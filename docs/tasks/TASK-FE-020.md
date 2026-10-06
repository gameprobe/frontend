# TASK-FE-020 — 프로필 공통 스타일 정리

## Status

DONE — PR #13이 `codex/frontend-rework`에 병합됨 (`45bbd06`).

## Goal

프로필 카드·제목·필터·빈 상태 등 여러 표시 영역이 사용하는 스타일을 전용 공통 CSS로 모은다.
현재 화면과 동작을 보존하고, 수정 위치와 사용처를 한국어 주석으로 설명한다.
경기 상세 모달 공통 스타일(FE-019)에 이어 진행하는 두 번째 단계다.

## Allowed changes

- `frontend/src/features/tracker-profile/ProfileShared.module.css` (신규)
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`, `TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/header/`의 `ProfileHeader.tsx`, `ProfileHeader.module.css`, `ProfilePromotion.tsx`, `ProfilePromotion.module.css`, `ProfileFilters.tsx`, `ProfileFilters.module.css`
- `frontend/src/features/tracker-profile/summary/`의 `SeasonOverview.tsx`, `SeasonOverview.module.css`, `ProbeScoreCard.tsx`, `ProbeScoreCard.module.css`, `AgentStatsTable.tsx`, `AgentStatsTable.module.css`
- `frontend/src/features/tracker-profile/sidebar/`의 `ProfileSidebar.tsx`, `ProfileSidebar.module.css`, `AccuracyCard.tsx`, `TopMapsCard.tsx`, `RoleStatsCard.tsx`, `TopWeaponsCard.tsx`, `RankCard.tsx`
- `frontend/src/features/tracker-profile/match-history/`의 `MatchHistory.tsx`, `MatchHistory.module.css`, `MatchDayGroup.tsx`, `MatchRow.tsx`, `MatchDetail.tsx`, `MatchFilters.tsx`, `RecentSummary.tsx`
- TSX 수정은 CSS import·클래스 참조·사용처 주석에 한정한다.
- `docs/tasks/TASK-FE-019.md` (병합 상태만), `docs/tasks/TASK-FE-020.md`
- `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-020.md`, `docs/visual-qa/assets/TASK-FE-020/*`
- `.agent-reports/CURRENT.md` (공통·Codex 섹션만)

HANDOFF.json은 없으며, 사용자가 승인한 후속 작업 범위를 이 Task에 기록한다.
읽기 전용: 위 파일과 프로젝트 지침·계획·과거 Task/QA, `frontend/src/features/stats-shell/*`,
`frontend/src/features/home/*`, `frontend/src/features/tracker-profile/match-history/detail/*`,
`frontend/src/features/tracker-profile/mock.ts`, `mock.test.cjs`, `format.ts`, `match-history/types.ts`,
`frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.js`, `docker/compose.frontend.yml`.
이전 `/tmp/fe018-*.cjs`, `/tmp/fe019-*` 검증 스크립트를 읽고 재사용할 수 있으며 신규 임시 스크립트는 `/tmp/fe020-*`에 작성한다.

## Forbidden changes

- JSX 구조·상태·동작·데이터·Mock·자산·글꼴·디자인 수치 변경
- 홈·라인업·전역 테마·경기 상세 모달 소스 변경
- 역할이나 반응형이 다른 규칙의 강제 통일, 범용 컴포넌트 추가
- 의존성·API·인증·DB·백엔드·배포 변경
- 요청 없는 커밋·푸시·PR·병합, 후속 상태/데이터 Task 자동 시작

## Acceptance criteria

- 공통 표시 규칙을 `ProfileShared.module.css`에서 관리하고 각 소비 영역을 명시한다.
- 상위 페이지 CSS에 의존하던 표시 컴포넌트의 공통 클래스 참조를 분리한다.
- 페이지 배치·전용 표/탭·모바일 차이·CSS 우선순위는 보존한다.
- PC/모바일 프로필 탭·카드·필터·빈 상태 Before/After 화면과 계산 스타일이 동일하다.
- 홈·경기 상세 모달, 프로필 탭/필터/목록/접근성 동작에 회귀가 없다.
- Task Result·Visual QA·진행 로그·Agent Report에 실제 검증 결과를 기록한다.

## Verification commands

```sh
node /tmp/fe020-visual.cjs before
node /tmp/fe020-visual.cjs after
python3 /tmp/fe020-pixels.py
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
node /tmp/fe020-smoke.cjs
git diff --check
```

Node/Python은 필요한 경우 번들 런타임의 절대 경로를 사용한다. 브라우저 세부 검증과 비교 결과는 Visual QA에 기록한다.

## Result

### 실제 변경 파일

- `frontend/src/features/tracker-profile/ProfileShared.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchDayGroup.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.module.css`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchRow.tsx`
- `frontend/src/features/tracker-profile/sidebar/AccuracyCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.module.css`
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.tsx`
- `frontend/src/features/tracker-profile/sidebar/RankCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/RoleStatsCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/TopMapsCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/TopWeaponsCard.tsx`
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.module.css`
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx`
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.module.css`
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.tsx`
- `frontend/src/features/tracker-profile/summary/SeasonOverview.module.css`
- `frontend/src/features/tracker-profile/summary/SeasonOverview.tsx`
- `docs/tasks/TASK-FE-019.md`: PR #12 병합 상태만 갱신.
- `docs/tasks/TASK-FE-020.md`, `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/PROGRESS.md`: 범위·수정 위치·실행 결과.
- `docs/visual-qa/TASK-FE-020.md`, `docs/visual-qa/assets/TASK-FE-020/`: 비교 PNG60장, 초기 차이 진단 PNG1장, verification.json. 개별 경로는 QA 표/진단 링크에 기록.
- `.agent-reports/CURRENT.md`: 공통·Codex 구현 보고(ignored).

### 구현 및 검증

- 공통10클래스와 반응형30선언 블록을 ProfileShared로 이동하고 부모/자식11개 소비자를 직접 연결했다.
- 페이지 배치·알림·전용 표는 로컬에 남겼다. Performance 그래프 전용 표식, 경기/사이드바 표식으로 원래 CSS 우선순위를 유지했다.
- Before/After Playwright: PASS. 58상태 DOM/계산 스타일/좌표 동일, 최종30쌍 픽셀 차이0, pageerror0.
- 6탭·Show More·20→23 목록·복합 필터·빈 결과/초기화·Act/모드·모달5탭·Escape/포커스·표 스크롤 검증 PASS.
- Mock/상세Mock/누락SSR, 타입, Lint(경고/오류0), build(정적11페이지) PASS. 개발 서버 복원 및 HTTP200·모달 smoke PASS.
- 정적 감사와 독립 코드/시각 검토, git diff --check PASS. 별도 Cursor 리뷰는 미실행.
- 실행 명령은 위 Verification commands 및 Visual QA에 기록했다. 첫 빈 상태 조건은 실제 Mock 조합에 맞게 보정했다. 모달 모서리의 초기 캡처 차이는 원본/변경본 재촬영으로 확인했고 엄격한 픽셀 비교를 유지했다.

### 남은 범위

- 새 기능/데이터/디자인 변경 없음. 개별 컴포넌트의 다른 배치·반응형을 강제 통합하지 않는다.
- Select/Sparkline/Empty 함수·상태·집계는 부모에 유지한다. 다음 후보는 상태·동작 분리, 그 뒤 Mock·데이터 처리 분리다.
- 이미지는 기존대로 유지하며 라인업과 API/Overwolf/배포는 이번 범위 밖이다.
- 기존 컨테이너 git 메타데이터 경고 외 새 검증 문제 없음.
- 사용자가 구현을 확인하고 커밋·푸시·PR 전달을 승인했다. `codex/frontend-rework` 대상 PR을 만들며 병합은 사용자가 진행한다.
