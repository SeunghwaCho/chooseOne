/** 게임 루프 콜백 타입 */
export type TickCallback = () => void;
export type RenderCallback = (animTick: number) => void;

/** 60fps 게임 루프 + 800ms 틱 관리 */
export class GameLoop {
  private running = false;
  private lastTimestamp = 0;
  private tickAccumulator = 0;
  private frameCount = 0;
  private animTickValue = 0;
  private animDirection = 1;

  private static readonly TICK_INTERVAL = 800;   // ms 단위 게임 틱
  private static readonly ANIM_TICK_MAX = 20;     // 애니메이션 틱 최댓값
  private static readonly ANIM_UPDATE_MS = 33;    // ~30fps 속도로 animTick 갱신

  private animAccumulator = 0;

  constructor(
    private onTick: TickCallback,
    private onRender: RenderCallback
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  stop(): void {
    this.running = false;
  }

  private loop(timestamp: number): void {
    if (!this.running) return;

    const dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.frameCount++;

    // 게임 틱 처리 (800ms 간격)
    this.tickAccumulator += dt;
    if (this.tickAccumulator >= GameLoop.TICK_INTERVAL) {
      this.tickAccumulator -= GameLoop.TICK_INTERVAL;
      this.onTick();
    }

    // 애니메이션 틱 갱신 (~30fps)
    this.animAccumulator += dt;
    if (this.animAccumulator >= GameLoop.ANIM_UPDATE_MS) {
      this.animAccumulator -= GameLoop.ANIM_UPDATE_MS;
      this.animTickValue += this.animDirection;
      if (this.animTickValue >= GameLoop.ANIM_TICK_MAX) {
        this.animTickValue = GameLoop.ANIM_TICK_MAX;
        this.animDirection = -1;
      } else if (this.animTickValue <= 0) {
        this.animTickValue = 0;
        this.animDirection = 1;
      }
    }

    // 렌더링
    this.onRender(this.animTickValue);

    requestAnimationFrame(this.loop.bind(this));
  }

  /** 현재 틱 진행률 반환 (0.0 ~ 1.0) */
  getTickProgress(): number {
    return this.tickAccumulator / GameLoop.TICK_INTERVAL;
  }

  /** 틱 누산기 리셋 (손가락 변경으로 타이머 재시작 시 호출) */
  resetTickAccumulator(): void {
    this.tickAccumulator = 0;
  }

  getFrameCount(): number {
    return this.frameCount;
  }
}
