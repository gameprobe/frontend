# TASK-FE-060 — Visual QA

2026-10-15 · Production main5da6a92 Before → local production build After.

## Reference and method
The user's current public GameProbe style is the reference: dark slate backgrounds (#0e131b/#161d28), blue primary (#5b8cff), Pretendard type,16px cards and existing button components. No new visual assets, fonts, runtime dependencies or global design tokens. Independent temporary Chrome profiles were driven through Playwright; the user's Chrome profiles were not accessed.

## Observed changes
- Before: /privacy, /terms, /connect and /insights rendered the app's404 screen. Home omitted the example-data notice and account copy implied real authentication.
- After: public reviewer walkthrough with current/planned sections; restored bilingual privacy/terms and illustrative report; old profile and connection URLs redirect to the current demo. Header/footer expose the review route and policies.
- Desktop1440px: existing container/card rhythm preserved; two-column walkthrough and three-column insight cards align. Existing header navigation and home composition remain intact.
- Mobile390px: cards stack; language controls, footer links and consent actions fit. Policy contact sidebar moves below content. No overlapping text, cropped controls or horizontal page scrolling observed.
- Inspected actual desktop review/insights/consent, mobile review/consent/privacy/English insights, English desktop review and Before home. Other screenshots are recorded below. Independent Cursor review was not run or claimed.

## Verification
- Typecheck PASS, lint PASS with0errors/0warnings (new mixed-export warning fixed by moving the hook into review-content.ts), existing backend-client tests10/10 PASS, production build PASS.
-32 rendered route checks:16 routes × desktop/mobile, including policy language variants, profile alias, detailed match, lineup and smoke landing pages.
- Browser flows PASS on both widths: four reviewer CTA links; language switch/link/reload; /connect alias; unchecked defaults; required gating; keyboard Space; cancel without persistence; connection with required-only/optional selections; reload persistence; unlink/removal; select-all toggle.
- Page runtime errors0. Observed Riot-domain or /api/ requests0 for these flows. This is not a claim that hosting providers collect no logs.
- Existing bundle>500kB advisory remains (547.52kB raw on this build). No actual external video playback or real Riot/RSO/backend integration was tested.
- First browser attempt targeted the visually hidden checkbox input; its decorative span intercepted pointer clicks. The test was corrected to click the visible enclosing label and independently exercise keyboard Space, retaining state assertions. Final run PASS. Evidence retained in attempt-1-selector-failure.json.
- Browser runtime setup: bundled Playwright browser was absent; installed Chrome was used in an independent temporary profile. The sandbox denied browser launch and localhost listen; the approved execution mode resolved both. No project source changes were used to bypass verification.

## Reproduce
```sh
npm run typecheck
npm run lint
npm run test:backend
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
PLAYWRIGHT_MODULE=/path/to/existing/playwright node docs/visual-qa/assets/TASK-FE-060/verify.mjs
git diff --check
```
The script assumes the public domain still represents the unchanged Before version. It stores screenshot evidence and results.json. Runtime module used locally: bundled Codex Playwright; no package.json/lock change.

## Screenshots

- [after-desktop-home](assets/TASK-FE-060/after-desktop-home.png)
- [after-desktop-insights-en](assets/TASK-FE-060/after-desktop-insights-en.png)
- [after-desktop-insights](assets/TASK-FE-060/after-desktop-insights.png)
- [after-desktop-my-consent](assets/TASK-FE-060/after-desktop-my-consent.png)
- [after-desktop-privacy](assets/TASK-FE-060/after-desktop-privacy.png)
- [after-desktop-review-en](assets/TASK-FE-060/after-desktop-review-en.png)
- [after-desktop-review](assets/TASK-FE-060/after-desktop-review.png)
- [after-mobile-home](assets/TASK-FE-060/after-mobile-home.png)
- [after-mobile-insights-en](assets/TASK-FE-060/after-mobile-insights-en.png)
- [after-mobile-insights](assets/TASK-FE-060/after-mobile-insights.png)
- [after-mobile-my-consent](assets/TASK-FE-060/after-mobile-my-consent.png)
- [after-mobile-privacy](assets/TASK-FE-060/after-mobile-privacy.png)
- [after-mobile-review-en](assets/TASK-FE-060/after-mobile-review-en.png)
- [after-mobile-review](assets/TASK-FE-060/after-mobile-review.png)
- [before-home](assets/TASK-FE-060/before-home.png)
- [before-insights](assets/TASK-FE-060/before-insights.png)
- [before-mobile-home](assets/TASK-FE-060/before-mobile-home.png)
- [before-mobile-insights](assets/TASK-FE-060/before-mobile-insights.png)
- [before-mobile-my-consent](assets/TASK-FE-060/before-mobile-my-consent.png)
- [before-mobile-privacy](assets/TASK-FE-060/before-mobile-privacy.png)
- [before-my-consent](assets/TASK-FE-060/before-my-consent.png)
- [before-privacy](assets/TASK-FE-060/before-privacy.png)

## Outcome
PASS — implementation and visual verification complete locally; uncommitted and unpublished. Portal text describes the completed additions and must be used after publishing and checking the public URLs. Production was not changed. Privacy/terms remain drafts with international-processing/provider details and legal adequacy requiring final review before real data service.
