# TASK-FE-061 - Refresh minimaps and orient selected side toward bottom

## Status
IMPLEMENTED

## Scope
User approved replacing breeze, lotus, sunset, icebox, pearl and bind minimaps with audited Valorant-API assets. Check existing lineup/smoke coordinate alignment. Determine quarter turns per map so the selected attack/defense spawn is below the opposite side, and use spawn data only to determine orientation. User subsequently requested removal of all agent-added spawn text: render source images without additional spawn labels. Follow-up: remove separate A/B/C site letters as well; commit/push to dev and create a dev → main PR. Do not merge main.

## Allowed changes
Only source and assets listed in .agent-reports/HANDOFF.json, this Task, Visual QA report and scoped evidence. Existing latest dev API/auth behavior and canonical coordinates must be preserved.

## Verification commands
- npm run typecheck
- npm run lint
- npm run build
- node --test src/components/guide-map/geometry.test.cjs src/lib/backend-client.test.cjs src/features/admin/*.test.cjs src/features/smokes/*.test.cjs
- CUA Playwright desktop/mobile Before/After, map/side orientation, marker/route alignment, editor inverse projection and keyboard checks.
- Static image-coordinate audit and git diff --check.

## Result
- Status: IMPLEMENTED
- Human Decision Required: NO for the authorized local scope.
- Branch: codex/minimap-refresh-orientation, base dev c1f34ce3b8a7428a68ae7845c472afaa14ebb0fa.
- Six assets replaced; side-dependent quarter turns and canonical coordinate inverse projection implemented. Existing site labels corrected and synthetic sample grids refreshed. All added spawn text and separately rendered site letters removed. Source image lettering remains unchanged.

### Actual changed files
- `docs/visual-qa/assets/TASK-FE-061/after-source-image-icebox-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/after-source-image-sunset-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/after-source-image-sunset-mobile.png`
- `docs/visual-qa/assets/TASK-FE-061/before-remove-site-labels-sunset-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/source-only-results.json`
- `.agent-reports/CURRENT.md`
- `.agent-reports/HANDOFF.json`
- `docs/tasks/TASK-FE-061.md`
- `docs/visual-qa/TASK-FE-061.md`
- `docs/visual-qa/assets/TASK-FE-061/after-breeze-attack-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/after-breeze-defense-mobile.png`
- `docs/visual-qa/assets/TASK-FE-061/after-icebox-attack-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/after-icebox-defense-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/after-icebox-defense-mobile.png`
- `docs/visual-qa/assets/TASK-FE-061/after-smoke-fixture-detail-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/after-sunset-defense-mobile.png`
- `docs/visual-qa/assets/TASK-FE-061/asset-manifest.json`
- `docs/visual-qa/assets/TASK-FE-061/before-breeze-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/before-icebox-desktop.png`
- `docs/visual-qa/assets/TASK-FE-061/input-results.json`
- `docs/visual-qa/assets/TASK-FE-061/map-harness.html`
- `docs/visual-qa/assets/TASK-FE-061/map-harness.tsx`
- `docs/visual-qa/assets/TASK-FE-061/mobile-results.json`
- `docs/visual-qa/assets/TASK-FE-061/orientation-results.json`
- `docs/visual-qa/assets/TASK-FE-061/smoke-flow-results.json`
- `docs/visual-qa/assets/TASK-FE-061/terrain-coordinate-audit.json`
- `public/img/SOURCES.md`
- `public/img/maps-mini/bind.webp`
- `public/img/maps-mini/breeze.webp`
- `public/img/maps-mini/icebox.webp`
- `public/img/maps-mini/lotus.webp`
- `public/img/maps-mini/pearl.webp`
- `public/img/maps-mini/sunset.webp`
- `src/components/guide-map/GuideMapViewer.tsx`
- `src/components/guide-map/GuideRouteMap.tsx`
- `src/components/guide-map/geometry.test.cjs`
- `src/components/guide-map/geometry.ts`
- `src/data/minimap-layout.ts`
- `src/data/minimap-points.ts`
- `src/features/admin/AdminEditorPage.tsx`
- `src/features/admin/MapEditor.tsx`
- `src/features/game-info/tabs/LineupsGuideTab.tsx`
- `src/features/game-info/tabs/MapsGuideTab.tsx`
- `src/features/lineups/LineupBoardPage.tsx`
- `src/features/lineups/LineupDetailPage.tsx`
- `src/features/lineups/MinimapStage.tsx`
- `src/features/smokes/SmokeDetailPage.tsx`
- `src/features/smokes/SmokeGuidePage.tsx`
- `src/features/smokes/SmokeMinimap.tsx`
- `src/features/smokes/SmokePointMap.tsx`
- `src/mocks/lineups.ts`

### Verification
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, warnings 0.
- `node --test src/components/guide-map/geometry.test.cjs src/lib/backend-client.test.cjs src/features/admin/*.test.cjs src/features/smokes/*.test.cjs`: PASS 64/64.
- `npm run build`: PASS. Existing >500 kB bundle advisory remains (589.23 kB, gzip 172.27 kB).
- `git diff --check`: PASS.
- CUA Playwright: 20 map/side views, 3 mobile views, 7 inverse-input checks and 3 smoke fixture navigation checks PASS. No added spawn labels in final views.
- Six image asset hashes and terrain sample audit recorded. All six regenerated example grids have zero points outside image; this is not a walkability guarantee.
- Original user file preservation: 13/13 SHA-256 matches. Other four minimap assets unchanged in Git diff.

### Remaining limitations
- Local backend health responds, but its `/api/smokes` returns 404. Smoke API rendering was verified against a read-only local HTTP fixture, not against real MongoDB data. Fixture and temporary Vite server were stopped after QA.
- Existing database coordinates and API payload schemas were not changed. Rotation projection/inverse projection preserves canonical coordinates, but terrain-changed real lineups (especially Breeze) still need in-game review. Image audit found 56 old synthetic Breeze sample points and 1 Sunset point outside the new map image; synthetic grids were regenerated.
- Provider version 13.08.00.5627607 identifies the fetched snapshot; it does not prove each minimap matches the current live game patch. Assets are community-hosted Riot images, with provenance retained in public/img/SOURCES.md.
- User authorized commit/push to dev and a dev → main PR. Main merge, production deployment and database writes remain outside scope. Independent Cursor review has not been performed.

### Release authorization and final revision
- Separately rendered site letters A/B/C were removed from lineup, shared guide and legacy smoke maps; original asset markings, guide markers and orientation remain.
- Final verification: typecheck/lint/build, 64 tests, 20 map/side source-only checks, mobile390 and diff check PASS.
- Push to dev and dev → main PR are explicitly authorized by user; main merge is not.
