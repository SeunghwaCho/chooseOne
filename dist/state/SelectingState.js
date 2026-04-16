/** 선택 중 상태: 손가락을 유지하며 카운트다운 */
export class SelectingState {
    constructor(ctx) {
        this.ctx = ctx;
        this.enterTime = 0;
    }
    init() {
        this.enterTime = Date.now();
    }
    tick() {
        const points = this.ctx.getPoints();
        // 손가락이 2개 미만이면 대기 상태로
        if (points.length < 2) {
            this.ctx.transit(0 /* StateType.IDLE */);
            return;
        }
        // 홀드 시간이 지났으면 알림 상태로
        if (Date.now() - this.enterTime >= SelectingState.HOLD_MS) {
            this.ctx.transit(2 /* StateType.ALERTING */);
        }
    }
    updatePointList(points) {
        if (points.length < 2) {
            // 손가락이 2개 미만이면 대기 상태로
            this.ctx.transit(0 /* StateType.IDLE */);
        }
        else {
            // 손가락 추가·제거 시 타이머 리셋 (같은 상태로 재진입 → init() 호출)
            this.ctx.transit(1 /* StateType.SELECTING */);
        }
    }
    toString() {
        return 'SelectingState';
    }
}
/** 홀드 시간 (ms) — 틱 간격과 무관하게 실제 경과 시간으로 판단 */
SelectingState.HOLD_MS = 1200;
