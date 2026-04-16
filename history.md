# 개발 이력

## 2026-04-16 - JS 번들링 적용 (단일 파일 출력)

### 작업 내용
- esbuild를 devDependency로 추가하여 JS 번들링 도입
- 빌드 시 13개 JS 파일 → `dist/bundle.js` 단일 파일로 통합 (27.2kb)
- `tsc --noEmit`으로 타입 체크 유지, 번들링은 esbuild가 담당
- `index.html`: `type="module"` 제거, `dist/bundle.js` 단일 참조로 변경
- `build.sh`: 릴리즈 시 `dist/bundle.js`만 복사하도록 간소화
- 기존 `dist/` 서브폴더(core/manager/model/state/view) 및 `main.js` 제거

## 2026-04-16 - 초기 프로젝트 구조 및 핵심 구현

### 작업 내용
- 프로젝트 초기 구조 생성
- Android 원본(chobocho/choose_one) → HTML5 Canvas + TypeScript 포팅

### 생성 파일
- `index.html`: 메인 HTML, Canvas 엘리먼트
- `package.json`, `tsconfig.json`: 빌드 설정 (TypeScript 5, ES2020 모듈)
- `src/model/CPoint.ts`: 터치 포인트 데이터 모델
- `src/state/`: 4개 상태 클래스 (Idle/Selecting/Alerting/Selected)
- `src/manager/ChooseManagerImpl.ts`: 상태 머신 + 포인트 관리 + 색상 할당
- `src/view/`: 5개 뷰 클래스 (Base/Idle/Selecting/Alerting/Selected) + ViewManager
- `src/core/GameLoop.ts`: 60fps rAF 루프 + 800ms 게임 틱
- `src/main.ts`: 진입점, 터치/마우스 이벤트 바인딩
- `tests/state.test.html`: 상태 머신 브라우저 테스트 (10개 케이스)
- `readme.md`: 한글 사용 설명서

### 구현 특징
- 상태 패턴(State Pattern) + 옵저버 패턴 적용
- 터치/마우스 모두 지원 (PC 우클릭으로 멀티포인트 시뮬레이션)
- animTick 0↔20 진동으로 펄스 애니메이션 구현
- CENTER/HOLE 두 가지 당첨 표시 모드 (매번 랜덤)
- 20가지 색상 자동 할당
