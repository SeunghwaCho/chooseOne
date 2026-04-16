import { IdleView } from './IdleView.js';
import { SelectingView } from './SelectingView.js';
import { AlertingView } from './AlertingView.js';
import { SelectedView } from './SelectedView.js';
/** 현재 상태에 맞는 뷰를 선택하고 렌더링 담당 */
export class ViewManager {
    constructor(ctx) {
        this.ctx = ctx;
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
    }
    /** 매 프레임 현재 상태 뷰 렌더링 */
    draw(points, animTick, selectedPoint) {
        const view = this.views[this.currentStateType];
        // 캔버스 크기 동기화
        const canvas = this.ctx.canvas;
        view.resize(canvas.width, canvas.height);
        view.draw(points, animTick, selectedPoint);
    }
    /** 캔버스 리사이즈 시 모든 뷰 업데이트 */
    resize(width, height) {
        for (const view of this.views) {
            view.resize(width, height);
        }
    }
}
