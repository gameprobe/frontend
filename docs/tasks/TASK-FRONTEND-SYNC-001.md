# TASK-FRONTEND-SYNC-001 — frontend dev 최신화 및 main 통합 검증

## Scope

사용자 요청에 따라 frontend dev를 최신 원격 dev로 갱신하고 main에서 별도로 진행된 공개 페이지 변경을 작업 브랜치에 합쳐 회귀를 확인한다. backend smoke는 dev 병합 상태를 확인하며 main 반영은 보류한다. 스모크 프론트 API 연결 구현은 다음 작업이다.

## Allowed changes

- origin/dev...origin/main 변경 파일을 검증 브랜치로 통합. 구체 목록은 .agent-reports/HANDOFF.json에 기록.
- src/app/router.tsx: 충돌이 있는 경우 양쪽 라우트 보존.
- docs/tasks/TASK-FRONTEND-SYNC-001.md
- docs/visual-qa/TASK-FRONTEND-SYNC-001.md
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md (Git 제외)
- 신규 테스트 스크립트·스크린샷은 /private/tmp에만 저장.

## Forbidden changes

- frontend main 변경·push, backend main 반영, 운영 배포.
- 요청하지 않은 smoke 프론트 구현, 의존성 추가, DB 쓰기, 비밀값 출력.
- 검증 후 사용자 승인으로 통합 커밋을 작성한다. 이후 별도 스모크 작업 커밋과 함께 frontend dev 대상 PR로 제출한다.

## Verification commands

- npm run typecheck
- npm run lint
- npm run build
- node --test src/lib/backend-client.test.cjs src/features/admin/*.test.cjs
- Playwright Before/After desktop/mobile 주요 공개 페이지와 dev 관리자/상세 기능 회귀.
- git diff --check, 병합 충돌 및 환경파일 제외 확인.

## Result

Status: IMPLEMENTED
Human Decision Required: NO

### 구현·검증 요약

- frontend origin/dev 387a2d3 기준으로 로컬 dev를 fast-forward하고 codex/frontend-main-sync 검증 브랜치를 만들었다.
- origin/main 06c02d2를 --no-commit --no-ff로 합쳤다. 자동 병합 성공, 충돌 없음. 검증 결과를 사용자 승인에 따라 통합 커밋으로 확정한다.
- main의 공개 서비스 안내(/review), 인사이트, 개인정보·약관, 이전 주소 이동을 가져왔다. dev의 관리자 API·인증·활성/비활성 상태와 라인업·스모크 상세 경로를 유지했다.
- 수동 제품 코드 수정 없음. 관리자 소스와 package.json/package-lock.json은 origin/dev와 동일하다.
- backend PR #15는 origin/dev 397a703에 병합된 것을 확인했고, 사용자 요청으로 backend 로컬 dev도 최신화했다. backend main cc7b10f에는 스모크가 없으며 반영을 보류한다.
- frontend main, backend main, 운영 배포, 실제 DB 쓰기 없음. 통합 커밋 작성은 사용자 승인으로 진행한다.

### 실제 변경 파일 전체

- docs/riot-submission/APPLICATION.md
- docs/riot-submission/README.md
- docs/tasks/TASK-FE-060.md
- docs/visual-qa/TASK-FE-060.md
- docs/visual-qa/assets/TASK-FE-060/after-desktop-home.png
- docs/visual-qa/assets/TASK-FE-060/after-desktop-insights-en.png
- docs/visual-qa/assets/TASK-FE-060/after-desktop-insights.png
- docs/visual-qa/assets/TASK-FE-060/after-desktop-my-consent.png
- docs/visual-qa/assets/TASK-FE-060/after-desktop-privacy.png
- docs/visual-qa/assets/TASK-FE-060/after-desktop-review-en.png
- docs/visual-qa/assets/TASK-FE-060/after-desktop-review.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-home.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-insights-en.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-insights.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-my-consent.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-privacy.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-review-en.png
- docs/visual-qa/assets/TASK-FE-060/after-mobile-review.png
- docs/visual-qa/assets/TASK-FE-060/attempt-1-selector-failure.json
- docs/visual-qa/assets/TASK-FE-060/before-home.png
- docs/visual-qa/assets/TASK-FE-060/before-insights.png
- docs/visual-qa/assets/TASK-FE-060/before-mobile-home.png
- docs/visual-qa/assets/TASK-FE-060/before-mobile-insights.png
- docs/visual-qa/assets/TASK-FE-060/before-mobile-my-consent.png
- docs/visual-qa/assets/TASK-FE-060/before-mobile-privacy.png
- docs/visual-qa/assets/TASK-FE-060/before-my-consent.png
- docs/visual-qa/assets/TASK-FE-060/before-privacy.png
- docs/visual-qa/assets/TASK-FE-060/before-public.json
- docs/visual-qa/assets/TASK-FE-060/results.json
- docs/visual-qa/assets/TASK-FE-060/verify.mjs
- src/app/AppLayout.tsx
- src/app/Footer.tsx
- src/app/Header.tsx
- src/app/router.tsx
- src/features/home/FavoritesAndLogin.tsx
- src/features/home/MapsAndLeaderboard.tsx
- src/features/my/LoginCards.tsx
- src/features/my/MyLayout.tsx
- src/features/my/tabs/MyTabs.tsx
- src/features/review/InsightsPage.tsx
- src/features/review/PolicyPage.tsx
- src/features/review/ReviewPage.tsx
- src/features/review/ReviewShell.tsx
- src/features/review/policy-content.ts
- src/features/review/review-content.ts
- docs/tasks/TASK-FRONTEND-SYNC-001.md
- docs/visual-qa/TASK-FRONTEND-SYNC-001.md
- .agent-reports/HANDOFF.json (Git 제외)
- .agent-reports/CURRENT.md (Git 제외)

### 실행한 검증 명령과 실제 결과

- git fetch origin --prune / git switch dev / git merge --ff-only origin/dev: PASS.
- git switch -c codex/frontend-main-sync / git merge --no-commit --no-ff origin/main: PASS, 충돌 없음.
- npm run typecheck: PASS.
- npm run lint: PASS.
- npm run build: PASS. 기존 500kB 초과 chunk 안내 있음(출력 JS 약569kB).
- node --test src/lib/backend-client.test.cjs src/features/admin/*.test.cjs: 29개 PASS.
- node /private/tmp/gameprobe-frontend-sync-qa/capture.cjs before / after: 동일 PC1440·모바일390 조건의 각10장 캡처, 가로 넘침0.
- PLAYWRIGHT_MODULE=<기존 런타임> node /private/tmp/gameprobe-frontend-sync-qa/public.mjs: 공개 경로38개, 동의·언어·이전 주소 PC/모바일2개 흐름 PASS, 런타임 오류0, 실제 API 요청0.
- node /private/tmp/gameprobe-frontend-sync-qa/admin-guides.cjs: 관리자 접근 차단·예시 목록/상태·실제 모드 테스트 인증·401 재인증·로그아웃·신규 라인업 기본 비활성·스모크 준비 중·공략 선택→출발 마커→상세 새로고침16개 PASS. 런타임 오류0, 실제 API 요청0(브라우저 격리 응답).
- 처음 상세 테스트가 선택 전 링크를 기대해 실패했다. 실제 목록 버튼→출발 마커 흐름에 맞게 테스트 선택자를 수정했다. 별도 탐색의 접근성 이름 공백 가정 오류도 수정했다. 제품 오류는 아니며 최종16개 통과.
- 독립 코드 검토 PASS. PC/모바일 Before/After 정성 시각 검토 PASS. 편집 화면 캡처의 sticky header 위치는 맨 위로 스크롤 후 재촬영해 검증했다.
- git diff --cached --check: PASS. 비밀 환경파일 제외 및 충돌 파일0 확인.

### 남은 작업과 주의 사항

- main 통합 검증을 마쳤고, 사용자 승인으로 통합 커밋을 작성한다. 원격 dev에는 아직 이번 main 통합이 반영되지 않았다.
- 스모크 백엔드는 단일 destination{x,y}, title/mapId/notes/status 및 서버 id/createdAt/updatedAt을 지원한다. 관리자 CRUD·공개 active 조회·필터/페이지는 구현·dev 병합 완료.
- 스모크 프론트 실제 API 연결은 아직 안 됐다. 실제 관리자 모드에서는 스모크가 준비 중이며, 공개 스모크와 체험 모드는 예시 데이터다. 새 단일 점 계약에 맞는 관리자 폼/CRUD와 공개 지도 연결이 후속 작업이다.
- 일반 라인업 공개 화면도 현재 예시 기반인 기존 상태를 유지한다. 이 동기화는 실제 공개 데이터 연결 작업이 아니다.
- main에서 이미 추적하던 PNG22개(5,366,455바이트/약5.12MiB)는 원본 그대로 통합했다. 이번 신규 스크린샷/스크립트는 /private/tmp에만 있다. docs는 기존 .dockerignore로 이미지 빌드 컨텍스트에서 제외된다.
- 검증 범위는 PC1440·모바일390 및 기록된 경로/흐름이다. 실제 영상 재생과 모든 화면 폭을 보장하는 검증은 아니다.
