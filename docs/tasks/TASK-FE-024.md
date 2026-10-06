# TASK-FE-024 — API 기반 Mock를 기존 데모 화면에 연결

## Status

DONE — PR #17이 `codex/frontend-rework`에 병합됨 (`36faaba`, 2026-09-21)

## Goal

FE-023의 동일 경기 원본으로 홈의 데모 진입, 프로필 요약/필터/목록, 경기 상세를 표시한다. 실제 변경에 필요한 데이터 공급/변환 경계만 추가하며 홈 본문 전체 리팩터링은 하지 않는다.

## Baseline

- 사용자 승인: PR #16 병합 후 새 Mock 연결을 먼저 진행. 불필요한 컴포넌트 분리를 줄이도록 요청.
- `codex/frontend-rework` PR #16 병합본 `8d204e8`에서 `codex/api-mock-ui` 분기.
- 기존 Mock은 비교용 경로로 보존한다. 새 데모는 DemoPlayer01과 4경기 기준이다.
- [API 설계](../frontend/API-MOCK-DESIGN.md), [데이터 설명](../../frontend/src/features/tracker-profile/data/README.md).

## Allowed changes

- `frontend/src/features/tracker-profile/**` — 새 공급자/표시 변환, 기존 프로필/상세 컴포넌트의 데이터 주입·미제공 처리와 필요한 스타일, 회귀 검사
- `frontend/src/features/home/HomeLanding.tsx`, `HomeLanding.module.css` — 새 데모 링크/표시 데이터와 사용자 요청의 기존 데모 비교 링크
- `frontend/src/components/HomeSearch.tsx` — 사용자가 지정한 기본 데모 진입/안내만
- `frontend/src/app/page.tsx`, `frontend/src/app/players/[puuid]/page.tsx`, `frontend/src/app/matches/[matchId]/page.tsx` — 기존 페이지 진입 연결
- `docs/tasks/TASK-FE-024.md`, `docs/tasks/TASK-FE-023.md`(병합 상태), `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/frontend/API-MOCK-DESIGN.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-024.md`, `docs/visual-qa/assets/TASK-FE-024/**`
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`(공통/Codex 섹션)

읽기 전용 소스는 HANDOFF의 stats-shell, types, lib/asset-map 및 mock-data, 기존 상세 컴포넌트, package/tsconfig/Docker 설정이다. `/tmp/fe024-*` 검증 파일 사용 가능.

## Forbidden changes

- 라인업/이미지/자산 매핑/백엔드/공개 API/인증/DB/비밀키/운영 의존성 변경
- 홈 전체 리팩터링, 기존 Mock 삭제, 실데이터인 척하는 임의 통계 보충
- 승인 없는 커밋/푸시/병합

## Acceptance criteria

- 홈에서 새 데모 계정 프로필로 이동하고 동일 4경기의 요약/요원/맵/목록/상세를 확인한다.
- 사용자 후속 요청: 홈에서 새 데이터 데모/기존 디자인 데모 링크를 모두 제공하고 실제 검색 미연결을 명시한다.
- 사용자 PR 요청: 홈 우측 프로필 카드에도 두 데모를 표시한다. 최종 검증 후 커밋·푸시·PR 생성하며 병합은 사용자가 진행한다.
- 병합 전 사용자 수정: 일반 `데모 보기`·홈 `Overview`·`전적 프로필 보기`는 기존 디자인 데모를 유지한다. `새 데이터 데모` 비교 링크/카드를 직접 선택할 때만 새 데이터로 진입한다.
- 기존 컴포넌트를 재사용하고 새 데이터의 로딩/빈/부분/오류를 표현한다. 늦은 요청 응답이 다른 조회 상태를 덮지 않게 한다.
- 실제0과 미제공을 구별한다. KAST/현재 RR/Probe Score/무기별HS·미확보 상세 필드를 기존 가짜 수치로 채우지 않는다.
- 상세 5탭/기존 inline 모드는 유지하며 새 원본으로 표시 가능한 내용만 제공한다.
- 직접 링크/새 탭/공유도 동일 경기·선수에 연결한다. legacy fixture는 비교 가능한 경로로 유지한다.
- 데이터 합계65/56/23,3승1패와 필터·목록·상세 일치 및 기존 경로 회귀를 검사한다.
- Playwright Before/After 화면 캡처와 시각 검증 보고서, Task Result 및 Agent Report 기록.

## Verification commands

- 새 데이터/공급자/표시 변환 테스트 및 기존 Mock/상세 테스트
- Docker frontend `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Playwright 데스크톱/모바일 캡처 및 진입/필터/상세/누락/오류/legacy 동작 검사
- `git diff --check`, 허용 파일/문서 링크 검사

## Result

### 구현 요약

- 홈의 `데모 보기`·`Overview`·일반 프로필 소개 카드는 `/players/ied-agent-allen`로 진입한다. `새 데이터 데모`를 명시한 링크/카드만 `/players/demo-player-01`로 연결한다. 입력값은 실제 Riot 계정을 조회하지 않는다.
- 합성 원본4경기에서 프로필·사이드바·요원/맵/무기·경기 목록·상세5탭·직접 링크를 함께 구성한다.
- 새 공급자/표시 변환/상세 변환과 조회 훅 경계를 추가했다. 기존 화면 컴포넌트를 재사용하고 사용처·누락값·분모 기준을 주석과 README에 기록했다.
- 로딩/부분/빈/오류/취소/재시도, 콘텐츠ID 집계·필터, 실제0/미제공 구분을 보완했다. 원본 합계65/56/23 및3승1패와 표시를 검사했다.
- 기존 `/players/ied-agent-allen` 및 기존 경기 상세, 인라인 상세 모드를 보존했다. 기본 표시 모드는 modal이다.

### 실제 변경 파일 전체

- `docs/PROGRESS.md`
- `docs/frontend/API-MOCK-DESIGN.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/tasks/TASK-FE-023.md`
- `docs/tasks/TASK-FE-024.md`
- `docs/visual-qa/TASK-FE-024.md`
- `docs/visual-qa/assets/TASK-FE-024/after-1100-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1280-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-default-entry.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-demo-links.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-detail-duels.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-detail-economy.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-detail-performance.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-detail-rounds.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-detail-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-direct.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-empty-overview.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-empty.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-error.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-home.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-inline.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-legacy-detail.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-legacy.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-partial.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-profile.png`
- `docs/visual-qa/assets/TASK-FE-024/after-1728-weapons.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-default-entry.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-demo-links.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-detail-duels.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-detail-economy.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-detail-performance.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-detail-rounds.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-detail-scoreboard.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-direct.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-empty.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-error.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-home.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-inline.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-legacy-detail.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-legacy.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-partial.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-profile.png`
- `docs/visual-qa/assets/TASK-FE-024/after-390-weapons.png`
- `docs/visual-qa/assets/TASK-FE-024/after-820-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1100-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1280-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1728-default-entry.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1728-demo-links.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1728-detail.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1728-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1728-home.png`
- `docs/visual-qa/assets/TASK-FE-024/before-1728-legacy.png`
- `docs/visual-qa/assets/TASK-FE-024/before-390-default-entry.png`
- `docs/visual-qa/assets/TASK-FE-024/before-390-demo-links.png`
- `docs/visual-qa/assets/TASK-FE-024/before-390-detail.png`
- `docs/visual-qa/assets/TASK-FE-024/before-390-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/before-390-home.png`
- `docs/visual-qa/assets/TASK-FE-024/before-390-legacy.png`
- `docs/visual-qa/assets/TASK-FE-024/before-820-hero-cards.png`
- `docs/visual-qa/assets/TASK-FE-024/browser-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-024/browser-results.json`
- `docs/visual-qa/assets/TASK-FE-024/default-entry-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-024/empty-state-qa.cjs`
- `docs/visual-qa/assets/TASK-FE-024/hero-cards-qa.cjs`
- `frontend/src/app/matches/[matchId]/page.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/components/HomeSearch.tsx`
- `frontend/src/features/home/HomeLanding.module.css`
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/tracker-profile/SyntheticMatchPage.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.module.css`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/data/README.md`
- `frontend/src/features/tracker-profile/data/matchDetail.test.cjs`
- `frontend/src/features/tracker-profile/data/matchDetail.ts`
- `frontend/src/features/tracker-profile/data/provider.ts`
- `frontend/src/features/tracker-profile/data/viewModel.test.cjs`
- `frontend/src/features/tracker-profile/data/viewModel.ts`
- `frontend/src/features/tracker-profile/format.ts`
- `frontend/src/features/tracker-profile/header/ProfileHeader.tsx`
- `frontend/src/features/tracker-profile/hooks/useProfileData.ts`
- `frontend/src/features/tracker-profile/hooks/useProfileViewState.ts`
- `frontend/src/features/tracker-profile/match-history/MatchDetail.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchRow.tsx`
- `frontend/src/features/tracker-profile/match-history/RecentSummary.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/DetailedMatchPanel.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/MatchPersonalSummary.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerDuels.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerEconomy.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerEconomy.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerMatchPanel.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerMatchPanel.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerPerformance.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerRounds.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerRounds.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerScoreboard.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/detailData.ts`
- `frontend/src/features/tracker-profile/match-history/detail/mockDetail.ts`
- `frontend/src/features/tracker-profile/match-history/types.ts`
- `frontend/src/features/tracker-profile/sidebar/AccuracyCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/RankCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/RoleStatsCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/TopMapsCard.tsx`
- `frontend/src/features/tracker-profile/sidebar/TopWeaponsCard.tsx`
- `frontend/src/features/tracker-profile/summary/AgentStatsTable.tsx`
- `frontend/src/features/tracker-profile/summary/ProbeScoreCard.tsx`
- `frontend/src/features/tracker-profile/summary/SeasonOverview.tsx`
- `.agent-reports/HANDOFF.json` (ignored)
- `.agent-reports/CURRENT.md` (ignored)

### 실행 명령과 결과

- `docker compose -f docker/compose.frontend.yml exec -T frontend node src/features/tracker-profile/data/data.test.cjs` — PASS、14 tests.
- 같은 Docker exec의 `node src/features/tracker-profile/data/viewModel.test.cjs` — PASS、6 tests.
- 같은 Docker exec의 `node src/features/tracker-profile/data/matchDetail.test.cjs` — PASS、4경기·89라운드·각10명·25대결, 팀/공수 반전·누락값·상세 렌더링.
- 같은 Docker exec의 `node src/features/tracker-profile/mock.test.cjs`, `node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs`, `node src/features/tracker-profile/match-history/detail/missingData.test.cjs` — 모두 PASS.
- 같은 Docker exec의 `npx tsc --noEmit`, `npm run lint` — PASS.
- `docker compose -f docker/compose.frontend.yml stop frontend` → `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` → `docker compose -f docker/compose.frontend.yml up -d frontend` — 최종 PASS, 11개 정적 페이지 생성 및 개발 서버 복원. 빌드 내부 타입·Lint 검사도 PASS.
- `PLAYWRIGHT_MODULES=<기존 Playwright 절대 경로> node docs/visual-qa/assets/TASK-FE-024/browser-qa.cjs` — PASS、2크기×7동작그룹, JS 오류0.
- 같은 Playwright 환경의 `node docs/visual-qa/assets/TASK-FE-024/empty-state-qa.cjs` — PASS、빈 승패 중립색·미지원 Deathmatch 비율 `—`.
- `node /private/tmp/fe024-hook-qa.cjs` — PASS、실제 React 지연 응답·조회 전환·취소·오류→재시도·unmount.
- `node /private/tmp/fe024-inline.cjs` — PASS、두 크기의 새/기존4탭; 기본 modal 설정 복원.
- `python3 /private/tmp/fe024-verify.py`, `git diff --check` — PASS、허용90파일·상대링크211개·캡처37장·공백 검사.
- Playwright 개발 서버 복원 smoke — 홈·새 프로필·새 경기 직접 링크·기존 프로필 HTTP200.

### 시각 검증

[Visual QA 보고서](../visual-qa/TASK-FE-024.md)에 Before6장·After31장과 동작/스크롤/누락 표시 검토를 기록했다.
기존 경로는 배치와 기능을 보존하되 작은 문자 픽셀 차이를 공개했다. 새 데이터 화면은 이전 데모와 표시값이 다르다.

### 남은 제한

- 실제 Riot 응답 검증·서버 공급자·RSO/동의·캐시·배포 연결은 포함하지 않았다. 현재 데이터는 API 소비 형태를 따른 합성 표본이다.
- 새 Mock은 PC Competitive의4경기만 제공한다. 현재 RR·최고 랭크·KAST·Probe Score·무기별 HS/피해·좌표/설치·해체 등 미확보 필드는 `—` 또는 미제공 안내로 남긴다.
- 무기 필터는 선택 무기의 처치가 기록된 경기 기준이며, 단순 장착/사용 횟수 필터가 아니다. 이미지가 없는 항목은 기존 fallback을 사용한다.
- 홈의 별도 분석 예시 카드는 설명용 기존 Mock이며 새 경기 집계와 별개다. 재시도는 같은 시나리오를 재실행하므로 error 시나리오는 계속 실패한다.
- 빌드에서 컨테이너에 git 실행 파일이 없다는 안내가 출력되지만 타입·Lint·빌드는 종료0으로 통과했다.
- 최초 타입 검사 오류(페이지 searchParams 타입, nullable 변경의 영향), 익명 테스트 컴포넌트 Lint 오류와 브라우저 버튼 선택자 오류는 수정 후 통과했다. 테스트 삭제·비활성화 없음.
- Cursor 별도 리뷰·사람 화면 확인은 대기 중이다. 커밋·푸시·PR·병합은 수행하지 않았다.

### 사용자 후속 보완: 두 데모 진입

- 홈의 데모 비교 영역에 새 데이터 데모와 기존 디자인 데모를 함께 노출했다. 검색 폼은 새 데이터 데모로 이동한다고 안내한다.
- 이번 보완의 제품 변경: `frontend/src/features/home/HomeLanding.tsx`, `frontend/src/components/HomeSearch.tsx`.
- 문서 변경: `docs/tasks/TASK-FE-024.md`, `docs/PROGRESS.md`, `docs/visual-qa/TASK-FE-024.md`, `.agent-reports/CURRENT.md`.
- 추가 캡처 파일 전체:
  - `docs/visual-qa/assets/TASK-FE-024/before-1728-demo-links.png`
  - `docs/visual-qa/assets/TASK-FE-024/before-390-demo-links.png`
  - `docs/visual-qa/assets/TASK-FE-024/after-1728-demo-links.png`
  - `docs/visual-qa/assets/TASK-FE-024/after-390-demo-links.png`
- 검증: `node /private/tmp/fe024-demo-links.cjs before`, `node /private/tmp/fe024-demo-links.cjs after` PASS. 1728/390px에서 양쪽 링크 이동, 새4경기/기존20개 목록, 문서 가로 넘침 검사 및 화면 대조 PASS.
- 추가 빌드 검증: `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` PASS (내부 타입·Lint 포함), `up -d frontend`로 개발 서버 복원. `python3 /private/tmp/fe024-verify.py` PASS (허용94파일·링크215개·캡처41장·공백 검사).
- CSS/데이터 계산 변경 없음. 신규 제한이나 사람 결정 필요 사항 없음. 미커밋 상태 유지.

### PR 전달 전 최종 보완·검증

- 사용자 승인으로 홈 우측에도 새/기존 데모 프로필 카드를 함께 표시했다. 801~1200px에서는 검색 아래로 배치하고 모바일은 기존 비교 링크를 사용한다.
- `node /private/tmp/fe024-hero-cards.cjs before`, `node /private/tmp/fe024-hero-cards.cjs after` PASS: 1728/1280/1100/820/390px, 검색 폼 겹침·문서 가로 넘침 없음, 각 카드의 새4경기/기존20개 목록 이동 확인. 동일 검사는 `docs/visual-qa/assets/TASK-FE-024/hero-cards-qa.cjs`로 보존했다.
- 최종 `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` PASS (타입·Lint 포함). 개발 서버 `up -d frontend` 복원 완료.
- `python3 /private/tmp/fe024-verify.py`, `git diff --check` PASS: 허용106파일·링크226개·Before13/After38 총51캡처·공백 검사.
- 독립 최종 코드 검토에서 새 차단 오류 없음. 실제 API/검색·RSO·현재 랭크/미제공 통계·캐시 등 후속 범위를 PR에 명시한다.
- 사용자의 명시적 요청에 따라 검증된 변경을 TASK-FE-024 커밋으로 push하고 `codex/frontend-rework` 대상 PR을 생성한다. 병합은 사용자가 진행한다.

### 병합 전 기본 데모 진입 보완

- 사용자 요청: 동료에게 익숙한 기본 디자인을 유지하고 새 데이터 데모는 명시적 선택으로만 진입한다.
- 기본 홈 데모 보기·Overview·일반 프로필 소개 카드를 `/players/ied-agent-allen`로 연결하고 입력창 예시/안내도 맞췄다. 새 데이터 비교 링크/카드만 `/players/demo-player-01`로 연결한다.
- 제품 변경은 `HomeLanding.tsx`, `HomeSearch.tsx` 두 파일이다. 사용법 문서·Task·Visual QA·회귀 검사도 현재 진입 정책에 맞췄다.
- `node /private/tmp/fe024-default-entry.cjs before/after` 각각 PASS: PC/모바일 기본3진입·명시적 새 진입·데스크톱 카드 이동·가로 넘침 검사. 스크립트는 Visual QA assets의 `default-entry-qa.cjs`로 보존했다.
- 업데이트한 `browser-qa.cjs` PASS: 14동작그룹, 오류0. 기본 버튼으로 기존20개 목록을 확인한 뒤 명시적 링크로 새4경기 검사를 진행한다.
- Before2/After2장 추가, 누적55장. Codex 화면 대조에서 글자 겹침·레이아웃 이상 없음.
- 최종 프로덕션 빌드(`docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build`) PASS: 타입·Lint 포함, 11개 정적 페이지 생성. 개발 서버 복원 완료.
- `python3 /private/tmp/fe024-verify.py`, `git diff --check` PASS: 이번 보완21파일·상대링크229개·누적55캡처·공백 검사.
- 기존 PR #17이 Open/미병합이며 base/head가 예상 브랜치인 것을 확인했다. 승인된 PR 보완 커밋으로 push하고 본문도 현재 동작을 설명하도록 갱신한다. 병합하지 않는다.
