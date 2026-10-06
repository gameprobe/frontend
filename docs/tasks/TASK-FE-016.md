# TASK-FE-016 — 프로필 사이드바 표시 컴포넌트 분리

## Status

DONE — 2026-09-20 PR #9가 `codex/frontend-rework`에 병합됨 (`eac0cbf`).

## Goal

PR #8 병합 `9e84346`의 `codex/frontend-rework`에서 `codex/profile-sidebar-components`로 분기한다.
[화면 정의서](../frontend/SCREEN-MAP.md)의 S01~S06 표시와 전용 CSS를 분리한다.
프로필 상단 P02~P05와 중앙 P06~P08은 이미 분리되어 있으며 이번 범위에 포함하지 않는다.

- `ProfileSidebar`: S01~S06 순서·배치와 짧은 S02 프로모션 조합.
- `RankCard`: S01 현재/최고 랭크.
- `AccuracyCard`: S03 명중 부위·기존 인체 SVG·그래프 표시.
- `RoleStatsCard`: S04 역할별 표본 표시.
- `TopWeaponsCard`, `TopMapsCard`: S05/S06 카드 표시와 선택 콜백.
- `ProfileSidebar.module.css`: 사이드바 전용 스타일과 반응형.

기존 DOM·문구·색·간격·접근성·이미지·SVG 경로·선택 동작을 보존한다.
각 파일에 화면 ID·사용처·부모가 제공하는 데이터/동작을 한국어 주석으로 기록한다.
상태·집계·필터·탭 이동·이미지 helper와 공용 그래프 helper는 부모에 유지하고 필요한 값/요소/콜백을 전달한다.
인체 SVG는 현재 형상과 속성을 그대로 S03 표시 코드와 이동할 수 있으며 새 자산 체계를 만들지 않는다.
Body/Legs 임시 계산, 역할별 표본, 대표 무기 기반 통계의 의미는 변경하지 않는다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.tsx` (신규)
- `frontend/src/features/tracker-profile/sidebar/RankCard.tsx` (신규)
- `frontend/src/features/tracker-profile/sidebar/AccuracyCard.tsx` (신규)
- `frontend/src/features/tracker-profile/sidebar/RoleStatsCard.tsx` (신규)
- `frontend/src/features/tracker-profile/sidebar/TopWeaponsCard.tsx` (신규)
- `frontend/src/features/tracker-profile/sidebar/TopMapsCard.tsx` (신규)
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.module.css` (신규)
- `docs/tasks/TASK-FE-016.md`
- `docs/tasks/TASK-FE-015.md` (확인된 PR #8 병합 상태만)
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/frontend/REFACTORING.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-016.md` (신규)
- `docs/visual-qa/assets/TASK-FE-016/*` (신규)
- `.agent-reports/CURRENT.md` (Codex·공통 상태)

읽기 전용: 프로젝트 지침·계획·기존 Task/QA, 위 소스와 `frontend/src/features/tracker-profile/{header,summary}/*`,
`tracker-profile/format.ts`, `tracker-profile/mock.ts`, `tracker-profile/mock.test.cjs`,
`stats-shell/*`, `home/HomeLanding.tsx`/`.module.css`, `frontend/src/components/HomeSearch.tsx`,
`AnalysisExampleCards.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/players/[puuid]/page.tsx`,
frontend package/tsconfig/next.config, `docker/compose.frontend.yml`.
생략한 tracker-profile/stats-shell/home 경로는 `frontend/src/features/` 기준이다.
현재 `.agent-reports/HANDOFF.json`은 없다. 사용자 지정 범위를 이 Task에 명시하며 기획자 인계 문서가 있다고 간주하지 않는다.
검증 스크립트는 `/tmp`에 둔다.

## Forbidden changes

- 디자인/기능 추가, 자산 취득·그림/매핑 변경, Mock 값·통계 산식 변경.
- 경기 목록·상단/요약·공통 헤더·홈·라인업 기능 변경.
- 백엔드·App 레이아웃·전역 CSS·실행/배포 설정·의존성 변경.
- 실제 API·RSO·Overwolf 구현 및 후속 Task 자동 진행.
- 요청 없는 커밋·푸시·PR·병합·브랜치 삭제.

## Acceptance criteria

1. S01~S06을 지정 표시 컴포넌트/CSS로 분리하고 사용처 주석·화면 정의서를 갱신한다.
2. 시즌/플랫폼/모드 변경에 따른 사이드바 수치와 빈 상태를 그대로 유지한다.
3. S02 Performance, S05/S06 카드 선택 및 View All 동작·필터 유지/초기화·펼침 상태를 보존한다.
4. 기존 이미지·SVG·그래프·반응형 배치·키보드 접근성을 유지한다.
5. Before/After 캡처와 DOM/배치/스타일·상호작용·Mock/타입/Lint/build 검증을 통과한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

Playwright Chromium 100%·DPR1에서 홈/프로필 desktop1920/mobile390과 CSS 분기점 전후를 비교한다.
기존 전환/필터 회귀와 사이드바 클릭·키보드·빈 결과를 확인하고 캡처·정성 평가를 Visual QA에 기록한다.
허용 경로·문서 링크·공백을 확인하고 ignored 보고서를 갱신한다.

## Result

- 구현: S01~S06을 `ProfileSidebar`와 랭크·명중 부위·역할·무기·맵 카드 5개로 분리했다. S02는 짧은 프로모션으로 조합 컴포넌트 안에 두었다. 화면 ID·역할·데이터 소유 위치를 한국어 주석으로 기록했다.
- 부모의 상태·집계·필터·탭 이동·이미지/Sparkline helper를 유지했다. 자식은 값·기존 이미지/그래프 요소·콜백을 받으며 Mock/Next/브라우저 API/상태에 직접 의존하지 않는다.
- 인체 SVG는 path·속성·태그 순서를 그대로 AccuracyCard로 이동했다. S03 임시 산식과 S04 역할당 요원 1명 표본 선택, S05 대표 무기별 집계 의미를 유지했다.
- 소스 변경9개: 부모 TSX/CSS 2개 및 Allowed changes의 sidebar TSX 6개/CSS 1개. CSS 390줄을 부모에서 옮겼고 공통 `card`·`sectionHeading`·`yellow`·`sparkline`은 기존 파일에 남겼다. 제목에는 공통 클래스와 사이드바 모바일 표식을 함께 적용해 기존 우선순위를 보존했다.
- 문서 변경7개: 이 Task, FE-015의 확인된 PR #8 병합 상태, 프론트 PLAN/SCREEN-MAP/REFACTORING, PROGRESS, Visual QA. PNG54장과 `verification.json`은 `docs/visual-qa/assets/TASK-FE-016/`에 보관한다. ignored `.agent-reports/CURRENT.md` 갱신.
- 실행: Verification commands의 Mock/타입/Lint/build와 서버 복원 성공. 추가 초기 `docker compose ... exec -T frontend npx tsc --noEmit` PASS. 복원 후 프로필 HTTP 200.
- Playwright: `/tmp/fe016-visual.cjs before/after`, sidebar Before/After 동작 대조, 기존 검색/시즌/상단 회귀 스크립트. 홈/프로필 21너비 및 7상태×2너비 총56조건에서 DOM·좌표·23개 계산 스타일·접근성/이미지/SVG 일치, pageerror·문서 가로 넘침0. 총46개 동작 PASS, 사이드바14상태 Before/After 동일.
- Visual QA: 캡처26쌍 모두 픽셀 차이0. desktop/mobile 사이드바·명중 부위·무기·맵을 직접 대조해 새 배치/겹침/잘림을 발견하지 못했다. [보고서](../visual-qa/TASK-FE-016.md)에 캡처·근거·자동화 한계를 기록한다.
- 독립 코드 대조: 부모의 사이드바 밖 JSX/로직 동일, SVG 동일. CSS349개 조건/selector/선언 단위 및 반응형 순서 동일, 값 변경0. 허용71파일·문서 링크184개·펜스·공백 검사 PASS.
- 남은 범위/한계: 경기 목록과 공통 표시 스타일, 상태·동작, Mock·타입·집계·데이터 공급 분리는 후속 Task. 기존 고정 이미지·시연 수치·데이터 의미를 유지했다. 네이티브 Act 팝업 방향키 선택은 headless 제약으로 포커스/선택 변경 이벤트까지만 검증했다. 컨테이너의 git 부재 메시지는 기존 빌드 정보 fallback이다. 정식 Cursor/사용자 검토는 별도다.
- 전달: 사용자 요청에 따라 커밋·푸시하고 `codex/frontend-rework` 대상 PR로 전달한다. 원격 통합 기준은 `9e84346`으로 동일하며 기존 검증 이후 소스 변경은 없다. 전달 전 허용 파일·문서 링크/펜스·공백 검사를 재확인했다.
- PR 병합 및 다음 Task는 진행하지 않는다.
