/** 선택 완료 상태: 당첨자 표시 후 대기 상태로 복귀 */
export class SelectedState {
    constructor(ctx) {
        this.ctx = ctx;
        this.tickCount = 0;
    }
    init() {
        this.tickCount = 0;
        // 진동 피드백 (모바일 지원 시)
        if (navigator.vibrate) {
            navigator.vibrate(800);
        }
    }
    tick() {
        this.tickCount++;
        if (this.tickCount >= SelectedState.DISPLAY_TICKS) {
            this.ctx.transit(0 /* StateType.IDLE */);
        }
    }
    updatePointList(_points) {
        // 표시 중에는 포인트 변경 무시
    }
    toString() {
        return 'SelectedState';
    }
}
SelectedState.DISPLAY_TICKS = 3; // 2.4초 표시 후 대기로
