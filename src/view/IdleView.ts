import { BaseView } from './BaseView.js';
import type { CPoint } from '../model/CPoint.js';

/** 대기 상태 뷰: 안내 메시지 + 터치 포인트 표시 */
export class IdleView extends BaseView {
  draw(points: CPoint[], animTick: number): void {
    this.drawBackground();
    this.drawInstructions(animTick);
    this.drawTouchPoints(points);
  }

  /** 안내 텍스트 표시 (상하 바운스 애니메이션) */
  private drawInstructions(animTick: number): void {
    const bounce = Math.sin((animTick / 20) * Math.PI) * 8;
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 메인 안내 메시지
    this.drawGlowText(
      '✋ 두 손가락 이상 올려주세요',
      cx,
      cy - 30 + bounce,
      `bold ${Math.round(this.width * 0.04)}px sans-serif`,
      '#ffffff',
      '#8888ff'
    );

    // 보조 안내 메시지
    this.drawCenteredText(
      '⏳ 잠시 기다리면 뽑아드려요!',
      cx,
      cy + 30 + bounce,
      `${Math.round(this.width * 0.025)}px sans-serif`,
      'rgba(180,180,255,0.85)'
    );

    // 손 이모지 장식
    const emojiSize = Math.round(this.width * 0.06);
    this.drawCenteredText(
      '👆👆👆',
      cx,
      cy + 80 + bounce,
      `${emojiSize}px serif`,
      'rgba(255,255,255,0.6)'
    );
  }

  /** 현재 터치 포인트 시각화 */
  private drawTouchPoints(points: CPoint[]): void {
    for (const pt of points) {
      // 채워진 원
      this.fillCircle(pt.x, pt.y, 30, pt.color, 0.8);
      // 외곽 원
      this.drawCircle(pt.x, pt.y, 35, pt.color, 3, 0.9);
      this.drawCircle(pt.x, pt.y, 50, pt.color, 2, 0.4);

      // 번호 표시
      this.drawCenteredText(
        String(pt.colorIndex + 1),
        pt.x,
        pt.y,
        'bold 20px sans-serif',
        '#ffffff'
      );
    }
  }
}
