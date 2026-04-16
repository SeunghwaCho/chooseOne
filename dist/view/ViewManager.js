import { IdleView } from './IdleView.js';
import { SelectingView } from './SelectingView.js';
import { AlertingView } from './AlertingView.js';
import { SelectedView } from './SelectedView.js';
/** 현재 상태에 맞는 뷰를 선택하고 렌더링 담당 */
export class ViewManager {
    constructor(ctx, gameLoop) {
        this.ctx = ctx;
        this.gameLoop = gameLoop;
        this.currentStateType = 0 /* StateType.IDLE */;
        this.stateEnterTime = 0; // 현재 상태 진입 시각 (ms)
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
        this.stateEnterTime = Date.now(); // 상태 진입 시각 기록
        if (state === 3 /* StateType.SELECTED */) {
            this.selectedView.onInit();
        }
        // SELECTING 재진입(손가락 변경) 포함 모든 상태 전환 시 틱 누산기 리셋
        if (state === 1 /* StateType.SELECTING */) {
            this.gameLoop.resetTickAccumulator();
        }
    }
    /** 매 프레임 현재 상태 뷰 렌더링 */
    draw(points, animTick, selectedPoint) {
        const view = this.views[this.currentStateType];
        // canvas.width/height 는 물리 픽셀, 뷰에는 논리 픽셀(CSS px) 전달
        const { logicalW, logicalH } = this.logicalSize();
        view.resize(logicalW, logicalH);
        view.draw(points, animTick, selectedPoint, Date.now() - this.stateEnterTime);
        this.drawTouchPointsInfo(logicalW);
    }
    /** 우측 상단: 최대 동시 터치 지점 표시 */
    drawTouchPointsInfo(logicalW) {
        const text = `이 브라우저의 최대 동시 터치 지점: ${navigator.maxTouchPoints}`;
        const padding = 10;
        this.ctx.save();
        this.ctx.font = '11px sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
        this.ctx.fillText(text, logicalW - padding, padding);
        this.ctx.restore();
    }
    /** 논리(CSS) 픽셀 크기 반환 */
    logicalSize() {
        const dpr = window.devicePixelRatio || 1;
        return {
            logicalW: this.ctx.canvas.width / dpr,
            logicalH: this.ctx.canvas.height / dpr,
        };
    }
}
