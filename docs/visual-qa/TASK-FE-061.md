# TASK-FE-061 Visual QA

## Scope and user correction
Replace the six approved source minimaps (Breeze, Lotus, Sunset, Icebox, Pearl, Bind), orient the selected side at the bottom, and keep markers/routes/editor input aligned. **All agent-added spawn text was removed at the user's request.** Spawn coordinates are internal orientation metadata only. Follow-up correction: separately rendered A/B/C site letters were also removed. Only markings baked into source images remain.

## Before / After
- Before: [Icebox](assets/TASK-FE-061/before-icebox-desktop.png), [Breeze](assets/TASK-FE-061/before-breeze-desktop.png).
- Corrected After: [Icebox attack](assets/TASK-FE-061/after-icebox-attack-desktop.png), [Icebox defense](assets/TASK-FE-061/after-icebox-defense-desktop.png), [Breeze attack](assets/TASK-FE-061/after-breeze-attack-desktop.png).
- Mobile 390×844: [Icebox](assets/TASK-FE-061/after-icebox-defense-mobile.png), [Breeze](assets/TASK-FE-061/after-breeze-defense-mobile.png), [Sunset](assets/TASK-FE-061/after-sunset-defense-mobile.png).
- [Smoke detail using read-only fixture](assets/TASK-FE-061/after-smoke-fixture-detail-desktop.png).

## Visual evaluation
Desktop and mobile captures retain the existing dark layout. Inspected views show no horizontal overflow or observed overlap. Icebox attack uses 270° clockwise (90° counterclockwise), so attack spawn is below defense. Original image pixels are not permanently rotated; CSS view projection applies the same transform to image, markers and route geometry. Labels and marker icons stay upright. No added spawn text appears in any final map/side view.

## Rotation matrix
| Map | Attack | Defense |
|---|---:|---:|
| ascent | 90° | 270° |
| bind | 0° | 180° |
| breeze | 0° | 180° |
| fracture | 0° | 180° |
| haven | 90° | 270° |
| icebox | 270° | 90° |
| lotus | 0° | 180° |
| pearl | 0° | 180° |
| split | 90° | 270° |
| sunset | 0° | 180° |

## Verification
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, warnings 0.
- `node --test src/components/guide-map/geometry.test.cjs src/lib/backend-client.test.cjs src/features/admin/*.test.cjs src/features/smokes/*.test.cjs`: PASS 64/64.
- `npm run build`: PASS. Existing >500 kB bundle advisory remains (589.23 kB, gzip 172.27 kB).
- `git diff --check`: PASS.
- CUA Playwright: 20 map/side views, 3 mobile views, 7 inverse-input checks and 3 smoke fixture navigation checks PASS. No added spawn labels in final views.
- Six image asset hashes and terrain sample audit recorded. All six regenerated example grids have zero points outside image; this is not a walkability guarantee.
- Original user file preservation: 13/13 SHA-256 matches. Other four minimap assets unchanged in Git diff.

## Browser evidence
- `orientation-results.json`: 20 loaded 1024×1024 images, expected map/side rotation, no horizontal overflow, added spawn labels 0.
- `mobile-results.json`: 3 mobile layouts, no overflow, added spawn labels 0.
- `input-results.json`: actual components exercised through pointer click/drag and keyboard. Icebox defense/90 click at view (.3,.4) produced canonical (~.400,.700); dragging right decreased canonical Y. Quarter-turn keyboard movements preserve original stored coordinate basis.
- `smoke-flow-results.json`: API fixture point (.3,.7) renders at (30%,30%) on Icebox defense/90; selection, detail, reload and back navigation preserve view side.
- `asset-manifest.json` and `terrain-coordinate-audit.json`: source/output hashes and image-only coordinate audit.
- `map-harness.html` / `map-harness.tsx`: isolated QA surface importing actual editor components. No API calls or save operations.

## Debugging notes
A temporary HMR reload error occurred while deleting the removed spawn component; full navigation and final typecheck/build passed afterward. One CUA locator used the platform accessibility checkbox interpretation; inspecting the DOM and selecting its actual button resolved it. These are not counted as product test passes. Existing unsaved editor guard interrupted an earlier temporary QA tab; no save or DB write occurred.

## Limits
- Local backend health responds, but its `/api/smokes` returns 404. Smoke API rendering was verified against a read-only local HTTP fixture, not against real MongoDB data. Fixture and temporary Vite server were stopped after QA.
- Existing database coordinates and API payload schemas were not changed. Rotation projection/inverse projection preserves canonical coordinates, but terrain-changed real lineups (especially Breeze) still need in-game review. Image audit found 56 old synthetic Breeze sample points and 1 Sunset point outside the new map image; synthetic grids were regenerated.
- Provider version 13.08.00.5627607 identifies the fetched snapshot; it does not prove each minimap matches the current live game patch. Assets are community-hosted Riot images, with provenance retained in public/img/SOURCES.md.
- User authorized commit/push to dev and a dev → main PR. No main merge, production deployment or database writes. Independent Cursor review has not been performed.

## Final source-image-only revision
- Before: [Sunset with separate site labels](assets/TASK-FE-061/before-remove-site-labels-sunset-desktop.png).
- Final After: [Sunset desktop](assets/TASK-FE-061/after-source-image-sunset-desktop.png), [Icebox desktop](assets/TASK-FE-061/after-source-image-icebox-desktop.png), [Sunset mobile](assets/TASK-FE-061/after-source-image-sunset-mobile.png).
- Earlier After images in this report document the previous intermediate revision; these final images supersede them for lettering.
- `source-only-results.json`: 20 map/side combinations with loaded images, zero separate site letters, zero spawn text, no horizontal overflow. Mobile 390×844 also has zero separate site letters and no overflow.
- Final typecheck, lint, 64 tests and build PASS. Trailing blank line reported by diff check was removed; final diff check PASS.
- React checklist: no conditional hooks, no new fetching/dependencies, existing accessible guide controls preserved; removed only decorative site/spawn text.
