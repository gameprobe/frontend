# TASK-FE-027 browser QA evidence

Baseline: f3efedf, codex/lineup-smoke-theme. Sources unchanged by QA. Existing installed Playwright Chromium, isolated browser contexts, DPR1/reduced motion. Base URL http://localhost:3000. API tests intercept only the public /api/lineups request in the test context; no real backend data or saved browser settings are changed.

## Current results

- Before: 14 screenshots. Three viewports1440×960/820×960/390×844 × Lineup/Smoke × map index/selected Ascent =12; 1440 home/profile regression baselines2.
- Final After: same14 screenshots recaptured after the tablet/table refinements, plus2 controlled empty/failure API state screenshots and4 final hover+keyboard focus screenshots. Total34 PNG files including Before.
- Visual capture pageerror0 and unexpected console error0. Lineup visual captures intentionally return503 and show existing Preview data; expected503 network logging is excluded from unexpected errors.
- Functional verification: **262 checks PASS,17 layout conditions**, pageerror0/unexpected console error0. At all three widths, no global overflow, one main/common header/visible footer, important supporting text12px or larger.
- Before/After6 selected Ascent states: target/start pin labels and percentage coordinates, path points and attack rotation matrix identical.
- 1440 home/profile: DOM text/style/rect observations identical; full PNG pixel differences **0**. Sizes1440×1119 and1440×4408 respectively.

## Covered behavior

- Public API success uses an isolated response in the existing backend schema: Ascent Sova two E candidates, Q single candidate, defense E, Split Omen. Selecting agent/skill/side/map preserves original result semantics. Multi-candidate E waits for a start pin selection; unique Q can show its path immediately. Empty API200 stays Published API and has no result pin; API503 uses existing Preview data.
- Twelve map entries and inline map switching are checked on both pages. Map/side/skill/site/type changes clear the original selection state as before. A selected Lineup detail link retains the selected ability record URL without navigating to an out-of-scope detail route.
- Lineup attack90°/defense270° image matrices and target/start/path coordinates are checked numerically against the test fixture. No state/coordinate logic is modified.
- Smoke selection initially hides path/start/detail, then shows guide steps and route. Ascent common/Harbor attack/defense target/thrower coordinates and Harbor wall endpoints match independently derived source expectations. Empty site and map/type/side reset behavior are checked. Six-agent comparison rows remain.
- Common active Lineups/Smokes navigation, Language selection, Korean content language marking, cross-page link and actual home search anchor destination work at all widths.

## Direct visual review

Reviewed desktop Lineup selected Ascent and tablet/mobile Smoke selected Ascent at original images. Dark surfaces make map/filter controls and existing ability icons legible. Pins and paths remain visible; guide/table content has no overlap or clipping. The initial820px filter left blank space below the left side selector. Implementation placed side/site/type together on the left and the comparison table across those rows on the right. Final820px capture and coordinate checks confirm the improvement. Table keep-all wrapping also remains legible at1440/820/390px.

## Final focused follow-up

- `focus-layout-qa.cjs`:32 checks PASS,3 comparison-table layouts and4 hover+Tab focus states; no page/console errors.
- Direct screenshot review found that the computed2px gold outline with offset−3px was covered by each map-card image. This was a real visual defect despite the computed-style checks passing. The implementation moved the outline3px outside the card.
- `focus-layout-qa.cjs --focus-only`:18 checks PASS after the fix,4 final screenshots, no browser errors. Direct review shows a clear gold focus ring while the red hover border remains.
- `focus-pixels.py`:all4 screenshots contain the expected painted gold ring in the focused-card region:2346/2346 pixels on desktop Lineup/Smoke,1072/1076 on mobile. This checks actual rendering in addition to computed style.
- Initial hidden-focus screenshot/result are preserved only in `/private/tmp/fe027-first-focus-hidden.png` and `/private/tmp/fe027-first-focus-computed-results.json`; the final evidence contains the corrected focus state.
- Final general After recapture and the exact coordinate/PNG comparison passed. No remaining tested visual/functional issue was observed. Production build can proceed; the QA browser processes have ended.

## Exact commands

Executed from repository root:

```sh
node /private/tmp/fe027-visual.cjs before
node /private/tmp/fe027-visual.cjs after
node /private/tmp/fe027-state.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /private/tmp/fe027-compare.py
node docs/visual-qa/assets/TASK-FE-027/browser-qa.cjs after
node docs/visual-qa/assets/TASK-FE-027/focus-layout-qa.cjs
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 docs/visual-qa/assets/TASK-FE-027/compare.py
node docs/visual-qa/assets/TASK-FE-027/focus-layout-qa.cjs --focus-only
/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 docs/visual-qa/assets/TASK-FE-027/focus-pixels.py
```

The stored browser-qa.cjs/state-qa.cjs scripts are copies of the executed temporary helpers, with an optional PLAYWRIGHT_MODULES override for reproducibility. Node scripts use Playwright from `/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright`. macOS Chromium launches used the authorized unsandboxed execution environment. The Python comparison uses existing Pillow; its getdata deprecation warning does not affect the comparison result. No dependency is installed.

## Files

- before-results.json, after-results.json: snapshots, browser errors, captured files, controlled request facts.
- state-results.json: all262 check names,17 layout measurements, fixture request/error facts.
- comparison-results.json: exact state preservation and home/profile pixel comparisons.
- focus-layout-results.json/focus-final-results.json/focus-pixel-results.json: targeted table/layout verification and final rendered focus evidence.
- before-*.png14; after-*.png20, including two API state screenshots and four focus screenshots.
- browser-qa.cjs/state-qa.cjs/compare.py/focus-layout-qa.cjs/focus-pixels.py: stored reproduction helpers. Run from repository root; Before must only run against the unchanged baseline, not overwrite its evidence with current source.

The feature intentionally retains Preview semantics, unavailable live API handling and the existing limited Lineup results display. Production build execution is implementation-owned; the browser restore smoke is recorded below.


## Post-build development-server restore smoke

After implementation reported a successful production build and restored the development server, `node /private/tmp/fe027-post-build.cjs` passed19 bounded checks at390×844: two HTTP200 routes, twelve maps each, Ascent selection, Smoke guide selection, main/header/footer1, no document overflow, and the preserved dark main surface rgb(14,20,26). Page/console errors0. Public Lineup API was controlled to200 with an empty array. No screenshots or comprehensive suites were repeated.

- post-build-results.json: final19 check names and measured page facts.
- post-build-qa.cjs: identical stored reproduction script; run with `node docs/visual-qa/assets/TASK-FE-027/post-build-qa.cjs` from repository root.
