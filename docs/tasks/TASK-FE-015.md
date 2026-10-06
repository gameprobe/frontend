# TASK-FE-015 — 프로필 상단 배너·탭·프로모션·시즌 필터 분리

## Status

DONE — 2026-09-20 PR #8이 `codex/frontend-rework`에 병합됨 (`9e84346`).

## Goal

기존 B2b를 상단과 사이드바로 나눠 [화면 정의서](../frontend/SCREEN-MAP.md)의 P02~P05만 수행한다.
프로필 상단의 화면 코드와 전용 CSS를 분리하고 기존 외형·데이터·동작을 유지한다.

- 기준: `codex/frontend-rework`, PR #7 병합 `e4f78bf`.
- 작업 브랜치: `codex/profile-header-components`.
- P02 배너와 P03 탭은 기존 한 header 구조를 유지하는 `ProfileHeader`로 묶는다.
- P04는 `ProfilePromotion`, P05는 `ProfileFilters`로 분리한다.
- 이 영역은 공통 Search 헤더(StatsHeader) 아래, P06 시즌 요약 위에 있다.
- 사이드바 S01~06, 경기 목록, 상태·데이터 계층 분리는 후속 Task다.

## 구현 경계

| 파일 | 책임 | 부모에 유지할 것 |
|---|---|---|
| `header/ProfileHeader.tsx` | 배너·신원·저장/갱신/공유 표시, 프로필 탭 | 이름 결정, 저장·공유·갱신 처리, 선택 탭 상태, 이미지 helper |
| `header/ProfilePromotion.tsx` | 브랜드 프로모션 표시 | Performance 이동 콜백 |
| `header/ProfileFilters.tsx` | PC/Console·모드·Act 표시 | 선택값/선택지, 설정 콜백, Select helper와 연동된 초기화 |
| 각 `.module.css` | 해당 전용 스타일·반응형 | 공통 버튼/Select 등 다른 영역과 공유하는 스타일은 기존 파일 유지 |

- 기존 아이콘·이미지·Select 요소는 필요할 경우 ReactNode 슬롯 또는 className을 받는 render prop으로 연결한다. 자산 선택/경로/크기/속성은 그대로이며 새 자산 체계는 만들지 않는다.
- 상태·effect·localStorage·clipboard·토스트 수명·집계·필터 의미는 부모에 남긴다. 자식은 값/표시 요소와 콜백을 받는다.
- DOM 태그·순서·접근성 속성·링크·문구·이벤트 순서·CSS 선언과 media 순서를 유지한다.
- CSS의 다른 영역 결합 selector는 역할별로 나누되 미분리 영역에 영향이 없어야 한다.
  Act 슬롯은 기존 단일 label/select 구조를 대상으로 `.actFilter > label`과
  `.actFilter > label > select`로 연결한다. 부모 Select 기본값에 대한 우선순위를 유지한다.
  기존 모바일 공통 padding에 덮여 효과가 없던 Act의 padding-left:12px는 옮기지 않아
  원래 계산값10px를 유지한다.
- 한국어 주석과 화면 정의서에 영역 ID, 실제 파일, 데이터/동작 소유 위치를 기록한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/header/ProfileHeader.tsx` (신규)
- `frontend/src/features/tracker-profile/header/ProfileHeader.module.css` (신규)
- `frontend/src/features/tracker-profile/header/ProfilePromotion.tsx` (신규)
- `frontend/src/features/tracker-profile/header/ProfilePromotion.module.css` (신규)
- `frontend/src/features/tracker-profile/header/ProfileFilters.tsx` (신규)
- `frontend/src/features/tracker-profile/header/ProfileFilters.module.css` (신규)
- `docs/tasks/TASK-FE-015.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/frontend/REFACTORING.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-015.md` (신규)
- `docs/visual-qa/assets/TASK-FE-015/*` (신규)
- `.agent-reports/CURRENT.md` (Codex·공통 상태)

읽기 전용: 프로젝트 지침·계획·기존 Task/QA, 위 소스와 `frontend/src/features/tracker-profile/summary/*`,
`tracker-profile/format.ts`, `tracker-profile/mock.ts`, `tracker-profile/mock.test.cjs`,
`stats-shell/*`, `home/HomeLanding.tsx`/`.module.css`, `frontend/src/components/HomeSearch.tsx`,
`AnalysisExampleCards.tsx`, `frontend/src/app/page.tsx`, `frontend/src/app/players/[puuid]/page.tsx`,
frontend package/tsconfig/next.config, `docker/compose.frontend.yml`.
생략한 tracker-profile/stats-shell/home 경로는 `frontend/src/features/` 기준이다.

현재 `.agent-reports/HANDOFF.json`은 없다. 사용자 승인 범위를 이 Task에 정의하며
Claude 인계 문서가 존재한다고 간주하지 않는다. 검증 스크립트는 `/tmp`에 둔다.

## Forbidden changes

- 신규 디자인/기능, 전면 명칭 정리, 자산 파일/매핑/그림 변경, Mock 값·통계 산식 변경.
- 사이드바·경기 목록·요약 컴포넌트·공통 헤더·홈·라인업 기능 변경.
- 백엔드·공용 App 레이아웃·전역 CSS·실행/배포 환경·의존성 변경.
- 실제 Riot API·RSO·Overwolf 연결, 다음 Task 자동 수행, 요청 없는 커밋·푸시·PR·병합·브랜치 삭제.

## Acceptance criteria

1. P02~05 화면과 전용 CSS가 지정 컴포넌트로 이동하고 한국어 사용처 주석을 제공한다.
2. 저장/재방문/저장소 오류·공유 성공/실패·Mock 갱신 안내를 유지한다.
3. 프로필 탭 및 프로모션 이동은 기존 필터/펼침/표시 개수 규칙을 유지한다.
4. PC/Console·모드·Act 선택과 All Acts/복합 필터/Reset/빈 상태가 동일하다.
5. 이미지·아이콘·모바일 탭 가로스크롤·선택 상태·키보드 접근성·시각 배치를 유지한다.
6. Before/After 비교·주요 동작·Mock·타입·Lint·빌드가 통과하고 문서/보고서를 갱신한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

- Playwright Chromium 배율100%·DPR1에서 구현 전후 전체 main DOM/스타일/좌표를 비교한다.
- 홈/프로필 320~1920px 및 기존·이동 CSS 분기점 전후를 확인한다.
- desktop1920/mobile390 전체·P02~05, 저장/갱신/탭/All Acts/Console/Deathmatch/빈 상태를 촬영한다.
- 기존 검색·키보드·저장·공유·시즌/경기 필터·경기 펼침·홈/라인업 전환도 확인한다.
- 허용 파일·동결 경로·문서 링크/펜스·공백과 정성 Visual QA를 확인한다.

## Result

- 구현: P02/P03 `ProfileHeader`, P04 `ProfilePromotion`, P05 `ProfileFilters`를 각각 전용 CSS와 분리했다. 같은 기존 header 구조 안의 배너·탭은 한 컴포넌트로 유지했다.
- 부모는 이름 결정·저장/갱신/공유·탭/시즌 선택·집계를 유지한다. 이미지/아이콘/Select는 부모가 제공하고 자식은 표시 및 콜백 호출만 담당한다. 기존 자산·상태·산식·문구는 그대로다.
- 실제 변경 소스8개:
  - `frontend/src/features/tracker-profile/TrackerProfile.tsx`
  - `frontend/src/features/tracker-profile/TrackerProfile.module.css`
  - `frontend/src/features/tracker-profile/header/ProfileHeader.tsx`
  - `frontend/src/features/tracker-profile/header/ProfileHeader.module.css`
  - `frontend/src/features/tracker-profile/header/ProfilePromotion.tsx`
  - `frontend/src/features/tracker-profile/header/ProfilePromotion.module.css`
  - `frontend/src/features/tracker-profile/header/ProfileFilters.tsx`
  - `frontend/src/features/tracker-profile/header/ProfileFilters.module.css`
- 문서6개: 이 Task, `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/frontend/REFACTORING.md`, `docs/PROGRESS.md`, `docs/visual-qa/TASK-FE-015.md`.
- 산출물: `docs/visual-qa/assets/TASK-FE-015/` PNG50장과 `verification.json`. ignored `.agent-reports/CURRENT.md` Codex·공통 상태 갱신.
- 실행: 위 Verification commands 전부 성공. 번들 Node `/tmp/fe015-visual.cjs before/after`, `/tmp/fe015-interactions.cjs`, `/tmp/fe015-summary-interactions.cjs`, `/tmp/fe015-header-interactions.cjs`, Python/Pillow 픽셀 대조·문서/허용 경로 검사를 수행했다.
- 실제 결과: Mock/타입 PASS, Lint0경고0오류, production build 정적11페이지 PASS. 개발 서버 재실행 완료. 최종56조건 DOM/좌표/23개 계산 스타일/이미지·접근성 속성 일치, pageerror0·가로 넘침0. 동작36개 PASS.
- Visual QA: 24쌍 중23쌍 픽셀0차이. 전체 모바일의 프로모션 둥근 모서리3픽셀만 최대RGB채널1차이. 독립 검토에서 새 배치·글자·겹침/잘림 문제 없음. [상세 보고서](../visual-qa/TASK-FE-015.md)에 수치·캡처·검증 한계를 기록했다.
- 수정한 회귀: 모드 버튼 aria-pressed 누락, Act 모바일 여백12px를 기존10px로 복원. Act 구조 selector와 효과 없던12px 선언 제외는 공통Select 연결을 보존하기 위한 의도된 CSS 차이다.
- 남은 범위/한계: 네이티브 Act 팝업 키 조작은 로컬 headless 자동화에서 확인되지 않아 포커스와 selectOption 이벤트로 검증했다. 버튼의 키보드 동작은 통과했다. 기존 시연값·고정 이미지·LAST20 제목 등은 그대로다. 컨테이너 git 부재는 기존 빌드 정보 fallback이다. 정식 Cursor/사용자 검토는 별도다.
- 전달: 사용자 요청에 따라 현재 변경을 커밋·푸시하고 `codex/frontend-rework` 대상 PR로 전달한다. 원격 기준은 `e4f78bf`로 동일하며 기존 검증 이후 소스 변경은 없다. 전달 전 허용 경로·문서 링크/펜스·공백 검사를 재확인했다.
- S01~06·경기 목록·상태/데이터 분리는 후속 Task. PR 병합 및 다음 Task는 진행하지 않는다.
