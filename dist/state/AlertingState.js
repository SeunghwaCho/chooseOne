/** 알림 상태: 선택 직전 강조 애니메이션 */
export class AlertingState {
    constructor(ctx) {
        this.ctx = ctx;
        this.tickCount = 0;
    }
    init() {
        this.tickCount = 0;
        // 랜덤 포인트 선택 (알림 시작 시)
        this.ctx.selectRandomPoint();
    }
    tick() {
        this.tickCount++;
        if (this.tickCount >= AlertingState.ALERT_TICKS) {
            this.ctx.transit(3 /* StateType.SELECTED */);
        }
    }
    updatePointList(_points) {
        // 알림 중에는 포인트 변경 무시
    }
    toString() {
        return 'AlertingState';
    }
}
AlertingState.ALERT_TICKS = 1; // 800ms 후 선택 완료로
