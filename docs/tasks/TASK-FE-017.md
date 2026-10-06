# TASK-FE-017 — 경기 목록 M01~M05 표시 컴포넌트 분리

## Status

DONE — 2026-09-20 M01~M05 분리·검증 완료. 사용자에 의해 PR #10이 `codex/frontend-rework`에 병합됐으며, 병합 커밋 `17da56c`를 확인했다.

## Goal

PR #9 병합 `eac0cbf`의 `codex/frontend-rework`에서 `codex/profile-match-history-components`로 분기한다.
[화면 정의서](../frontend/SCREEN-MAP.md)의 경기 목록 M01~M05 표시와 전용 CSS를 분리하고 현재 외형·동작을 유지한다.

- `MatchHistory`: 전체 경기 영역, 안내·제목, 자식 조합, 빈 상태와 더 보기.
- `MatchFilters`: M01 조건/More/Reset/날짜 안내 표시.
- `RecentSummary`: M02 최근20경기 요약·최근8경기 스트립.
- `MatchDayGroup`: M03 날짜별 요약과 경기 조합.
- `MatchRow`: M03 경기 행·펼침 버튼.
- `MatchDetail`: M04 펼친 경기의 Overview/Performance 표시.
- `types.ts`: 해당 표시 영역에 필요한 props 데이터 계약만. Mock/API 계약을 정의하지 않는다.
- `MatchHistory.module.css`: 경기 영역 전용 스타일·반응형.

상태·effect·데이터 필터/집계·날짜/숫자 의미·이미지 선택은 부모에 유지한다.
표시값·기존 이미지/아이콘/Select/빈 상태 요소 및 콜백을 전달한다.
필터 변경 시 펼침 닫기/20개 복원, 탭 변경 시 펼침만 닫기, 재펼침 상세 Overview 초기화,
스트립 클릭 펼침→상세 초기화→스크롤, All Matches 및 Load more 동작을 그대로 유지한다.
DOM·문구·ARIA·이미지/SVG·CSS 선언과 반응형 순서를 보존하고 한국어 영역/사용처 주석을 추가한다.
공통 스타일 재구성·상태 훅·Mock/타입/집계 재구성은 이번 Task에 넣지 않는다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.tsx` (신규)
- `frontend/src/features/tracker-profile/match-history/MatchFilters.tsx` (신규)
- `frontend/src/features/tracker-profile/match-history/RecentSummary.tsx` (신규)
- `frontend/src/features/tracker-profile/match-history/MatchDayGroup.tsx` (신규)
- `frontend/src/features/tracker-profile/match-history/MatchRow.tsx` (신규)
- `frontend/src/features/tracker-profile/match-history/MatchDetail.tsx` (신규)
- `frontend/src/features/tracker-profile/match-history/types.ts` (신규)
- `frontend/src/features/tracker-profile/match-history/MatchHistory.module.css` (신규)
- `docs/tasks/TASK-FE-017.md`
- `docs/tasks/TASK-FE-016.md` (확인된 PR #9 병합 상태만)
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/frontend/REFACTORING.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-017.md` (신규)
- `docs/visual-qa/assets/TASK-FE-017/*` (신규)
- `.agent-reports/CURRENT.md` (Codex·공통 상태)

읽기 전용: 프로젝트 지침·계획·기존 Task/QA, 위 소스와 `frontend/src/features/tracker-profile/{header,summary,sidebar}/*`,
`tracker-profile/format.ts`, `tracker-profile/mock.ts`, `tracker-profile/mock.test.cjs`,
`stats-shell/*`, `home/HomeLanding.tsx`/`.module.css`, `frontend/src/components/HomeSearch.tsx`,
`AnalysisExampleCards.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/players/[puuid]/page.tsx`,
frontend package/tsconfig/next.config, `docker/compose.frontend.yml`.
생략한 tracker-profile/stats-shell/home 경로는 `frontend/src/features/` 기준이다.
현재 `.agent-reports/HANDOFF.json`은 없다. 사용자 지정 범위를 이 Task에 기록하며 기획자 인계 문서를 가정하지 않는다.
검증 스크립트는 `/tmp`에 둔다.

## Forbidden changes

- 신규 디자인/기능·자산/이미지/매핑·Mock 수치/산식 변경.
- 홈·상단/시즌 요약·사이드바·라인업 기능 변경.
- 공통 스타일 재구성, 상태·동작 훅, 데이터 공급/집계 계층 정리.
- 백엔드·전역/App 레이아웃·환경/배포·의존성·실제 API/RSO/Overwolf 변경.
- 요청 없는 커밋·푸시·PR·병합·브랜치 삭제·다음 Task 자동 진행.

## Acceptance criteria

1. M01~M05를 지정 표시 컴포넌트/CSS로 분리하고 사용처·부모 책임 주석/문서를 갱신한다.
2. 필터·More/Reset·날짜 안내·빈 결과·최근20요약/8스트립·일별 집계를 보존한다.
3. 한 경기 펼침, 두 상세 탭, 재펼침 초기화, 스트립 스크롤, All Matches/Load more 및 부모 선택 초기화 규칙을 보존한다.
4. Deathmatch 지표/라벨, 다른 프로필 표시명, 이미지/ARIA·키보드·모바일 배치를 유지한다.
5. Before/After·회귀 동작·Mock·타입·Lint·build·허용 경로 검증 후 결과/QA/보고서를 기록한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

Playwright Chromium 100%·DPR1에서 홈/프로필 320~1920px 및 CSS 분기점을 확인한다.
M01~M05 펼침/두 상세탭/여러 필터/빈 결과/Deathmatch/더 보기/스트립 상태를 구현 전후 대조한다.
기존 홈·헤더·시즌·사이드바 회귀를 확인하고 캡처와 정성 평가를 Visual QA로 작성한다.
문서 링크·공백·허용 경로를 확인하고 ignored 보고서를 갱신한다.

## Result

### 구현

- `codex/profile-match-history-components`에서 표시 컴포넌트6개·props 타입·전용 CSS를 분리했다.
- 부모가 기존 집계·날짜/지표·이미지·Select·빈 상태·콜백을 준비한다. 자식은 새 상태나
  Mock/Next/브라우저 API 의존 없이 배치와 표시를 맡는다. 사용처 주석과 화면 정의서를 갱신했다.
- 부모 CSS 1165→452줄, 경기 전용 713줄을 이동했다. 원본259규칙=부모91+전용168이며
  selector/선언/반응형 순서를 보존했다. 공유 CSS와 연결하는 `content`·`selectWrap` marker로
  교차 selector4개의 우선순위를 유지했다. 공통 스타일을 다시 설계하지 않았다.

### 변경 파일

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchFilters.tsx`
- `frontend/src/features/tracker-profile/match-history/RecentSummary.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchDayGroup.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchRow.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchDetail.tsx`
- `frontend/src/features/tracker-profile/match-history/types.ts`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.module.css`
- `docs/tasks/TASK-FE-016.md` (PR #9 병합 상태만), `docs/tasks/TASK-FE-017.md`
- `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/frontend/REFACTORING.md`
- `docs/PROGRESS.md`, `docs/visual-qa/TASK-FE-017.md`
- `docs/visual-qa/assets/TASK-FE-017/`: Before/After30쌍·키보드2장=PNG62장, 검증 요약JSON.
  전체 캡처 목록은 Visual QA의 링크와 검증 JSON에 기록한다.
- `.agent-reports/CURRENT.md` (ignored, 공통 상태·Codex 보고)

### 실행 명령과 검증

- `docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit`: PASS.
- 위 Verification commands의 stop → run(Mock/tsc/Lint/build) → up: 모두 PASS.
  결정적 표본·복합/날짜 필터·빈 상태·가중 집계·그룹 대조 PASS, 타입 PASS,
  Lint0경고0오류, production build 정적11페이지 생성 PASS.
- 개발 서버 재시작 후 `curl --retry 12 --retry-connrefused --retry-delay 1 -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/players/ied-agent-allen`: HTTP200.
- 번들 Node로 `/tmp/fe017-visual.cjs before/after`: 기본56조건 전체 DOM·좌표·계산스타일 동일.
- `/tmp/fe017-match-interactions.cjs before/after`: 경기30상태·22동작 PASS.
  필터/More/Reset·날짜 안내·두 빈 상태·재펼침/상세 탭·스트립·All Matches/Load more·Deathmatch·다른 표시명 확인.
- `/tmp/fe017-sidebar-interactions.cjs before/after`: 사이드바10동작·14연결상태 동일.
  `/tmp/fe017-interactions.cjs` 18개, `/tmp/fe017-summary-interactions.cjs` 11개,
  `/tmp/fe017-header-interactions.cjs` 7개 PASS. 경기 포함 총68개 동작 PASS.
- 번들 Python/Pillow로 `/tmp/fe017-match-crop.py before/after`·`/tmp/fe017-pixels.py`:
  캡처30쌍 모두 픽셀 차이0. 키보드2장도 저장. 원본 full-page와 좌표로 경기 영역을 잘라 sticky 촬영 간섭을 피했다.
- 독립 코드 리뷰: DOM·ARIA·표시값·이벤트 순서·집계/Deathmatch·부모 경계에 회귀 없음.
  CSS 원문 비교259규칙 동일. 모바일 경기 카드 모서리10px도 계산스타일 동일.
- 구현자 Visual QA: PC·모바일 필터/경기/상세/빈 상태 등을 직접 대조, 새 겹침·잘림·정렬 붕괴 없음.
  root도 PC Performance·모바일 Overview 상세 After를 직접 확인했다.
- `python3 /tmp/fe017-check-docs.py`: 허용80파일(소스10·문서7·PNG62·JSON1),
  로컬 링크206개·펜스·공백 PASS. 동결 경로 변경 없음.
- `git diff --check`, `git status --short`: PASS, 명시된 Task 범위만 변경. 최종 상세 근거를 보고서에 기록했다.

### 남은 사항

- 스트립 선택2상태의 잔여 스크롤(Before PC7px/모바일5px, After PC8px/모바일4px)은
  원본 측정을 보존한 채 양쪽을 문서좌표로 환산했다. After에 instant scroll을 호출해도 잔여 이동이 남았다.
  실제 smooth/center 호출은 따로 확인했고 마스킹·앱 수정 없이 동일성을 검증했다.
- 컨테이너의 기존 `git: not found`는 빌드 메타정보 fallback이며 빌드 실패가 아니다.
- `formWin`·`matchWin`의 CSS 정의 없음도 원래 상태로 유지한다. 실제 API/통계 계약은 확정하지 않았다.
- 정식 Cursor 및 사용자 리뷰는 별도다. 후속 공통 스타일·상태/동작·Mock/데이터 분리,
  이미지·라인업·백엔드·환경·의존성 변경은 진행하지 않았다.
- 사용자 요청으로 현재 변경을 커밋·푸시하고 `codex/frontend-rework` 대상 PR로 전달한다.
  원격 기준 `eac0cbf` 동일 및 열린 중복 PR 없음을 확인했다. 검증 이후 소스 변경은 없다.
  이번 보존 기준은 직전 구현의 Overview/Performance 상세이며, 구형 스코어보드·라운드·성과·분석 4탭 복원은 포함하지 않는다.

### 구형 경기 상세 연결 이력 확인

사용자 첨부 화면의 스코어보드·라운드·성과·분석 4탭은 FE-017에서 제거된 기능이 아니다.
2026-09-16의 FE-002 커밋 `ef4e69f80f8ad27cb6e1d8133b10c73e1ddccc60`에서
`players/[puuid]/page.tsx`가 `PlayerProfile` 대신 `TrackerProfile`을 렌더링하도록 바뀌었다.
새 TrackerProfile은 도입 당시부터 Overview/Performance 두 탭을 제공했다.
구형 `MatchDetailPanel`·`MatchTabs`와 4탭 구현은 저장소에 남아 있으나 현재 프로필에서 연결되지 않는다.
이번 PR은 리팩토링 직전 두 탭의 외형·동작을 보존한 것이며 구형 기능 복원은 포함하지 않는다.
해당 이력은 `git show ef4e69f -- frontend/src/app/players/[puuid]/page.tsx`와 구형 탭 코드를
읽기 전용으로 확인했다. 구형 컴포넌트·페이지 진입점은 이번에 수정하지 않았다.
