import { IState, StateContext, StateType } from './IState.js';
import type { CPoint } from '../model/CPoint.js';

/** 알림 상태: 선택 직전 강조 애니메이션 */
export class AlertingState implements IState {
  private tickCount = 0;
  private static readonly ALERT_TICKS = 1; // 800ms 후 선택 완료로

  constructor(private ctx: StateContext) {}

  init(): void {
    this.tickCount = 0;
    // 랜덤 포인트 선택 (알림 시작 시)
    this.ctx.selectRandomPoint();
  }

  tick(): void {
    this.tickCount++;
    if (this.tickCount >= AlertingState.ALERT_TICKS) {
      this.ctx.transit(StateType.SELECTED);
    }
  }

  updatePointList(_points: CPoint[]): void {
    // 알림 중에는 포인트 변경 무시
  }

  toString(): string {
    return 'AlertingState';
  }
}
