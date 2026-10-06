# TASK-FE-005 — 홈·프로필 상단 내비게이션 크기 보완

## Status

IMPLEMENTED — 구현·검증 완료, 사람 검토 대기 (2026-09-16).

## Goal

캡처로 지정한 상단 내비게이션의 글자·검색·More 버튼과 세로 여백을 확대한다.
홈/전적 프로필에만 반영하고 동료의 라인업 화면은 변경하지 않는다.
기존 미커밋 TASK-FE-004 홈 가독성 변경은 보존한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.module.css` (내비게이션과 직접 연관된 반응형 규칙만)
- `frontend/src/features/home/HomeLanding.module.css` (내비게이션 관련 override만)
- `docs/tasks/TASK-FE-005.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md` (이번 작업 요약)
- `docs/visual-qa/TASK-FE-005.md`
- `docs/visual-qa/assets/TASK-FE-005/*`
- `.agent-reports/CURRENT.md` (Codex 및 공통 상태만)

읽기: 홈/프로필 JSX의 내비게이션, CSS Module import 사용처, 관련 기존 Task.
HANDOFF.json 없음. 사용자 지정 영역을 이 Task 범위로 한정한다.

## Forbidden changes

- 라인업 및 공통 레이아웃/전역 CSS 수정
- 본문 재디자인, 메뉴 이름·기능 변경, API·데이터·의존성 변경
- 전체 페이지 zoom/scale 강제 적용, 기존 미커밋 변경 되돌리기
- 사용자 요청 없는 commit/push/merge 및 다음 Task 자동 시작

## Acceptance criteria

- 데스크톱 메뉴·검색·More 글자 16px, 내비게이션 높이 68px, 컨트롤 높이 최소44px.
- 모바일 내비게이션 높이64px 및 글자16px 유지, 좁은 화면 겹침/가로 넘침 없음.
- 홈/프로필에 일관되게 반영하며 검색·메뉴·프로필 탭과 sticky 동작 유지.
- 1440px/390px Before·After, 320/768/1100px 추가 레이아웃 점검.
- 라인업/공통 파일 변경 없음.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저 computed style, 컨트롤 위치, 검색/메뉴/탭 및 라인업 스타일 경계 검증.

## Stop conditions

- 동일 원인 검증 실패 3회
- 라인업/공통 파일 수정 또는 새 의존성이 필요한 경우
- 새 사용자 변경과 충돌 시 보존하고 확인

## Result

### 변경 파일과 구조

- `frontend/src/features/tracker-profile/TrackerProfile.module.css`: 바 높이68/64px,
  메뉴·검색·More16px, 검색/More44px. 버튼 아래 메뉴 간격8px, 내부 스크롤/포커스,
  480px 이하 여백/검색 로고 생략 등 내비게이션 규칙만 보완.
- `frontend/src/features/home/HomeLanding.module.css`: 프로필과 동일한16px 및
  좁은 화면44px 검색 바로가기, 활성 밑줄 정렬. 기존 FE-004 보존.
- `docs/tasks/TASK-FE-005.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`.
- `docs/visual-qa/TASK-FE-005.md`.
- `docs/visual-qa/assets/TASK-FE-005/before-home-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-005/before-home-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-005/before-profile-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-005/before-profile-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-005/after-home-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-005/after-home-mobile.jpg`
- `docs/visual-qa/assets/TASK-FE-005/after-profile-desktop.jpg`
- `docs/visual-qa/assets/TASK-FE-005/after-profile-mobile.jpg`
- `.agent-reports/CURRENT.md` (ignored).

### 실행 명령과 검증 결과

- `docker compose -f docker/compose.frontend.yml stop frontend`: 정상 중지.
- `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'npx tsc --noEmit && npm run lint && npm run build'`:
  PASS — 타입 검사, Lint 경고/오류0, Next.js 빌드 및 정적 페이지11개 생성.
- `docker compose -f docker/compose.frontend.yml up -d frontend`: 정상 재시작.
- `git diff --check`: PASS.
- 홈/프로필320/390/768/1100/1440px 가로 넘침과 영역 겹침 없음.
- computed style: 메뉴16px, 검색/More44px, 바68px/모바일64px.
- 검색·More·프로필 탭 전환, 홈 Escape 및 검색 포커스, sticky 유지 PASS.
- Before/After8장 및 독립 코드/시각 리뷰 PASS. 자세한 근거는 Visual QA 참조.

### 주의 사항과 다음 확인

- 768px 프로필의 일부 메뉴는 기존처럼 내비게이션 내부에서 가로 스크롤한다.
  전체 페이지 가로 넘침은 없다.
- 본문 및 최상단 브랜드 바, 메뉴 이름/동작은 그대로다. 라인업/공통 파일 미변경.
- 기존 Docker git 부재 로그는 build metadata fallback이며 빌드는 성공했다.
- FE-004와 이번 FE-005는 미커밋 상태다. 사용자 화면 검토 후 별도 지시로 커밋한다.
  푸시·병합 및 다음 Task 자동 시작 없음.
