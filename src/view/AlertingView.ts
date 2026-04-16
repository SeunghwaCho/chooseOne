import { BaseView } from './BaseView.js';
import type { CPoint } from '../model/CPoint.js';

/** 알림 상태 뷰: 선택 직전 강조 플래시 효과 */
export class AlertingView extends BaseView {
  draw(points: CPoint[], animTick: number, selectedPoint: CPoint | null, _stateElapsedMs: number): void {
    const flashAlpha = (animTick / 20) * 0.3;
    this.drawBackground('#050510');

    // 전체 화면 플래시
    if (selectedPoint) {
      this.ctx.save();
      this.ctx.globalAlpha = flashAlpha;
      this.ctx.fillStyle = selectedPoint.color;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }

    this.drawAlertPoints(points, animTick, selectedPoint);
    this.drawAlertText(animTick);
  }

  /** 알림 포인트 시각화 */
  private drawAlertPoints(
    points: CPoint[], animTick: number, selectedPoint: CPoint | null
  ): void {
    const pulse = animTick / 20;

    for (const pt of points) {
      const isSelected = selectedPoint?.id === pt.id;
      const baseRadius = isSelected ? 60 + pulse * 40 : 35 + pulse * 20;
      const circleCount = isSelected ? 6 : 4;

      for (let i = circleCount - 1; i >= 0; i--) {
        const radius = baseRadius + i * 30;
        const alpha = isSelected
          ? (1.0 - i * 0.15) * (0.6 + pulse * 0.4)
          : (0.3 - i * 0.06);
        this.drawCircle(pt.x, pt.y, radius, pt.color, isSelected ? 4 : 2, alpha);
      }

      // 중심 원
      this.fillCircle(pt.x, pt.y, isSelected ? 35 : 22, pt.color, 0.95);
      this.drawCenteredText(
        String(pt.colorIndex + 1),
        pt.x,
        pt.y,
        `bold ${isSelected ? 26 : 18}px sans-serif`,
        '#000000'
      );
    }
  }

  /** 알림 텍스트 */
  private drawAlertText(animTick: number): void {
    const alpha = 0.7 + (animTick / 20) * 0.3;
    this.drawGlowText(
      '🎯 뽑는 중...',
      this.width / 2,
      this.height / 2,
      `bold ${Math.round(this.width * 0.055)}px sans-serif`,
      `rgba(255,255,180,${alpha.toFixed(2)})`,
      '#ffff44'
    );
  }
}
