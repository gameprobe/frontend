# TASK-FE-038 — 관리자 메뉴·목록·편집 흐름 정리

## Status
IMPLEMENTED — 검증 완료, 사용자 승인으로 PR 제출 진행

## Goal
관리 메뉴와 공략 목록의 역할을 분리하여 자료를 찾은 뒤 등록/편집에 집중할 수 있게 한다.

## Scope
- PR #40 병합된 frontend-rework d3547ec를 받아 codex/admin-management-flow에서 진행한다.
- /admin/preview의 DEMO1234 입장 후 라인업 목록부터 표시한다.
- 왼쪽은 라인업 관리/스모크 관리 메뉴만 두고 목록은 본문에 표시한다. 모바일은 위쪽의 간결한 메뉴로 전환한다.
- 목록 → 새 자료/기존 자료 편집 → 미리보기/예시 저장 → 목록 복귀 흐름. 저장 후에는 편집 화면에서 결과를 확인하고 목록으로 돌아갈 수 있다.
- 검색어와 상태 필터는 종류별로 기억하고 목록 복귀/관리 메뉴 전환에도 유지한다. 저장이 검색어/상태를 자동 초기화하지 않는다. 결과 없음에서는 조건 초기화 제공.
- 미저장 편집을 버리는 목록 복귀/메뉴 전환/새 공략 전환에는 확인을 거친다. 취소 시 현재 상태 보존. 화면 전환 후 적절한 초점/스크롤 이동.
- 기존 공략별 자료·경로·도착점 공유 규칙/드래그·튕김·벽 끝·키보드·미리보기·메모리 저장을 보존한다.
- 실제 /admin 인증, 백엔드/API/DB/영구 저장, 새 라이브러리·이미지·전역 메뉴·공개 라인업 연결·삭제/게시 기능은 제외한다.
- 커밋/푸시/PR/다음 작업은 별도 요청 전 수행하지 않는다.

## Reference
사용자가 승인한 구조: 왼쪽 관리 메뉴는 라인업/스모크 선택, 본문 목록은 검색/신규등록, 편집 화면은 설명/주소/지도 경로 수정. 기존 FE-037 테마를 유지한다. 새로운 외부 디자인 레퍼런스 없음.

## Allowed changes
- frontend/src/features/admin/preview/AdminPreview.tsx
- frontend/src/features/admin/preview/AdminPreview.module.css
- docs/tasks/TASK-FE-038.md
- docs/frontend/PLAN.md, docs/PROGRESS.md
- docs/visual-qa/TASK-FE-038.md, docs/visual-qa/assets/TASK-FE-038/**
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md
- 나머지 HANDOFF allowed_files는 읽기 전용이다.

## Verification commands
- frontend: npx tsc --noEmit
- frontend: npm run lint
- frontend: npm run build (기존 개발 서버와 분리된 임시 폴더)
- frontend: node src/features/admin/preview/model.test.cjs (기존30개 모두 유지)
- Playwright: `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-038/verify.cjs before|after`
- Playwright: 같은 환경 `node docs/visual-qa/assets/TASK-FE-038/editor-regression.cjs`
- 1440/390px 메뉴·목록·편집·신규저장·종류별 검색/필터 유지·미저장 전환 취소/승인·미리보기 복귀·빈 결과·키보드초점/터치·가로넘침·브라우저오류·실 API 미호출 확인.
- 기존 map 공유/단독 도착점·출발/경유/튕김/벽끝 이동 및 저장 보존 확인.
- Before/After 시각 보고서 자동 생성, 독립 코드/시각 검토.
- git diff --check 및 소스 변경 범위 확인.

## Result

### 구현 결과
- DEMO1234 입장 후 목록 우선 표시. PC 왼쪽/모바일 위쪽 관리 메뉴, 본문 검색·도착점 그룹 목록, 별도 등록/편집·미리보기로 구성했다.
- 검색어와 상태를 라인업/스모크별로 보존한다. 저장 후 편집 화면에서 결과를 확인하고 목록으로 돌아가며 기존 조건이 유지된다.
- 미저장 변경이 있는 목록 복귀/관리 메뉴/같은 도착점 신규 공략 전환을 확인하고 취소 시 현재 상태를 보존한다. 화면 전환 후 제목에 초점을 옮긴다.
- 기존 도착점 공유, 지도 편집, 반사·벽·미리보기·예시 저장 로직은 유지했다.

### 변경 파일 전체
- `frontend/src/features/admin/preview/AdminPreview.tsx`
- `frontend/src/features/admin/preview/AdminPreview.module.css`
- `docs/tasks/TASK-FE-038.md`
- `docs/frontend/PLAN.md`
- `docs/PROGRESS.md`
- `docs/visual-qa/TASK-FE-038.md`
- `.agent-reports/HANDOFF.json`
- `.agent-reports/CURRENT.md`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-dirty-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-empty-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-gate.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-lineup-editor.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-lineup-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-new-lineup.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-saved-editor.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-smoke-filtered-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-smoke-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-1440-smoke-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-dirty-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-empty-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-gate.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-lineup-editor.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-lineup-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-new-lineup.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-saved-editor.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-smoke-filtered-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-smoke-list.png`
- `docs/visual-qa/assets/TASK-FE-038/after-390-smoke-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/after.json`
- `docs/visual-qa/assets/TASK-FE-038/before-1440-gate.png`
- `docs/visual-qa/assets/TASK-FE-038/before-1440-lineup-editor-sidebar.png`
- `docs/visual-qa/assets/TASK-FE-038/before-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/before-1440-smoke-editor-sidebar.png`
- `docs/visual-qa/assets/TASK-FE-038/before-390-gate.png`
- `docs/visual-qa/assets/TASK-FE-038/before-390-lineup-editor-sidebar.png`
- `docs/visual-qa/assets/TASK-FE-038/before-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/before-390-smoke-editor-sidebar.png`
- `docs/visual-qa/assets/TASK-FE-038/before.json`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-dragged-editor.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-dragged-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-new-shared-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-new-shared-smoke.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-shared-staged.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-single-smoke.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-1440-wall-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-dragged-editor.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-dragged-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-new-shared-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-new-shared-smoke.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-shared-staged.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-single-smoke.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-390-wall-preview.png`
- `docs/visual-qa/assets/TASK-FE-038/editor-regression.cjs`
- `docs/visual-qa/assets/TASK-FE-038/editor-results.json`
- `docs/visual-qa/assets/TASK-FE-038/verify.cjs`

### 실행 명령과 검증 결과
- `git fetch origin` / `git switch codex/frontend-rework` / `git merge --ff-only origin/codex/frontend-rework` / `git switch -c codex/admin-management-flow`: PASS, 기준 d3547ec.
- `docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit`: PASS (최종 초점 보완 후 재실행 포함).
- `docker exec valorant-frontend-dev-frontend-1 npm run lint`: PASS, ESLint 경고/오류 없음.
- `docker exec valorant-frontend-dev-frontend-1 node src/features/admin/preview/model.test.cjs`: PASS, 30/30, 실패/제외 0.
- `npm run build`: 개발 컨테이너의 `/tmp/fe038-build-*` 별도 복사본에서 실행, PASS, 정적 페이지 15/15. 기존 개발 서버의 `.next` 보존. 컨테이너의 기존 `git: not found` 버전 조회 메시지는 있었으며 빌드 exit 0.
- `PLAYWRIGHT_MODULE=/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright node docs/visual-qa/assets/TASK-FE-038/verify.cjs before`: PASS, 8장.
- 같은 환경 `node docs/visual-qa/assets/TASK-FE-038/verify.cjs after`: PASS, 20장, 1440/390px 목록·편집·종류별 조건·저장·미저장 전환·초점·신규·미리보기·재로드.
- 같은 환경 `node docs/visual-qa/assets/TASK-FE-038/editor-regression.cjs`: PASS, 14장, 기존 지도 기능 PC 마우스/모바일 터치 회귀.
- Before/After JSON 기반 시각 보고서 자동 생성 및 구현자/독립 검토자의 실제 이미지·코드 검토: PASS.
- `git diff --check` 및 수정 파일 허용 범위 검사: PASS. 소스 변경은 AdminPreview TSX/CSS 두 파일뿐이다.

### 남은 위험·주의 사항
- 실제 저장/인증/API/DB/공개 페이지 연결은 후속 Task. 예시는 새로고침/페이지 이탈 시 초기화된다.
- 목록 검색 조건은 유지하므로 저장한 제목·상태가 조건과 달라지면 해당 공략이 목록에 보이지 않을 수 있다. 빈 결과의 ‘검색 조건 초기화’로 해제할 수 있다.
- 이번 미저장 확인은 화면 내부 전환에 적용한다. 브라우저 닫기·상단 공개 메뉴 이동에 대한 이탈 방지는 추가하지 않았다.
- 2026-10-04 사용자 요청으로 현재 구현을 커밋·푸시하고 codex/frontend-rework 대상 PR을 제출한다. 병합은 사용자가 수행한다.

### 사용자 승인 및 후속 후보
- 현재 화면 흐름을 먼저 공유하고 실제 등록 담당자의 피드백을 받아 후속 보완하기로 했다. 추가 UI/백엔드 구현 없이 PR로 마무리한다.
- 알려진 편의성 후보: 긴 편집 화면의 저장 버튼 접근, 일부 입력 수정 시 남은 오류 안내 유지, 지도 번호 구분, 저장된 도착점 이름 수정, 경유점 개별 삭제/종류 변경.
- 저장 검증 자체는 동작한다. 저장 실패 후 입력 하나를 수정하면 다른 오류 안내도 숨겨지는 현재 표시 방식은 유지하며, 후속 개선 대상으로 남긴다.
