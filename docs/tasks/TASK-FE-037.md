# TASK-FE-037 — 관리자 등록 화면 프론트 예시

## Status
IMPLEMENTED — 검증 완료, 사용자 승인으로 PR 제출

## Goal
라인업·스모크 등록 흐름을 백엔드 연결 전에 화면으로 확인한다. 사용자가 확인한 등록 범위는 자료 주소 + 맵 시작/도착 위치다.

## Scope
- 기준 dev c0a876d(PR #39 병합). 로컬 codex/frontend-rework를 fast-forward하고 codex/admin-ui-preview에서 작업한다. 이후 PR 대상은 codex/frontend-rework.
- /admin/preview: 토큰 없이 체험하는 명시적 예시. 기존 /admin 인증 및 실제 관리자/공개 데이터는 보존한다.
- 라인업/스모크 목록·검색·상태 필터, 새 자료/편집, 제목·맵·요원·진영·구역·스킬·설명·영상/이미지 URL 입력.
- 사용자 추가 요청: 시작 → 여러 경유점 → 도착을 연결하며, 경유점마다 일반 지점 또는 벽 튕김을 선택한다. 편집과 미리보기에서 동일한 꺾임/튕김 표시를 사용한다. 벽 충돌 자동 감지나 물리 시뮬레이션은 범위 밖이다.
- 최종 사용자 승인: 등록 한 건은 출발점·경로·자료 URL 한 개로 단순화한다. 공통 출발점/복수 경로 양식을 대체하고, 안정적인 도착점 ID로 여러 공략을 묶는다. 도착점 선택 → 출발점·영상 입력 → 선택적인 경유/벽 튕김 흐름을 제공한다. 같은 도착점에 공략 추가 시 맵·요원·스킬·도착점은 재사용하고 출발·경로·영상은 새로 입력한다. 현재 공략만 다른 곳에 도착하게 할 때는 새 도착점으로 분리하며, 기존 도착점 자체의 이동은 아래 최신 사용자 승인 정책을 따른다. 공개 라인업의 도착점 클릭/hover/영상 이동은 별도 Task로 남긴다.
- 후속 사용자 승인: 이미 지정한 출발점·새 도착점·경유/튕김·벽 끝을 마우스/터치로 끌어 수정한다. 경로 순서와 유형을 유지하고 공유 도착점의 명시적 수정 활성화 절차를 지킨다. 드래그 종료 후 의도하지 않은 다음 지점 생성 방지, 지도 밖 좌표 제한, 취소 및 키보드 수정도 검증한다.
- 예시 입장 코드 `DEMO1234`로 /admin/preview에 진입한다. 프론트 체험용 코드임을 명시하고 실제 /admin 인증·토큰은 변경하거나 호출하지 않는다.
- 기존 맵 이미지로 시작/도착/경로(스모크 벽 끝 포함)를 지정하고 같은 내용으로 미리본다. 원본 이미지 0~1 정규화 좌표를 사용하며 실제 탄도/공략 정확성을 주장하지 않는다.
- 예시 목록에 저장/수정하는 상태는 현재 화면 메모리에만 유지한다. 새로고침 시 초기화됨을 명시한다. 실제 공개 상태 전환, 백엔드/DB/API/인증 변경, 패키지 추가, 이미지 수집/교체, 업로드 기능 제외.
- 입력 URL은 형식 검증 후 텍스트 링크로 미리본다. 자동 외부 이미지/영상 요청이나 URL 내용 검증을 하지 않는다.
- 기존 관리자처럼 한국어 본문으로 구현하며 공통 헤더의 언어 전환은 유지한다.
- 커밋/푸시/PR/배포는 요청 전 수행하지 않는다.

- 최신 사용자 승인: 저장된 도착점을 현재 공략 하나만 사용하면 바로 이동한다. 여러 공략(새 공략 포함)이 영향을 받으면 공략 수를 안내하는 ‘도착점 수정’을 명시적으로 활성화한다. 좌표는 편집 중인 공략에만 임시 반영하고 예시 저장 성공 시 같은 종류·맵·도착점 ID의 공략 전체에 좌표만 함께 반영한다. 수정 취소는 도착 좌표만 복구하고, 선택/맵 변경·저장 시 활성화를 해제한다. 현재 공략만 옮기는 새 도착점 분리를 유지한다.

- 추가 시각 보완: 관리자 예시 선택 상자의 화살표를 테두리 안쪽 일정한 간격으로 정렬하고 긴 항목과 겹치지 않게 여백을 확보한다. 기본 select 키보드 동작은 유지한다.

## Allowed changes
- frontend/src/app/admin/preview/page.tsx
- frontend/src/features/admin/preview/AdminPreview.tsx
- frontend/src/features/admin/preview/AdminPreview.module.css
- frontend/src/features/admin/preview/PreviewMap.tsx
- frontend/src/features/admin/preview/model.ts
- frontend/src/features/admin/preview/model.test.cjs
- frontend/src/components/AdminLogin.tsx (예시 화면 진입 링크만 추가)
- docs/tasks/TASK-FE-037.md, docs/frontend/PLAN.md, docs/PROGRESS.md
- docs/visual-qa/TASK-FE-037.md, docs/visual-qa/assets/TASK-FE-037/**
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md
- 기존 관리자/지도/테마/타입/자산 매핑은 HANDOFF에 명시된 파일만 읽기 전용 참조.

## Verification commands
- frontend: npx tsc --noEmit, npm run lint, npm run build
- frontend: node src/features/admin/preview/model.test.cjs
- Playwright Before/After: /admin 및 /admin/preview 1440/390px, 예시 코드 오류/성공·목록·필터·신규/수정·경유점/튕김 순서 및 저장·URL 유효성·지도 좌표·맵 변경 초기화·벽 끝·미리보기·메모리 저장 및 새로고침 초기화·실 API 미호출·가로 넘침/브라우저 오류 확인.
- 드래그 Playwright 실행 파일: `docs/visual-qa/assets/TASK-FE-037/drag.cjs before|after`. 마우스/터치·키보드·경계·취소·저장 검증.
- 최종 Playwright 실행 파일: `docs/visual-qa/assets/TASK-FE-037/destination.cjs before|after`, `destination-regression.cjs`. 같은 도착점 재사용·공략 격리·잠금·분리·긴 이름 검사를 포함한다. 이전 UI 단계 스크립트/캡처는 시각 QA 이력으로 남긴다.
- 기존 홈/Insights/라인업/스모크 회귀와 관리자 로그인 유지, 직접·독립 시각 검토.
- git diff --check, 소스 변경 범위 확인.

- 공유 도착점 Playwright: `shared-destination.cjs before|after`; 단독 이동, 공유 활성화/취소/저장 전 격리/전체 반영/새 공략 영향 수/분리/PC·터치 확인.

## Result

단독 도착점은 바로 이동하고 공유 도착점은 영향 공략 수를 확인한 뒤 ‘도착점 수정’으로 활성화한다. 저장 성공 시 같은 종류·맵·도착점 ID의 좌표만 함께 반영하며 취소는 도착 좌표만 복구한다. 선택 상자 화살표를 오른쪽 테두리에서 12px 안쪽으로 배치하고 글자 공간 36px을 확보했다.

### 변경 파일 전체
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`
- `docs/PROGRESS.md`
- `docs/frontend/PLAN.md`
- `docs/tasks/TASK-FE-037.md`
- `docs/visual-qa/TASK-FE-037.md`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-admin.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-bent-route-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-bent-route-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-entry-code.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-insights.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-lineups.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-smoke-wall.png`
- `docs/visual-qa/assets/TASK-FE-037/after-1440-smokes.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-admin.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-bent-route-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-bent-route-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-entry-code.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/after-390-smoke-wall.png`
- `docs/visual-qa/assets/TASK-FE-037/after.json`
- `docs/visual-qa/assets/TASK-FE-037/before-1440-admin.png`
- `docs/visual-qa/assets/TASK-FE-037/before-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-037/before-1440-insights.png`
- `docs/visual-qa/assets/TASK-FE-037/before-1440-lineups.png`
- `docs/visual-qa/assets/TASK-FE-037/before-1440-preview-missing.png`
- `docs/visual-qa/assets/TASK-FE-037/before-1440-smokes.png`
- `docs/visual-qa/assets/TASK-FE-037/before-390-admin.png`
- `docs/visual-qa/assets/TASK-FE-037/before-390-preview-missing.png`
- `docs/visual-qa/assets/TASK-FE-037/before.json`
- `docs/visual-qa/assets/TASK-FE-037/comparison.json`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-add-same-destination.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-admin.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-gate.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-home.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-insights.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-lineups.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-long-name-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-saved-guide.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-saved-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-smokes.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-1440-wall.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-add-same-destination.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-admin.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-gate.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-long-name-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-saved-guide.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-saved-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after-390-wall.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-after.json`
- `docs/visual-qa/assets/TASK-FE-037/destination-before-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-before-1440-gate.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-before-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-before-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-before-390-gate.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-before-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/destination-before.json`
- `docs/visual-qa/assets/TASK-FE-037/destination-comparison.json`
- `docs/visual-qa/assets/TASK-FE-037/destination-regression.cjs`
- `docs/visual-qa/assets/TASK-FE-037/destination-regression.json`
- `docs/visual-qa/assets/TASK-FE-037/destination.cjs`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-1440-dragged-existing.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-1440-dragged-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-1440-unlocked-destination.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-1440-wall-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-390-dragged-existing.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-390-dragged-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-390-unlocked-destination.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after-390-wall-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-after.json`
- `docs/visual-qa/assets/TASK-FE-037/drag-before-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-before-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-before-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-before-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/drag-before.json`
- `docs/visual-qa/assets/TASK-FE-037/drag.cjs`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-1440-multiple-walls.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-1440-three-routes-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-1440-three-routes-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-390-multiple-walls.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-390-three-routes-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after-390-three-routes-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-after.json`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-before-1440-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-before-1440-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-before-390-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-before-390-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/multiroute-before.json`
- `docs/visual-qa/assets/TASK-FE-037/multiroute.cjs`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-new-shared-draft.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-select-spacing.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-shared-locked.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-shared-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-shared-saved.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-shared-staged.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-1440-single-editable.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-new-shared-draft.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-select-spacing.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-shared-locked.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-shared-preview.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-shared-saved.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-shared-staged.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after-390-single-editable.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-after.json`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-before-1440-shared-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-before-1440-single-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-before-390-shared-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-before-390-single-editor.png`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination-before.json`
- `docs/visual-qa/assets/TASK-FE-037/shared-destination.cjs`
- `docs/visual-qa/assets/TASK-FE-037/verify.cjs`
- `frontend/src/app/admin/preview/page.tsx`
- `frontend/src/components/AdminLogin.tsx`
- `frontend/src/features/admin/preview/AdminPreview.module.css`
- `frontend/src/features/admin/preview/AdminPreview.tsx`
- `frontend/src/features/admin/preview/PreviewMap.tsx`
- `frontend/src/features/admin/preview/model.test.cjs`
- `frontend/src/features/admin/preview/model.ts`

### 실행 명령 및 결과
- `docker exec valorant-frontend-dev-frontend-1 npx tsc --noEmit`: PASS.
- `docker exec valorant-frontend-dev-frontend-1 npm run lint`: PASS, ESLint 경고/오류 없음. 컨테이너 Git 미설치 기존 경고만 출력.
- `docker exec valorant-frontend-dev-frontend-1 node src/features/admin/preview/model.test.cjs`: 30/30 PASS, fail/skip 0.
- Docker `/tmp/fe037-destination-edit-final-*` 격리 폴더에 src/public 및 빌드 설정 복사·기존 node_modules 연결 후 `npm run build`: 최종 PASS, 정적 15페이지. 개발 .next와 실제 .env는 보존했다. 마지막 접근성 수정 포함 타입/Lint 검증 통과.
- `PLAYWRIGHT_MODULE=<bundled playwright> node docs/visual-qa/assets/TASK-FE-037/shared-destination.cjs before` / `after`: Before 4장/After 14장, PC1440 마우스·모바일390 touch PASS. 공유 활성화/취소/저장 실패 격리/저장 성공 전체 반영/다른 공략 자료 보존/새 공략 포함 영향 수/도착점 분리/미리보기/새로고침 검증. 선택 상자 각10개 간격 확인. 브라우저 오류/API 요청/가로 넘침 0.
- 같은 Playwright 환경 `node docs/visual-qa/assets/TASK-FE-037/drag.cjs after`: 12장 PASS. 저장된 단독 도착점이 수정 가능한 최신 정책으로 assertion 갱신, 기존 경계/키보드/취소/경유·튕김 검증 유지.
- 같은 Playwright 환경 `node docs/visual-qa/assets/TASK-FE-037/destination.cjs after`: 16장 PASS. 저장 후 단독 도착점 이동 가능 검사를 추가하고 기존 등록 회귀 검증 유지.
- 기존 `destination-regression.cjs` 관리자/홈/Insights/라인업/스모크 결과는 이전 단계 PASS 기록이며 이번 수정 범위는 예시 화면 내부다. 이전 픽셀 차이0 기록을 신규 재실행 결과로 주장하지 않는다.
- 독립 코드/시각 검토 PASS, Cursor 공식 리뷰 미수행. 공유 도착점 이동 중 안내·오류 제거가 지도 위치를 바꾸는 결함을 발견해 공간 유지 방식으로 수정하고 실제 드래그 재검증. 숨긴 오류의 접근성 설명도 해제했다.
- 검증 도구 보정: Next 안내용 alert 중복 및 모바일 오류 요약 focus가 끝나기 전 hit 검사 시점을 수정했다. 기능 assertion을 삭제하거나 테스트를 건너뛰지 않았고 최종 모두 PASS.
- `git diff --check`: PASS. 변경 소스 7개 모두 Task Allowed changes 내.

### 남은 위험 및 주의 사항
- 예시 데이터는 현재 화면 메모리에만 남고 새로고침/이동 시 초기화된다. 실제 저장·공개 API·인증·DB 변경 없음.
- `DEMO1234`는 공개된 화면 체험 코드이며 실제 관리자 인증 토큰이 아니다.
- 경유/튕김·벽 끝은 수동 좌표 예시다. 게임 물리나 실제 공략 정확성을 검증하지 않는다.
- 자료 URL은 형식 검증 및 링크 표시만 한다. 미디어 재생·업로드·자료 내용 검증은 후속 범위다.
- 공개 라인업의 도착점 선택 → 여러 출발점 → hover 경로 → 영상 이동은 별도 Task다.
- 편집 중 이전 안내/오류는 숨기되 드래그 좌표 안정성을 위해 공간을 유지한다. 다음 저장/선택에서 다시 정리된다.
- 사용자 승인으로 커밋·푸시 및 codex/frontend-rework 대상 PR 제출 단계다. 원격 통합 브랜치는 이미 dev에 병합된 c0a876d로 fast-forward 동기화했다. 기존 stash 보존, 병합/배포는 별도 진행한다.
