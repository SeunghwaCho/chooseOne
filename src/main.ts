import { ChooseManagerImpl } from './manager/ChooseManagerImpl.js';
import { ViewManager } from './view/ViewManager.js';
import { GameLoop } from './core/GameLoop.js';

/** 캔버스 초기화 및 크기 조정 */
function initCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context를 가져올 수 없습니다.');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  return { canvas, ctx };
}

/** 마우스/터치 이벤트 등록 (PC + 모바일 지원) */
function bindInputEvents(
  canvas: HTMLCanvasElement,
  manager: ChooseManagerImpl
): void {
  // 터치 이벤트 (모바일)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const touch of Array.from(e.changedTouches)) {
      const rect = canvas.getBoundingClientRect();
      manager.addPoint(
        touch.identifier,
        touch.clientX - rect.left,
        touch.clientY - rect.top
      );
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const touch of Array.from(e.changedTouches)) {
      const rect = canvas.getBoundingClientRect();
      manager.updatePoint(
        touch.identifier,
        touch.clientX - rect.left,
        touch.clientY - rect.top
      );
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of Array.from(e.changedTouches)) {
      manager.removePoint(touch.identifier);
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', (e) => {
    for (const touch of Array.from(e.changedTouches)) {
      manager.removePoint(touch.identifier);
    }
  });

  // 마우스 이벤트 (PC - 포인터 ID: 1000)
  const MOUSE_ID = 1000;
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    manager.addPoint(MOUSE_ID, e.clientX - rect.left, e.clientY - rect.top);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (e.buttons > 0) {
      const rect = canvas.getBoundingClientRect();
      manager.updatePoint(MOUSE_ID, e.clientX - rect.left, e.clientY - rect.top);
    }
  });

  canvas.addEventListener('mouseup', () => {
    manager.removePoint(MOUSE_ID);
  });

  canvas.addEventListener('mouseleave', () => {
    manager.removePoint(MOUSE_ID);
  });

  // PC 멀티 마우스 시뮬레이션: 우클릭 = 두 번째 포인트 (테스트용)
  const MOUSE_ID2 = 1001;
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    if (manager.getPoints().filter(p => p.id === MOUSE_ID2).length === 0) {
      manager.addPoint(MOUSE_ID2, e.clientX - rect.left, e.clientY - rect.top);
    } else {
      manager.removePoint(MOUSE_ID2);
    }
  });
}

/** 메인 진입점 */
function main(): void {
  const { canvas, ctx } = initCanvas();
  const manager = new ChooseManagerImpl();

  // GameLoop를 먼저 생성 후 ViewManager에 전달 (tickProgress 접근 필요)
  const gameLoop = new GameLoop(
    () => { manager.tick(); },
    (animTick) => {
      viewManager.draw(
        manager.getPoints(),
        animTick,
        manager.getSelectedPoint()
      );
    }
  );

  const viewManager = new ViewManager(ctx, gameLoop);

  // 상태 변경 시 뷰 알림 연결
  manager.setViewObserver(viewManager);

  // 리사이즈 시 뷰도 갱신
  window.addEventListener('resize', () => {
    viewManager.resize(canvas.width, canvas.height);
  });

  bindInputEvents(canvas, manager);
  gameLoop.start();

  console.log('🎯 Choose One 게임 시작!');
  console.log('💡 팁: 우클릭으로 두 번째 포인트를 추가하여 PC에서 테스트하세요.');
}

// DOM 로드 완료 후 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
