import type { CPoint } from '../model/CPoint.js';

/** 모든 뷰의 기반 클래스: 공통 캔버스 그리기 유틸리티 제공 */
export abstract class BaseView {
  protected ctx: CanvasRenderingContext2D;
  protected width: number;
  protected height: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
  }

  /** 캔버스 크기 갱신 */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /** 배경 그리기 */
  protected drawBackground(color = '#0d0d1a'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /** 원 그리기 */
  protected drawCircle(
    x: number, y: number, radius: number,
    color: string, lineWidth = 3, alpha = 1.0
  ): void {
    if (radius <= 0) return;
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
  protected fillCircle(
    x: number, y: number, radius: number,
    color: string, alpha = 1.0
  ): void {
    if (radius <= 0) return;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.restore();
  }

  /** 동심원 세트 그리기 (펄스 애니메이션용) */
  protected drawConcentricCircles(
    x: number, y: number,
    baseRadius: number, count: number, gap: number,
    color: string
  ): void {
    for (let i = 0; i < count; i++) {
      const radius = baseRadius + i * gap;
      const alpha = 1.0 - (i / count) * 0.7;
      this.drawCircle(x, y, radius, color, 3, alpha);
    }
  }

  /** 방사형 선 그리기 (HOLE 타입용) */
  protected drawRadialLines(
    x: number, y: number,
    length: number, color: string,
    degreeStep = 15
  ): void {
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
  protected drawCenteredText(
    text: string, x: number, y: number,
    font: string, color: string, alpha = 1.0
  ): void {
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
  protected drawGlowText(
    text: string, x: number, y: number,
    font: string, color: string, glowColor: string
  ): void {
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
  protected drawPointLabel(point: CPoint, emoji: string): void {
    this.drawGlowText(
      emoji,
      point.x,
      point.y - 60,
      '32px serif',
      '#ffffff',
      point.color
    );
  }

  /**
   * @param points        현재 터치 포인트 목록
   * @param animTick      애니메이션 틱 (0~20 진동)
   * @param selectedPoint 선택된 포인트 (SELECTED 상태에서만 유효)
   * @param stateElapsedMs 현재 상태 진입 후 경과 시간 (ms)
   */
  abstract draw(
    points: CPoint[],
    animTick: number,
    selectedPoint: CPoint | null,
    stateElapsedMs: number
  ): void;
}
