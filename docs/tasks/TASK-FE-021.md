# TASK-FE-021 — 프로필 상태·동작 분리

## Status

DONE — 화면 상태·브라우저 동작 두 단계(`32aefcd`, `22ea0c7`) 구현·검증 완료. 사용자가 PR #14를 `codex/frontend-rework`에 병합했다(`660c6cd`, 2026-09-20). 아래 Result는 각 단계 완료 당시 기록이다.
PR #13 병합 `45bbd06`에서 `codex/profile-view-state`로 분기했다.

## Goal

프로필 부모에 모여 있는 탭·필터·경기 선택·목록 표시 개수와 관련 전환 동작을
전용 React 훅으로 분리한다. Mock 화면의 디자인·데이터·상호작용은 보존하며,
사용자가 수정 위치를 찾을 수 있도록 한국어 사용처 주석을 남긴다.
1차 화면 상태 분리는 완료했다. 2026-09-20 사용자 추가 승인에 따라 브라우저 저장·공유·검색 안내·Mock 갱신·알림·메뉴/배너 상태도 이 Task에서 분리한다.
두 단계는 별도 커밋으로 보존하고 `codex/frontend-rework` 대상 PR 하나로 전달한다. 병합은 사용자가 맡는다.

## Allowed changes

- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/tracker-profile/hooks/useProfileViewState.ts` (1차 완료)
- `frontend/src/features/tracker-profile/hooks/useProfileBrowserActions.ts` (2차 신규)
- `docs/tasks/TASK-FE-020.md` (병합 상태만), `docs/tasks/TASK-FE-021.md`
- `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-021.md`, `docs/visual-qa/assets/TASK-FE-021/*`
- `.agent-reports/CURRENT.md` (공통·Codex 섹션만)

HANDOFF.json은 존재하지 않는다. 사용자가 상태·동작 분리 진행을 승인했으며
이번 단계의 허용 범위를 이 Task에 기록한다.
읽기 전용: 위 경로, 프로젝트 지침·계획·기존 Task/QA, `frontend/src/features/tracker-profile/`의
기존 TS/TSX/CSS/테스트, `frontend/src/features/stats-shell/`의 TS/TSX/CSS,
`frontend/src/config/`의 TS, `frontend/package.json`, `frontend/tsconfig.json`,
`frontend/next.config.js`, `docker/compose.frontend.yml`.
기존 `/tmp/fe017-*`~`/tmp/fe020-*` 검증 스크립트를 읽고 재사용하며 신규 임시 검증은
`/tmp/fe021-*`에 작성할 수 있다. 검증 도구 탐색과 실행에 필요한 런타임 경로 조회도 허용한다.

## Forbidden changes

- 화면 구조·CSS·문구·자산·통계 산식·Mock 값·데이터 공급 방식 변경
- 라인업·홈·실제 API·API 키·Spring·RSO·DB·배포·의존성 변경
- 새 전역 상태나 URL 상태 동기화 도입
- 모달 내부 로컬 상태의 이동, 저장 키·알림 문구/시간·검색 의미·권한 실패 처리 변경
- 요청 없는 병합 및 후속 데이터/API Task 자동 시작. 현재 두 단계 커밋·푸시·PR은 사용자 승인됨.

## Acceptance criteria

- 화면 선택 상태와 관련 전환/초기화는 부모에서 한 번 호출하는 `useProfileViewState`가 관리한다.
- 필터 변경 시 경기 닫기·20개 복원, 탭 변경 시 경기만 닫기 등 기존 차이를 보존한다.
- 경기 선택/닫기·재선택 상세 탭 초기화·최근 경기 스트립·All Matches·Load more의 기존 동작을 유지한다.
- 브라우저 저장/공유/검색/갱신/알림/메뉴/배너는 `useProfileBrowserActions`로 묶고 부모에서 한 번 호출한다.
- 저장 키·성공/실패 안내·재진입·선수 ID 변경·토스트 타이머(3200ms)와 cleanup·메뉴/배너 상태 수명을 보존한다.
- 통계 계산과 DOM 스크롤·포커스는 기존 위치에 유지한다.
- Before/After Playwright로 PC/모바일 탭·필터·빈 결과·모달 동작과 화면을 비교한다.
- 기존 Mock/상세/누락 상태 검사, 타입·Lint·build가 통과한다.
- Task Result·시각 검증·화면 연결 문서·진행 로그·Agent Report를 실제 결과로 갱신한다.

## Verification commands

```sh
node /tmp/fe021-visual.cjs before
node /tmp/fe021-visual.cjs after
python3 /tmp/fe021-pixels.py
node /tmp/fe021-state.cjs
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend sh -c 'node src/features/tracker-profile/mock.test.cjs && node src/features/tracker-profile/match-history/detail/mockDetail.test.cjs && node src/features/tracker-profile/match-history/detail/missingData.test.cjs && npx tsc --noEmit && npm run lint && npm run build'
docker compose -f docker/compose.frontend.yml up -d frontend
curl --fail --silent --show-error --retry 5 --retry-connrefused --retry-all-errors --retry-delay 1 --max-time 20 --output /dev/null http://localhost:3000/players/ied-agent-allen
node /tmp/fe021-smoke.cjs
git diff --check
```

필요한 경우 번들 Node/Python 런타임 절대 경로로 실행한다.
`fe021-state.cjs`는 기존 React 18/ReactDOM/TypeScript로 실제 훅을 Chromium에서 렌더하며 상태 API를 흉내 내지 않는다.
소스의 새 테스트 의존성은 추가하지 않는다. 자세한 환경과 결과는 Visual QA에 기록한다.

## Result — 1차 완료 기록 (32aefcd)

아래는 첫 구현 완료 당시 기록이다. 이후 사용자 승인으로 C2도 이 Task에 포함했으며 최종 결과는 하단 2차 Result를 따른다.

### 실제 변경 파일

- `frontend/src/features/tracker-profile/hooks/useProfileViewState.ts`: 새 화면 상태 훅.
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`: 훅 한 번 호출·기존 표시 컴포넌트 연결·사용처 주석.
- `docs/tasks/TASK-FE-020.md`: PR #13 병합 상태만 갱신.
- `docs/tasks/TASK-FE-021.md`, `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md`: 범위·수정 위치·상태 소유와 실제 결과.
- `docs/visual-qa/TASK-FE-021.md`, `docs/visual-qa/assets/TASK-FE-021/`: Before/After PNG60장 및 verification.json.
- `.agent-reports/CURRENT.md`: 공통·Codex 구현 보고(ignored).

### 구현 및 검증

- P01/P03/P05/P06·M01~M05의 탭/필터/More/선택 경기/인라인 상세 탭/표시량과 초기화·이동 동작을 한 훅으로 분리했다.
- 통계 카드 선택, 행 토글, 스트립 선택, 닫기, All Matches/Load more를 이름 있는 동작으로 모았다.
- 동일 필터 재선택은 초기화하지 않고 탭 재선택은 경기만 닫는 기존 차이, reset 범위, effect 시점을 유지했다.
- Playwright Before/After: 58상태 DOM·스타일·좌표·스크롤·ARIA 동일, 30쌍 픽셀 차이0, pageerror0.
- 실제 React 18 일반 모드/StrictMode: 총30 상태 전환 검사그룹 PASS, 브라우저 오류·React 경고0.
- 기존 Mock/상세Mock/누락SSR·타입·Lint(경고/오류0)·build(정적11페이지) PASS.
- 개발 서버 복원 후 HTTP200·모달5탭·Escape·스크롤 잠금 해제 smoke PASS.
- 독립 훅/부모 연결 코드 감사와 PC/모바일 시각 검토 PASS. 별도 Cursor 리뷰는 미실행.
- `git diff --check` PASS. 실행 명령과 캡처별 근거는 Visual QA에 기록했다.

### 남은 범위와 검증 환경

- 저장·공유·검색 안내·알림·Mock 갱신·메뉴/배너 상태는 부모에 유지한다. 후속 C2에서 검토한다.
- 통계 계산·Mock 데이터/API 교체는 D 단계이며 실제 Riot 키·Spring·RSO·DB·배포를 구현하지 않았다.
- 모달 내부 5탭 상태와 인라인 표시 방식, DOM 스크롤·포커스, 홈·라인업·CSS·이미지는 변경하지 않았다.
- Chromium/Docker는 sandbox 권한을 적용해 실행했고 픽셀 검사는 PIL이 있는 번들 Python을 사용했다.
- 개발 서버 재시작 직후 첫 smoke는 ERR_EMPTY_RESPONSE로 실패했다. HTTP 준비 확인 후 같은 smoke가 통과했다.
- 컨테이너의 기존 git 메타데이터 경고는 유지된다. 검증 이후 제품 소스 변경 없음.
- 커밋·푸시·PR·병합은 수행하지 않았다. 사용자 검토 후 별도 요청으로 진행한다.


## 2차 구현·검증 계획 (실행 완료)

- 제품 소스 수정 전 `/tmp/fe021-browser.cjs before`로 성공/실패 브라우저 동작과 화면 캡처를 남긴다.
- `useProfileBrowserActions`에 기존 상태/브라우저 동작을 그대로 옮기고 부모의 콜백을 연결한다.
- `/tmp/fe021-browser.cjs after` 및 픽셀 비교로 저장/공유 성공·실패, 검색·Mock 갱신,
  메뉴/배너·타이머·화면 이동 후 수명과 재진입을 검증한다. 타이머 cleanup은 실제 React 하네스로 확인한다.
- 1차 Before를 보존한 채 최종 `/tmp/fe021-visual.cjs after`·픽셀 비교·상태 하네스를 재실행하고 전체 기본 검증을 수행한다.
- 초기 Before/1차 결과는 보존하고 2차 근거는 같은 QA 자산 폴더의 `browser-*`, `final-*`, `control-*` 이름에 기록한다.
- 검증 후 두 번째 커밋·푸시·PR을 수행한다. `main`/`dev`/배포 설정은 변경하지 않는다.


## Result — 2차 및 최종

### 변경 파일

- `frontend/src/features/tracker-profile/hooks/useProfileBrowserActions.ts`: P01/P02/P10·M01의 브라우저 상태·동작, 저장소/클립보드 예외 처리와 알림 타이머.
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`: 두 훅을 각 한 번 호출해 기존 표시 컴포넌트로 전달. 사용처 한국어 주석.
- `docs/tasks/TASK-FE-021.md`, `docs/frontend/PLAN.md`, `docs/frontend/REFACTORING.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md`: 확정 범위·완료 상태·동작 수정 위치·진행 기록.
- `docs/visual-qa/TASK-FE-021.md`, `docs/visual-qa/assets/TASK-FE-021/browser-*.png`(8장), `final-*.png`(30장), `control-*.png`(4장), `final-verification.json`: 최종 화면/동작/소스 검증 근거. 1차 근거는 보존.
- `.agent-reports/CURRENT.md`: 공통·Codex 보고 갱신(ignored).

### 구현 및 실제 검증 결과

- 저장 키·저장/공유 성공과 실패 안내·검색 문구·Mock 갱신·메뉴/배너 수명을 그대로 옮겼다.
- 알림 3200ms, 같은 문구 재표시 시 남은 시간 유지, 교체/직접 닫기/unmount 정리와 선수 ID/표시 이름 변경을 검증했다.
- 브라우저 Before/After: PC/모바일18동작그룹·12상태 동일·4쌍 픽셀 차이0·pageerror0.
- 실제 React 일반/StrictMode: 화면 상태30그룹 + 브라우저 동작10그룹 PASS, 오류/경고0.
- 최종 전체58상태 동일. 픽셀은 기존 기준28쌍 + 같은 환경의 수정 전/후 통제 기준2쌍 모두 차이0.
- Mock/상세Mock/누락SSR·TypeScript·Lint·build PASS(정적11페이지). 개발 서버 복원·HTTP200·모달 smoke PASS.
- 검증 이후 제품 소스 SHA-256 유지, `git diff --check` PASS. 명령 전문·캡처별 근거는 [Visual QA](../visual-qa/TASK-FE-021.md)에 기록했다.

### 2차 추가 Verification commands

```sh
node /tmp/fe021-browser.cjs before
node /tmp/fe021-browser.cjs after
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe021-browser-pixels.py
node /tmp/fe021-browser-state.cjs
node /tmp/fe021-state.cjs
node /tmp/fe021-final-visual.cjs after
node /tmp/fe021-control.cjs before
node /tmp/fe021-control.cjs after
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /tmp/fe021-final-check.py
```

기본 Verification commands의 Docker 전체 검사·서버 복원·smoke·diff check도 최종 코드에서 다시 통과했다.

### 남은 문제·범위

- 초기 전체 픽셀 비교에서 둥근 모서리만 미세 차이. DOM/스타일/좌표 동일 확인 후 첫 커밋과 최종 코드를 동일 렌더러로 다시 촬영하여 2쌍 정확히 일치했다. 허용치 변경 없음.
- 브라우저 검사의 메뉴 클릭 순서·JSON 비교기만 보정했다. 시작 전 서버 준비 실패는 재시도 후 성공했고 최종 smoke PASS.
- 컨테이너의 기존 git 메타데이터 경고는 유지된다. 별도 Cursor 리뷰는 실행하지 않았다.
- Mock/통계/데이터 교체, 실제 Riot API·키·RSO·Spring·배포는 후속 범위다. 모달 내부 상태·홈·라인업은 변경하지 않았다.
- 사용자 승인에 따라 두 커밋을 `codex/frontend-rework` 대상 PR 하나로 전달한다. 병합과 다음 Task 시작은 하지 않는다.
