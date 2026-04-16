import { ViewObserver } from '../manager/ChooseManager.js';
import { StateType } from '../state/IState.js';
import { BaseView } from './BaseView.js';
import { IdleView } from './IdleView.js';
import { SelectingView } from './SelectingView.js';
import { AlertingView } from './AlertingView.js';
import { SelectedView } from './SelectedView.js';
import type { CPoint } from '../model/CPoint.js';

/** 현재 상태에 맞는 뷰를 선택하고 렌더링 담당 */
export class ViewManager implements ViewObserver {
  private views: BaseView[];
  private currentStateType: StateType = StateType.IDLE;
  private selectedView: SelectedView;

  constructor(private ctx: CanvasRenderingContext2D) {
    this.selectedView = new SelectedView(ctx);
    this.views = [
      new IdleView(ctx),
      new SelectingView(ctx),
      new AlertingView(ctx),
      this.selectedView
    ];
  }

  onStateChanged(state: StateType): void {
    this.currentStateType = state;
    if (state === StateType.SELECTED) {
      this.selectedView.onInit();
    }
  }

  /** 매 프레임 현재 상태 뷰 렌더링 */
  draw(points: CPoint[], animTick: number, selectedPoint: CPoint | null): void {
    const view = this.views[this.currentStateType];
    // 캔버스 크기 동기화
    const canvas = this.ctx.canvas;
    view.resize(canvas.width, canvas.height);
    view.draw(points, animTick, selectedPoint);
    this.drawTouchPointsInfo();
  }

  /** 우측 상단: 최대 동시 터치 지점 표시 */
  private drawTouchPointsInfo(): void {
    const canvas = this.ctx.canvas;
    const text = `이 브라우저의 최대 동시 터치 지점: ${navigator.maxTouchPoints}`;
    const padding = 10;
    const fontSize = 11;

    this.ctx.save();
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = 'rgba(255,255,255,0.45)';
    this.ctx.fillText(text, canvas.width - padding, padding);
    this.ctx.restore();
  }

  /** 캔버스 리사이즈 시 모든 뷰 업데이트 */
  resize(width: number, height: number): void {
    for (const view of this.views) {
      view.resize(width, height);
    }
  }
}
