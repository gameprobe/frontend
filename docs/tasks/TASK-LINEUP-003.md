# TASK-LINEUP-003 — 라인업 활성/비활성 상태 통일

## Scope

사용자가 승인한 프론트·백엔드 상태 단순화. 기존 공개 여부를 유지하며 status를 active/inactive 두 값으로 통일한다. 기본값은 inactive. 기존 저장값은 읽을 때 변환하고 수정 저장 시 새 값을 쓴다. 실제 DB 일괄 변경, 인증 변경, 스모크 API 구현, 의존성, 배포는 제외한다.

## Allowed changes

- src/features/admin/model.ts
- src/features/admin/AdminLayout.tsx
- src/features/admin/AdminEditorPage.tsx
- src/features/admin/AdminListPage.tsx
- src/features/admin/StatusBadge.tsx
- src/features/admin/guide-store.ts
- src/features/admin/public-guides.ts
- src/features/admin/admin-lineup-api.ts
- src/features/admin/admin-lineup-api.test.cjs
- src/features/admin/model.test.cjs
- docs/tasks/TASK-LINEUP-003.md
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md
- docs/visual-qa/TASK-LINEUP-003.md

## Verification commands

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:backend`
- `node --test src/features/admin/*.test.cjs`
- `git diff --check`

- 이전 상태 변환과 활성 공개/비활성 차단, 관리자 생성·수정·필터, 공개 필드/경로 보존 검증.
- UI 변경은 Playwright Before/After 및 PC/모바일 QA.

## Result

Status: IMPLEMENTED
Human Decision Required: NO

### 구현

- 관리자 상태를 `active`(활성), `inactive`(비활성)으로 통일했다. 새 공략과 같은 도착점에 추가하는 공략의 기본값은 비활성이다.
- 편집 선택지·목록 필터·뱃지·예시 안내를 두 상태로 맞추고 활성은 일반 사용자 공개, 비활성은 관리자 조회만 가능하다는 설명을 추가했다.
- 예시 seed와 공개 예시 연결도 활성만 노출한다. 예시 저장소는 모듈 메모리라 새로고침하면 초기화되며 과거 저장자료 변환 코드는 필요 없다.
- 실제 DB의 과거 `published → active`, `draft/review/rejected → inactive` 변환은 백엔드 읽기 경계에서 담당한다. API 응답/화면의 상태 왕복과 공개 여부를 검증했다.
- 좌표·중간점 순서·영상·인증 정책과 실제 스모크 미구현 상태를 유지했다. 실제 환경파일·Atlas·운영 배포는 건드리지 않았다.

### 변경 파일

- src/features/admin/model.ts
- src/features/admin/AdminEditorPage.tsx
- src/features/admin/AdminListPage.tsx
- src/features/admin/AdminLayout.tsx
- src/features/admin/StatusBadge.tsx
- src/features/admin/public-guides.ts
- src/features/admin/admin-lineup-api.test.cjs
- src/features/admin/model.test.cjs
- docs/tasks/TASK-LINEUP-003.md
- docs/visual-qa/TASK-LINEUP-003.md
- .agent-reports/HANDOFF.json (Git 제외)
- .agent-reports/CURRENT.md (Git 제외)

### 검증

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS. 기존 500kB 초과 chunk 안내가 남아 있다.
- `npm run test:backend`: 기존 클라이언트 테스트 10개 PASS.
- `node --test src/features/admin/*.test.cjs`: 관리자 테스트 19개 PASS(상태 관련 새 테스트 5개 포함).
- `node /private/tmp/gameprobe-status-qa/before.cjs`: UI 변경 전 PC 목록/편집·모바일 편집 3장 캡처.
- `node /private/tmp/gameprobe-status-qa/after.cjs`: 브라우저 동작 13개 PASS, 런타임 오류 0.
- `node /private/tmp/gameprobe-status-qa/capture.cjs`: 최종 PC/모바일 화면 캡처, 390px 가로 넘침 없음.
- 독립 Before/After 시각 검토: 7장 교차 확인, 잘림·겹침 없음, PASS.
- `git diff --check`: PASS.

### 남은 위험과 후속 범위

- 프론트와 백엔드가 같은 두 값 계약으로 배포되어야 한다. 구 프론트의 네 상태 요청은 새 백엔드에서 거부된다.
- 일반 사용자 화면의 실제 API 연결은 여전히 후속 작업이다. 이번 공개 노출 검증은 실제 FastAPI 공개 조회 응답과 관리자 예시 연결을 각각 검증했다.
- 실제 Atlas 쓰기는 수행하지 않았다. 테스트 등록·수정·삭제는 별도 localhost:8001 가짜 Mongo에서만 수행했다.
- 스크린샷·격리 QA 스크립트는 /private/tmp 아래에만 있으며 Git 또는 Docker 이미지에 포함하지 않는다.
- 구현 검증 시점에 커밋·푸시·PR 생성·병합은 하지 않았다. 이후 사용자 요청으로 dev 대상 PR 제출을 진행한다.

### 제출 전 확인 (2026-10-15)

- 사용자가 프론트·백엔드 각각 dev 대상 PR 생성을 요청했다.
- 원격 dev를 다시 확인했고 작업 시작 기준과 동일하다.
- 앞서 검증한 소스가 유지되며 제출 파일은 위 작업 범위에 한정한다. 실제 .env·스크린샷은 포함하지 않는다.
- 병합과 운영 배포는 수행하지 않는다.
