"use strict";
(() => {
  // src/model/CPoint.ts
  var CPoint = class {
    constructor(id, x, y, color, colorIndex) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.color = color;
      this.colorIndex = colorIndex;
    }
    /** 두 포인트 사이의 거리를 반환 */
    distanceTo(other) {
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
  };

  // src/state/IdleState.ts
  var IdleState = class {
    constructor(ctx) {
      this.ctx = ctx;
    }
    init() {
    }
    tick() {
      if (this.ctx.getPoints().length >= 2) {
        this.ctx.transit(1 /* SELECTING */);
      }
    }
    updatePointList(_points) {
    }
    toString() {
      return "IdleState";
    }
  };

  // src/state/SelectingState.ts
  var _SelectingState = class _SelectingState {
    constructor(ctx) {
      this.ctx = ctx;
      this.enterTime = 0;
    }
    init() {
      this.enterTime = Date.now();
    }
    tick() {
      const points = this.ctx.getPoints();
      if (points.length < 2) {
        this.ctx.transit(0 /* IDLE */);
        return;
      }
      if (Date.now() - this.enterTime >= _SelectingState.HOLD_MS) {
        this.ctx.transit(2 /* ALERTING */);
      }
    }
    updatePointList(points) {
      if (points.length < 2) {
        this.ctx.transit(0 /* IDLE */);
      } else {
        this.ctx.transit(1 /* SELECTING */);
      }
    }
    toString() {
      return "SelectingState";
    }
  };
  /** 홀드 시간 (ms) — 틱 간격과 무관하게 실제 경과 시간으로 판단 */
  _SelectingState.HOLD_MS = 1200;
  var SelectingState = _SelectingState;

  // src/state/AlertingState.ts
  var _AlertingState = class _AlertingState {
    // 800ms 후 선택 완료로
    constructor(ctx) {
      this.ctx = ctx;
      this.tickCount = 0;
    }
    init() {
      this.tickCount = 0;
      this.ctx.selectRandomPoint();
    }
    tick() {
      this.tickCount++;
      if (this.tickCount >= _AlertingState.ALERT_TICKS) {
        this.ctx.transit(3 /* SELECTED */);
      }
    }
    updatePointList(_points) {
    }
    toString() {
      return "AlertingState";
    }
  };
  _AlertingState.ALERT_TICKS = 1;
  var AlertingState = _AlertingState;

  // src/state/SelectedState.ts
  var _SelectedState = class _SelectedState {
    // 2.4초 표시 후 대기로
    constructor(ctx) {
      this.ctx = ctx;
      this.tickCount = 0;
    }
    init() {
      this.tickCount = 0;
      if (navigator.vibrate) {
        navigator.vibrate(800);
      }
    }
    tick() {
      this.tickCount++;
      if (this.tickCount >= _SelectedState.DISPLAY_TICKS) {
        this.ctx.transit(0 /* IDLE */);
      }
    }
    updatePointList(_points) {
    }
    toString() {
      return "SelectedState";
    }
  };
  _SelectedState.DISPLAY_TICKS = 3;
  var SelectedState = _SelectedState;

  // src/manager/ChooseManagerImpl.ts
  var COLOR_TABLE = [
    "#FF4444",
    "#44FF44",
    "#4444FF",
    "#FFFF44",
    "#FF44FF",
    "#44FFFF",
    "#FF8844",
    "#8844FF",
    "#44FF88",
    "#FF4488",
    "#4488FF",
    "#88FF44",
    "#FF6666",
    "#66FF66",
    "#6666FF",
    "#FFAA44",
    "#AA44FF",
    "#44FFAA",
    "#FF44AA",
    "#44AAFF"
  ];
  var ChooseManagerImpl = class {
    // colorIndex → pointId
    constructor() {
      this.currentStateType = 0 /* IDLE */;
      this.points = /* @__PURE__ */ new Map();
      this.selectedPoint = null;
      this.viewObserver = null;
      this.colorUsage = /* @__PURE__ */ new Map();
      this.states = [
        new IdleState(this),
        new SelectingState(this),
        new AlertingState(this),
        new SelectedState(this)
      ];
      this.states[0 /* IDLE */].init();
    }
    setViewObserver(observer) {
      this.viewObserver = observer;
    }
    transit(state) {
      this.currentStateType = state;
      this.states[state].init();
      this.viewObserver?.onStateChanged(state);
    }
    getPoints() {
      return Array.from(this.points.values());
    }
    selectRandomPoint() {
      const pts = this.getPoints();
      if (pts.length === 0) return null;
      const idx = Math.floor(Math.random() * pts.length);
      this.selectedPoint = pts[idx];
      return this.selectedPoint;
    }
    getSelectedPoint() {
      return this.selectedPoint;
    }
    getCurrentStateType() {
      return this.currentStateType;
    }
    addPoint(id, x, y) {
      if (this.points.has(id)) return;
      const colorIndex = this.findAvailableColorIndex();
      const color = COLOR_TABLE[colorIndex % COLOR_TABLE.length];
      const point = new CPoint(id, x, y, color, colorIndex);
      this.points.set(id, point);
      this.colorUsage.set(colorIndex, id);
      this.states[this.currentStateType].updatePointList(this.getPoints());
    }
    updatePoint(id, x, y) {
      const point = this.points.get(id);
      if (point) {
        point.x = x;
        point.y = y;
      }
    }
    removePoint(id) {
      const point = this.points.get(id);
      if (point) {
        this.colorUsage.delete(point.colorIndex);
        this.points.delete(id);
      }
      this.states[this.currentStateType].updatePointList(this.getPoints());
    }
    tick() {
      this.states[this.currentStateType].tick();
    }
    findAvailableColorIndex() {
      for (let i = 0; i < COLOR_TABLE.length; i++) {
        if (!this.colorUsage.has(i)) return i;
      }
      return 0;
    }
  };

  // src/view/BaseView.ts
  var BaseView = class {
    constructor(ctx) {
      this.ctx = ctx;
      this.width = ctx.canvas.width;
      this.height = ctx.canvas.height;
    }
    /** 캔버스 크기 갱신 */
    resize(width, height) {
      this.width = width;
      this.height = height;
    }
    /** 배경 그리기 */
    drawBackground(color = "#0d0d1a") {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
    /** 원 그리기 */
    drawCircle(x, y, radius, color, lineWidth = 3, alpha = 1) {
      if (radius <= 0) return;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
      this.ctx.restore();
    }
    /** 채워진 원 그리기 */
    fillCircle(x, y, radius, color, alpha = 1) {
      if (radius <= 0) return;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.restore();
    }
    /** 동심원 세트 그리기 (펄스 애니메이션용) */
    drawConcentricCircles(x, y, baseRadius, count, gap, color) {
      for (let i = 0; i < count; i++) {
        const radius = baseRadius + i * gap;
        const alpha = 1 - i / count * 0.7;
        this.drawCircle(x, y, radius, color, 3, alpha);
      }
    }
    /** 방사형 선 그리기 (HOLE 타입용) */
    drawRadialLines(x, y, length, color, degreeStep = 15) {
      this.ctx.save();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      for (let deg = 0; deg < 360; deg += degreeStep) {
        const rad = deg * Math.PI / 180;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + Math.cos(rad) * length, y + Math.sin(rad) * length);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
    /** 중앙 정렬 텍스트 그리기 */
    drawCenteredText(text, x, y, font, color, alpha = 1) {
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.font = font;
      this.ctx.fillStyle = color;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(text, x, y);
      this.ctx.restore();
    }
    /** 발광 효과 텍스트 그리기 */
    drawGlowText(text, x, y, font, color, glowColor) {
      this.ctx.save();
      this.ctx.font = font;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 20;
      this.ctx.fillStyle = color;
      this.ctx.fillText(text, x, y);
      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }
    /** 포인트에 이모지 레이블 그리기 */
    drawPointLabel(point, emoji) {
      this.drawGlowText(
        emoji,
        point.x,
        point.y - 60,
        "32px serif",
        "#ffffff",
        point.color
      );
    }
  };

  // src/view/IdleView.ts
  var IdleView = class extends BaseView {
    draw(points, animTick, _selectedPoint, _stateElapsedMs) {
      this.drawBackground();
      this.drawInstructions(animTick, points.length);
      this.drawTouchPoints(points);
    }
    /** 안내 텍스트 (손가락 수에 따라 메시지 변경) */
    drawInstructions(animTick, count) {
      const bounce = Math.sin(animTick / 20 * Math.PI) * 8;
      const cx = this.width / 2;
      const cy = this.height / 2;
      const baseFontSize = Math.round(this.width * 0.04);
      if (count === 0) {
        this.drawGlowText(
          "\u270B \uB450 \uC190\uAC00\uB77D \uC774\uC0C1 \uC62C\uB824\uC8FC\uC138\uC694",
          cx,
          cy - 30 + bounce,
          `bold ${baseFontSize}px sans-serif`,
          "#ffffff",
          "#8888ff"
        );
        this.drawCenteredText(
          "\u23F3 \uC7A0\uC2DC \uAE30\uB2E4\uB9AC\uBA74 \uBF51\uC544\uB4DC\uB824\uC694!",
          cx,
          cy + 30 + bounce,
          `${Math.round(this.width * 0.025)}px sans-serif`,
          "rgba(180,180,255,0.85)"
        );
        this.drawCenteredText(
          "\u{1F446}\u{1F446}\u{1F446}",
          cx,
          cy + 80 + bounce,
          `${Math.round(this.width * 0.06)}px serif`,
          "rgba(255,255,255,0.6)"
        );
      } else if (count === 1) {
        this.drawGlowText(
          "\u261D\uFE0F \uC190\uAC00\uB77D \uD558\uB098\uAC00 \uB354 \uD544\uC694\uD574\uC694!",
          cx,
          cy - 20 + bounce,
          `bold ${baseFontSize}px sans-serif`,
          "#ffdd88",
          "#aa8800"
        );
        this.drawFingerCountBadge(1, cx, cy + 50 + bounce);
      } else {
        this.drawGlowText(
          "\u2705 \uC7A0\uC2DC \uD6C4 \uC2DC\uC791\uB429\uB2C8\uB2E4...",
          cx,
          cy - 20 + bounce,
          `bold ${baseFontSize}px sans-serif`,
          "#88ff88",
          "#008800"
        );
        this.drawFingerCountBadge(count, cx, cy + 50 + bounce);
      }
    }
    /** 손가락 개수 배지 */
    drawFingerCountBadge(count, cx, cy) {
      const r = Math.min(this.width, this.height) * 0.07;
      this.fillCircle(cx, cy, r, "rgba(100,100,200,0.35)");
      this.drawCircle(cx, cy, r, "rgba(180,180,255,0.6)", 2);
      this.drawCenteredText(
        String(count),
        cx,
        cy - 4,
        `bold ${Math.round(r * 1.1)}px sans-serif`,
        "#ffffff"
      );
      this.drawCenteredText(
        "\uAC1C",
        cx,
        cy + r * 0.65,
        `${Math.round(r * 0.5)}px sans-serif`,
        "rgba(200,200,255,0.8)"
      );
    }
    /** 현재 터치 포인트 시각화 */
    drawTouchPoints(points) {
      for (const pt of points) {
        this.fillCircle(pt.x, pt.y, 30, pt.color, 0.8);
        this.drawCircle(pt.x, pt.y, 35, pt.color, 3, 0.9);
        this.drawCircle(pt.x, pt.y, 50, pt.color, 2, 0.4);
        this.drawCenteredText(
          String(pt.colorIndex + 1),
          pt.x,
          pt.y,
          "bold 20px sans-serif",
          "#000000"
        );
      }
    }
  };

  // src/view/SelectingView.ts
  var _SelectingView = class _SelectingView extends BaseView {
    // SelectingState.HOLD_MS 와 동일하게 유지
    draw(points, animTick, _selectedPoint, stateElapsedMs) {
      this.drawBackground("#050510");
      this.drawPulsingPoints(points, animTick);
      const progress = Math.min(stateElapsedMs / _SelectingView.HOLD_MS, 1);
      this.drawCountdownTimer(points.length, progress);
    }
    /** 각 포인트에 펄스하는 동심원 + 번호 */
    drawPulsingPoints(points, animTick) {
      const pulse = animTick / 20;
      const baseRadius = 40 + pulse * 30;
      for (const pt of points) {
        for (let i = 4; i >= 0; i--) {
          const radius = baseRadius + i * 35;
          const alpha = (1 - i * 0.18) * (0.5 + pulse * 0.5);
          this.drawCircle(pt.x, pt.y, radius, pt.color, 3, alpha);
        }
        this.fillCircle(pt.x, pt.y, 28, pt.color, 0.9);
        this.drawCenteredText(
          String(pt.colorIndex + 1),
          pt.x,
          pt.y,
          "bold 22px sans-serif",
          "#000000"
        );
      }
    }
    /**
     * 중앙 카운트다운 UI:
     *  - 진행 호(arc)  : tickProgress 0→1 에 따라 시계방향으로 채워짐
     *  - 손가락 개수   : 호 안쪽 중앙
     *  - 상태 문구     : 개수에 따라 다름
     */
    drawCountdownTimer(count, tickProgress) {
      const cx = this.width / 2;
      const cy = this.height / 2;
      const ringR = Math.min(this.width, this.height) * 0.14;
      this.fillCircle(cx, cy, ringR + 6, "rgba(0,0,0,0.5)");
      this.drawCircle(cx, cy, ringR, "rgba(255,255,255,0.15)", 6);
      const startAngle = -Math.PI / 2;
      const sweepAngle = Math.PI * 2 * tickProgress;
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, ringR, startAngle, startAngle + sweepAngle);
      this.ctx.strokeStyle = "#ffffaa";
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = "round";
      this.ctx.shadowColor = "#ffff44";
      this.ctx.shadowBlur = 12;
      this.ctx.stroke();
      this.ctx.restore();
      this.drawGlowText(
        String(count),
        cx,
        cy - 10,
        `bold ${Math.round(ringR * 0.95)}px sans-serif`,
        "#ffffff",
        "#aaaaff"
      );
      const guide = count < 2 ? "\u26A0\uFE0F \uC190\uAC00\uB77D\uC774 \uBD80\uC871\uD569\uB2C8\uB2E4" : "\u{1F91A} \uC190\uAC00\uB77D\uC744 \uC720\uC9C0\uD558\uC138\uC694...";
      this.drawCenteredText(
        guide,
        cx,
        cy + ringR + 28,
        `${Math.round(this.width * 0.028)}px sans-serif`,
        count < 2 ? "rgba(255,120,120,0.9)" : "rgba(180,180,255,0.8)"
      );
    }
  };
  _SelectingView.HOLD_MS = 1200;
  var SelectingView = _SelectingView;

  // src/view/AlertingView.ts
  var AlertingView = class extends BaseView {
    draw(points, animTick, selectedPoint, _stateElapsedMs) {
      const flashAlpha = animTick / 20 * 0.3;
      this.drawBackground("#050510");
      if (selectedPoint) {
        this.ctx.save();
        this.ctx.globalAlpha = flashAlpha;
        this.ctx.fillStyle = selectedPoint.color;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();
      }
      this.drawAlertPoints(points, animTick, selectedPoint);
      this.drawAlertText(animTick);
    }
    /** 알림 포인트 시각화 */
    drawAlertPoints(points, animTick, selectedPoint) {
      const pulse = animTick / 20;
      for (const pt of points) {
        const isSelected = selectedPoint?.id === pt.id;
        const baseRadius = isSelected ? 60 + pulse * 40 : 35 + pulse * 20;
        const circleCount = isSelected ? 6 : 4;
        for (let i = circleCount - 1; i >= 0; i--) {
          const radius = baseRadius + i * 30;
          const alpha = isSelected ? (1 - i * 0.15) * (0.6 + pulse * 0.4) : 0.3 - i * 0.06;
          this.drawCircle(pt.x, pt.y, radius, pt.color, isSelected ? 4 : 2, alpha);
        }
        this.fillCircle(pt.x, pt.y, isSelected ? 35 : 22, pt.color, 0.95);
        this.drawCenteredText(
          String(pt.colorIndex + 1),
          pt.x,
          pt.y,
          `bold ${isSelected ? 26 : 18}px sans-serif`,
          "#000000"
        );
      }
    }
    /** 알림 텍스트 */
    drawAlertText(animTick) {
      const alpha = 0.7 + animTick / 20 * 0.3;
      this.drawGlowText(
        "\u{1F3AF} \uBF51\uB294 \uC911...",
        this.width / 2,
        this.height / 2,
        `bold ${Math.round(this.width * 0.055)}px sans-serif`,
        `rgba(255,255,180,${alpha.toFixed(2)})`,
        "#ffff44"
      );
    }
  };

  // src/view/SelectedView.ts
  var SelectedView = class extends BaseView {
    constructor() {
      super(...arguments);
      this.mode = "CENTER";
      this.displayTick = 0;
    }
    /** 표시 모드 전환 (외부 호출 가능) */
    setMode(mode) {
      this.mode = mode;
    }
    onInit() {
      this.displayTick = 0;
      this.mode = Math.random() < 0.5 ? "CENTER" : "HOLE";
    }
    draw(points, animTick, selectedPoint, _stateElapsedMs) {
      this.displayTick++;
      this.drawBackground("#020208");
      this.drawUnselectedPoints(points, selectedPoint);
      if (selectedPoint) {
        if (this.mode === "CENTER") {
          this.drawCenterMode(selectedPoint, animTick);
        } else {
          this.drawHoleMode(selectedPoint, animTick);
        }
        this.drawWinnerAnnouncement(selectedPoint, animTick);
      }
    }
    /** 선택되지 않은 포인트는 흐릿하게 */
    drawUnselectedPoints(points, selectedPoint) {
      for (const pt of points) {
        if (pt.id === selectedPoint?.id) continue;
        this.fillCircle(pt.x, pt.y, 20, pt.color, 0.2);
        this.drawCircle(pt.x, pt.y, 28, pt.color, 2, 0.2);
      }
    }
    /** CENTER 모드: 펄스하는 동심원 */
    drawCenterMode(pt, animTick) {
      const pulse = animTick / 20;
      const baseRadius = 50 + pulse * 50;
      this.fillCircle(pt.x, pt.y, baseRadius + 60, pt.color, 0.08 + pulse * 0.05);
      for (let i = 7; i >= 0; i--) {
        const radius = baseRadius + i * 30;
        const alpha = (1 - i * 0.1) * (0.5 + pulse * 0.5);
        this.drawCircle(pt.x, pt.y, radius, pt.color, 4, alpha);
      }
      this.fillCircle(pt.x, pt.y, 40, pt.color, 1);
      this.drawCenteredText(
        "\u{1F3C6}",
        pt.x,
        pt.y,
        "28px serif",
        "#ffffff"
      );
    }
    /** HOLE 모드: 방사형 라인 */
    drawHoleMode(pt, animTick) {
      const pulse = animTick / 20;
      const lineLength = 80 + pulse * 120;
      this.ctx.save();
      this.ctx.strokeStyle = pt.color;
      this.ctx.lineWidth = 4;
      this.ctx.shadowColor = pt.color;
      this.ctx.shadowBlur = 10;
      for (let deg = 0; deg < 360; deg += 15) {
        const rad = deg * Math.PI / 180;
        const innerR = 30;
        this.ctx.globalAlpha = 0.8 + pulse * 0.2;
        this.ctx.beginPath();
        this.ctx.moveTo(
          pt.x + Math.cos(rad) * innerR,
          pt.y + Math.sin(rad) * innerR
        );
        this.ctx.lineTo(
          pt.x + Math.cos(rad) * (innerR + lineLength),
          pt.y + Math.sin(rad) * (innerR + lineLength)
        );
        this.ctx.stroke();
      }
      this.ctx.restore();
      this.fillCircle(pt.x, pt.y, 30, pt.color, 1);
      this.drawCenteredText(
        "\u{1F389}",
        pt.x,
        pt.y,
        "22px serif",
        "#ffffff"
      );
    }
    /** 당첨자 발표 텍스트 */
    drawWinnerAnnouncement(pt, animTick) {
      const pulse = animTick / 20;
      const fontSize = Math.round(this.width * 0.06 + pulse * 4);
      this.drawGlowText(
        `\u2728 ${pt.colorIndex + 1}\uBC88 \uB2F9\uCCA8! \u2728`,
        this.width / 2,
        this.height * 0.12,
        `bold ${fontSize}px sans-serif`,
        "#ffffff",
        pt.color
      );
      this.drawCenteredText(
        `(${this.getColorName(pt.colorIndex)})`,
        this.width / 2,
        this.height * 0.12 + fontSize + 10,
        `${Math.round(this.width * 0.025)}px sans-serif`,
        "rgba(200,200,255,0.8)"
      );
    }
    /** 색상 인덱스로 사람이 읽을 수 있는 색상 이름 반환 */
    getColorName(index) {
      const names = [
        "\uBE68\uAC15",
        "\uCD08\uB85D",
        "\uD30C\uB791",
        "\uB178\uB791",
        "\uBCF4\uB77C",
        "\uD558\uB298",
        "\uC8FC\uD669",
        "\uC790\uC8FC",
        "\uC5F0\uB450",
        "\uD551\uD06C",
        "\uB0A8\uC0C9",
        "\uC5F0\uB450",
        "\uC5F0\uBE68",
        "\uC5F0\uCD08",
        "\uC5F0\uD30C",
        "\uD669\uAE08",
        "\uB77C\uBCA4\uB354",
        "\uBBFC\uD2B8",
        "\uC7A5\uBBF8",
        "\uC2A4\uCE74\uC774"
      ];
      return names[index % names.length] ?? "\uCEEC\uB7EC";
    }
  };

  // src/view/ViewManager.ts
  var ViewManager = class {
    // 현재 상태 진입 시각 (ms)
    constructor(ctx, gameLoop) {
      this.ctx = ctx;
      this.gameLoop = gameLoop;
      this.currentStateType = 0 /* IDLE */;
      this.stateEnterTime = 0;
      this.selectedView = new SelectedView(ctx);
      this.views = [
        new IdleView(ctx),
        new SelectingView(ctx),
        new AlertingView(ctx),
        this.selectedView
      ];
    }
    onStateChanged(state) {
      this.currentStateType = state;
      this.stateEnterTime = Date.now();
      if (state === 3 /* SELECTED */) {
        this.selectedView.onInit();
      }
      if (state === 1 /* SELECTING */) {
        this.gameLoop.resetTickAccumulator();
      }
    }
    /** 매 프레임 현재 상태 뷰 렌더링 */
    draw(points, animTick, selectedPoint) {
      const view = this.views[this.currentStateType];
      const { logicalW, logicalH } = this.logicalSize();
      view.resize(logicalW, logicalH);
      view.draw(points, animTick, selectedPoint, Date.now() - this.stateEnterTime);
    }
    /** 논리(CSS) 픽셀 크기 반환 */
    logicalSize() {
      const dpr = window.devicePixelRatio || 1;
      return {
        logicalW: this.ctx.canvas.width / dpr,
        logicalH: this.ctx.canvas.height / dpr
      };
    }
  };

  // src/core/GameLoop.ts
  var _GameLoop = class _GameLoop {
    constructor(onTick, onRender) {
      this.onTick = onTick;
      this.onRender = onRender;
      this.running = false;
      this.lastTimestamp = 0;
      this.tickAccumulator = 0;
      this.frameCount = 0;
      this.animTickValue = 0;
      this.animDirection = 1;
      // ~30fps 속도로 animTick 갱신
      this.animAccumulator = 0;
    }
    start() {
      if (this.running) return;
      this.running = true;
      this.lastTimestamp = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }
    stop() {
      this.running = false;
    }
    loop(timestamp) {
      if (!this.running) return;
      const dt = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      this.frameCount++;
      this.tickAccumulator += dt;
      if (this.tickAccumulator >= _GameLoop.TICK_INTERVAL) {
        this.tickAccumulator -= _GameLoop.TICK_INTERVAL;
        this.onTick();
      }
      this.animAccumulator += dt;
      if (this.animAccumulator >= _GameLoop.ANIM_UPDATE_MS) {
        this.animAccumulator -= _GameLoop.ANIM_UPDATE_MS;
        this.animTickValue += this.animDirection;
        if (this.animTickValue >= _GameLoop.ANIM_TICK_MAX) {
          this.animTickValue = _GameLoop.ANIM_TICK_MAX;
          this.animDirection = -1;
        } else if (this.animTickValue <= 0) {
          this.animTickValue = 0;
          this.animDirection = 1;
        }
      }
      this.onRender(this.animTickValue);
      requestAnimationFrame(this.loop.bind(this));
    }
    /** 현재 틱 진행률 반환 (0.0 ~ 1.0) */
    getTickProgress() {
      return this.tickAccumulator / _GameLoop.TICK_INTERVAL;
    }
    /** 틱 누산기 리셋 (손가락 변경으로 타이머 재시작 시 호출) */
    resetTickAccumulator() {
      this.tickAccumulator = 0;
    }
    getFrameCount() {
      return this.frameCount;
    }
  };
  _GameLoop.TICK_INTERVAL = 800;
  // ms 단위 게임 틱
  _GameLoop.ANIM_TICK_MAX = 20;
  // 애니메이션 틱 최댓값
  _GameLoop.ANIM_UPDATE_MS = 33;
  var GameLoop = _GameLoop;

  // src/main.ts
  function initCanvas() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context\uB97C \uAC00\uC838\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resize);
    resize();
    return { canvas, ctx };
  }
  function bindInputEvents(canvas, manager) {
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        const rect = canvas.getBoundingClientRect();
        manager.addPoint(
          touch.identifier,
          touch.clientX - rect.left,
          touch.clientY - rect.top
        );
      }
    }, { passive: false });
    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        const rect = canvas.getBoundingClientRect();
        manager.updatePoint(
          touch.identifier,
          touch.clientX - rect.left,
          touch.clientY - rect.top
        );
      }
    }, { passive: false });
    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      for (const touch of Array.from(e.changedTouches)) {
        manager.removePoint(touch.identifier);
      }
    }, { passive: false });
    canvas.addEventListener("touchcancel", (e) => {
      for (const touch of Array.from(e.changedTouches)) {
        manager.removePoint(touch.identifier);
      }
    });
    const MOUSE_ID = 1e3;
    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      manager.addPoint(MOUSE_ID, e.clientX - rect.left, e.clientY - rect.top);
    });
    canvas.addEventListener("mousemove", (e) => {
      if (e.buttons > 0) {
        const rect = canvas.getBoundingClientRect();
        manager.updatePoint(MOUSE_ID, e.clientX - rect.left, e.clientY - rect.top);
      }
    });
    canvas.addEventListener("mouseup", () => {
      manager.removePoint(MOUSE_ID);
    });
    canvas.addEventListener("mouseleave", () => {
      manager.removePoint(MOUSE_ID);
    });
    const MOUSE_ID2 = 1001;
    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (manager.getPoints().filter((p) => p.id === MOUSE_ID2).length === 0) {
        manager.addPoint(MOUSE_ID2, e.clientX - rect.left, e.clientY - rect.top);
      } else {
        manager.removePoint(MOUSE_ID2);
      }
    });
  }
  function main() {
    const { canvas, ctx } = initCanvas();
    const manager = new ChooseManagerImpl();
    const gameLoop = new GameLoop(
      () => {
        manager.tick();
      },
      (animTick) => {
        viewManager.draw(
          manager.getPoints(),
          animTick,
          manager.getSelectedPoint()
        );
      }
    );
    const viewManager = new ViewManager(ctx, gameLoop);
    manager.setViewObserver(viewManager);
    bindInputEvents(canvas, manager);
    gameLoop.start();
    console.log("\u{1F3AF} Choose One \uAC8C\uC784 \uC2DC\uC791!");
    console.log("\u{1F4A1} \uD301: \uC6B0\uD074\uB9AD\uC73C\uB85C \uB450 \uBC88\uC9F8 \uD3EC\uC778\uD2B8\uB97C \uCD94\uAC00\uD558\uC5EC PC\uC5D0\uC11C \uD14C\uC2A4\uD2B8\uD558\uC138\uC694.");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
