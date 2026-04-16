import type { CPoint } from '../model/CPoint.js';

/** 게임 상태 타입 */
export const enum StateType {
  IDLE = 0,
  SELECTING = 1,
  ALERTING = 2,
  SELECTED = 3
}

/** 상태에서 매니저로 콜백하는 인터페이스 */
export interface StateContext {
  transit(state: StateType): void;
  getPoints(): CPoint[];
  selectRandomPoint(): CPoint | null;
}

/** 게임 상태 인터페이스 */
export interface IState {
  /** 상태 초기화 */
  init(): void;
  /** 게임 틱 처리 (800ms 간격) */
  tick(): void;
  /** 터치 포인트 목록 갱신 */
  updatePointList(points: CPoint[]): void;
}
