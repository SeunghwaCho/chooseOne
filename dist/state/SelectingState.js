/** 선택 중 상태: 손가락을 유지하며 카운트다운 */
export class SelectingState {
    constructor(ctx) {
        this.ctx = ctx;
        this.tickCount = 0;
    }
    init() {
        this.tickCount = 0;
    }
    tick() {
        const points = this.ctx.getPoints();
        // 손가락이 2개 미만이면 대기 상태로
        if (points.length < 2) {
            this.ctx.transit(0 /* StateType.IDLE */);
            return;
        }
        this.tickCount++;
        // 충분한 시간 유지 시 알림 상태로
        if (this.tickCount >= SelectingState.REQUIRED_TICKS) {
            this.ctx.transit(2 /* StateType.ALERTING */);
        }
    }
    updatePointList(points) {
        // 포인트 감소 시 즉시 대기 상태로
        if (points.length < 2) {
            this.ctx.transit(0 /* StateType.IDLE */);
        }
    }
    getTickCount() {
        return this.tickCount;
    }
    toString() {
        return 'SelectingState';
    }
}
SelectingState.REQUIRED_TICKS = 1; // 800ms 1틱 후 알림 전환
