import type { CPoint } from '../model/CPoint.js';
import type { StateType } from '../state/IState.js';

/** 뷰 변경 알림 인터페이스 */
export interface ViewObserver {
  onStateChanged(state: StateType): void;
}

/** 뽑기 매니저 인터페이스 */
export interface ChooseManager {
  /** 상태 전환 */
  transit(state: StateType): void;
  /** 현재 터치 포인트 반환 */
  getPoints(): CPoint[];
  /** 랜덤 포인트 선택 및 반환 */
  selectRandomPoint(): CPoint | null;
  /** 선택된 포인트 반환 */
  getSelectedPoint(): CPoint | null;
  /** 현재 상태 반환 */
  getCurrentStateType(): StateType;
  /** 터치/마우스 포인트 추가 */
  addPoint(id: number, x: number, y: number): void;
  /** 터치/마우스 포인트 갱신 */
  updatePoint(id: number, x: number, y: number): void;
  /** 터치/마우스 포인트 제거 */
  removePoint(id: number): void;
  /** 게임 틱 처리 */
  tick(): void;
  /** 뷰 옵저버 등록 */
  setViewObserver(observer: ViewObserver): void;
}
