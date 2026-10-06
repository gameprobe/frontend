# TASK-FE-018 — 경기 상세 연결 복원과 Tracker 스타일 모달

## Status

DONE — PR #11을 사용자가 `codex/frontend-rework`에 병합함 (`d48aac4`).

## Goal

PR #10 병합 `17da56c`에서 `codex/profile-match-detail-restore`로 분기했다.
기존 스코어보드·라운드·성과·분석 상세를 새 프로필 경기 목록에 연결하고 현재 테마에 맞춘다.
상세를 맡는 컴포넌트·연결/표시 데이터 처리를 분리하고 한국어 사용처 주석을 작성한다.
사용자의 추가 승인으로 기본 상세 표시를 큰 모달로 전환한다. 인라인 펼침 구현과 기존 4탭은 보존하며
설정 한 곳에서 표시 방식을 선택한다. 추가 디자인 요청에 따라 모달은 Scoreboard/Performance/Economy/Rounds/Duels 5탭으로 구성하며, 인라인은 기존 4탭을 보존한다. 새 경로는 추가하지 않는다.
기존 상세와 현재 목록은 서로 다른 Mock이므로 ID/수치 연결 가능 여부를 먼저 확인한다.
서로 다른 경기의 표본을 같은 실제 경기처럼 연결하지 않는다. 새 표본은 Mock임을 고지하며 목록과 일치하도록 검증한다.

## 확정된 데이터 범위

- 현재 목록 36개의 식별자·날짜·선수 표시·점수·개인 기록을 유지한다.
- 상세에 필요한 표본은 `match-history/detail/`의 별도 데이터 공급 모듈에 둔다. 기존 원본 Mock/구형 JSON은 변경하지 않는다.
- 준비한 표본과 없는 기록을 구분한다. 누락된 팀·라운드·무기·교전·경제 기록을 0 또는 다른 경기 기록으로 치환하지 않는다.
- 팀/라운드형 상세를 적용할 수 없는 Deathmatch나 원본 요약과 일관된 상세를 제공할 수 없는 경우, 개인 요약과 미제공 안내를 표시한다.
- 데이터 공급·유효성/누락 판정·표시를 분리한다. 같은 경기 ID, 선택 선수, 점수, 개인 지표 및 제공 표본 내부의 합계 일치를 검증한다.
- 새 Mock은 UI 시연용으로 한정하며 실제 Riot 통계 산식이나 운영 API 계약으로 취급하지 않는다.

## 추가 승인: 모달과 인라인 보존

- 경기 상세를 화면 크기에 맞춘 모달로 열고 경기 정보·탭·닫기를 고정한다. 긴 내용만 내부 스크롤한다.
- 닫기 버튼·Escape·배경 클릭, 배경 스크롤 차단, 포커스 제한/복귀와 목록 스크롤 위치 보존을 검증한다.
- `detail/presentation.ts`의 설정으로 modal/inline을 선택하며 공급 데이터·누락 검사 경계는 두 방식이 공유한다.
- 현재 인라인 소스와 시각 근거를 보존하고 새 Before/After에는 modal 접두사를 붙인다. 사용자용 설정 UI는 추가하지 않는다.
- 본 Task의 미커밋 결과에 대한 사용자 수정 요청이며 새 브랜치/커밋/의존성은 필요하지 않다.

## 추가 승인: Tracker 상세 디자인

- 사용자 첨부 5개 캡처를 디자인 기준으로 사용한다. 청회색 정보 헤더, 균등 탭, 청록/붉은 팀 띠, 교차 행, 라운드 스트립과 탭별 정보 배치를 맞춘다.
- 모달 전용 표시 컴포넌트를 detail 아래에 분리하고 기존 인라인 4탭/스타일은 보존한다.
- 현재 상세가 가진 참가자·요약·라운드 승리·선택 선수의 무기/교전 분포만 표시한다. 랭크/라운드별 개인 기록/경제/좌표처럼 없는 기록은 —/미제공 안내를 사용한다. 데이터 생성·자산 추가는 이번 디자인 보완에 포함하지 않는다.
- 제공된 값의 정렬·선수 선택·경제 보기·라운드 선택 등 화면 동작을 구현하며 출처가 다른 점수(Tracker TRS)를 우리 PS와 동일하다고 표시하지 않는다.
- Before/After에 tracker 접두사를 사용하고 앞 단계 인라인·모달 근거는 보존한다.

## 추가 보완: 실제 화면 비율 비교

- 실제 Tracker 탭에서 확인한 상세창 최대 폭 1,400px, 정보 헤더 56px, 탭 포함 상단 112px을 기준으로 모달 크기/간격을 보정한다.
- Performance의 불필요한 중간 제목과 선수명 보조줄을 정리하고 표/인물/라운드 영역의 상대 비율을 맞춘다.
- 현재 Arial과 참고 Roboto의 글꼴 차이는 기록한다. 외부 폰트/이미지 추가 없이 기존 자산과 데이터 범위를 유지한다.
- 이번 비교 Before/After는 fidelity 접두사로 보존한다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/match-history/types.ts`
- `frontend/src/features/tracker-profile/match-history/MatchHistory.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchDayGroup.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchRow.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchDetail.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/*` (새 상세 연결/표시/스타일/필요 검증)
- `frontend/src/components/MatchScoreboardTab.tsx` (미제공 FK/FD 표시 및 표 스크롤 접근성)
- `frontend/src/components/MatchAnalysisTab.tsx` (viewer 누락 및 미제공 피해 통계 처리)
- `frontend/src/components/MatchPerformanceTab.tsx` (무기/교전 미제공과 0건 구분)
- `frontend/src/components/MatchRoundsTab.tsx` (미제공 종료 원인을 제압 아이콘으로 표시하지 않음)
- `frontend/src/components/MatchRoundMapPlotter.tsx` (좌표 미제공이면 지도 도형 대신 누락 안내)
- `docs/tasks/TASK-FE-017.md` (PR #10 병합 상태만)
- `docs/tasks/TASK-FE-018.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/frontend/REFACTORING.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-018.md`
- `docs/visual-qa/assets/TASK-FE-018/*`
- `.agent-reports/CURRENT.md` (공통·Codex 섹션)

읽기 전용: 위 경로와 지침/계획/과거Task·QA, tracker-profile의 mock/format/상위 module.css 및
header/summary/sidebar, stats-shell, `frontend/src/components/Match*.tsx`, `PlayerProfile.tsx`,
그 상세 컴포넌트가 직접 import하는 표시 helper/유틸/타입, `frontend/src/lib/mock-data.ts`,
`frontend/src/types/*`, `frontend/src/data/mock-data.json`, `frontend/src/app/globals.css`, players/[puuid]/page.tsx와 matches/[matchId]/page.tsx,
frontend package/tsconfig/next.config 및 docker/compose.frontend.yml.
source의 tracker-profile/stats-shell은 frontend/src/features/ 기준이다.
HANDOFF.json은 없으며 사용자 지정 범위를 이 Task에 기록한다. 임시 조사/검증 스크립트는 /tmp에 둔다.

## Forbidden changes

- 라인업·백엔드·운영 API·인증·DB·새 의존성·배포 설정 변경.
- 전체 프로필의 상태/공통 스타일/Mock 구조 일괄 리팩터링.
- 게임 자산 추가/수정, 무관한 화면 변경.
- 구형 데이터를 다른 경기 기록으로 표시, Mock 고지 없는 표본 생성, 누락을 0으로 표시.
- 요청 없는 커밋/푸시/PR/병합, 후속 Task 자동 시작.

## Acceptance criteria

- 기존 4탭의 재사용 가능 부분과 현재 목록 데이터의 차이를 명시한다.
- 선택 경기 식별자와 내용이 맞으며 누락 데이터는 명확히 처리한다.
- 현재 테마·글자 기준을 따르는 PC/모바일 상세와 사용처 주석을 제공한다.
- 탭 전환/펼침 초기화/목록 필터/키보드/반응형 동작 및 범위 밖 회귀를 검증한다.
- Before/After Playwright 캡처·Visual QA·Result·보고서를 기록한다.
- 모달의 접근성·닫기 후 목록 위치 복원과 설정 변경 시 기존 인라인 동작을 검증한다.
- 모달 5탭의 참고 배치를 반영하고 표 정렬·선수 선택·경제 보기·라운드 선택을 검증한다.
- 데이터가 없는 표/그래프를 허구로 채우지 않고 원래 인라인 4탭의 표시와 동작을 보존한다.

## Verification commands

```sh
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
git status --short
```

브라우저 검증 명령과 캡처·측정 근거는 [Visual QA](../visual-qa/TASK-FE-018.md)에 기록한다.
개발 서버 복원 후 프로필 HTTP 200도 확인한다.

## Result

### 이번 비율 보완 결과

- 실제 Tracker 측정에 따라 최대 폭1,400px·정보 헤더56px·탭56px, 하단 정렬 및 내용 높이 제한을 적용했다.
- 스코어보드 행56px/초상44px, Performance 추가 제목/선수명 보조줄 정리, 라운드·교전 영역 비율을 조정했다.
- 새 캡처20장·fidelity-verification.json, 동작42그룹·반응형20조건 및 Mock/SSR/타입/Lint/build PASS.
- 1728×941 스코어보드 본문736px에 두 팀10명이 표시된다. 홈/닫힌 프로필4조건 DOM/스타일/좌표 동일.
- 이 단계의 변경 파일8개/전체해시는 fidelity-verification.json에 기록했다. 기존 인라인·데이터 파일은 이전 해시와 동일하다.
- Roboto/Arial 글꼴 차이는 남으며 외부 폰트/이미지를 추가하지 않았다.

### 구현 결과

- 현재 목록 36개를 유지하며 34개 팀 경기의 상세 Mock을 연결했다. Deathmatch 2개는 개인 요약/지표와 팀 상세 미제공 안내를 표시한다.
  구형 다른 경기 상세를 현재 ID로 치환하지 않고 경기·선수·점수·개인 기록·팀/라운드/분포 합계를 검사한다.
- 기본 모달을 사용자 Tracker 캡처에 맞춰 **Scoreboard / Performance / Economy / Rounds / Duels**로 구성했다.
  청회색 헤더·균등 탭·청록/붉은 팀 띠·교차 행을 사용하고 중첩 카드/여백을 줄였다.
- Scoreboard는 10명·라운드 승리 타임라인·지표 정렬을 제공한다. 선택 열 강조와 선택 선수 표시를 유지한다.
  PS 이름은 공통 branding 설정을 사용하며 Tracker TRS로 표시하지 않는다. PS/DDΔ/KAST는 조회 선수에게만 제공된다.
- Performance는 10명 선수 선택, 개인 지표, 팀 라운드 결과, 상대/무기별 정렬 표를 제공한다.
  Duels는 5×5 매트릭스 중 제공된 조회 선수 5개 조합만 표시하며 미제공 20개를 0으로 채우지 않는다.
- Economy는 Bank/Loadout/Total 보기와 미제공 상태, 같은 경기 스코어보드를 배치했다.
  Rounds는 라운드 선택/누적 점수/승리 팀, 참가자 표와 이벤트/위치 미제공 상태를 제공한다.
  랭크·경제·공수 개인 기록·라운드 개인 지표·이벤트·좌표를 만들어 넣지 않는다.
- 모달 헤더/탭/닫기는 고정하고 내용만 내부 스크롤한다. 배경 잠금, 키보드 포커스 순환,
  닫기/Escape/배경 클릭 후 목록/스트립 위치와 포커스 복귀를 유지한다.
- `presentation.ts`의 `matchDetailPresentation`은 최종 `modal`이다. `inline`으로 바꾸면 기존 한국어 4탭 펼침이 복원된다.
  인라인 소스/스타일·이전 캡처는 보존하고 같은 상세 공급자/검사를 사용한다.
- `MatchDetail`은 연결, `mockDetail/detailData`는 공급/검사, `TrackerMatchPanel`은 모달 구성,
  `TrackerScoreboard/Performance/Economy/Rounds/Duels`와 각 CSS는 탭별 표시/로컬 동작을 맡는다.
  `DetailedMatchPanel`은 기존 인라인을 맡으며 각 파일에 한국어 사용처/누락 처리 주석을 기록했다.

### 실제 변경 파일

소스/검증 31개:

- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchRoundMapPlotter.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchDetail.tsx`
- `frontend/src/features/tracker-profile/match-history/MatchRow.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/DetailedMatchPanel.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/MatchDetailDialog.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/MatchDetailDialog.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/MatchDetailTheme.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/MatchPersonalSummary.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerDuels.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerDuels.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerEconomy.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerEconomy.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerMatchPanel.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerMatchPanel.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerPerformance.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerPerformance.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerRounds.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerRounds.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerScoreboard.module.css`
- `frontend/src/features/tracker-profile/match-history/detail/TrackerScoreboard.tsx`
- `frontend/src/features/tracker-profile/match-history/detail/detailData.ts`
- `frontend/src/features/tracker-profile/match-history/detail/missingData.test.cjs`
- `frontend/src/features/tracker-profile/match-history/detail/mockDetail.test.cjs`
- `frontend/src/features/tracker-profile/match-history/detail/mockDetail.ts`
- `frontend/src/features/tracker-profile/match-history/detail/presentation.ts`
- `frontend/src/features/tracker-profile/match-history/types.ts`

문서/시각 근거:

- `docs/PROGRESS.md`, `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/frontend/REFACTORING.md`
- `docs/tasks/TASK-FE-017.md` (병합 상태만), `docs/tasks/TASK-FE-018.md`
- `docs/visual-qa/TASK-FE-018.md`와 `docs/visual-qa/assets/TASK-FE-018/`의 PNG 108장 및 단계별 검증 JSON
- `.agent-reports/CURRENT.md` (ignored, 공통/Codex 섹션)

이미지 개별 링크·단계별 결과는 [Visual QA](../visual-qa/TASK-FE-018.md), 전체 파일 목록은 Agent Report에 기록했다.

### 실행한 명령과 검증 결과

- `docker compose -f docker/compose.frontend.yml stop frontend`: PASS.
- `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'`: PASS.
  원본 Mock, 34개 팀 경기/2개 Deathmatch 상세 검사, 누락/실제 0/원본 배열 불변성/정밀도 SSR,
  타입·Lint(경고/오류 0)·production build(정적 11페이지) 모두 통과했다.
- `docker compose -f docker/compose.frontend.yml up -d frontend`: PASS. 개발 서버 복원 후 프로필 HTTP 200.
- Tracker 단계 Playwright: 5탭·정렬·선수/경제/라운드 선택·키보드·포커스·잠금·필터·재열기·다른 프로필·Deathmatch PASS.
  상세 개수/측정/스크립트 명령은 [tracker-verification.json](../visual-qa/assets/TASK-FE-018/tracker-verification.json)에 기록했다.
- 이전 Tracker 단계 PC 1920×960 스코어보드: 본문737px. 최신 비율 보완 단계는 PC1728×941 본문736px, 두 팀10명 표시.
  작은 화면은 본문 내부 세로 스크롤과 표/타임라인의 별도 가로 스크롤을 사용한다.
- 홈/닫힌 프로필 PC·모바일 및 인라인 복원 캡처 비교 PASS. 최종 `modal` 복원 후 열기/닫기·잠금 해제 smoke PASS.
- `git diff --check`와 문서/링크/허용 파일/보고서 목록 검사 PASS.
- 앞선 인라인 연결/모달 전환의 검증 JSON·PNG 52장도 그대로 보존했다.

검증 중 발견한 ADR 불필요 반올림과 0데스 K/D 탭 불일치를 기존 표시 정책에 맞췄다.
모바일 Economy의 grid가 표 최소폭을 따라 늘어나던 문제는 `minmax(0,1fr)`로 보완하고,
문서/dialog뿐 아니라 활성 탭 내용의 가로 넘침까지 재검사했다.

### 남은 한계와 전달 상태

- 모든 상세는 UI 시연용 표본이며 실제 Riot 기록/통계 산식/API 계약을 검증한 것은 아니다.
- 참가자 요원/랭크와 경제·개인 라운드 기록·이벤트·좌표가 없어서 참고 캡처의 모든 이미지/그래프/순위를 채우지는 않는다.
  경제 선택과 라운드 선택은 동작하지만 미제공 기록을 실제 데이터처럼 그리지 않는다.
- 새 창/공유용 경기 경로는 이번 범위에서 추가하지 않았다. 기존 인라인과 모달은 동일 데이터에 서로 다른 탭 구성을 사용한다.
- 원본 Mock/구형 JSON, 이미지, 라인업, 백엔드·운영 API·의존성·전역 CSS·배포는 변경하지 않았다.
- 구현 검증을 완료했고, 사용자 요청에 따라 현재 결과를 커밋·푸시해 `codex/frontend-rework` 대상 PR로 전달한다. 별도 Cursor 검토는 미실행이며 PR 검토와 병합은 사용자가 진행한다.
