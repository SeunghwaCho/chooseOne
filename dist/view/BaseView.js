/** 모든 뷰의 기반 클래스: 공통 캔버스 그리기 유틸리티 제공 */
export class BaseView {
    constructor(ctx) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }
    /** 캔버스 크기 갱신 */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }
    /** 배경 그리기 */
    drawBackground(color = '#0d0d1a') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    /** 원 그리기 */
    drawCircle(x, y, radius, color, lineWidth = 3, alpha = 1.0) {
        if (radius <= 0)
            return;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.restore();
    }
    /** 채워진 원 그리기 */
    fillCircle(x, y, radius, color, alpha = 1.0) {
        if (radius <= 0)
            return;
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.restore();
    }
    /** 동심원 세트 그리기 (펄스 애니메이션용) */
    drawConcentricCircles(x, y, baseRadius, count, gap, color) {
        for (let i = 0; i < count; i++) {
            const radius = baseRadius + i * gap;
            const alpha = 1.0 - (i / count) * 0.7;
            this.drawCircle(x, y, radius, color, 3, alpha);
        }
    }
    /** 방사형 선 그리기 (HOLE 타입용) */
    drawRadialLines(x, y, length, color, degreeStep = 15) {
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        for (let deg = 0; deg < 360; deg += degreeStep) {
            const rad = (deg * Math.PI) / 180;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.cos(rad) * length, y + Math.sin(rad) * length);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    /** 중앙 정렬 텍스트 그리기 */
    drawCenteredText(text, x, y, font, color, alpha = 1.0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
    /** 발광 효과 텍스트 그리기 */
    drawGlowText(text, x, y, font, color, glowColor) {
        this.ctx.save();
        this.ctx.font = font;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    /** 포인트에 이모지 레이블 그리기 */
    drawPointLabel(point, emoji) {
        this.drawGlowText(emoji, point.x, point.y - 60, '32px serif', '#ffffff', point.color);
    }
}
