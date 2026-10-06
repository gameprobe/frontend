# TASK-FE-039 — 공개 라인업 도착점·출발점 선택 연결

## Status
IMPLEMENTED — 검증 완료, 사용자 승인으로 PR 제출 진행

## Goal
같은 도착점을 향하는 여러 공략을 확인하고 선택한 출발점의 경로·자료·상세 화면이 일치하도록 한다.

## Scope
- PR #41 병합 frontend-rework `25b0f52`에서 `codex/lineup-destination-flow` 분기.
- 도착점 선택 → 여러 출발점/경로 → hover·focus 경로 강조 → 클릭·터치·키보드로 해당 공략 상세 이동.
- 겹치는 지도 마커도 선택할 수 있도록 같은 도착점의 공략 링크 목록 제공. 필터 변경 시 선택 초기화.
- 프론트 예시의 명시적 도착점 ID로 묶고 목록/상세의 출발·도착·경로를 같은 예시 원본에서 제공. ID 없는 기존 API 자료는 공략별로 유지하며 좌표/스킬로 추측하여 묶지 않는다.
- 실제 플레이용 공략이 아닌 합성 위치임을 안내한다. 없는 영상은 없다고 표시한다.
- 기존 지도 회전·공통 테마·API 응답/요청 계약 유지. 관리자 편의성, 저장/공개 연결, 스모크, 백엔드, 인증, DB, 의존성/이미지 추가는 제외.
- 커밋·푸시·PR은 별도 요청 전 수행하지 않는다.

## Reference
앞서 사용자가 제공한 Strats.gg 캡처의 도착점 → 출발점 → 자료 탐색 흐름. 시각 스타일은 현재 GameProbe 라인업 화면을 유지한다. 새 외부 자산은 사용하지 않는다.

## Allowed changes
- frontend/src/components/LineupSearchFilter.tsx
- frontend/src/components/LineupSearchFilter.module.css
- frontend/src/components/LineupDetail.tsx
- frontend/src/app/lineups/page.tsx
- frontend/src/lib/lineup-api.ts
- frontend/src/types/lineup.ts
- frontend/src/features/lineup-explorer/model.ts
- frontend/src/features/lineup-explorer/model.test.cjs
- frontend/src/features/lineup-explorer/preview-data.ts
- docs/PLAN.md
- docs/frontend/PLAN.md
- docs/PROGRESS.md
- docs/tasks/TASK-FE-039.md
- docs/visual-qa/TASK-FE-039.md
- docs/visual-qa/assets/TASK-FE-039/verify.cjs
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md
- docs/visual-qa/assets/TASK-FE-039/**
- 나머지 HANDOFF 파일은 읽기 전용.

## Verification commands
- frontend: `npx tsc --noEmit`
- frontend: `npm run lint`
- frontend: `npm run build` (개발 서버와 분리한 임시 복사본)
- frontend: `node src/features/lineup-explorer/model.test.cjs`
- frontend: `node src/features/admin/preview/model.test.cjs`
- Playwright: `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-039/verify.cjs before|after`
- Playwright: 같은 환경 `node docs/visual-qa/assets/TASK-FE-039/api-fixtures.cjs` (임시빌드 localhost3101)
- 1440/390px: 도착점/출발점/전체·강조 경로, 키보드·터치, 올바른 상세 이동·동일 좌표, 필터 초기화, ID없는API 자료분리, 빈 결과·위치 없음, 가로넘침/실행오류 검사.
- Before/After 시각 보고서와 독립 코드/실제 이미지 검토.
- `git diff --check`

## Result

### 구현 결과
- 명시적인 도착점 묶음을 선택하고 출발점·전체 경로를 표시한다. hover/focus는 해당 공략 경로만 강조하고 클릭/Enter/터치는 해당 상세로 이동한다.
- 텍스트 도착점 버튼과 번호별 공략 목록으로 겹친 마커·미등록 위치에서도 자료에 접근한다. 필터 변경은 선택을 초기화한다.
- 공개 목록/상세의 합성 예시 좌표를 공유 원본으로 통일했다. 정사각형 지도/좌표 레이어와 기존 공수 회전을 맞췄다.
- 실제 API의 기록 경로는 그대로 보존하며 빈 경로를 추정하지 않는다. 가짜 데모 영상은 재생하지 않고 미연결 안내를 표시한다.

### 변경 파일 전체
- `frontend/src/components/LineupSearchFilter.tsx`
- `frontend/src/components/LineupSearchFilter.module.css`
- `frontend/src/components/LineupDetail.tsx`
- `frontend/src/app/lineups/page.tsx`
- `frontend/src/lib/lineup-api.ts`
- `frontend/src/types/lineup.ts`
- `frontend/src/features/lineup-explorer/model.ts`
- `frontend/src/features/lineup-explorer/model.test.cjs`
- `frontend/src/features/lineup-explorer/preview-data.ts`
- `docs/tasks/TASK-FE-039.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-039.md`
- `docs/visual-qa/assets/TASK-FE-039/after-1440-destinations.png`
- `docs/visual-qa/assets/TASK-FE-039/after-1440-detail.png`
- `docs/visual-qa/assets/TASK-FE-039/after-1440-empty.png`
- `docs/visual-qa/assets/TASK-FE-039/after-1440-hover-route.png`
- `docs/visual-qa/assets/TASK-FE-039/after-1440-origins.png`
- `docs/visual-qa/assets/TASK-FE-039/after-390-destinations.png`
- `docs/visual-qa/assets/TASK-FE-039/after-390-detail.png`
- `docs/visual-qa/assets/TASK-FE-039/after-390-empty.png`
- `docs/visual-qa/assets/TASK-FE-039/after-390-origins.png`
- `docs/visual-qa/assets/TASK-FE-039/after.json`
- `docs/visual-qa/assets/TASK-FE-039/api-1440-empty.png`
- `docs/visual-qa/assets/TASK-FE-039/api-1440-missing-positions.png`
- `docs/visual-qa/assets/TASK-FE-039/api-390-empty.png`
- `docs/visual-qa/assets/TASK-FE-039/api-390-missing-positions.png`
- `docs/visual-qa/assets/TASK-FE-039/api-fixtures.cjs`
- `docs/visual-qa/assets/TASK-FE-039/api-fixtures.json`
- `docs/visual-qa/assets/TASK-FE-039/before-1440-destinations.png`
- `docs/visual-qa/assets/TASK-FE-039/before-1440-detail.png`
- `docs/visual-qa/assets/TASK-FE-039/before-1440-origins.png`
- `docs/visual-qa/assets/TASK-FE-039/before-390-destinations.png`
- `docs/visual-qa/assets/TASK-FE-039/before-390-detail.png`
- `docs/visual-qa/assets/TASK-FE-039/before-390-origins.png`
- `docs/visual-qa/assets/TASK-FE-039/before.json`
- `docs/visual-qa/assets/TASK-FE-039/verify.cjs`
- `.agent-reports/HANDOFF.json`
- `.agent-reports/CURRENT.md`

- `docs/visual-qa/assets/TASK-FE-039/regression-1440-admin-editor.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-admin-lineups.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-admin-smokes.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-insights.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-overview.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-smokes-defense.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-1440-smokes.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-admin-editor.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-admin-lineups.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-admin-smokes.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-home.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-insights.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-overview.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-smokes-defense.png`
- `docs/visual-qa/assets/TASK-FE-039/regression-390-smokes.png`
- `docs/visual-qa/assets/TASK-FE-039/regression.cjs`
- `docs/visual-qa/assets/TASK-FE-039/regression.json`

### 실행 명령과 검증 결과
- 추가 회귀: `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-039/regression.cjs` PASS — PC1440/모바일390, 홈·오버뷰·인사이트·스모크 가이드/진영 전환·관리자 예시 입장/수정/저장/목록/종류별 검색 유지. 16장 캡처, 실행 예외·가로 넘침·네트워크 쓰기 요청 0.
- PR 전 공유 코드 독립 재검토 PASS. 실제 API·관리자 저장 payload·관리자 모델은 원본과 동일하며 추가 소스 수정 없이 검토를 마쳤다.

- `git fetch origin`, `git switch codex/frontend-rework`, `git merge --ff-only origin/codex/frontend-rework`: PASS, PR #41 병합 `25b0f52` 반영, 충돌 없음.
- `git switch -c codex/lineup-destination-flow`: PASS.
- `docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit`: PASS.
- `docker exec valorant-frontend-dev-frontend-1 npm run lint`: PASS, ESLint 경고/오류 없음.
- `docker exec valorant-frontend-dev-frontend-1 node src/features/lineup-explorer/model.test.cjs`: PASS, 17/17 (담당 구현 에이전트 실행).
- `docker exec valorant-frontend-dev-frontend-1 node src/features/admin/preview/model.test.cjs`: PASS, 30/30.
- 동일 개발 이미지에서 읽기 전용 소스 복사본을 만든 임시 컨테이너 `valorant-fe039-qa`의 `/tmp/fe039-qa`에서 `npm run build`: PASS, 정적15/15. 테스트용 `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:3101/test-api`만 지정. 기존 .next·환경파일·DB 미변경. 기존 git 미설치 안내는 있었고 빌드 성공.
- `PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-039/verify.cjs before`: PASS, PC/모바일6장.
- 같은 환경 `node docs/visual-qa/assets/TASK-FE-039/verify.cjs after`: PASS, PC/모바일9장, 선택/hover/focus/터치/상세좌표·식별자/필터/빈결과/수비회전.
- 같은 환경 `node docs/visual-qa/assets/TASK-FE-039/api-fixtures.cjs`: PASS, PC/모바일4장, no-ID분리/경로보존/출발·도착점누락/성공0건/API자료상세. 운영 API/DB 쓰기 없이 로컬 GET 응답만 대체.
- Before/After JSON·스크린샷 기반 시각 보고서 생성, 실제 이미지 대조 및 독립 코드/시각 검토: PASS.
- `git diff --check`: PASS.

### 남은 위험·주의 사항
- 관리자 예시의 등록 내용은 여전히 관리자 화면 메모리에만 있고 공개 목록과 연결하지 않았다.
- 기존10개 공략ID 유지+합성예시3개. 예시 경로·좌표는 실제 플레이용 검증 자료가 아니며 실제 영상은 없다.
- 운영 API는 공유 도착점ID가 없으므로 기존 공략마다 별도의 도착점을 표시한다. 관리자 저장 계약/공개 연결은 별도 Task다.
- 공개 상세는 기존의 별도 페이지 이동 방식이다. 인사이트/스모크/관리자 편의성 추가 작업은 수행하지 않았다.
- 사용자 승인으로 현재 변경을 커밋·푸시하고 `codex/frontend-rework` 대상 PR을 제출한다. 병합은 사용자가 수행한다. 배포·백엔드 연결은 포함하지 않는다.

- 검증용 임시 컨테이너 `valorant-fe039-qa` 종료·자동 삭제 완료. 기존 개발 서버는 유지했다.
