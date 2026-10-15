# TASK-SMOKE-002 — 단일 위치 스모크 관리자와 공개 지도 API 연결

## Scope

검증된 main 통합 커밋 49010a0 이후 같은 codex/frontend-main-sync에서 관리자 단일 위치 입력·수정·삭제·활성 설정과 공개 active 지도 조회를 연결한다. 사용자 승인으로 별도 커밋 후 frontend dev PR을 제출한다. backend main 배포와 frontend main 변경은 하지 않는다.

## Allowed changes

- src/features/smokes/smoke-api.ts
- src/features/smokes/smoke-model.ts
- src/features/smokes/smoke-api.test.cjs
- src/features/smokes/SmokePointMap.tsx
- src/features/smokes/SmokeGuidePage.tsx
- src/features/smokes/SmokeMapSelectPage.tsx
- src/features/smokes/SmokeDetailPage.tsx
- src/features/admin/admin-smoke-store.ts
- src/features/admin/admin-smoke-store.test.cjs
- src/features/admin/AdminSmokeListPage.tsx
- src/features/admin/AdminSmokeEditorPage.tsx
- src/features/admin/AdminLayout.tsx
- src/features/admin/AdminGatePage.tsx
- src/app/router.tsx
- docs/tasks/TASK-SMOKE-002.md
- docs/visual-qa/TASK-SMOKE-002.md
- .agent-reports/HANDOFF.json
- .agent-reports/CURRENT.md

## Verification commands

- npm run typecheck
- npm run lint
- npm run build
- node --test src/lib/backend-client.test.cjs src/features/admin/*.test.cjs src/features/smokes/*.test.cjs
- Playwright desktop/mobile Before/After, isolated real FastAPI CRUD/public visibility, auth/empty/error regression
- git diff --check; no secrets or new screenshot assets staged

## Result

Status: IMPLEMENTED
Human Decision Required: NO

### 변경 결과

- 관리자 스모크 목록·등록·편집·삭제를 실제 API에 연결했다. 쓰기 필드는 title, mapId, destination{x,y}, notes, status 다섯 개이며 기본 상태는 inactive다.
- 전용 지도에서 한 점을 누르거나 끌어 수정한다. 방향키·Shift·Enter 및 드래그 Esc 취소를 지원한다. 관리자/공개/상세 화면은 같은 이미지와 0~1 좌표를 사용한다.
- 공개 스모크 지도는 서버 active 자료를 모두 읽고 번호/목록 선택으로 제목과 설명을 표시한다. 직접 상세 주소, 새로고침, 없는 자료, 로딩·오류·빈 목록을 처리한다. 예시 데이터로 대체하지 않는다.
- 관리자 예시는 별도 메모리에만 보관하며 공개 스모크 및 DB와 분리했다. 기존 라인업 동작은 유지한다.
- 401 재인증 시 편집 내용 유지, 오래된 응답의 인증/캐시 덮어쓰기 방지, 저장 중 중복 요청 방지, 미저장 뒤로가기/링크 이동 확인을 적용했다.
- 독립 검토에서 발견한 미저장 history 이동과 초기 목록/저장 경쟁 문제를 수정하고 회귀 검증했다.
- main 통합은 앞선 49010a0 커밋으로 분리했다. 이번 구현은 frontend dev 대상이며 frontend main 및 backend main 변경/운영 배포는 없다.

### 실행한 검증 명령과 실제 결과

- npm run typecheck: PASS.
- npm run lint: PASS.
- npm run build: PASS. 기존 단일 JS chunk 500kB 초과 안내 유지(약578kB).
- node --test src/lib/backend-client.test.cjs src/features/admin/*.test.cjs src/features/smokes/*.test.cjs: 42개 PASS.
- node /private/tmp/gameprobe-smoke-qa/crud.cjs: 실제 FastAPI와 격리 메모리 DB, 관리자 등록/드래그/새로고침/활성/503/401 재인증 13개 PASS.
- node /private/tmp/gameprobe-smoke-qa/public.cjs: PC1440·모바일390, 공개 위치/설명/상세 재조회/맵 불일치/오류 재시도/비활성 숨김/삭제/로그아웃 21개 PASS, 런타임 오류0.
- point-map-results.json: 양쪽 뷰포트 키보드 이동·드래그 취소·경계 제한·긴 입력/체험 API 격리 8개 PASS.
- review-history.cjs / review-history-logout.cjs: 브라우저 뒤로가기·링크 이동 취소/승인과 로그아웃 단일 확인 PASS.
- node /private/tmp/gameprobe-smoke-qa/public-map-extra.cjs: 101건 페이징·겹친 위치 개별 선택·인증정보 없는 공개 요청·맵 전환 지연응답 폐기·불완전 응답 재시도·긴 설명 확인 PASS (결과 묶음5개).
- 기존 로컬 backend localhost:8000 /health 및 공개 /api/smokes?mapId=ascent&limit=1: 200, 현재 목록0개 확인(읽기 전용).
- 독립 코드 및 PC/모바일 시각 검토 PASS. Before/After PNG는 /private/tmp/gameprobe-smoke-qa에만 저장한다.
- 테스트 초기 CSS 좌표 문자열 반올림을 고려한 비교와 없는 자료 안내/개발 StrictMode 중복 조회에 맞게 QA 스크립트 기대값을 수정했다. 최종 검증은 통과했다.
- git diff --check: PASS. .env·신규 캡처는 Git 추가하지 않는다.

### 남은 위험·범위

- backend smoke는 dev에만 있으므로 운영 프론트 사용 전 백엔드 공개 API 배포가 필요하다. 이번에는 main 반영과 운영 배포를 보류한다.
- DB CRUD 통합 테스트는 실제 FastAPI 코드 + 메모리 DB로 수행했다. Atlas의 기존 자료는 생성·수정·삭제하지 않았다. 지도 테스트 좌표는 실제 게임 전술 검증 자료가 아니다.
- 일반 라인업 공개 화면의 실제 자료 연결, 기존 예시 관련 코드 정리, 번들 분할은 이번 범위가 아니다.
- main 통합에서 가져온 기존 PNG22개는 이미 main에 있던 자료다. 이번 스모크 캡처는 추가하지 않으며 docs는 .dockerignore에서 제외된다.

### 실제 변경 파일 전체

- docs/tasks/TASK-SMOKE-002.md
- docs/visual-qa/TASK-SMOKE-002.md
- src/app/router.tsx
- src/features/admin/AdminGatePage.tsx
- src/features/admin/AdminLayout.tsx
- src/features/admin/AdminSmokeEditorPage.tsx
- src/features/admin/AdminSmokeListPage.tsx
- src/features/admin/admin-smoke-store.test.cjs
- src/features/admin/admin-smoke-store.ts
- src/features/smokes/SmokeDetailPage.tsx
- src/features/smokes/SmokeGuidePage.tsx
- src/features/smokes/SmokeMapSelectPage.tsx
- src/features/smokes/SmokePointMap.tsx
- src/features/smokes/smoke-api.test.cjs
- src/features/smokes/smoke-api.ts
- src/features/smokes/smoke-model.ts
- .agent-reports/HANDOFF.json (Git 제외)
- .agent-reports/CURRENT.md (Git 제외)
