# TASK-ADMIN-001 — 실제 라인업 관리자 CRUD 연결

## Scope

사용자의 명시적 위임으로 FastAPI 관리자 CRUD와 기존 프론트 관리자 화면을 연결한다. 등록·목록·단건 조회·수정·삭제·인증·오류 처리를 완료한다. 일반 사용자 API 연결, 스모크 실제 저장, 공유 도착점 일괄 이동, 운영 배포는 제외한다.

## Allowed changes

- compose.yaml (로컬 Docker 개발 서버의 API 주소 연결)

- src/features/admin/AdminGatePage.tsx
- src/features/admin/AdminLayout.tsx
- src/features/admin/AdminListPage.tsx
- src/features/admin/AdminEditorPage.tsx
- src/features/admin/MapEditor.tsx
- src/features/admin/admin-session.ts
- src/features/admin/model.ts
- src/features/admin/admin-lineup-api.ts
- src/features/admin/admin-lineup-store.ts
- src/features/admin/admin-lineup-api.test.cjs
- src/features/admin/admin-session.test.cjs
- docs/visual-qa/TASK-ADMIN-001.md
- docs/tasks/TASK-ADMIN-001.md
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md

## Verification commands

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:backend` 및 새 관리자 API/변환 테스트
- Playwright PC/모바일 Before/After와 실제 FastAPI 앱 + 격리 가짜 DB HTTP 흐름 검증.
- `git diff --check`

## Result

Status: IMPLEMENTED
Human Decision Required: NO

### 구현 요약

- 기존 관리자 디자인과 지도 편집기를 유지하면서 실제 인증·목록·단건 조회·등록·수정·삭제를 FastAPI와 연결했다.
- UI 512px 좌표를 API 0~1로 변환하고 경로 배열 순서를 유지한다. 예시 저장소와 실제 API 저장소를 분리했다.
- 토큰은 현재 탭 sessionStorage에 저장하고 로그아웃 시 제거한다. 늦은 응답이 새 인증 상태나 로그아웃을 되돌리지 못하게 했다.
- 저장·삭제 중 중복 요청/입력을 차단하고 삭제 확인을 제공한다. 저장 실패·401 재인증 후에도 작성 내용이 유지된다.
- 실제 공유 도착점은 잠그고 새 도착점으로 분리하도록 했다. 실제 스모크는 준비 중이며 예시 모드의 스모크는 유지된다.
- 개발용 compose.yaml에 VITE_BACKEND_URL 기본값 http://localhost:8000을 추가하고 실행 중인 로컬 컨테이너에 적용했다. 명시적 환경값으로 덮어쓸 수 있으며 운영 이미지 빌드 설정은 변경하지 않는다.
- 기존 공개 라인업 화면/자료 저장소, 실제 환경파일, 패키지, 운영 배포는 변경하지 않았다. 커밋·푸시 없음.

### 실제 변경 파일 전체

- compose.yaml
- src/features/admin/AdminEditorPage.tsx
- src/features/admin/AdminGatePage.tsx
- src/features/admin/AdminLayout.tsx
- src/features/admin/AdminListPage.tsx
- src/features/admin/MapEditor.tsx
- src/features/admin/admin-session.ts
- src/features/admin/model.ts
- src/features/admin/admin-lineup-api.ts
- src/features/admin/admin-lineup-store.ts
- src/features/admin/admin-lineup-api.test.cjs
- src/features/admin/admin-session.test.cjs
- docs/tasks/TASK-ADMIN-001.md
- docs/visual-qa/TASK-ADMIN-001.md
- .agent-reports/HANDOFF.json (Git 제외)
- .agent-reports/CURRENT.md (Git 제외)

### 실행한 검증 명령과 실제 결과

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS. 기존 500kB 초과 chunk 안내 존재.
- `npm run test:backend`: 기존 백엔드 클라이언트 10개 PASS.
- `node --test src/features/admin/admin-lineup-api.test.cjs src/features/admin/admin-session.test.cjs`: 14개 PASS. API 요청·오류·좌표 변환·세션 분리·전체 페이지 로딩·로그아웃/새 로그인과 늦은 응답 경합 검증.
- `git diff --check`: PASS.
- `node /private/tmp/gameprobe-admin-crud-qa/browser.cjs`: Playwright 21개 PASS, 브라우저 런타임 오류 0. 실제 수정 소스 + 가짜 Mongo를 사용하는 실제 FastAPI 앱으로 검증; 실제 Atlas 데이터는 변경하지 않음.
- `docker compose up -d frontend`: PASS. 실제 localhost:3000에서 브라우저에 제공되는 API 주소가 localhost:8000임을 확인. 실제 백엔드 health 200 및 CORS 사전 요청 200.
- 독립 시각 검토: PC 2열/390px 모바일 1열, 버튼·드롭다운·지도 겹침/가로 넘침 없음. 상세 결과 docs/visual-qa/TASK-ADMIN-001.md.
- `.env`와 Agent Report Git 제외 확인. 실제 환경파일 추적 없음(.env.example만 추적), 스크린샷·node_modules·dist를 커밋 대상에 추가하지 않음.

### 남은 문제와 후속 범위

- 일반 사용자 화면의 실제 API 연결과 스모크 CRUD는 후속 작업이다. 실제 관리자 자료가 공개 화면에 자동으로 반영되지는 않는다.
- 실제 Atlas 쓰기는 이 검증에서 수행하지 않았다. 사용자는 http://localhost:3000/admin에서 자신의 백엔드 토큰으로 확인할 수 있다.
- 새로고침/닫기/앵커 이동은 미저장 경고를 제공하지만 브라우저 자체 Back/Forward의 SPA 이동 차단은 현재 BrowserRouter에서 구현하지 않았다.
- 동일 도착점의 여러 자료를 한 번에 이동하는 기능은 제외했다. 새 도착점으로 분리 가능하다.
- 긴 모바일 편집 화면의 저장 버튼은 상단에 있다. 버튼 고정은 후속 UX 개선 후보다.
- 새 CJS 테스트는 위 명령으로 명시 실행한다. 기존 test:backend 명령은 기존 클라이언트 테스트만 실행한다.
