# TASK-FE-058 — 기존 저장소 팀원 추가 작업 이관

## Status
IMPLEMENTED - Local implementation and verification passed. User explicitly approved commit, push and a dev-target PR on 2026-10-14.

## Request and provenance
기존 valorant-platform에 팀원이 추가한 코드를 gameprobe/frontend로 가져온다. 원본 [PR #55](https://github.com/98jh-shin/valorant-platform/pull/55), dev4ad1c3f와 직전 이관 기준259d880 사이 제품 변경27개만 반영했다. 조직 기준은 devabecf50, 작업 브랜치는 codex/import-teammate-updates다. 원본 Task55~57은 조직 Task55와 번호가 충돌하므로 기존 문서를 덮어쓰지 않고 이번058로 기록했다.

## Allowed changes
아래 실제 변경 제품27파일, 이 Task, docs/visual-qa/TASK-FE-058.md, screenshots/TASK-FE-058/**, ignored .agent-reports/**. 조직 루트 빌드·배포·환경 설정, 팀원 이력, 기존 사용자 미커밋 파일은 보존한다.

## Verification commands and results
- 이관 전 source259d880 대비 조직 제품9파일 바이트 동일, 신규18파일 경로 미존재 — 충돌0.
- `docker compose exec -T frontend npm run typecheck` — PASS.
- `docker compose exec -T frontend npm run lint` — PASS.
- `docker compose exec -T frontend npm run build` — PASS. JS517.01kB/gzip151.20kB, 500kB 청크 경고. Docker git 부재 메시지는 기존 환경에서 버전 폴백 경고이며 빌드는 성공.
- `docker compose exec -T frontend npm run test:backend` — 10/10 PASS.
- `git diff --check` — 원본 CSS 파일 끝 빈 줄 경고1개를 정리한 뒤 PASS. 이 수정 외 제품26개는 원본과 바이트 동일.
- CUA Playwright 브라우저 상호작용·DOM·로그·Before/After 시각검사 — PASS, 상세는 Visual QA.
- package/lock/Docker/Compose/Vercel/env example/workflow/helper10개 바이트 보존 — PASS.
- React 검토: Hook 호출 순서·외부 저장소 구독·키보드 지도조작·iframe 출처 확인. 예시 메모리 상태만 사용하며 서버 인증/저장 정책이나 신규 의존성 변경 없음. 동적 import 등 범위 밖 최적화는 하지 않음.

## Result
- Status: IMPLEMENTED
- Human Decision Required: NO - User approved commit/push/dev-target PR. Final remote results are recorded in the PR and local Agent Report.
- 구현: 관리자 예시 등록/편집, 공략 도착지 묶음과 영상 연결, 스모크 맵 선택 단계를 팀원 원본에서 이관.
- Scope: commit and push the task branch, then open a dev-target PR. No main merge or production deployment. Existing user files, team deployment settings and environment files are preserved.
- 남은 문제: 실제 관리자 인증·DB 저장 없음(예시 모드), 외부 영상 실제 재생은 미검증, JS 청크 경고. 홈페이지 운영 반영은 dev→main 병합을 별도로 승인할 때 진행한다.

## 실제 변경 파일 전체
- `src/app/router.tsx`
- `src/components/guide-map/GuideMapViewer.tsx`
- `src/components/guide-map/RouteSvg.tsx`
- `src/components/guide-map/YouTubePlayer.tsx`
- `src/components/guide-map/destination-groups.ts`
- `src/components/guide-map/geometry.ts`
- `src/components/ui/TextField.tsx`
- `src/features/admin/AdminEditorPage.tsx`
- `src/features/admin/AdminGatePage.tsx`
- `src/features/admin/AdminLayout.tsx`
- `src/features/admin/AdminListPage.tsx`
- `src/features/admin/MapEditor.tsx`
- `src/features/admin/StatusBadge.tsx`
- `src/features/admin/admin-session.ts`
- `src/features/admin/guide-store.ts`
- `src/features/admin/model.ts`
- `src/features/admin/public-guides.ts`
- `src/features/lineups/LineupBoardPage.tsx`
- `src/features/lineups/LineupSteps.tsx`
- `src/features/lineups/MinimapStage.tsx`
- `src/features/smokes/SmokeGuidePage.tsx`
- `src/features/smokes/SmokeMapSelectPage.tsx`
- `src/features/smokes/SmokeMinimap.tsx`
- `src/lib/youtube.ts`
- `src/mocks/lineups.ts`
- `src/mocks/smokes.ts`
- `src/styles/index.css`
- `docs/tasks/TASK-FE-058.md`
- `docs/visual-qa/TASK-FE-058.md`
- `screenshots/TASK-FE-058/after-admin-editor.png`
- `screenshots/TASK-FE-058/after-admin-gate.png`
- `screenshots/TASK-FE-058/after-admin-list.png`
- `screenshots/TASK-FE-058/after-admin-mobile.png`
- `screenshots/TASK-FE-058/after-lineups-mobile.png`
- `screenshots/TASK-FE-058/after-lineups.png`
- `screenshots/TASK-FE-058/after-smokes-mobile.png`
- `screenshots/TASK-FE-058/after-smokes.png`
- `screenshots/TASK-FE-058/before-admin.png`
- `screenshots/TASK-FE-058/before-lineups.png`
- `screenshots/TASK-FE-058/before-smokes.png`

ignored 로컬 보고: .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md, 루트 .agent-reports/teammate-import/{baseline.json,collision-check.json,transplant.json,final-source-comparison.json,browser-errors.json,result.json,preservation.json,pr-body.md}. 원본 루트 docs/tasks/TASK-FE-058.md에도 이 결과를 보관한다.
