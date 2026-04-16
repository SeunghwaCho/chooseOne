import { IState, StateContext, StateType } from './IState.js';
import type { CPoint } from '../model/CPoint.js';

/** 대기 상태: 손가락을 기다리는 초기 상태 */
export class IdleState implements IState {
  constructor(private ctx: StateContext) {}

  init(): void {
    // 대기 상태 초기화 - 별도 처리 없음
  }

  tick(): void {
    // 포인트가 2개 이상이면 선택 중 상태로 전환
    if (this.ctx.getPoints().length >= 2) {
      this.ctx.transit(StateType.SELECTING);
    }
  }

  updatePointList(_points: CPoint[]): void {
    // 대기 상태에서는 포인트 갱신만 기록
  }

  toString(): string {
    return 'IdleState';
  }
}
