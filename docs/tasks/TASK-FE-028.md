# TASK-FE-028 — 공통 메뉴 구성 통일

## Status

IMPLEMENTED — 구현·검증 및 사용자 화면 확인 완료, PR 병합 검토 단계

## Goal

홈·프로필·라인업·스모크의 Search 옆 탐색 메뉴에서 Lineups와 Smokes를 마지막 두 항목으로 이어 배치한다. 공통 이동 항목을 한 곳에서 관리하여 화면마다 누락·순서 차이가 생기는 것을 줄인다.

## Baseline / authorization

- 사용자 승인: 공통 메뉴 구성 통일 작업 진행. 직전 합의한 네 화면의 메뉴·현재 위치·좁은 화면·키보드 이동을 범위로 한다.
- PR #21 병합 `df4d078`을 `codex/frontend-rework`에 fast-forward pull 후 `codex/shared-navigation` 분기. 시작 시 작업 트리 clean.
- PR 대상은 `codex/frontend-rework`. 사용자 화면 확인 후 commit/push/PR 제출을 명시적으로 요청했다. 병합은 사용자가 수행한다.
- 레퍼런스: 사용자 제공 홈/오버뷰 캡처와 합의한 메뉴 순서. 화면 오른쪽 끝 More 옆으로 분리하지 않는다.

## Scope

1. 홈·라인업·스모크: Home → Overview → Lineups → Smokes.
2. 프로필: Home → Overview → Matches → Performance → Agents → Maps → Weapons → Lineups → Smokes.
3. 공통 링크의 문구·주소·순서를 작은 설정/함수로 관리한다. 프로필 전적 탭은 기존 내부 전환 콜백을 유지한다. 공통 설정에 사용처 주석을 남긴다.
4. 현재 메뉴를 시각·접근성 정보로 표시하고, 1440/820/390px에서 좁은 화면의 스크롤 또는 기존 메뉴 배치와 More·키보드 조작을 검증한다.
5. 홈/탐색 페이지 Overview는 기존 디자인 데모로 이동한다. 프로필 내부 탭은 현재 플레이어를 유지한다. 기존 Search와 Language·More 목적지를 유지한다.

## Allowed changes

- `frontend/src/features/stats-shell/navigation.ts`: 공통 이동 항목 및 프로필 탭 조합.
- `frontend/src/features/stats-shell/StatsHeader.tsx`: 메뉴 타입·현재 위치·메뉴 접근성에 필요한 최소 수정.
- `frontend/src/features/stats-shell/StatsShell.module.css`: 메뉴 배치·현재 위치·반응형·초점에 필요한 규칙만.
- `frontend/src/features/home/HomeLanding.tsx`: 헤더 메뉴 설정 연결만.
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`: 헤더 메뉴 설정·현재 탭 및 기존 콜백 연결만.
- `frontend/src/features/strategy-explorer/StrategyExplorerShell.tsx`: 헤더 메뉴 설정 연결만.
- `docs/tasks/TASK-FE-028.md`, `docs/visual-qa/TASK-FE-028.md`, `docs/visual-qa/assets/TASK-FE-028/**` 및 `/private/tmp/fe028-*`.
- `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md` 및 `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`의 공통 상태/Codex Implementation.

추가 읽기 참조는 HANDOFF의 `read_only_files`를 따른다.

## Out of scope

- 결과 없음·서버 연결 안내, API·백엔드·데이터·필터 계산, 새로운 페이지/의존성/이미지.
- 브랜드 바의 기능 확장, 프로필 본문 탭 재디자인, 홈 소개 카드·라인업 상세·관리자 디자인.
- 번역 범위 확대, 로그인·권한·배포 변경, 다른 Task 자동 시작.

## Acceptance criteria

- 네 화면 모두 메뉴 끝이 Lineups → Smokes이며 기존 항목에 바로 이어진다.
- 전적 탭 6개는 순서대로 동작하고 선택한 플레이어/페이지 경로를 유지한다.
- 홈·프로필·라인업·스모크 각각 현재 위치가 한 항목에 표시된다.
- 작은 화면에서 메뉴 전체에 접근할 수 있고 문구 겹침·페이지 가로 넘침이 없다.
- More와 Search·Language의 기존 조작과 이동 목적지가 정상이다. 키보드로 마지막 두 링크 접근·활성화가 가능하다.
- 프로필 본문·전술 필터/지도·데모 원본은 수정하지 않는다.
- Before/After 비교, 실제 메뉴 이동·내부 탭·모바일·키보드 확인, TypeScript/Lint/build/diff 검증 통과.

## Verification commands

```bash
docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit
docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint
docker compose -f docker/compose.frontend.yml stop frontend
docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build
docker compose -f docker/compose.frontend.yml up -d frontend
git diff --check
```

Playwright 실행 명령과 캡처/결과 파일은 Result와 Visual QA에 실제 수행 결과로 기록한다.

## Result

### 변경 결과

- 공통 `navigation.ts`에 Home/Overview/Lineups/Smokes의 표시 이름·주소 및 마지막 두 항목의 순서를 모았다. 각 함수의 사용 화면을 주석으로 기록했다.
- HomeLanding·StrategyExplorerShell은 공통 페이지 메뉴를 사용하고, TrackerProfile은 기존 6탭의 navigate 콜백과 현재 탭을 전달한다.
- 링크와 프로필 내부 버튼 모두 현재 위치를 붉은 밑줄과 `aria-current`로 표시한다. 작은 화면에서 전적 버튼을 숨기던 규칙을 없애고 메뉴 영역의 가로 스크롤로 전체 항목에 접근한다.
- 프로필 More 메뉴에도 Escape 닫기·버튼 초점 복원 및 연결된 `aria-controls`를 제공했다. 기존 부모 상태·동작 훅은 수정하지 않았다.

### 실제 변경 파일

- `frontend/src/features/stats-shell/navigation.ts`
- `frontend/src/features/stats-shell/StatsHeader.tsx`
- `frontend/src/features/stats-shell/StatsShell.module.css`
- `frontend/src/features/home/HomeLanding.tsx`
- `frontend/src/features/tracker-profile/TrackerProfile.tsx`
- `frontend/src/features/strategy-explorer/StrategyExplorerShell.tsx`
- `docs/tasks/TASK-FE-028.md`, `docs/frontend/PLAN.md`, `docs/frontend/SCREEN-MAP.md`, `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-028.md`, 캡처·스크립트·검증 결과 [전체 목록](../visual-qa/assets/TASK-FE-028/manifest.json)
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md` (로컬 ignored 보고서)

### 실행한 검증과 실제 결과

- `git fetch origin`, 통합 브랜치 `pull --ff-only`, `switch -c codex/shared-navigation`: 성공. 기준 `df4d078`, 시작 시 clean.
- 위 Verification commands의 TypeScript·Lint(경고/오류 0)·production build(정적 12페이지)·개발 서버 복원·`git diff --check`: 모두 PASS.
- `node docs/visual-qa/assets/TASK-FE-028/capture.cjs before` / `after`: 제품 수정 전후 각각 12장, 브라우저 예외 0.
- `node docs/visual-qa/assets/TASK-FE-028/navigation-qa.cjs`: 498개 검사, 15개 화면/폭 조건, 30개 키보드 초점 배치 확인 PASS. 실제 링크 이동·프로필 6탭/URL 유지·Search·More·Language 포함.
- 기존 bundled Python으로 `compare.py`: 12개 헤더 위치/높이 동일, 모든 화면의 문서 가로 넘침 0. 프로필 3개 폭의 헤더 아래 변경 픽셀 0. 다른 화면의 미세 픽셀 차이와 직접 시각 평가는 [Visual QA](../visual-qa/TASK-FE-028.md)에 기록했다.
- `source-preservation.json`: 본문/상태 훅/탐색 페이지/전역 CSS/패키지 보존 9개 확인 PASS.
- `node docs/visual-qa/assets/TASK-FE-028/post-build.cjs`: 서버 복원 후 모바일 네 경로 HTTP 200·메뉴/현재 위치·가로 넘침·페이지 오류 확인 PASS.
- 독립 코드 검토 PASS. Cursor 리뷰를 대신 수행한 것으로 간주하지 않는다.

### 남은 제한

- 작은 화면은 메뉴 영역을 가로로 넘겨 모든 항목을 찾는다. Lineups·Smokes를 More 안으로 옮기지 않았다.
- 본문 탭·상단 브랜드 바·소개 카드·데이터/API·결과 없음·서버 연결 안내·번역 범위를 변경하지 않았다.
- 사용자 화면 확인 완료. 승인된 커밋·푸시·PR 제출을 진행하며, 병합은 사용자 검토 후 수행한다.
