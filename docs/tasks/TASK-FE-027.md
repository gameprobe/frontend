# TASK-FE-027 — 라인업·스모크 공통 테마 연결

## Status

IMPLEMENTED — 구현·검증 완료, PR 제출 및 사용자 병합 검토

## Goal

`/lineups`와 `/smokes`의 맵 우선 탐색 기능을 보존하면서 홈과 같은 헤더·푸터·어두운 테마·글자 기준을 적용한다. 두 화면에서 반복되는 외곽과 표시 스타일만 함께 관리한다.

## Baseline / authorization

- 사용자 요청: 충돌 확인 후 이번 브랜치 범위를 정하고 구현까지 진행.
- 기준 `origin/dev` / 로컬 `codex/frontend-rework`: `f3efedf`. 작업 트리 clean, 미해결 index 충돌 없음, `git diff --check` 통과, HEAD와 origin/dev 차이 0/0 확인.
- 작업 브랜치 `codex/lineup-smoke-theme`. 후속 사용자 요청으로 commit/push/PR을 진행하며 PR 대상은 `codex/frontend-rework`다. 병합은 사용자가 직접 수행하고, `dev` 반영은 후속 작업을 모아 별도로 진행한다.
- PR 준비 시 원격 `codex/frontend-rework`는 `3418943`, 구현 기준은 `f3efedf`로 원격보다 6개 커밋 앞선다. 따라서 PR에는 기존 dev의 라인업·스모크 변경과 이번 테마 작업이 함께 포함된다. 아래 검증과 변경 범위는 구현 기준 `f3efedf` 대비 FE-027 작업을 설명한다.
- 참조: TASK-FE-026_SMOKE_PAGE, 기존 홈 StatsShell/StatsHeader/theme. 기존 라인업·스모크 데이터/동작은 변경하지 않는다.

## Scope

1. 두 페이지에 기존 StatsShell/StatsHeader/StatsFooter를 재사용한다. Home/Search/Lineups/Smokes 이동, 현재 위치, 기존 Language·계정 안내를 연결한다.
2. 맵 인덱스와 선택 후 필터·지도·결과·가이드 영역을 홈의 배경/표면/테두리/강조색에 맞춘다. 제목·본문·보조 문구의 크기와 대비, 버튼 선택/hover/focus 상태를 정돈한다.
3. 공유하는 전술 탐색 외곽과 CSS만 feature 폴더에 둔다. 기존 상태·필터·API 호출·좌표 변환·공수 회전·데이터 값은 보존한다.
4. 1440/820/390px에서 배치·가로 넘침·지도 마커·경로와 조작을 확인한다. 홈·프로필의 기존 화면 회귀도 확인한다.
5. API 실패 시 Preview로 표시되는 기존 의미를 유지하고, 필요하면 기술적 오류 대신 사용자용 안내 문구만 정돈한다. 스모크 Preview 고지는 유지한다.

## Allowed changes

- `frontend/src/app/lineups/page.tsx`, `frontend/src/app/smokes/page.tsx`: 공통 화면 외곽 연결.
- `frontend/src/features/strategy-explorer/StrategyExplorerShell.tsx`, `StrategyExplorerShell.module.css`: 공통 헤더/푸터/제목/안내와 두 탐색 화면 전용 테마.
- `frontend/src/components/LineupSearchFilter.tsx`, `SmokeSearchFilter.tsx`: 테마 연결을 위한 최소 클래스/마크업/접근성 이름/안내 문구. 상태·계산·필터·요청 로직 변경 금지.
- `frontend/src/features/stats-shell/StatsHeader.tsx`: 기존 호출 결과를 유지하는 선택적 탐색 메뉴/현재 위치 지원이 필요한 경우에 한함.
- `frontend/src/app/globals.css`: 두 화면에 한정한 기존 테마 충돌 해소가 필요한 경우에만. 전역 토큰/리셋/관리자/홈/프로필 규칙 변경 금지. 우선 feature CSS로 한정한다.
- `docs/tasks/TASK-FE-027.md`, `docs/frontend/PLAN.md`, `docs/PROGRESS.md`, `docs/frontend/SCREEN-MAP.md`.
- `docs/visual-qa/TASK-FE-027.md`, `docs/visual-qa/assets/TASK-FE-027/**`, `/private/tmp/fe027-*`.
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md`의 공통 상태 및 Codex Implementation만.

## Read-only references

HANDOFF의 read-only 목록에 지정한 공통 셸/홈/설정/지도·라인업·스모크 타입·API·기존 데이터·자산 매핑·실행 설정. 검증을 위해 읽을 수 있으나 수정하지 않는다.

## Out of scope

- 관리자 화면·데이터 등록·백엔드·Riot API/RSO·Railway/Vercel·운영 설정·패키지 추가.
- 자산/수치/좌표/지도 회전 규칙/필터 의미/API 계약 변경.
- 홈·프로필·경기 상세 재디자인, 라인업 독립 상세 페이지 재디자인.
- 번역 대상 확대 및 서비스 정책 결정. 기존 공통 헤더 언어 기능을 유지하고 한국어 본문 언어는 정확히 지정한다.
- 자동 병합·배포 및 다음 Task 자동 시작. commit/push/PR은 후속 사용자 요청으로 승인되었다.

## Acceptance criteria

- 두 페이지는 홈과 같은 헤더/푸터를 각 1개 표시하며 중첩 main이 없다. 검색은 홈 입력창으로 이동하고 현재 메뉴가 구별된다.
- 홈의 테마 값을 재사용하고 별도 흰색 페이지 배경·헤더 글자 대비 문제를 해소한다.
- 필터/가이드/비교표의 핵심 보조 글자는 원칙적으로 12px 이상, 일반 조작 문구 14px 기준으로 읽힌다. 좁은 표도 잘림/겹침 없이 읽을 수 있다.
- 맵 인덱스 → 맵 선택 → 인라인 맵 변경, 공수 선택, 요원/스킬/사이트/유형 선택, 마커/경로/가이드가 기존 기준대로 동작한다.
- 라인업 공격 90° / 수비 270° 지도 회전과 좌표 변환을 보존하고, 실제 스킬/요원 이미지 및 지도는 기존 자산을 사용한다.
- 스모크는 선택 전 경로를 숨기고 선택 후 기존 Preview 가이드를 보여준다. 공통 연막/Harbor 일자 유형을 유지한다.
- 1440/820/390px에서 가로 넘침 없음. 홈·프로필 주요 픽셀/레이아웃 회귀 없음.
- 구현 전/후 Playwright 캡처, 비교 보고서, 기능 회귀와 TypeScript/Lint/build 통과 후 완료.

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
```

Playwright Before/After 및 회귀 실행 명령은 실제 환경을 확인한 후 Result에 기록한다. 네트워크 API는 통제한 응답으로 성공/빈 결과/실패 fallback을 검증하며, 운영 서버 상태는 이번 테마 검증의 완료 조건으로 삼지 않는다.

## Result

### 구현 결과

- 공통 셸 TSX/CSS를 추가하여 기존 홈 헤더·푸터·테마를 재사용했다. Search는 홈 입력창으로, Overview는 기존 디자인 데모로 이동하고 Lineups/Smokes의 현재 위치를 표시한다.
- 두 페이지의 외곽 JSX만 교체했다. 필터·지도 회전·좌표·API·데이터 로직은 그대로 유지했다.
- 비교표·가이드의 작은 글자와 대비, 맵/필터/버튼 표면, 태블릿 여백 및 모바일 배치를 정리했다.
- 지도 경로의 표시 순서와 hover+키보드 초점 윤곽선을 보완했다. 기존 자산을 사용하고 새 의존성은 추가하지 않았다.

### 실제 변경 파일

- `frontend/src/app/lineups/page.tsx`
- `frontend/src/app/smokes/page.tsx`
- `frontend/src/features/strategy-explorer/StrategyExplorerShell.tsx`
- `frontend/src/features/strategy-explorer/StrategyExplorerShell.module.css`
- `docs/tasks/TASK-FE-027.md`
- `docs/frontend/PLAN.md`
- `docs/frontend/SCREEN-MAP.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-027.md`
- `docs/visual-qa/assets/TASK-FE-027/`: 캡처·회귀/초점 검사 스크립트·실제 결과. 전체 개별 파일은 [manifest](../visual-qa/assets/TASK-FE-027/manifest.json)에서 확인한다.
- `.agent-reports/HANDOFF.json`, `.agent-reports/CURRENT.md` (로컬 ignored 보고서).

### 실행 명령과 검증 결과

- `git status --short --branch`, `git ls-files -u`, HEAD/origin/dev 비교: 최초 clean, 미해결 충돌 0, 차이 0/0.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npx tsc --noEmit`: PASS.
- `docker compose -f docker/compose.frontend.yml exec -T frontend npm run lint`: PASS, 오류·경고 0.
- `docker compose -f docker/compose.frontend.yml stop frontend` → `docker compose -f docker/compose.frontend.yml run --rm --no-deps frontend npm run build` → `docker compose -f docker/compose.frontend.yml up -d frontend`: PASS, 컴파일·타입/Lint·정적 12페이지 생성, 개발 서버 복원.
- Playwright `browser-qa.cjs`, `state-qa.cjs`, `focus-layout-qa.cjs` / `--focus-only`, Python `compare.py`, `focus-pixels.py`: Before 14장·대응 After 14장 및 추가 6장. 기능 262검사/17배치, 후속 32검사, 최종 초점 18검사 PASS. 실제 명령 전문과 시각 디버깅 기록은 [Visual QA](../visual-qa/TASK-FE-027.md)와 [QA 상세](../visual-qa/assets/TASK-FE-027/qa-summary.md) 참조.
- 홈·프로필 1440px PNG 변경 픽셀 각각 0, 6개 맵 선택 상태의 핀 퍼센트 좌표·경로점·회전 동일. 브라우저 예외/예상 밖 콘솔 오류 0.
- 라인업 데이터·상태·effect·Preview 계산 코드, 두 필터, globals.css, StatsHeader 원본 보존 검사 PASS.
- 서버 복원 후 `node /private/tmp/fe027-post-build.cjs`: 두 경로 HTTP 200·맵/가이드 선택·공통 헤더/푸터·가로 넘침·브라우저 오류 등 19검사 PASS.
- `git diff --check`: PASS.

### 사용자 요청에 따른 최종 범위 재확인

- 기준 `origin/dev` / `f3efedf`와 전체 변경 목록(새 파일 포함)을 재대조했다. 제품 변경은 두 페이지와 신규 공통 셸 TSX/CSS 총 4파일뿐이다.
- 라인업 state/effect/API 결과 처리/Preview 계산 부분은 기준 코드와 동일하다. 두 필터·API·스모크 데이터·타입·자산 매핑·전역 CSS·공통 헤더/셸/테마/언어·RootLayout·package.json 15개 소스의 바이트 일치를 확인했다.
- 디자인 외에 추가로 연결된 UI 동작은 기존 공통 헤더의 메뉴 열기/닫기·초점 복원·현재 메뉴·홈 검색 이동·Language 선택이다. 로그인 요구, 검색/API 기능, 데이터 의미를 새로 바꾸지 않았다.
- 한국어 본문/상태 안내의 접근성 표시, 지도 경로/핀의 겹침 순서와 반응형 배치는 이번 표시 범위에 해당한다. 백엔드·인증·DB·운영 의존성 변경은 없다.
- 독립 읽기 전용 검토에서도 업무 로직 침범 및 다른 페이지로의 새 CSS 적용을 발견하지 못했다. 기존 기능262검사·좌표/픽셀 비교·최종초점·서버복원 결과 PASS를 확인했다.
- 이번 재확인에서는 제품 코드를 수정하거나 전체 테스트를 반복하지 않았다. `git diff --check`는 다시 통과했다. 메뉴 역할 정리와 추가 디테일은 다음 Task에서 다룬다.

### 남은 제한

- 스모크 좌표/수치의 Preview 의미와 기존 API 실패 시 데모 전환을 유지한다. 실제 운영 API 가용성·데이터 정확성/패치 검증·배포를 완료한 것은 아니다.
- 라인업 독립 상세·관리자·홈/프로필 재디자인과 탐색 본문 번역 확대는 이번 범위 밖이다.
- 검증에서 지도 함수·좌표의 의미 변경 없음. 태블릿/모바일의 기존 스크롤 탐색은 유지한다.
- 사용자 PR 검토·병합 및 별도 Cursor 리뷰 대기. 이번 제출은 `codex/frontend-rework` 대상이며 `dev`/`main` 병합이나 배포를 수행하지 않는다.
