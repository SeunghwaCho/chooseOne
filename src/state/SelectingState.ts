import { IState, StateContext, StateType } from './IState.js';
import type { CPoint } from '../model/CPoint.js';

/** 선택 중 상태: 손가락을 유지하며 카운트다운 */
export class SelectingState implements IState {
  private tickCount = 0;
  private static readonly REQUIRED_TICKS = 4; // 800ms × 4 = 3.2초 유지 후 알림 전환

  constructor(private ctx: StateContext) {}

  init(): void {
    this.tickCount = 0;
  }

  tick(): void {
    const points = this.ctx.getPoints();

    // 손가락이 2개 미만이면 대기 상태로
    if (points.length < 2) {
      this.ctx.transit(StateType.IDLE);
      return;
    }

    this.tickCount++;

    // 충분한 시간 유지 시 알림 상태로
    if (this.tickCount >= SelectingState.REQUIRED_TICKS) {
      this.ctx.transit(StateType.ALERTING);
    }
  }

  updatePointList(points: CPoint[]): void {
    if (points.length < 2) {
      // 손가락이 2개 미만이면 대기 상태로
      this.ctx.transit(StateType.IDLE);
    } else {
      // 손가락 추가·제거로 개수가 바뀌었으면 타이머 리셋
      // (같은 상태로 재진입 → init() 호출 → tickCount = 0)
      this.ctx.transit(StateType.SELECTING);
    }
  }

  getTickCount(): number {
    return this.tickCount;
  }

  toString(): string {
    return 'SelectingState';
  }
}
