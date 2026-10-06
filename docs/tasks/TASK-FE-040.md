# TASK-FE-040 — 라인업 관리자 실제 API 연결

## Status
IMPLEMENTED

## Goal
관리자에서 입력한 개별 라인업을 BE-003 API로 저장·재조회·편집하고 공개된 자료의 도착점·경로·영상/이미지를 일반 사용자 화면에서도 동일하게 보여준다.

## Scope and authorization
- 사용자 승인: 최신 dev 5e0fa1c 기반 codex/frontend-rework에서 codex/admin-lineup-api로 분기하여 한 브랜치에서 라인업 연결을 완성한다.
- 실제 /admin 흐름에 기존 토큰 인증과 관리자 CRUD/상태 API를 재사용하고 예시 화면의 메뉴·목록·지도 편집 디자인을 연결한다. /admin/preview는 독립 메모리 예시로 유지한다.
- BE-003 registration과 단일 중간좌표 pathPoints를 요청/응답/표시에 보존한다. 소바 전용 설정·라인업 경유/튕김 구분을 정리한다.
- 등록 자료 조회 실패/필수값 오류/저장 중/인증 오류와 미저장 전환 안내를 제공한다. 상태와 기존 다중 마커 자료를 임의 축소하거나 초기화하지 않는다.
- 공개 자료에 destination ID와 media/site/slot을 전달하고 출발→중간점→도착 경로를 표시한다.
- 스모크 저장·공유 도착점 일괄 이동·인증 정책·백엔드 코드/API/스키마 변경·새 의존성·외부 배포는 제외한다.
- 최신 백엔드 실행은 이미 승인한 연결 검증의 선행 작업으로 허용. 실제 등록 검증은 임시 로컬 DB/별도 백엔드를 사용하며 Atlas에 테스트 자료를 쓰지 않는다.
- 커밋·푸시·PR은 별도 요청 후 진행한다.

## Allowed changes
- frontend/src/types/lineup.ts
- frontend/src/lib/lineup-api.ts, lineup-api.test.cjs
- frontend/src/features/lineup-explorer/model.ts, model.test.cjs, media.ts, media.test.cjs
- frontend/src/features/admin/LineupWorkspace.tsx, LineupWorkspace.module.css
- frontend/src/features/admin/lineup-registration.ts, lineup-registration.test.cjs
- frontend/src/features/admin/preview/model.ts, model.test.cjs, PreviewMap.tsx, AdminPreview.tsx, AdminPreview.module.css
- frontend/src/components/AdminLogin.tsx, AdminLineupList.tsx, LineupEditor.tsx, LineupDetail.tsx, LineupDetail.module.css, LineupSearchFilter.tsx, LineupSearchFilter.module.css
- frontend/src/app/admin/page.tsx, lineups/page.tsx, lineups/new/page.tsx, lineups/[id]/edit/page.tsx
- docs/tasks/TASK-FE-040.md, docs/frontend/PLAN.md, docs/PROGRESS.md
- docs/visual-qa/TASK-FE-040.md, docs/visual-qa/assets/TASK-FE-040/**
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md, .agent-reports/VERDICT.json (Git 제외)
- frontend/.env.local (로컬 공개 API 주소만 설정, Git 제외; 다른 환경값 보존)
- 나머지 HANDOFF 파일은 읽기 전용 참고. 새 파일이 필요하면 위 기능 범위 내에서 먼저 허용 목록에 명시한다.

## Verification commands
- frontend: npx tsc --noEmit, npm run lint
- frontend: node src/features/admin/preview/model.test.cjs
- frontend: node src/features/admin/lineup-registration.test.cjs
- frontend: node src/features/lineup-explorer/model.test.cjs
- frontend: node src/features/lineup-explorer/media.test.cjs
- frontend: node src/lib/lineup-api.test.cjs
- frontend: npm run build (개발 서버와 분리된 임시 복사본)
- Playwright Before/After: 1440/390px 관리자 로그인·목록·편집/preview 및 공개 목록/상세. 시각 보고서 작성.
- Playwright + 격리된 백엔드/임시 MongoDB: 잘못된 토큰 거절, 새 등록→새로고침→재편집→공개→비로그인 조회→비공개 시 미노출, 여러 출발점/중간점0·1·여러개/이미지·영상/삭제·잘못된 입력 회귀.
- git diff --check, 비밀환경파일 제외 확인. 운영 데이터 읽기/쓰기 없음.

## Result

Status: IMPLEMENTED — API 연결·지도 통일·상세 오류 안내 및 스킬별 자료 선택 검증 완료. 사용자 요청에 따라 세 작업 단위로 커밋을 정리하고 codex/frontend-rework 대상 PR을 제출한다. 병합은 사용자 검토 후 진행한다.

### 구현

- `/admin` → `/admin/lineups` → 등록/편집을 실제 API에 연결. 저장/재조회·공개 상태·삭제와 실패 복구, 미저장 이동 확인을 제공한다.
- registration destination/media/site/slot과 순서 있는 중간점 x/y를 보존한다. 소바 전용 입력과 라인업 경유/튕김 구분을 없앴다. 스모크의 예시 기능은 유지한다.
- 공개 도착점 묶음과 정확한 공략 상세에 좌표·자료를 표시한다. 기존 다중 마커를 임의 축소하지 않고 읽기 전용으로 안내한다.

### 변경된 파일 전체

- docs/PROGRESS.md
- docs/frontend/PLAN.md
- docs/tasks/TASK-FE-040.md
- docs/visual-qa/TASK-FE-040.md
- docs/visual-qa/assets/TASK-FE-040/after-1440-detail-image.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-detail-video.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-editor-preview.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-editor.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-expired.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-legacy.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-list.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-login.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-preview.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-public.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-unpublished.png
- docs/visual-qa/assets/TASK-FE-040/after-1440-validation.png
- docs/visual-qa/assets/TASK-FE-040/after-390-detail-image.png
- docs/visual-qa/assets/TASK-FE-040/after-390-detail-video.png
- docs/visual-qa/assets/TASK-FE-040/after-390-editor-preview.png
- docs/visual-qa/assets/TASK-FE-040/after-390-editor.png
- docs/visual-qa/assets/TASK-FE-040/after-390-legacy.png
- docs/visual-qa/assets/TASK-FE-040/after-390-list.png
- docs/visual-qa/assets/TASK-FE-040/after-390-login.png
- docs/visual-qa/assets/TASK-FE-040/after-390-preview.png
- docs/visual-qa/assets/TASK-FE-040/after-390-public.png
- docs/visual-qa/assets/TASK-FE-040/after-390-unpublished.png
- docs/visual-qa/assets/TASK-FE-040/after-390-validation.png
- docs/visual-qa/assets/TASK-FE-040/before-1440-detail.png
- docs/visual-qa/assets/TASK-FE-040/before-1440-editor.png
- docs/visual-qa/assets/TASK-FE-040/before-1440-list.png
- docs/visual-qa/assets/TASK-FE-040/before-1440-login.png
- docs/visual-qa/assets/TASK-FE-040/before-1440-preview.png
- docs/visual-qa/assets/TASK-FE-040/before-1440-public.png
- docs/visual-qa/assets/TASK-FE-040/before-390-detail.png
- docs/visual-qa/assets/TASK-FE-040/before-390-editor.png
- docs/visual-qa/assets/TASK-FE-040/before-390-list.png
- docs/visual-qa/assets/TASK-FE-040/before-390-login.png
- docs/visual-qa/assets/TASK-FE-040/before-390-preview.png
- docs/visual-qa/assets/TASK-FE-040/before-390-public.png
- docs/visual-qa/assets/TASK-FE-040/before-results.json
- docs/visual-qa/assets/TASK-FE-040/cleanup-results.json
- docs/visual-qa/assets/TASK-FE-040/integration-api-results.json
- docs/visual-qa/assets/TASK-FE-040/integration-list-results.json
- docs/visual-qa/assets/TASK-FE-040/integration-ui-results.json
- docs/visual-qa/assets/TASK-FE-040/integration.cjs
- docs/visual-qa/assets/TASK-FE-040/qa-video.webm
- docs/visual-qa/assets/TASK-FE-040/verify.cjs
- frontend/src/app/admin/lineups/[id]/edit/page.tsx
- frontend/src/components/AdminLineupList.tsx
- frontend/src/components/AdminLogin.tsx
- frontend/src/components/LineupDetail.module.css
- frontend/src/components/LineupDetail.tsx
- frontend/src/components/LineupEditor.tsx
- frontend/src/features/admin/LineupWorkspace.module.css
- frontend/src/features/admin/LineupWorkspace.tsx
- frontend/src/features/admin/lineup-registration.test.cjs
- frontend/src/features/admin/lineup-registration.ts
- frontend/src/features/admin/preview/PreviewMap.tsx
- frontend/src/features/admin/preview/model.test.cjs
- frontend/src/features/admin/preview/model.ts
- frontend/src/features/lineup-explorer/media.test.cjs
- frontend/src/features/lineup-explorer/media.ts
- frontend/src/features/lineup-explorer/model.test.cjs
- frontend/src/features/lineup-explorer/model.ts
- frontend/src/lib/lineup-api.test.cjs
- frontend/src/lib/lineup-api.ts
- frontend/src/types/lineup.ts
- frontend/.env.local (로컬 공개 API 주소; Git 제외)
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md
- .agent-reports/VERDICT.json

### 실행한 명령과 결과

- 기존 프론트 컨테이너에서 `npx tsc --noEmit`, `npm run lint`: PASS, 경고/오류0.
- Verification commands의 모델/요청/미디어 Node 검사: 30+9+17+12+11 = **79개 PASS**.
- 환경파일을 제외한 임시 프론트 복사본에서 `npm run build`: PASS. 시각 보완 CSS를 반영한 최종 빌드도 PASS.
- `node docs/visual-qa/assets/TASK-FE-040/integration.cjs api`: **8개 PASS**. 지정된 임시 18080 백엔드와 tmpfs MongoDB만 사용.
- Playwright 런타임을 지정해 같은 스크립트 `ui` 실행: **19개 PASS**. 실제 API 저장/조회/공개 및 영상/이미지·인증·실패 복구·예시 격리 검증. CSS 보완 후 PC/모바일 목록 회귀 **2개 PASS**.
- Playwright Before12/After23장. 직접 및 독립 Codex 코드·이미지 검토 PASS. Cursor 별도 검토는 실행하지 않았다.
- `docker compose --env-file backend/.env -f docker/compose.backend.yml build backend`, 이어서 `up -d --no-build --pull never --no-deps --force-recreate --wait --wait-timeout 50 backend`: PASS. 기존 병합 소스 적용, backend 코드/환경값 변경 없음.
- 로컬 health200, 기존 토큰 인증200, 오류토큰401, 무토큰 관리자403 PASS. 프론트 공개 API가 localhost:8080을 요청하는지 브라우저에서 실제 요청을 가로채 확인. Atlas 자료 조회/쓰기 없음.
- 임시 테스트 자료·컨테이너3개·전용 네트워크·임시 복사본 정리 PASS. 기존3000/8080 서버 유지.
- `git diff --check`, 두 환경파일 ignore/미추적 및 실제 비밀값의 공유 diff·신규 파일 미포함 검사 PASS.

### 남은 위험과 주의

- 실제 `/admin` 저장은 연결된 DB에 반영된다. `/admin/preview`는 예시 메모리이며 별도다. 테스트는 일회용 DB에서 수행했고 운영 자료 품질을 검수하지 않았다.
- 등록 정보 없는 자료/다중 마커는 내용 편집을 자동 변환하지 않는다. 상태 변경·삭제만 가능하다.
- 실제 공유 도착점 일괄 이동, 동시 편집 충돌 방지, 스모크 저장은 후속 범위다.
- HTTP(S) 영상/이미지 주소를 저장하며 파일 업로드는 제공하지 않는다. 임의 영상 서비스는 원본 링크로 연다.
- 로컬 공개 API 주소는 Git 제외다. 다른 환경은 기존 `.env.example`에 따라 NEXT_PUBLIC_BACKEND_URL을 설정하고 프론트를 다시 빌드해야 한다.

## 사용자 후속 검증 요청 (2026-10-05)

- Docker 빌드에 검증 이미지가 포함되는지 읽기 전용으로 확인한다. Docker 설정·의존성을 임의 변경하지 않는다.
- Strats 화면과 같은 Abyss/Brimstone 경로 예시 한 건을 실제 관리자 UI에서 생성·공개·조회한다. 해당 한 건에 한해 기존 Atlas 쓰기 제외 범위를 사용자가 확장했다. 다른 자료는 수정/삭제하지 않는다.
- 제목/설명에 테스트·미검증 공략임을 표시하며 지도 위치는 이미지 기반 시각 예시다. 외부 자료를 복사하지 않고 원문 링크를 사용한다.
- 허용된 검증 스크립트·보고서 영역에 재실행 시 중복 생성하지 않는 검사를 작성한다. 비밀 토큰은 로컬 환경에서 읽되 공유 파일·로그에 기록하지 않는다.

## 실제 예시 등록 후속 검증 (2026-10-05)

- 사용자가 요청한 한 건을 실제 `/admin` UI로 등록·공개했다. Atlas 저장 ID: `15f99bbd-3982-469e-b447-09f4ffcc4064`, 제목: `[테스트] 어비스 브림스톤 A 사이트 · 꺾이는 경로`.
- Abyss / Brimstone / Q / 공격 / A 구역. 출발점 1개 → 중간점 1개 → 도착점 1개이며, 등록 후 새로고침과 비로그인 조회에서 좌표·자료 주소가 유지된다. 기존 자료는 변경하지 않았다. 확인용 한 건은 삭제하지 않고 남겼다.
- [Strats 원본](https://strats.gg/valorant/lineups/post-plant-molly-a-site-10727?map=abyss&agent=brimstone)을 직접 확인하고 영상 자료 주소로 연결했다. 영상/이미지를 내려받거나 재배포하지 않았다. 좌표는 참고 화면 기반 시각 예시이며 실제 게임 성공을 검증하지 않았음을 본문에 명시했다. 영상은 원본 링크로 열린다.
- 단위 검사 2개 추가 후 **81개 PASS**(예시30 + 등록10 + 공개 경로18 + 미디어12 + API11). 새 검사는 Brimstone 직접 입력 스킬ID·Q 슬롯·꺾임 좌표의 API 왕복 및 공수 방향 변환을 확인한다.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/registered-example.cjs --create`: **15개 PASS**, 실제 UI POST201 한 번. 관리자 로그인·저장·재조회·공개 API·도착점 선택·출발점 hover·상세 이동·자료 링크·모바일 넘침·실행 예외를 검증했다.
- 같은 스크립트를 `--create` 없이 재실행: **14개 PASS**, 추가 생성0. 기존 등록 ID를 결과 파일에서 먼저 조회하므로 제목 변경/삭제 이후에도 무심코 다시 생성하지 않는다. 기본은 읽기 전용이며 자격증명·브라우저 저장소·요청 헤더는 결과에 저장하지 않는다.
- [생성 결과](../visual-qa/assets/TASK-FE-040/registered-example-results.json), [읽기 전용 재검증](../visual-qa/assets/TASK-FE-040/registered-example-readonly-results.json), [공개 지도](../visual-qa/assets/TASK-FE-040/registered-example-public.png), [상세 화면](../visual-qa/assets/TASK-FE-040/registered-example-detail.png).
- 직접 이미지 대조: 공개 지도에 출발 요원·도착 스킬·한 번 꺾이는 선이 보이며 목록과 상세의 저장 좌표는 같다. 목록은 공격 방향으로 회전하고 상세는 원본 지도 방향이다. 겹침·깨진 이미지·가로 넘침·JS 실행 예외가 없다. 이번 캡처는 2장, 약511KiB만 추가했다.
- [Docker 감사](../visual-qa/assets/TASK-FE-040/container-audit.json): 현재 프론트 빌드 범위 밖에 `docs/`가 있고 백엔드는 Docker 전용 ignore로 제외하므로 QA 스크린샷은 현재 두 이미지에 포함되지 않는다. 테스트 CJS 12개 약126KiB는 다음 프론트 개발 이미지에 포함될 수 있다. 프론트 운영용 Dockerfile은 현재 없으므로 향후 별도 빌드 설정은 다시 확인해야 한다. Git 저장소 용량에는 캡처37장 약7.47MiB가 반영된다.
- 추가 변경 파일: `frontend/src/features/admin/lineup-registration.test.cjs`, `frontend/src/features/lineup-explorer/model.test.cjs`, 검증 스크립트/JSON/PNG, Task·PROGRESS·Visual QA·CURRENT·HANDOFF. 제품 소스·Docker 설정·의존성·백엔드·비밀 환경값은 이 후속 검증에서 변경하지 않았다.
- `git diff --check` 및 두 `.env` Git 제외 확인 PASS. 커밋/푸시/PR 없음.

## 사용자 승인에 따른 커밋 분리 (2026-10-05)

- 검증한 API 연결 작업을 첫 커밋으로 보존한 뒤, 같은 브랜치에서 상세 지도의 방향·스킬 아이콘·경로선을 기존 목록 기준으로 맞추고 두 번째 커밋으로 분리한다.
- API 연결 검증은 통과했다. 사용자 검토에서 목록/상세의 화면 방향·마커·선 표현 불일치가 확인됐으며, 다음 커밋의 수정 대상으로 남긴다. 초기 시각 검증은 이 화면 간 일관성 문제를 놓쳤다.
- DB 좌표·자료·백엔드·관리자 입력·목록 디자인은 유지한다. 상세 컴포넌트·로컬 CSS·관련 회귀 검사와 보고서만 수정한다. globals.css는 상속 규칙 확인을 위한 읽기 전용 참고다.

## 목록·상세 지도 표현 통일 — 두 번째 작업 단위 (2026-10-05)

- 첫 번째 커밋 `c87b263`: 관리자 API 연결 및 등록 검증. 이어서 사용자 승인으로 같은 브랜치의 상세 표시를 보완했다.
- 목록의 `orientLineupPoint`를 상세 경로와 모든 마커에 재사용하고 지도 이미지에도 같은 공수별 회전을 적용했다. 정사각형 캔버스에서 이미지·SVG·마커가 같은 좌표 기준을 사용한다.
- 단일 등록 공략은 저장된 `abilitySlot`의 스킬 아이콘을 표시한다. 원형 아이콘 중심이 정확한 좌표가 되도록 번호 배지를 별도로 배치했다. 구형 다중 마커는 기존 번호·미디어 선택을 유지한다.
- 목록과 동일한 기본 초록색3px 실선, hover/키보드 포커스 시 금색4px 강조를 적용했다. 배경 지도·선·아이콘의 방향이 함께 바뀌며 원본 데이터는 변경하지 않는다.
- 변경 소스는 `frontend/src/components/LineupDetail.tsx`, `LineupDetail.module.css` 두 파일이다. 목록·관리자·DB·API는 미변경. 기존 공개 검사 스크립트2개의 상세 예상 경로를 목록과 같은 방향으로 갱신하고 `map-consistency.cjs`를 추가했다.
- `docker exec valorant-frontend-dev-frontend-1`에서 `npx tsc --noEmit`, `npm run lint`, 기존 모델/미디어/API 검사 **81개 PASS**. 환경파일을 제외한 임시 복사본의 `npm run build` PASS, 임시 폴더 제거 완료. 컨테이너의 기존 git 미설치 버전조회 안내가 출력되지만 타입/Lint/빌드는 성공했다.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/map-consistency.cjs after`: **10개 검증 PASS**. 1440/390px의 공격/수비·중간점0/1/2·가장자리 좌표·목록/상세 경로와 마커 중심·스킬이미지·hover/포커스 선 스타일·구형 다중 마커/자료 선택을 확인했다.
- 실제 등록 자료는 공개 GET으로만 비교했고 변경 없음. 추가 수비/다중 경로 자료는 브라우저 응답 대역을 사용해 DB 쓰기0. 실행 예외·깨진 이미지·가로 넘침0.
- Before1장, After2장만 추가했다. 직접 및 독립 Codex 코드·이미지 검토 PASS. Cursor 별도 검토는 실행하지 않았다. 이번 검사는 이전에 놓친 목록↔상세 일관성을 명시적으로 검증한다.
- 남은 범위: 실제 공략 좌표의 게임 내 정확성은 미검증이고, 구형 자료의 누락된 스킬 슬롯을 임의 추정하지 않는다. 영상/설명 영역과 관리자 원본 방향 입력은 유지한다.

| 비교 | 결과 |
|---|---|
| [수정 전 PC](../visual-qa/assets/TASK-FE-040/map-consistency-before-1440-detail.png) → [수정 후 PC](../visual-qa/assets/TASK-FE-040/map-consistency-after-1440-detail.png) | 원본 세로 방향/숫자 표시/얇은 선에서 목록과 같은 방향/Q 아이콘/실선으로 통일 |
| [수정 후 모바일](../visual-qa/assets/TASK-FE-040/map-consistency-after-390-detail.png) | 아이콘 중심·지도 좌표 유지, 가로 넘침 없음 |
| [자동 검증 결과](../visual-qa/assets/TASK-FE-040/map-consistency-after-results.json) | 공수·경로·아이콘·기존 자료 동작 10개 PASS |


## 상세 화면 오류 처리 후속 수정 (2026-10-05)

- 사용자 승인: 같은 브랜치에서 조회 실패 안내와 구형 다중 스킬의 잘못된 영상 대체만 수정한다.
- 허용 소스: `frontend/src/components/LineupDetail.tsx`. 기존 예시 fallback, 마커가 없는 자료의 공략 공통 영상, 등록 자료의 미디어는 유지한다.
- 회귀 검사: `docs/visual-qa/assets/TASK-FE-040/detail-errors.cjs` 및 같은 폴더의 Before/After·결과 파일. API 응답을 브라우저에서 대체해 DB 쓰기 없이 검증한다.
- 검증 명령: 기존 타입·Lint·모델/미디어/API 81개 검사·격리 빌드, 새 상세 오류 Playwright 검사(404/500/연결 실패/예시 fallback/구형 선택별 미디어/자료 없음/기존 등록 상세·PC/모바일), `git diff --check`와 환경파일 제외 확인.
- 기존 CRUD·백엔드 계약 통합 검증은 위 완료 결과를 유지한다. 이번 수정은 조회 후 프론트 표시만 바꾸므로 DB 생성·수정·삭제 통합 검사를 반복하지 않는다. 추가 커밋·푸시·PR 없음.

### 상세 화면 오류 처리 후속 수정 결과 (2026-10-05)

- Status: IMPLEMENTED. 제품 변경은 `frontend/src/components/LineupDetail.tsx` 한 파일이다. API의 404/서버 오류/연결 실패 안내를 보존하고, 구형 스킬 자료는 선택한 마커의 영상만 조회한다. 영상이 없으면 “선택한 스킬에는 등록된 영상이 없습니다.”를 표시한다.
- 기존 예시 fallback, 등록 영상/이미지 우선 처리, 마커 없는 자료의 공통 영상 분기, 페이지 전환 응답 보호를 유지했다. 백엔드·DB·관리자·지도/CSS·의존성 변경 없음.
- `docker exec valorant-frontend-dev-frontend-1`에서 `npx tsc --noEmit`, `npm run lint`, 기존 Node 검사5개(30+10+18+12+11): **81개 PASS**. 비밀환경파일을 제외한 임시 복사본 `npm run build` PASS, 복사본 자동 정리. 컨테이너의 기존 git 미설치 버전조회 안내는 남지만 빌드 성공.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-040/detail-errors.cjs before`: 기존 결함4개 재현·캡처. `after`: **23개 PASS**. PC1440/모바일390의 404/500/통신 실패, 예시 fallback, 스킬URL null/누락/빈 문자열, 스킬별 URL 전환, 등록 VIDEO/IMAGE와 빈 자료를 검증했다. 브라우저 GET 응답 대역만 사용해 DB 접근·쓰기0.
- `/tmp/fe040-detail-review/current-only.cjs`: 기존 실제 등록 예시를 1440/768/390/320px에서 읽기 전용 확인. 예외·콘솔 오류·요청 실패·깨진 이미지·가로 넘침0. 저장 자료 전후 JSON 일치, DB 쓰기0. 새 검증 스크립트의 결과와 구분해 임시 폴더에만 저장했다.
- Before4/After4 영역 캡처 총약106KiB. 직접 및 독립 Codex 코드·시각 검토 PASS. Cursor 별도 검토는 실행하지 않았다.
- QA 스크립트 초기 문제: Next.js route announcer와 오류 안내 선택자 중복을 구체화했다. 합성 마커가 모바일에서 겹쳐 첫 마커 클릭이 가려졌으므로 영상 선택 검사의 좌표를 분리했다. 제품 오류 검사를 삭제/비활성화하지 않았다. 구형 자료의 아주 가까운 마커가 겹치는 기존 표시 제약은 이번 두 결함 수정 범위에서 변경하지 않았다.
- `git diff --check`, 환경파일 Git 제외 확인 PASS. 실제 비밀환경값을 읽거나 변경하지 않았다. 추가 커밋·푸시·PR 없음.
- 현재 Strats 페이지 URL은 원본 링크 안내를 유지한다. 외부 서비스의 영상 재생 보증, 실제 게임 좌표 검증, 스모크 저장은 이번 작업에 포함하지 않는다.

이번 후속 수정의 변경 파일 전체:

- frontend/src/components/LineupDetail.tsx
- docs/tasks/TASK-FE-040.md
- docs/PROGRESS.md
- docs/visual-qa/TASK-FE-040.md
- docs/visual-qa/assets/TASK-FE-040/detail-errors-after-1440-missing-second-media.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-after-1440-server-error.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-after-390-missing-second-media.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-after-390-server-error.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-after-results.json
- docs/visual-qa/assets/TASK-FE-040/detail-errors-before-1440-missing-second-media.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-before-1440-server-error.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-before-390-missing-second-media.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-before-390-server-error.png
- docs/visual-qa/assets/TASK-FE-040/detail-errors-before-results.json
- docs/visual-qa/assets/TASK-FE-040/detail-errors.cjs
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md, .agent-reports/VERDICT.json (Git 제외)


### 사용자 요청에 따른 최종 재검증 (2026-10-05)

- 같은 수정본을 다시 실행해 확인했다. 소스·DB·환경파일·커밋 변경 없음. 이번 변경 파일은 이 검증 기록이 추가된 `docs/tasks/TASK-FE-040.md`와 Git 제외 `.agent-reports/CURRENT.md`뿐이다.
- 기존 프론트 Docker에서 `npx tsc --noEmit`, `npm run lint`, Node 모델/등록/공개/미디어/API 검사5개를 재실행: 타입·Lint PASS, **81/81 PASS**. 기존 git 미설치 안내 외 오류 없음. 코드 변경이 없어 직전 성공한 격리 빌드는 반복하지 않았다.
- `PLAYWRIGHT_MODULE=<bundled playwright> OUTPUT_DIR=/tmp/fe040-confirmation/errors node docs/visual-qa/assets/TASK-FE-040/detail-errors.cjs after`: **23/23 PASS**. 404/500/통신 오류 구분, 영상 없는 스킬의 다른 영상 대체 방지, 원래 스킬로 복귀, 등록 자료/예시 유지 확인.
- 기존 `map-consistency.cjs`를 임시 폴더로 복사해 같은 내용으로 실행: **10/10 PASS**. PC/모바일 실제 목록→상세 이동, 공수별 지도·좌표·아이콘·경로·강조 및 구형 다중 자료 선택 확인. 실제 등록 자료 전후 JSON 동일, 추가 API 쓰기0.
- 새 PC/모바일 캡처 직접 확인: 오류 안내와 빈 자료 안내, 실제 상세 지도 정상. 검증 범위 내 실행 예외·깨진 이미지·가로 넘침0. 캡처/JSON은 `/tmp/fe040-confirmation/`에만 저장해 저장소에 이미지 추가 없음.
- 앞서 기록한 아주 가까운 구형 마커의 겹침, Strats 페이지 URL의 원본 링크 표시 및 실제 게임 내 좌표 정확성 미검증 범위는 유지한다. 이번 두 오류 수정의 회귀 검사에서 새 결함은 발견하지 못했다.

### PR 제출 범위 (2026-10-05)

- 사용자 승인: 현재 변경을 PR로 제출하고, 마커 겹침 보완은 병합 후 다음 브랜치에서 다룬다. 다음 Task는 자동으로 시작하지 않는다.
- 대상: `codex/admin-lineup-api` → `codex/frontend-rework`. 로컬 기준 브랜치는 이미 dev의 `5e0fa1c`까지 갱신되어 있으므로 원격 기준 브랜치에도 해당 병합분만 fast-forward로 동기화한다. 이번 기능은 PR 검토 대상으로 남긴다.
- 커밋 구분: 관리자 API 연결 → 목록/상세 지도 통일 → 상세 오류 안내·스킬별 자료 선택 수정.
- 최종 수정본의 타입·Lint·81개 Node 검사, 상세 회귀23개, 지도 회귀10개 통과 결과를 유지한다. 격리 빌드도 통과했으며 이후 제품 소스 변경은 없다.
- 후속 작업: 겹친 마커의 보조 선택, 스모크 백엔드 저장/API 및 프론트 연결, 운영 공략·영상 검수. 공유 도착점 일괄 이동과 동시 편집 충돌 방지는 후순위다.
- `.env` 파일과 `.agent-reports`는 Git 제외 상태를 유지한다. 이번 PR 준비에서 DB 자료를 변경하지 않는다.
