# TASK-FE-004 — 홈 글자 가독성 보완

## Status

IMPLEMENTED — 구현·검증 완료, 사람 검토 대기 (2026-09-16).

## Goal

홈 테마 변경을 `7d66a7f`로 먼저 커밋한 뒤, 작은 글자와 검색 버튼 대비를
보완한다. 큰 제목과 현재 테마·기능은 유지한다.

## Allowed changes

- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/home/HomeLanding.tsx` (홈 전용 스타일 클래스와 검색 바로가기 접근성 이름만)
- `docs/tasks/TASK-FE-004.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 결과 요약)
- `docs/visual-qa/TASK-FE-004.md`
- `docs/visual-qa/assets/TASK-FE-004/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태만)

읽기: 홈 구성/검색/분석 컴포넌트, 참조하는 프로필 CSS, 전역 CSS/레이아웃,
관련 폰트 선언. HANDOFF.json은 없으며 사용자 지정 피드백을 이 범위에 반영한다.

## Forbidden changes

- 프로필·라인업·전역 CSS/레이아웃·데이터·API·백엔드 변경
- 새 폰트/패키지/외부 자산, 전체 재디자인 또는 모듈 리팩터링
- 근거 없는 텍스트 blur/outline/smoothing 강제 보정
- 후속 변경 자동 커밋·푸시·병합 및 다음 Task 자동 시작

## Acceptance criteria

- 홈 본문/조작 글씨 14px 이상, 입력창 16px, 보조 정보 최소 12px (로고 제외).
- 제목 크기와 색상 테마는 유지하고 읽을 내용이 있는 작은 글자의 대비를 확인한다.
- 검색 버튼 흰색 글자와 배경 대비 4.5:1 이상.
- 1440px/390px Before·After, 320px/768px 넘침·레이아웃 확인.
- 기존 검색/프로필·라인업 진입 및 키보드 메뉴 동작 유지.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저의 computed style 및 대비 계산, 반응형 화면 캡처와 동작 검증을 수행한다.

## Stop conditions

- 동일 원인 검증 실패 3회
- 라인업/공통 CSS 변경이나 새 의존성이 필요한 경우
- 같은 파일의 사용자 변경 발견 시 보존하고 확인

## Result

### 변경 파일과 구조

- `frontend/src/features/home/HomeLanding.module.css`: 홈 본문 15~16px,
  입력 16px, 버튼/링크 14px, 보조 정보 최소 12px. 본문·placeholder·CTA 명도와
  검색/계정 버튼 대비 개선. 모바일 검색 세로 배치 및 지도 태그 겹침 방지.
- `frontend/src/features/home/HomeLanding.tsx`: 홈 전용 헤더/내비게이션/계정
  스타일 클래스와 좁은 화면에서 아이콘으로 표시되는 검색 바로가기 접근성 이름.
- `docs/tasks/TASK-FE-004.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`.
- `docs/visual-qa/TASK-FE-004.md`.
- `docs/visual-qa/assets/TASK-FE-004/before-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-004/before-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-004/after-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-004/after-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-004/after-mobile-bottom.jpg`
- `.agent-reports/CURRENT.md` (ignored).

### 실행 명령과 검증 결과

- `docker compose -f docker/compose.frontend.yml stop frontend`: 정상 중지.
- `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'`:
  PASS — 타입 검사, Lint 경고/오류 0, Next.js 빌드 및 정적 페이지 11개 생성.
- `docker compose -f docker/compose.frontend.yml up -d frontend`: 정상 재시작.
- `git diff --check`: PASS.
- 320/390/768/1440px 넘침 없음. 모바일 로고 외 보이는 글자 12px 미만 없음.
- 검색 버튼 대비 3.45:1 → 5.12:1, hover 6.16:1. 큰 제목과 font family 유지.
- 검색, 프로필/라인업 이동, 메뉴 Escape 및 검색 바로가기 포커스 PASS.
- Before/After 5개 캡처와 독립 코드/시각 리뷰 PASS.

### 남은 주의 사항

- OS/브라우저의 폰트 렌더링 차이를 없앤 것은 아니다. 이번 변경은 확인된
  작은 글자와 버튼 대비 문제를 홈 범위에서 보완한다.
- 프로필/라인업/공통 CSS·동작·Mock·의존성은 변경하지 않았다.
- 기존 Docker `git: not found` 메시지는 메타데이터 fallback이며 빌드는 성공했다.
- 홈 테마는 사용자 요청으로 `7d66a7f`에 커밋했다. 이 후속 가독성 변경은
  미커밋 상태로 검토 대기한다. 푸시·병합·다음 Task 자동 시작 없음.
