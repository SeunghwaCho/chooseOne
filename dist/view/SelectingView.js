import { BaseView } from './BaseView.js';
/** 선택 중 상태 뷰: 동심원 펄스 + 카운트다운 */
export class SelectingView extends BaseView {
    draw(points, animTick) {
        this.drawBackground('#050510');
        this.drawPulsingPoints(points, animTick);
        this.drawStatusText(animTick);
    }
    /** 각 포인트에 펄스하는 동심원 그리기 */
    drawPulsingPoints(points, animTick) {
        const pulse = animTick / 20; // 0.0 ~ 1.0
        const baseRadius = 40 + pulse * 30;
        for (const pt of points) {
            // 5겹 동심원
            for (let i = 4; i >= 0; i--) {
                const radius = baseRadius + i * 35;
                const alpha = (1.0 - i * 0.18) * (0.5 + pulse * 0.5);
                this.drawCircle(pt.x, pt.y, radius, pt.color, 3, alpha);
            }
            // 중심 채워진 원
            this.fillCircle(pt.x, pt.y, 28, pt.color, 0.9);
            this.drawCenteredText(String(pt.colorIndex + 1), pt.x, pt.y, 'bold 22px sans-serif', '#000000');
        }
    }
    /** 상태 텍스트 표시 */
    drawStatusText(animTick) {
        const alpha = 0.6 + (animTick / 20) * 0.4;
        this.drawCenteredText('🤚 손가락을 유지하세요...', this.width / 2, 30, `bold ${Math.round(this.width * 0.03)}px sans-serif`, `rgba(180,180,255,${alpha.toFixed(2)})`);
    }
}
