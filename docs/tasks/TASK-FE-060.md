# TASK-FE-060 — Current public demo and Riot application readiness

## Goal
2026-10-15 사용자 요청: 현재 공개 사이트를 참고해 신청 문안을 다시 작성하고, 부족한 부분을 현재 디자인에 맞춰 구현한다. 운영 main 5da6a92 기준. 새 원격 dev d65ce21의 TASK-FE-059 가이드 상세 변경은 미배포 별도 작업이며 건드리지 않는다.

## Allowed changes
- src/app/{AppLayout,Footer,Header,router}.tsx
- src/features/my/{LoginCards,MyLayout}.tsx, src/features/my/tabs/MyTabs.tsx
- src/features/home/{FavoritesAndLogin,MapsAndLeaderboard}.tsx
- src/features/review/{ReviewShell,ReviewPage,InsightsPage,PolicyPage}.tsx
- src/features/review/{review-content,policy-content}.ts
- docs/riot-submission/{APPLICATION,README}.md
- docs/tasks/TASK-FE-060.md
- docs/visual-qa/TASK-FE-060.md, docs/visual-qa/assets/TASK-FE-060/**
- .agent-reports/HANDOFF.json, .agent-reports/CURRENT.md and evidence

## Scope
- Restore missing /privacy /terms /insights and /connect compatibility; preserve old demo profile URL with explicit redirect to current fictional profile.
- Add /review with public walkthrough, current/planned capability distinction, contact, Korean/English reviewer explanations.
- Keep dark slate, blue accent, existing typography/buttons/cards. Visible synthetic-data and demo-login labels, no false live-data claims.
- Illustrative coaching report with position/timing/habit examples and clear evidence limitations. No actual trained model or elite dataset claimed.
- Privacy/terms describe current browser storage, Gmail contact and hosting/embedded-provider boundaries, carrying forward confirmed owner/contact/deletion plan. No invented retention/provider assurances.
- Rewrite application with concise counted English text and verified reviewer URLs. Distinguish current production from unpublished additions.

## Forbidden changes
No real API, DB, RSO, authentication/authorization policy, dependency, deployment/security configuration changes. Riot portal submission is excluded. On2026-10-15 the user authorized committing and publishing the completed changes; that approval supersedes the earlier local-only scope. No changes to teammate guide implementation or other root dirty files.

## Verification commands
- npm run typecheck
- npm run lint
- npm run test:backend
- npm run build
- Playwright production Before + local production-build After, desktop/mobile, direct reload, compatibility links, consent unchecked/required/cancel/connect/reload/unlink, policy language switch, no Riot/API stats requests, key existing demo/guide regressions.
- git diff --check

## Acceptance criteria
All restored pages accessible without login; reviewers can traverse profile/match/consent/insights and policies. Current/planned features and storage limits are explicit. Original design retained. No runtime errors or horizontal overflow on changed pages at 1440/390 widths. Screenshots inspected, report and implementation results recorded.

## Result
- Status: IMPLEMENTED
- Human Decision Required: NO — user authorized publication on2026-10-15.
- Repository: https://github.com/gameprobe/frontend.git
- Branch: codex/riot-review-readiness, main baseline5da6a9245b93e081f07dbe9610c7d0e548b9954e.
- Current remote devd65ce21 contains separate teammate TASK-FE-059 guide-detail work. It was left unchanged; reconcile router changes when merging this branch into dev.
- Repaired missing reviewer/policy/report routes, carried forward old application URLs, labeled demo authentication and synthetic stats, and wrote672-character English application description.
- Verification: npm run typecheck PASS; npm run lint PASS0warnings; npm run test:backend PASS10/10; npm run build PASS (existing500kB advisory); Playwright32route checks and2viewport flow suites PASS, errors0, Riot/API requests0; git diff --check PASS.
- Setup: npm ci --ignore-scripts --no-audit --no-fund installed existing locked packages. No dependency/lock changes. Preview http://127.0.0.1:4173/review. Browser/system restrictions and selector correction are recorded in Visual QA.
- Source edits do not change session persistence, auth policy, API, DB, dependencies or security settings. Policy drafts explain actual browser/Gmail/provider behavior and limitations. Actual RSO, permission-controlled data and trained coaching remain future work.
- Publication authorized; prepare a PR directly to main to release only TASK-FE-060. Keep separate teammate dev work unchanged. Production will be verified after automatic Git deployment; no Riot portal write.

### Actual changed files
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

### Visual report
[Before/After and validation](../visual-qa/TASK-FE-060.md)

### Release authorization
- User clarified that the English application (not the reply) was too long. Reduced from1596 to672characters including spaces/newlines.
- Publish the already verified site changes via gameprobe/frontend main and existing Vercel Git integration. No deployment configuration changes.
