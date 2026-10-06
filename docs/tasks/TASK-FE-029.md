# TASK-FE-029 — 라인업·스모크 상태 안내 정리

## Status

IMPLEMENTED — 검증 완료, 사용자 요청에 따른 PR 제출·병합 검토 단계

## Goal

라인업·스모크를 탐색하는 사용자가 로딩, 공개 자료, 연결 실패에 따른 데모, 원본 자료 없음과 필터 결과 없음을 구분하도록 안내 문구와 표시를 정리한다.

## Baseline / authorization

- 사용자 승인: 제안한 1번 상태 안내 정리 진행. 2번 독립 상세 화면 보완은 별도 브랜치/Task로 보류한다.
- PR #22 병합 c469a68을 codex/frontend-rework에 fast-forward pull 후 codex/strategy-status-messages에서 작업한다. 시작 시 clean.
- 후속 사용자 요청으로 커밋·푸시·PR 제출을 승인받았다. PR 대상은 codex/frontend-rework이며 병합은 사용자가 수행한다.

## Scope

1. 라인업 로딩/공개 자료/실패 후 데모/공개 자료 0건을 사용자용 한국어 문구로 구분한다. 원시 서버 오류·API Preview 같은 구현 용어를 사용자 안내에 노출하지 않는다.
2. 원본 0건과 현재 맵·요원·스킬 조건에 맞는 결과 0건을 구분한다. 로딩 중 표시되는 기존 예시도 실제 자료로 오인하지 않도록 알린다.
3. 스모크의 예시 자료·검증 전 상태와 필터 결과/선택 안내를 같은 문체로 정리한다. 실제 좌표나 수치의 정확성은 주장하지 않는다.
4. 기존 공통 안내 표면을 유지하며 제목·본문·상태 구분 및 접근성을 보완한다. 필요한 빈 결과 안내만 탐색 화면 안에 추가한다.
5. 기존 데이터 요청·성공/실패 후 데이터 선택·필터 계산·좌표·공수 회전·링크 동작은 보존한다.

## 상태 표시 기준

- 라인업 상단: loading → 불러오는 중+현재 예시 표시 / api+자료 있음 → 공개 라인업 / api+0건 → 공개 자료 없음 / fallback → 연결 실패로 예시 표시.
- 선택한 맵 내부: loading → 원본 0건 → 필터 결과 0건 → 요원 미선택 → 선택 자료의 위치 누락 → 스킬/시작 위치 선택 안내 순으로 판단한다. 기존 결과 배열과 좌표 유무만 읽는다.
- fallback의 필터 0건은 실제 공개 자료가 아닌 현재 예시 안에 없다는 뜻으로 표현한다.
- 스모크 0건이면 가이드 선택을 요구하지 않는다. 결과가 있고 미선택인 경우만 선택 안내를 표시한다.
- 스모크 비교표·가이드의 Preview 표기는 예시로 읽기 쉽게 바꾸되 검증 전 고지와 원본 값은 보존한다.

## Allowed changes

- frontend/src/app/lineups/page.tsx, frontend/src/app/smokes/page.tsx: 표시할 상태 판정과 문구 전달만.
- frontend/src/components/LineupSearchFilter.tsx, frontend/src/components/SmokeSearchFilter.tsx: 상태 표시용 선택 props, 결과 없음/선택/예시 안내와 최소 마크업. 필터 계산·선택 상태·지도 로직 변경 금지.
- frontend/src/features/strategy-explorer/StrategyExplorerShell.tsx, StrategyExplorerShell.module.css: 안내 표시와 해당 화면 내부 빈 상태 스타일만.
- frontend/src/features/strategy-explorer/status.ts: 두 화면에서 사용하는 상태 타입/문구·순수 표시 판정.
- docs/tasks/TASK-FE-029.md, docs/visual-qa/TASK-FE-029.md, docs/visual-qa/assets/TASK-FE-029/**, docs/frontend/PLAN.md, docs/PROGRESS.md.
- .agent-reports/HANDOFF.json, CURRENT.md의 공통 상태 및 Codex Implementation, /private/tmp/fe029-*.

## Out of scope

독립 상세·관리자 디자인, 새 재시도/필터 초기화 기능, API/DB/인증, Mock/스모크 값·자산, 번역 확대, 운영 배포·의존성 추가.

## Acceptance criteria

- 로딩·자료 성공·0건·실패 후 예시 상태가 서로 모순 없는 한국어 안내를 표시한다.
- 원본 자료가 없을 때와 필터에 맞는 자료가 없을 때 안내가 다르다. 로딩 중 0건이라고 잘못 안내하지 않는다.
- API 오류의 기술적 원문을 화면에 표시하지 않는다. 예시/검증 전 의미는 유지한다.
- 스모크 선택 전·선택 후·결과 없음 및 타입 필터 동작이 유지된다.
- 1440/820/390px에서 상태 안내가 잘리거나 겹치지 않고 문서 가로 넘침이 없다.
- 키보드 탐색과 live status 표시를 확인한다. 홈/프로필 공통 메뉴 및 디자인에 영향을 주지 않는다.
- Before/After 시각 검증, 통제된 응답별 상태 전환 및 기존 조작 검증과 TypeScript/Lint/build 통과.

## Verification commands

```bash
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

브라우저 상태 검증/캡처 명령은 실행 후 Result에 기록한다. 운영 서버를 변경하지 않고 응답을 통제하여 로딩/성공/빈 자료/실패를 확인한다.

## Result

### 변경 결과

- status.ts에 상단 자료 상태와 탐색 결과 안내를 모으고 사용 화면을 주석으로 기록했다. 로딩/공개 자료/공개0건/실패 후 예시/스모크 예시를 구별한다.
- 실패의 원시 오류 문자열을 사용자 화면에서 제거하고 기존 예시 fallback 동작은 유지했다. 로딩 동안 예시를 보여주는 점도 명시한다.
- 라인업 지도 위에 결과 안내를 추가하여 원본0건/필터0건/요원 미선택/위치 누락/선택 단계를 구별한다. 예시 필터0건은 현재 예시 안에 없다는 의미로 한정한다.
- 스모크 0건일 때 존재하지 않는 아이콘을 선택하라는 문구를 숨기고 조건 변경 안내를 표시한다. Preview 표시를 예시로 정리하고 패치 검증 전 고지는 보존한다.
- 기존 필터/state/요청/좌표/회전/게임 데이터는 보존했다. 경로가 없는 자료에 경로 표시를 보장하던 문구는 시작 위치 안내로 좁혔다.

### 실제 변경 파일

- frontend/src/features/strategy-explorer/status.ts (신규)
- frontend/src/features/strategy-explorer/StrategyExplorerShell.tsx
- frontend/src/features/strategy-explorer/StrategyExplorerShell.module.css
- frontend/src/app/lineups/page.tsx
- frontend/src/app/smokes/page.tsx
- frontend/src/components/LineupSearchFilter.tsx
- frontend/src/components/SmokeSearchFilter.tsx
- docs/tasks/TASK-FE-029.md, docs/frontend/PLAN.md, docs/PROGRESS.md
- docs/visual-qa/TASK-FE-029.md 및 [캡처·스크립트·결과 전체 목록](../visual-qa/assets/TASK-FE-029/manifest.json)
- .agent-reports/HANDOFF.json, CURRENT.md (로컬 ignored 보고서)

### 실행한 명령 및 검증 결과

- `git fetch origin`, `git switch codex/frontend-rework`, `git pull --ff-only origin codex/frontend-rework`, `git switch -c codex/strategy-status-messages`: 성공, 기준 c469a68, 시작 시 clean.
- Verification commands의 TypeScript/Lint/production build/개발 서버 복원/diff 검사 모두 PASS. Lint 경고·오류 0, 정적 12페이지 생성. 컨테이너의 기존 git 미설치 안내는 빌드 성공(종료 코드0)에 영향 없음.
- `node docs/visual-qa/assets/TASK-FE-029/capture.cjs before` / `after`: Before69검사·After69검사, 각29장 PASS. 마지막 문구 수정 후 선택3폭 재촬영·17검사 PASS(After 총86).
- 같은 경로의 `status-qa.cjs`: 168검사·9상태전환 PASS. 요청 보류→성공/0건/실패, live status, 키보드 이동, 누락 위치 확인.
- `regression-qa.cjs`: 기존 지도/필터/선택/회전/좌표/경로/상세 링크 262검사·17배치 PASS.
- `edge-qa.cjs`: 경로와 시작 위치 누락4검사 PASS. 수정된 문구에 불필요한 추가 조건을 요구한 첫 테스트 기대를 범위에 맞게 바로잡았다. 상세는 Visual QA에 기록했다.
- `compare.py`와 comparison.json: 29조건의 핀·경로·회전·카드수·링크·메뉴 동일. 홈·프로필 1440px PNG 변경 픽셀0. 전체 캡처62장.
- API·데이터·타입·전역 CSS·공통 메뉴/헤더·언어·패키지 등13파일 byte 보존 PASS.
- `post-build.cjs`: 서버 복원 후 390px 홈·프로필·라인업·스모크 HTTP200/가로 넘침0/상태 안내/브라우저 예외0 PASS.
- 독립 읽기전용 코드 검토 및 PC/태블릿/모바일 직접 시각 검토 PASS. 별도 Cursor 리뷰는 수행하지 않았다.

### 남은 제한

- 운영 API 가용성·게임 자료 정확성 검증은 포함하지 않는다. 기존 예시 데이터와 한국어 탐색 본문을 유지한다.
- 스크린리더 실제 발화는 확인하지 않았고 live region DOM과 갱신을 검증했다.
- 상세/관리자 화면과 새 재시도·필터 초기화 기능은 포함하지 않았다. 2번 상세 보완은 후속 Task다.
- 사용자 요청에 따라 커밋·푸시·PR 제출을 진행한다. 디자인이 아직 맞지 않는 다른 페이지는 다음 작업에서 점검하며, 병합은 사용자가 수행한다.
