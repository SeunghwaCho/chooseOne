import { ChooseManager, ViewObserver } from './ChooseManager.js';
import { CPoint } from '../model/CPoint.js';
import { IState, StateContext, StateType } from '../state/IState.js';
import { IdleState } from '../state/IdleState.js';
import { SelectingState } from '../state/SelectingState.js';
import { AlertingState } from '../state/AlertingState.js';
import { SelectedState } from '../state/SelectedState.js';

/** 플레이어에게 할당되는 20가지 고유 색상 테이블 */
const COLOR_TABLE: string[] = [
  '#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF',
  '#44FFFF', '#FF8844', '#8844FF', '#44FF88', '#FF4488',
  '#4488FF', '#88FF44', '#FF6666', '#66FF66', '#6666FF',
  '#FFAA44', '#AA44FF', '#44FFAA', '#FF44AA', '#44AAFF'
];

/** 뽑기 매니저 구현체: 상태 기계 + 포인트 관리 */
export class ChooseManagerImpl implements ChooseManager, StateContext {
  private states: IState[];
  private currentStateType: StateType = StateType.IDLE;
  private points: Map<number, CPoint> = new Map();
  private selectedPoint: CPoint | null = null;
  private viewObserver: ViewObserver | null = null;
  private colorUsage: Map<number, number> = new Map(); // colorIndex → pointId

  constructor() {
    this.states = [
      new IdleState(this),
      new SelectingState(this),
      new AlertingState(this),
      new SelectedState(this)
    ];
    this.states[StateType.IDLE].init();
  }

  setViewObserver(observer: ViewObserver): void {
    this.viewObserver = observer;
  }

  transit(state: StateType): void {
    this.currentStateType = state;
    this.states[state].init();
    this.viewObserver?.onStateChanged(state);
  }

  getPoints(): CPoint[] {
    return Array.from(this.points.values());
  }

  selectRandomPoint(): CPoint | null {
    const pts = this.getPoints();
    if (pts.length === 0) return null;
    const idx = Math.floor(Math.random() * pts.length);
    this.selectedPoint = pts[idx];
    return this.selectedPoint;
  }

  getSelectedPoint(): CPoint | null {
    return this.selectedPoint;
  }

  getCurrentStateType(): StateType {
    return this.currentStateType;
  }

  addPoint(id: number, x: number, y: number): void {
    if (this.points.has(id)) return;

    // 사용하지 않는 색상 인덱스 찾기
    const colorIndex = this.findAvailableColorIndex();
    const color = COLOR_TABLE[colorIndex % COLOR_TABLE.length];
    const point = new CPoint(id, x, y, color, colorIndex);

    this.points.set(id, point);
    this.colorUsage.set(colorIndex, id);
    this.states[this.currentStateType].updatePointList(this.getPoints());
  }

  updatePoint(id: number, x: number, y: number): void {
    const point = this.points.get(id);
    if (point) {
      point.x = x;
      point.y = y;
    }
  }

  removePoint(id: number): void {
    const point = this.points.get(id);
    if (point) {
      this.colorUsage.delete(point.colorIndex);
      this.points.delete(id);
    }
    this.states[this.currentStateType].updatePointList(this.getPoints());
  }

  tick(): void {
    this.states[this.currentStateType].tick();
  }

  private findAvailableColorIndex(): number {
    for (let i = 0; i < COLOR_TABLE.length; i++) {
      if (!this.colorUsage.has(i)) return i;
    }
    return 0;
  }
}
