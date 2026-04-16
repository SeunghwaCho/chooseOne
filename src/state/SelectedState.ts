import { IState, StateContext, StateType } from './IState.js';
import type { CPoint } from '../model/CPoint.js';

/** 선택 완료 상태: 당첨자 표시 후 대기 상태로 복귀 */
export class SelectedState implements IState {
  private tickCount = 0;
  private static readonly DISPLAY_TICKS = 3; // 2.4초 표시 후 대기로

  constructor(private ctx: StateContext) {}

  init(): void {
    this.tickCount = 0;
    // 진동 피드백 (모바일 지원 시)
    if (navigator.vibrate) {
      navigator.vibrate(800);
    }
  }

  tick(): void {
    this.tickCount++;
    if (this.tickCount >= SelectedState.DISPLAY_TICKS) {
      this.ctx.transit(StateType.IDLE);
    }
  }

  updatePointList(_points: CPoint[]): void {
    // 표시 중에는 포인트 변경 무시
  }

  toString(): string {
    return 'SelectedState';
  }
}
