/** 60fps 게임 루프 + 800ms 틱 관리 */
export class GameLoop {
    constructor(onTick, onRender) {
        this.onTick = onTick;
        this.onRender = onRender;
        this.running = false;
        this.lastTimestamp = 0;
        this.tickAccumulator = 0;
        this.frameCount = 0;
        this.animTickValue = 0;
        this.animDirection = 1;
        this.animAccumulator = 0;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }
    stop() {
        this.running = false;
    }
    loop(timestamp) {
        if (!this.running)
            return;
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
            }
            else if (this.animTickValue <= 0) {
                this.animTickValue = 0;
                this.animDirection = 1;
            }
        }
        // 렌더링
        this.onRender(this.animTickValue);
        requestAnimationFrame(this.loop.bind(this));
    }
    /** 현재 틱 진행률 반환 (0.0 ~ 1.0) */
    getTickProgress() {
        return this.tickAccumulator / GameLoop.TICK_INTERVAL;
    }
    /** 틱 누산기 리셋 (손가락 변경으로 타이머 재시작 시 호출) */
    resetTickAccumulator() {
        this.tickAccumulator = 0;
    }
    getFrameCount() {
        return this.frameCount;
    }
}
GameLoop.TICK_INTERVAL = 800; // ms 단위 게임 틱
GameLoop.ANIM_TICK_MAX = 20; // 애니메이션 틱 최댓값
GameLoop.ANIM_UPDATE_MS = 33; // ~30fps 속도로 animTick 갱신
