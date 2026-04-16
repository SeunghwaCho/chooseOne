import { BaseView } from './BaseView.js';
import type { CPoint } from '../model/CPoint.js';

/** 대기 상태 뷰: 안내 메시지 + 터치 포인트 + 손가락 개수 피드백 */
export class IdleView extends BaseView {
  draw(points: CPoint[], animTick: number, _selectedPoint: CPoint | null, _stateElapsedMs: number): void {
    this.drawBackground();
    this.drawInstructions(animTick, points.length);
    this.drawTouchPoints(points);
  }

  /** 안내 텍스트 (손가락 수에 따라 메시지 변경) */
  private drawInstructions(animTick: number, count: number): void {
    const bounce = Math.sin((animTick / 20) * Math.PI) * 8;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const baseFontSize = Math.round(this.width * 0.04);

    if (count === 0) {
      // 손가락 없음: 기본 안내
      this.drawGlowText(
        '✋ 두 손가락 이상 올려주세요',
        cx, cy - 30 + bounce,
        `bold ${baseFontSize}px sans-serif`,
        '#ffffff', '#8888ff'
      );
      this.drawCenteredText(
        '⏳ 잠시 기다리면 뽑아드려요!',
        cx, cy + 30 + bounce,
        `${Math.round(this.width * 0.025)}px sans-serif`,
        'rgba(180,180,255,0.85)'
      );
      this.drawCenteredText(
        '👆👆👆',
        cx, cy + 80 + bounce,
        `${Math.round(this.width * 0.06)}px serif`,
        'rgba(255,255,255,0.6)'
      );
    } else if (count === 1) {
      // 손가락 1개: 하나 더 올리라는 안내
      this.drawGlowText(
        '☝️ 손가락 하나가 더 필요해요!',
        cx, cy - 20 + bounce,
        `bold ${baseFontSize}px sans-serif`,
        '#ffdd88', '#aa8800'
      );
      this.drawFingerCountBadge(1, cx, cy + 50 + bounce);
    } else {
      // 손가락 2개 이상: 틱 대기 중
      this.drawGlowText(
        '✅ 잠시 후 시작됩니다...',
        cx, cy - 20 + bounce,
        `bold ${baseFontSize}px sans-serif`,
        '#88ff88', '#008800'
      );
      this.drawFingerCountBadge(count, cx, cy + 50 + bounce);
    }
  }

  /** 손가락 개수 배지 */
  private drawFingerCountBadge(count: number, cx: number, cy: number): void {
    const r = Math.min(this.width, this.height) * 0.07;
    this.fillCircle(cx, cy, r, 'rgba(100,100,200,0.35)');
    this.drawCircle(cx, cy, r, 'rgba(180,180,255,0.6)', 2);
    this.drawCenteredText(
      String(count),
      cx, cy - 4,
      `bold ${Math.round(r * 1.1)}px sans-serif`,
      '#ffffff'
    );
    this.drawCenteredText(
      '개',
      cx, cy + r * 0.65,
      `${Math.round(r * 0.5)}px sans-serif`,
      'rgba(200,200,255,0.8)'
    );
  }

  /** 현재 터치 포인트 시각화 */
  private drawTouchPoints(points: CPoint[]): void {
    for (const pt of points) {
      this.fillCircle(pt.x, pt.y, 30, pt.color, 0.8);
      this.drawCircle(pt.x, pt.y, 35, pt.color, 3, 0.9);
      this.drawCircle(pt.x, pt.y, 50, pt.color, 2, 0.4);
      this.drawCenteredText(
        String(pt.colorIndex + 1),
        pt.x, pt.y,
        'bold 20px sans-serif',
        '#000000'
      );
    }
  }
}
