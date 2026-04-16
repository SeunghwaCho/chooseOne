import { BaseView } from './BaseView.js';
/** 선택 중 상태 뷰: 동심원 펄스 + 손가락 개수 + 카운트다운 타이머 */
export class SelectingView extends BaseView {
    draw(points, animTick, _selectedPoint, tickProgress) {
        this.drawBackground('#050510');
        this.drawPulsingPoints(points, animTick);
        this.drawCountdownTimer(points.length, tickProgress);
    }
    /** 각 포인트에 펄스하는 동심원 + 번호 */
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
    /**
     * 중앙 카운트다운 UI:
     *  - 진행 호(arc)  : tickProgress 0→1 에 따라 시계방향으로 채워짐
     *  - 손가락 개수   : 호 안쪽 중앙
     *  - 상태 문구     : 개수에 따라 다름
     */
    drawCountdownTimer(count, tickProgress) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const ringR = Math.min(this.width, this.height) * 0.14;
        // ── 배경 반투명 원 ──
        this.fillCircle(cx, cy, ringR + 6, 'rgba(0,0,0,0.5)');
        // ── 회색 트랙 ──
        this.drawCircle(cx, cy, ringR, 'rgba(255,255,255,0.15)', 6);
        // ── 진행 호 ──
        const startAngle = -Math.PI / 2; // 12시 방향
        const sweepAngle = Math.PI * 2 * tickProgress;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, ringR, startAngle, startAngle + sweepAngle);
        this.ctx.strokeStyle = '#ffffaa';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#ffff44';
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();
        this.ctx.restore();
        // ── 손가락 개수 (큰 숫자) ──
        this.drawGlowText(String(count), cx, cy - 10, `bold ${Math.round(ringR * 0.95)}px sans-serif`, '#ffffff', '#aaaaff');
        // ── "개 손가락" 부제목 ──
        this.drawCenteredText('개 손가락', cx, cy + ringR * 0.55, `${Math.round(ringR * 0.38)}px sans-serif`, 'rgba(200,200,255,0.75)');
        // ── 하단 안내 문구 ──
        const guide = count < 2
            ? '⚠️ 손가락이 부족합니다'
            : '🤚 손가락을 유지하세요...';
        this.drawCenteredText(guide, cx, cy + ringR + 28, `${Math.round(this.width * 0.028)}px sans-serif`, count < 2 ? 'rgba(255,120,120,0.9)' : 'rgba(180,180,255,0.8)');
    }
}
