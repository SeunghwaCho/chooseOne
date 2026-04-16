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
        const canvas = this.ctx.canvas;
        view.resize(canvas.width, canvas.height);
        view.draw(points, animTick, selectedPoint, this.gameLoop.getTickProgress());
        this.drawTouchPointsInfo();
    }
    /** 우측 상단: 최대 동시 터치 지점 표시 */
    drawTouchPointsInfo() {
        const canvas = this.ctx.canvas;
        const text = `이 브라우저의 최대 동시 터치 지점: ${navigator.maxTouchPoints}`;
        const padding = 10;
        const fontSize = 11;
        this.ctx.save();
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
        this.ctx.fillText(text, canvas.width - padding, padding);
        this.ctx.restore();
    }
    /** 캔버스 리사이즈 시 모든 뷰 업데이트 */
    resize(width, height) {
        for (const view of this.views) {
            view.resize(width, height);
        }
    }
}
