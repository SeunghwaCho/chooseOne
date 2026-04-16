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
        if (points.length < 2) {
            // 손가락이 2개 미만이면 대기 상태로
            this.ctx.transit(0 /* StateType.IDLE */);
        }
        else {
            // 손가락 추가·제거로 개수가 바뀌었으면 타이머 리셋
            // (같은 상태로 재진입 → init() 호출 → tickCount = 0)
            this.ctx.transit(1 /* StateType.SELECTING */);
        }
    }
    getTickCount() {
        return this.tickCount;
    }
    toString() {
        return 'SelectingState';
    }
}
SelectingState.REQUIRED_TICKS = 4; // 800ms × 4 = 3.2초 유지 후 알림 전환
