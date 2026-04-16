import { IState, StateContext, StateType } from './IState.js';
import type { CPoint } from '../model/CPoint.js';

/** 선택 중 상태: 손가락을 유지하며 카운트다운 */
export class SelectingState implements IState {
  /** 홀드 시간 (ms) — 틱 간격과 무관하게 실제 경과 시간으로 판단 */
  static readonly HOLD_MS = 1200;

  private enterTime = 0;

  constructor(private ctx: StateContext) {}

  init(): void {
    this.enterTime = Date.now();
  }

  tick(): void {
    const points = this.ctx.getPoints();

    // 손가락이 2개 미만이면 대기 상태로
    if (points.length < 2) {
      this.ctx.transit(StateType.IDLE);
      return;
    }

    // 홀드 시간이 지났으면 알림 상태로
    if (Date.now() - this.enterTime >= SelectingState.HOLD_MS) {
      this.ctx.transit(StateType.ALERTING);
    }
  }

  updatePointList(points: CPoint[]): void {
    if (points.length < 2) {
      // 손가락이 2개 미만이면 대기 상태로
      this.ctx.transit(StateType.IDLE);
    } else {
      // 손가락 추가·제거 시 타이머 리셋 (같은 상태로 재진입 → init() 호출)
      this.ctx.transit(StateType.SELECTING);
    }
  }

  toString(): string {
    return 'SelectingState';
  }
}
