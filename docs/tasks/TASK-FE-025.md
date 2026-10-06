# TASK-FE-025 — 보조 화면·공통 버튼·안내·탭 사이드바 일관성 정리

## Status

IMPLEMENTED — 검증 완료, 사용자 승인으로 PR 제출·병합 검토 단계

## Goal

계정 연결·정책·기록 없음 화면을 홈·프로필의 공통 테마로 맞춘다. 사용자 승인 확장에서 주요 행동 버튼의 색, 설명·피드백 문구, 짧은 프로필 탭의 사이드바까지 정리한다. 라인업은 제외한다.

## Baseline

- 사용자 디자인 감사 및 단계별 정리 승인. PR #17 병합 `36faaba`를 `codex/frontend-rework`에 fast-forward pull하고 `codex/support-page-theme`에서 작업한다.
- 참조: 홈·프로필의 기존 stats-shell 테마. 1차는 보조/오류 화면을 처리하고, 승인 확장은 기존 홈/프로필의 버튼·안내·사이드바를 처리한다.
- 초기 보조 화면 정리는 `2018b08`로 검증 후 커밋했다. 사용자 후속 승인으로 버튼·안내·사이드바도 같은 Task/브랜치에서 이어서 정리한다.

## Allowed changes

- `frontend/src/features/stats-shell/SupportPage.tsx`, `SupportPage.module.css` — 보조 화면 외곽과 세 가지 찾을 수 없음 안내가 공유할 표시 UI
- `frontend/src/features/stats-shell/StatsHeader.tsx` — 홈 외부에서 Search가 홈 입력창으로 이동하도록 선택적 주소만 지원. 홈/프로필 검색 동작 유지. 버튼·안내 변경은 아래 승인 확장 참고
- `frontend/src/app/connect/page.tsx`, `privacy/page.tsx`, `terms/page.tsx` — 기존 본문을 공통 보조 화면에 연결
- `frontend/src/app/players/[puuid]/page.tsx`, `matches/[matchId]/page.tsx`, `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx` — 존재하지 않는 기록 분기의 공통 안내만 변경
- `docs/tasks/TASK-FE-025.md`, `docs/tasks/TASK-FE-024.md`(병합 상태), `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-025.md`, `docs/visual-qa/assets/TASK-FE-025/**`
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`(공통/Codex 섹션), `/private/tmp/fe025-*`

아래 승인 확장을 포함한 Allowed changes 밖의 HANDOFF 소스는 비교용 읽기 전용이다.

### 사용자 승인 확장 (2026-09-21)

- 추가 변경 허용: `frontend/src/features/stats-shell/theme.module.css`, `StatsShell.module.css`, `StatsHeader.tsx`, `StatsFooter.tsx`, `branding.ts`, `copy.ts`, `SupportPage.tsx`, `SupportPage.module.css`.
- 추가 변경 허용: `frontend/src/features/home/HomeLanding.tsx`, `HomeLanding.module.css`, `frontend/src/components/HomeSearch.tsx`, `RiotConnectNotice.tsx`.
- 추가 변경 허용: `frontend/src/features/tracker-profile/TrackerProfile.tsx`, `TrackerProfile.module.css`, `header/ProfileHeader.tsx`, `header/ProfileHeader.module.css`, `hooks/useProfileBrowserActions.ts`, `sidebar/ProfileSidebar.tsx`, `sidebar/ProfileSidebar.module.css`, `SyntheticMatchPage.tsx`, `summary/SeasonOverview.tsx`, `summary/ProbeScoreCard.tsx`, `summary/AgentStatsTable.tsx`, `sidebar/RankCard.tsx`, `match-history/MatchFilters.tsx`, `match-history/MatchHistory.tsx`. 이 중 summary 3개·RankCard·MatchFilters·MatchHistory는 안내/빈 상태 문구만 변경한다.
- 기존 connect/privacy/terms/players/matches 페이지 문구 수정 허용. 약관·개인정보의 법적 의미/정책은 유지하며 개발 작업 번호/Phase와 예전 서비스명만 사용자에게 읽히는 표현으로 바꾼다.
- 공통 주요 행동 버튼의 기본/hover/글자 색을 토큰으로 모은다. 저장 완료·비활성·필터·승패 등 다른 의미의 색은 유지한다.
- 내비게이션/통계명은 기존 영문 기준을 유지한다. 데모/실제 데이터 미연결 안내·저장/공유 피드백·정책 안내는 한국어 기준으로 정리하고 같은 안내는 재사용한다.
- Agents/Maps/Weapons의 사이드바는 랭크와 Overview 복귀만 표시한다. 상세 통계·전체 사이드바는 Overview/Matches/Performance에 남기고 이미지/수치/필터를 변경하지 않는다.
- 기존 Before/After 증거는 보존하고 `consistency-*` 별도 캡처·검사 결과를 추가한다. 1440/820/390px에서 모든 프로필 탭과 두 데모, 계정·홈·문서·없는 기록을 확인한다.
- 현재 완료분과 추가분을 별도 커밋한다. push/PR/merge는 하지 않는다.

### 언어 전환 추가 승인 (2026-09-21)

- 기준 `0a2c08b`, 같은 브랜치에서 홈·프로필·보조 화면의 한국어 안내를 영어로도 볼 수 있는 버튼을 추가한다.
- 위 허용 파일과 `frontend/src/features/stats-shell/StatsShell.tsx`, `locale.tsx`, `frontend/src/components/AnalysisExampleCards.tsx` 변경 허용. 필요한 번역은 공통 copy 또는 해당 표시 컴포넌트 옆에서 관리한다.
- 공통 헤더에 언어 전환 버튼을 추가하고 기본 한국어·영어 선택, 같은 브라우저의 화면 이동/새로고침/다른 탭에서 선택 유지, 저장 제한 시 현재 탭에서 동작한다.
- 첫 서버/클라이언트 출력 일치를 지키고 표시 언어를 main의 lang에 적용한다. 프로필 필터·선택 경기·저장 등 기존 상태는 언어 변경으로 초기화하지 않는다.
- 홈/분석 예시/프로필 설명·상태/보조 페이지·법적 초안의 현재 한국어 표시를 번역한다. 고유 게임/통계/메뉴명과 기존 영문 경기 상세5탭은 유지한다. 라인업은 제외한다.
- 정책은 기존 초안 의미를 번역만 하며 실제 인증·데이터 수집·법률 효력을 변경하지 않는다.
- `language-*` Playwright Before/After 캡처와 전환/저장/새로고침/탐색/저장차단/모바일 넘침을 검증한다. TypeScript/Lint/build 및 영향받는 기존 회귀 확인.
- 기존 2개 로컬 커밋은 보존한다. 이번 추가분의 commit/push/PR/merge는 별도 요청 없이 하지 않는다.

### Language 목록 추가 승인 (2026-09-21)

- 직전 미커밋 언어 구현을 기준으로 토글 버튼을 Language 박스와 한국어/English 선택 목록으로 바꾼다.
- 제품 변경은 `StatsHeader.tsx`, `StatsShell.module.css`, `locale.tsx`에 한정한다. 위 문서/QA/보고서 경로의 변경도 허용한다.
- 마우스 hover, 클릭/터치, 키보드로 목록 열기·선택·Escape/바깥 클릭 닫기를 지원한다. 현재 언어를 표시하고 저장/페이지 이동 유지 기능을 보존한다.
- 지원 언어 코드·표시 이름을 한곳에 모으고 이후 언어 추가 시 번역 연결이 필요한 위치를 주석/SCREEN-MAP에 기록한다. 아직 번역되지 않은 언어는 노출하지 않는다.
- `language-menu-*` Before/After 캡처, 320/390/820/1440px, 두 언어·홈/프로필/보조 화면, hover 이동·터치·키보드·선택 상태·저장/새로고침·오류/넘침을 검증한다. 타입/Lint/build 확인.
- 앞선 작업과2커밋을 보존한다. 후속 PR 제출 승인은 아래 항목을 따른다.

### PR 제출 승인 (2026-09-21)

- 사용자가 현재 상태의 커밋·푸시·PR 작성을 요청했다. 대상은 `codex/frontend-rework`이며 병합은 사용자가 직접 수행한다.
- 검증된 제품 코드는 그대로 제출한다. 한국어·영어 전환 대상의 확대/축소는 동료 논의 후 별도 요청에서 조정한다.
- 아래 과거 Result의 미커밋/미푸시 표시는 당시 단계의 기록이다. 이번 제출은 앞선 두 커밋과 언어 선택 추가분을 묶는다.

## Forbidden changes

- 라인업/관리자/백엔드/API/인증 정책/실제 로그인/데이터/이미지/의존성 변경
- 약관·개인정보·계정 연결 안내의 의미/정책 변경, 전역 CSS·RootLayout 변경
- 승인 확장 밖의 홈·프로필·정상 경기 상세 디자인 변경, 광범위한 컴포넌트 분리
- 사용자 대신 PR 병합, 새 Task 자동 시작

## Acceptance criteria

- 연결·정책3페이지가 현재 공통 GP 브랜드·2단 메뉴·평면 배경·푸터를 사용하며 구형 헤더/푸터 중복 없음.
- 본문 제목28px 기준, 문서용 읽기 폭과 여백; 모바일에서 카드/본문/메뉴 가로 넘침 없음.
- 기존/합성 경기 없음과 플레이어 없음은 같은 제목·카드·복귀 동작 기준을 사용한다. 홈 기본 복귀는 기존 디자인 데모, 합성 경기 없음의 복귀는 새 데모를 유지한다.
- Search는 보조 페이지에서도 홈 입력창으로 이동. More 메뉴와 정책 간 이동, Escape/초점 복귀 동작 확인.
- 법적 의미 및 비활성 계정 연결 상태 유지. 동의/인증을 구현한 것처럼 표시하지 않는다.
- 홈·기존/새 프로필·정상 상세 캡처/이동 회귀 확인. 라인업 관련 소스 diff0.
- Playwright Before/After, 시각 검증 보고서, Task 결과와 Agent Report 기록.

## Verification commands

- 1차 기록: `PLAYWRIGHT_MODULES=<기존 Playwright 경로> node docs/visual-qa/assets/TASK-FE-025/browser-qa.cjs before|after` — Before는 `36faaba`, After는 `2018b08`에서 실행했다. 현재 문구 변경본에 1차 본문 동일성 검사를 적용하지 않는다.
- 현재 확장: 같은 환경에서 `node docs/visual-qa/assets/TASK-FE-025/consistency-qa.cjs before|after`, `node docs/visual-qa/assets/TASK-FE-025/consistency-actions.cjs`. Before는 `2018b08`, After는 확장본에서 실행한다.
- Docker frontend `npx tsc --noEmit`, `npm run lint`, `npm run build`
- `git diff --check`, 허용 파일·문서 링크 확인

### 확장 검증 기준

- 홈·프로필·보조 페이지 계정 버튼의 기본/hover 색 일치, 홈 데모/미저장/복귀 버튼도 공통 주요 행동 색 적용. 저장 완료·비활성·키보드 초점 유지.
- 데이터 시연 사실·실제 검색/인증 미연결, 원본4경기·수치·필터·미제공 의미 및 기존/새 데모 진입 유지.
- 연결/정책 본문에서 TASK/Phase/예전 서비스명 제거, 정책 의미/초안 상태 유지.
- 두 데모의 6탭, PC/태블릿/모바일 탭 전환·짧은 탭 compact·Overview 전체 복원·선택 필터 동작·겹침/가로 넘침 확인.
- 새 `consistency-qa.cjs` Before/After, 타입/Lint/build, 데이터 기존 회귀, 범위/링크/공백 검사. 기존 FE025 캡처는 1차 작업 증거로 보존.

## Result — Language 선택 목록 추가

### 구현 요약

- 공통 브랜드 바의 직접 전환 버튼을 Language 박스와 한국어·English 목록으로 교체했다. 선택한 언어에 체크 표시를 제공한다.
- 마우스 hover/클릭·터치·키보드로 열고 선택한다. 방향키/Home/End 이동, Escape 닫기, 메뉴 내부 초점의 버튼 복귀, 외부 초점의 보존, 바깥 클릭/Tab 닫기를 지원한다.
- hover 이동 통로를 확보하고 메뉴를 내비게이션 위에 표시한다. 320px에서는 브랜드/계정 패딩과 글자 크기를 조절해 세 항목을 유지한다.
- supportedLanguages에서 코드·이름과 저장값 유효성 검증을 함께 관리한다. 기존 언어 저장·번역·프로필 상태는 유지했다.
- 독립 코드 검토에서 외부 입력에 초점을 둔 hover 메뉴의 Escape 누락을 발견해 보완했고, 실제 입력 초점 보존까지 재검증했다.

### 이번 요청의 변경 파일 전체

직전 미커밋 언어 구현에 덧붙인 변경이다. 앞선 전체 번역 변경 목록은 아래 기록에 보존한다.

- `frontend/src/features/stats-shell/StatsHeader.tsx`
- `frontend/src/features/stats-shell/StatsShell.module.css`
- `frontend/src/features/stats-shell/locale.tsx`
- `docs/tasks/TASK-FE-025.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-025.md`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-1440-connect-en-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-1440-connect-ko-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-1440-home-en-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-1440-home-ko-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-1440-profile-en-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-1440-profile-ko-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-390-connect-en-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-390-connect-ko-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-390-home-en-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-390-home-ko-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-390-profile-en-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-390-profile-ko-open.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-after-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-1440-connect-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-1440-home-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-1440-profile-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-390-connect-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-390-home-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-390-profile-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-before-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-smoke-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-state-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-state-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-menu-store-results.json`
- `.agent-reports/HANDOFF.json (ignored)`
- `.agent-reports/CURRENT.md (ignored)`

### 실행 명령·검증 결과

- `PLAYWRIGHT_MODULES=<기존 Playwright 경로> node docs/visual-qa/assets/TASK-FE-025/language-menu-qa.cjs before` / `after` — PASS,20/32검사·Before6/After12캡처·브라우저 오류0. Before는 변경 전 기존 토글 상태에서만 실행했다.
- 같은 환경의 `language-menu-state-qa.cjs` — 최종205검사 PASS,320/390/820/1440px×홈/프로필/연결×한국어/영어의24레이아웃. 마우스·터치·키보드·초점·저장·이동·다른 탭 동기화 확인.
- `docker compose -f docker/compose.frontend.yml exec -T frontend node < /private/tmp/fe025-language-store.cjs > docs/visual-qa/assets/TASK-FE-025/language-menu-store-results.json` — 실제 locale.tsx 저장소22검사 PASS.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit` — PASS.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint` — PASS,경고/오류0.
- `docker compose -f docker/compose.frontend.yml stop frontend` → `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` → `docker compose -f docker/compose.frontend.yml up -d frontend` — PASS,최종 컴파일·타입/Lint·정적11페이지 생성 및 개발 서버 복원.
- `node /private/tmp/fe025-language-menu-smoke.cjs` — PASS,복원 후8검사. 모바일 언어 선택·기본 데모 이동·새로고침·한국어 복귀·기존20행·브라우저 오류0.

- 파일 범위·문서 링크·산출물·파일 목록 및 `git diff --check` — PASS,브랜치 전체239파일 목록 일치·365상대링크·18캡처·5검사 결과 확인.

### 남은 사항

- 지원 목록 추가만으로 새 언어 번역이 자동 생성되지는 않는다. statsCopies와 현재 t(한국어, 영어) 방식의 화면별 번역도 함께 확장해야 한다.
- 저장 제한 시 현재 방문의 선택은 유지하지만 새로고침 이후 영구 저장은 보장하지 않는다.
- 기존 이미지·데이터·라우트·인증·백엔드·라인업·운영 의존성과 기존2커밋은 유지했다. 사용자 승인에 따라 언어/메뉴 추가분을 별도 커밋하여 PR에 제출한다. 병합은 사용자가 수행한다.

## Result — 한국어·영어 전환 추가

### 구현 요약

- 공통 헤더의 EN/한국어 버튼으로 홈·프로필·보조 화면의 설명/알림/본문을 전환한다. 모바일에서도 버튼을 표시하고 StatsShell의 main lang을 바꾼다.
- locale.tsx의 공유 구독과 localStorage로 선택을 유지한다. 서버 최초 출력 한국어와 hydration 일치를 보장하고 저장 제한 시 현재 방문의 메모리 선택을 유지한다.
- 다른 탭의 변경을 동기화하며, 구독자가 없는 동안 놓친 변경도 복귀 시 읽는다. 저장 실패한 선택을 오래된 저장값으로 덮지 않는다.
- 반복 문구는 copy.ts의 같은 키를 가진 한국어/영어 사전, 개별 문구는 표시 컴포넌트의 t(한국어, 영어)로 관리한다. 법적 본문은 기존 초안 의미를 번역만 한다.
- 알림은 내부 동작 코드로 보관해 언어 전환 시 열린 알림도 번역한다. 3.2초 타이머·필터·탭·선택 경기·저장 상태는 초기화하지 않는다.
- 사용처/데이터와의 경계는 코드 주석 및 SCREEN-MAP에 기록했다. 독립 소스 재검토와 PC/모바일 직접 시각 대조에서 남은 결함 없음.

### 추가 변경 파일 전체

`0a2c08b` 이후 언어 추가분. 앞선1차·2차 전체 목록은 아래 기록에 유지한다.

- `docs/PROGRESS.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/tasks/TASK-FE-025.md`
- `docs/visual-qa/TASK-FE-025.md`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-connect-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-connect-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-home-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-home-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-legacy-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-legacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-new-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-new-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-privacy-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-privacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-terms-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-1440-terms-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-connect-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-connect-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-home-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-home-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-legacy-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-legacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-new-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-new-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-privacy-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-privacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-terms-en.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-390-terms-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-after-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-before-1440-connect-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-1440-home-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-1440-legacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-1440-new-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-1440-privacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-1440-terms-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-390-connect-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-390-home-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-390-legacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-390-new-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-390-privacy-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-390-terms-ko.png`
- `docs/visual-qa/assets/TASK-FE-025/language-before-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-english-audit.cjs`
- `docs/visual-qa/assets/TASK-FE-025/language-english-audit.json`
- `docs/visual-qa/assets/TASK-FE-025/language-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-025/language-regression-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-smoke-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-state-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-025/language-state-results.json`
- `docs/visual-qa/assets/TASK-FE-025/language-store-results.json`
- `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`
- `frontend/src/components/AnalysisExampleCards.tsx`
- `frontend/src/components/HomeSearch.tsx`
- `frontend/src/components/RiotConnectNotice.tsx`
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/stats-shell/StatsFooter.tsx`
- `frontend/src/features/stats-shell/StatsHeader.tsx`
- `frontend/src/features/stats-shell/StatsShell.module.css`
- `frontend/src/features/stats-shell/StatsShell.tsx`
- `frontend/src/features/stats-shell/SupportPage.tsx`
- `frontend/src/features/stats-shell/copy.ts`
- `frontend/src/features/stats-shell/locale.tsx`
- `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/header/ProfileHeader.tsx`
- `frontend/src/features/tracker-profile/hooks/useProfileBrowserActions.ts`
- `frontend/src/features/tracker-profile/match-history/MatchFilters.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.tsx`
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.tsx`
- `frontend/src/features/tracker-profile/sidebar/RankCard.tsx`
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx`
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.tsx`
- `frontend/src/features/tracker-profile/summary/SeasonOverview.tsx`
- `.agent-reports/HANDOFF.json` (ignored)
- `.agent-reports/CURRENT.md` (ignored)

### 실행 명령·검증 결과

- `PLAYWRIGHT_MODULES=<기존 Playwright 경로> node docs/visual-qa/assets/TASK-FE-025/language-qa.cjs before` / `after` — PASS,38/94검사, Before12/After24캡처, 브라우저 오류0.
- 같은 환경의 `language-state-qa.cjs` — 최종 저장소 보완 후 재실행 PASS,215검사·1440/820/390/320px의64조건. 초기값/이동/새로고침/다른 탭/저장차단/필터/저장/열린 모달 상세 탭 유지.
- `language-store-qa.cjs` — 실제 locale.tsx를 변환해 검증,22검사 PASS. 구독 해제/재등록·저장 실패·오래된 저장값·invalid/clear 이벤트 구별.
- `node /private/tmp/fe025-language-regression.cjs`(기존 consistency-actions를 결과 경로만 바꾸어 실행) —104검사 PASS. 저장/공유/검색/갱신/필터/시나리오/재시도/데모 진입 유지.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit` — PASS.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint` — PASS, 경고/오류0.
- `docker compose -f docker/compose.frontend.yml stop frontend` → `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` → `docker compose -f docker/compose.frontend.yml up -d frontend` — PASS, 최종 컴파일·타입/Lint·정적11페이지 생성 및 개발 서버 복원.
- `node /private/tmp/fe025-language-smoke.cjs` — PASS,8검사. 복원 후 모바일 한국어→영어→기존 데모 이동→새로고침 유지→한국어,20행·오류0.
- 영어12개 캡처 본문에서 한국어 전환 버튼을 제외한 한글 잔여0. 번역 대상/정책 의미·데이터 수치는 독립 검토 및 브라우저로 확인.
- 파일 범위·문서 링크·파일 목록 및 `git diff --check` — PASS, 언어 추가 77허용파일·340상대링크·36캡처·6검사결과·브랜치 전체214파일 목록 일치.

### 남은 사항

- 기본 한국어, 안내/홈/보조 본문은 두 언어를 제공한다. 기존 영문 메뉴·통계/게임 이름·상세5탭은 유지한다. 라인업/관리자 전체 번역 작업은 아니다.
- 브라우저 저장이 차단되면 현재 방문에서는 전환할 수 있지만 완전한 새로고침 이후 저장 유지까지 보장하지 않는다.
- 실제 Riot API·인증은 미연결, 법적 문서는 초안이다. 데이터·이미지·백엔드·RootLayout/전역 CSS·운영 의존성을 변경하지 않았다.
- 컨테이너의 기존 git: not found 안내와 별개로 타입/Lint/build는 통과했다. 최초 Before 촬영 중 임시 미완성 패치로 발생한500은 복원 후 다시 촬영해 최종 오류0을 확인했다.
- 기존2커밋은 보존했고 언어 추가분은 미커밋이다. push/PR/merge 및 다음 Task는 수행하지 않았다. 사용자/Cursor 검토는 별도다.

## Result — 언어 전환 추가 이전의 1차·2차 기록

### 구현 요약

- 1차 보조 화면 정리를 검증 후 `2018b08`로 커밋했다. SupportPage/MissingRecordPage가 연결·정책·기록 없음의 외곽/제목/복귀 UI를 공유하고 조회·본문은 호출자가 소유한다.
- 주요 행동 버튼은 THEME의 `--action-bg`, `--action-hover`, `--action-text`를 재사용한다. 저장 완료·비활성·필터·승패 상태 색과 초점 표시를 유지했다.
- 반복 문구는 `stats-shell/copy.ts`에 모았다. 홈·프로필·보조 화면 설명과 저장/공유/검색 피드백을 한국어로 정리하고 메뉴·통계·필터 이름은 기존 영문을 유지했다.
- 정책 문서의 TASK/Phase·예전 서비스명을 정리했다. 정책 의미·초안·법률 검토·비제휴·미연결 안내는 유지했다.
- Agents/Maps/Weapons에서는 랭크와 Overview 복귀만 표시한다. Overview/Matches/Performance는 전체 사이드바를 유지한다. 선택 필터·통계·이미지·기존/새 데모 경로는 보존했다.
- 사용처·상태 경계는 인접 주석과 SCREEN-MAP에 기록했다. 독립 소스 검토와 직접 시각 대조에서 구체적인 결함을 발견하지 못했다.

### 변경된 파일 전체

기준선 `36faaba` 이후 1차·확장을 합친 목록이다.

- `docs/PROGRESS.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/tasks/TASK-FE-024.md`
- `docs/tasks/TASK-FE-025.md`
- `docs/visual-qa/TASK-FE-025.md`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-legacy-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-missing-legacy-match.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-missing-player.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-missing-synthetic-match.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-new-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-synthetic-detail.png`
- `docs/visual-qa/assets/TASK-FE-025/after-1440-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-home.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-legacy-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-missing-legacy-match.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-missing-player.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-missing-synthetic-match.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-new-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-synthetic-detail.png`
- `docs/visual-qa/assets/TASK-FE-025/after-390-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/after-results.json`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-legacy-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-missing-legacy-match.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-missing-player.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-missing-synthetic-match.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-new-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-synthetic-detail.png`
- `docs/visual-qa/assets/TASK-FE-025/before-1440-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-home.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-legacy-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-missing-legacy-match.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-missing-player.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-missing-synthetic-match.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-new-profile.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-synthetic-detail.png`
- `docs/visual-qa/assets/TASK-FE-025/before-390-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/before-results.json`
- `docs/visual-qa/assets/TASK-FE-025/browser-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-025/consistency-actions-results.json`
- `docs/visual-qa/assets/TASK-FE-025/consistency-actions.cjs`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-legacy-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-legacy-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-legacy-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-legacy-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-missing.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-new-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-new-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-new-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-new-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-1440-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-home.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-legacy-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-legacy-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-legacy-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-legacy-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-missing.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-new-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-new-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-new-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-new-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-390-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-home.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-legacy-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-legacy-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-legacy-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-legacy-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-missing.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-new-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-new-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-new-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-new-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-820-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-after-results.json`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-legacy-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-legacy-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-legacy-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-legacy-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-missing.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-new-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-new-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-new-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-new-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-1440-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-home.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-legacy-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-legacy-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-legacy-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-legacy-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-missing.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-new-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-new-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-new-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-new-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-390-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-connect.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-home.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-legacy-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-legacy-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-legacy-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-legacy-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-missing.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-new-agents.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-new-maps.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-new-overview.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-new-weapons.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-privacy.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-820-terms.png`
- `docs/visual-qa/assets/TASK-FE-025/consistency-before-results.json`
- `docs/visual-qa/assets/TASK-FE-025/consistency-height-results.json`
- `docs/visual-qa/assets/TASK-FE-025/consistency-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-025/consistency-smoke-results.json`
- `docs/visual-qa/assets/TASK-FE-025/regression-pixels.json`
- `docs/visual-qa/assets/TASK-FE-025/smoke-results.json`
- `frontend/src/app/connect/page.tsx`
- `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/app/privacy/page.tsx`
- `frontend/src/app/terms/page.tsx`
- `frontend/src/components/HomeSearch.tsx`
- `frontend/src/components/RiotConnectNotice.tsx`
- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/stats-shell/StatsFooter.tsx`
- `frontend/src/features/stats-shell/StatsHeader.tsx`
- `frontend/src/features/stats-shell/StatsShell.module.css`
- `frontend/src/features/stats-shell/SupportPage.module.css`
- `frontend/src/features/stats-shell/SupportPage.tsx`
- `frontend/src/features/stats-shell/copy.ts`
- `frontend/src/features/stats-shell/theme.module.css`
- `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/header/ProfileHeader.module.css`
- `frontend/src/features/tracker-profile/header/ProfileHeader.tsx`
- `frontend/src/features/tracker-profile/hooks/useProfileBrowserActions.ts`
- `frontend/src/features/tracker-profile/match-history/MatchFilters.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.tsx`
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.module.css`
- `frontend/src/features/tracker-profile/sidebar/ProfileSidebar.tsx`
- `frontend/src/features/tracker-profile/sidebar/RankCard.tsx`
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx`
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.tsx`
- `frontend/src/features/tracker-profile/summary/SeasonOverview.tsx`
- `.agent-reports/HANDOFF.json` (ignored)
- `.agent-reports/CURRENT.md` (ignored)

### 실행한 명령어·검증 결과

- 1차 `browser-qa.cjs before` / `after` — PASS,49/181검사·40캡처. `2018b08` 당시 본문 보존·주요 화면8쌍 픽셀 일치 및 복원 smoke PASS. 원래 증거를 수정하지 않았다.
- `PLAYWRIGHT_MODULES=<기존 Playwright 경로> node docs/visual-qa/assets/TASK-FE-025/consistency-qa.cjs before` / `after` — PASS,164/593검사·각51상태·각39캡처. 1440/820/390px, 수치/필터 동일, pageerror/console error0.
- 같은 환경에서 `node docs/visual-qa/assets/TASK-FE-025/consistency-actions.cjs` — PASS,104검사. 저장/공유/검색/갱신/필터/모달/기본 데모와 partial/empty/error/Console 상태 검증. 최초 모바일 숨김 카드 선택 timeout은 보이는 링크를 검사하도록 하니스를 보정한 뒤 통과했다.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit` — PASS.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint` — PASS, 경고/오류0.
- Docker frontend Node 실행기로 아래 기존6파일을 각각 실행 — 모두 PASS. 데이터·테스트 소스 변경 없음:
  - `node src/features/tracker-profile/data/data.test.cjs` — 14테스트.
  - `node src/features/tracker-profile/data/viewModel.test.cjs` — 6테스트.
  - `node src/features/tracker-profile/data/matchDetail.test.cjs` — 4표본·10인·총합·25교전/팀·누락/모달5/인라인4 검증.
  - `node src/features/tracker-profile/mock.test.cjs` — 결정성·필터·날짜·가중 요약.
  - `node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs` — 34팀 경기·2Deathmatch.
  - `node src/features/tracker-profile/match-history/detail/missingData.test.cjs` — 누락/실제0/부분/정렬/키보드.
- `docker compose -f docker/compose.frontend.yml stop frontend` → `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` → `docker compose -f docker/compose.frontend.yml up -d frontend` — PASS, 컴파일·내부 타입/Lint·정적11페이지 생성, 개발 서버 복원.
- 기존 Playwright 환경의 `node /private/tmp/fe025-consistency-smoke.cjs` — PASS,28검사. PC/모바일 홈·두 프로필·연결 정상 로드, compact→Overview 복귀·전체 통계·20/4행·비활성 연결·오류0.
- 문서/범위/산출물 검사와 `git diff --check` — PASS, 허용165파일·상대링크299개·118캡처·확장 QA4결과·Task/report 파일 목록 일치. 커밋 직전 `git diff --cached --check`도 PASS.

### 남은 위험·주의 사항

- 기존 계정 연결은 비활성이고 법적 문서는 초안이다. 실제 API/RSO 연결·법률 검토는 구현하지 않았다.
- 내비게이션·통계 이름과 브랜드 슬로건, 경기 상세5탭의 개별 영문 안내는 유지했다. 전면 다국어화 작업은 아니다.
- 라인업/관리자/백엔드/이미지/의존성/전역 CSS/데이터 계산 변경 없음. 일반 URL의404 화면은 이번 대상 밖이다.
- 컨테이너의 `git: not found`는 기존 환경 안내이며 Lint·빌드는 정상 완료했다.
- Codex 구현·시각 검증은 완료했고 별도 Cursor/사람 검토는 대기 중이다. 사용자 승인대로 1차·확장분을 두 로컬 커밋으로 남기며 push/PR/merge는 하지 않는다.
