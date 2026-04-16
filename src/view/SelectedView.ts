import { BaseView } from './BaseView.js';
import type { CPoint } from '../model/CPoint.js';

/** 표시 타입: 동심원 or 방사형 라인 */
type DisplayMode = 'CENTER' | 'HOLE';

/** 선택 완료 상태 뷰: 당첨자 강조 표시 */
export class SelectedView extends BaseView {
  private mode: DisplayMode = 'CENTER';
  private displayTick = 0;

  /** 표시 모드 전환 (외부 호출 가능) */
  setMode(mode: DisplayMode): void {
    this.mode = mode;
  }

  onInit(): void {
    this.displayTick = 0;
    // 매번 랜덤으로 모드 선택
    this.mode = Math.random() < 0.5 ? 'CENTER' : 'HOLE';
  }

  draw(points: CPoint[], animTick: number, selectedPoint: CPoint | null, _stateElapsedMs: number): void {
    this.displayTick++;
    this.drawBackground('#020208');
    this.drawUnselectedPoints(points, selectedPoint);

    if (selectedPoint) {
      if (this.mode === 'CENTER') {
        this.drawCenterMode(selectedPoint, animTick);
      } else {
        this.drawHoleMode(selectedPoint, animTick);
      }
      this.drawWinnerAnnouncement(selectedPoint, animTick);
    }
  }

  /** 선택되지 않은 포인트는 흐릿하게 */
  private drawUnselectedPoints(points: CPoint[], selectedPoint: CPoint | null): void {
    for (const pt of points) {
      if (pt.id === selectedPoint?.id) continue;
      this.fillCircle(pt.x, pt.y, 20, pt.color, 0.2);
      this.drawCircle(pt.x, pt.y, 28, pt.color, 2, 0.2);
    }
  }

  /** CENTER 모드: 펄스하는 동심원 */
  private drawCenterMode(pt: CPoint, animTick: number): void {
    const pulse = animTick / 20;
    const baseRadius = 50 + pulse * 50;

    // 발광 배경 원
    this.fillCircle(pt.x, pt.y, baseRadius + 60, pt.color, 0.08 + pulse * 0.05);

    // 동심원 8겹
    for (let i = 7; i >= 0; i--) {
      const radius = baseRadius + i * 30;
      const alpha = (1.0 - i * 0.1) * (0.5 + pulse * 0.5);
      this.drawCircle(pt.x, pt.y, radius, pt.color, 4, alpha);
    }

    // 중심 강조
    this.fillCircle(pt.x, pt.y, 40, pt.color, 1.0);
    this.drawCenteredText(
      '🏆',
      pt.x,
      pt.y,
      '28px serif',
      '#ffffff'
    );
  }

  /** HOLE 모드: 방사형 라인 */
  private drawHoleMode(pt: CPoint, animTick: number): void {
    const pulse = animTick / 20;
    const lineLength = 80 + pulse * 120;

    // 방사형 선 (15도 간격)
    this.ctx.save();
    this.ctx.strokeStyle = pt.color;
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = pt.color;
    this.ctx.shadowBlur = 10;

    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
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

    // 중심 원
    this.fillCircle(pt.x, pt.y, 30, pt.color, 1.0);
    this.drawCenteredText(
      '🎉',
      pt.x,
      pt.y,
      '22px serif',
      '#ffffff'
    );
  }

  /** 당첨자 발표 텍스트 */
  private drawWinnerAnnouncement(pt: CPoint, animTick: number): void {
    const pulse = animTick / 20;
    const fontSize = Math.round(this.width * 0.06 + pulse * 4);

    // 당첨 번호 표시
    this.drawGlowText(
      `✨ ${pt.colorIndex + 1}번 당첨! ✨`,
      this.width / 2,
      this.height * 0.12,
      `bold ${fontSize}px sans-serif`,
      '#ffffff',
      pt.color
    );

    // 색상 이름 힌트
    this.drawCenteredText(
      `(${this.getColorName(pt.colorIndex)})`,
      this.width / 2,
      this.height * 0.12 + fontSize + 10,
      `${Math.round(this.width * 0.025)}px sans-serif`,
      'rgba(200,200,255,0.8)'
    );
  }

  /** 색상 인덱스로 사람이 읽을 수 있는 색상 이름 반환 */
  private getColorName(index: number): string {
    const names = [
      '빨강', '초록', '파랑', '노랑', '보라',
      '하늘', '주황', '자주', '연두', '핑크',
      '남색', '연두', '연빨', '연초', '연파',
      '황금', '라벤더', '민트', '장미', '스카이'
    ];
    return names[index % names.length] ?? '컬러';
  }
}
