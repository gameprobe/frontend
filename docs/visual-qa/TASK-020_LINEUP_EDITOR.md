# TASK-020_LINEUP_EDITOR Visual QA

## Evidence

- Before: `screenshots/lineup-editor-before.png`
- After desktop: `screenshots/lineup-editor-after-desktop.png`
- After mobile: `screenshots/lineup-editor-after-mobile.png`
- Desktop calculated layout: viewport/body 1280px, editor page/header 1232px, two-column grid `805.328px 402.664px`.
- Mobile calculated layout: viewport/body 390px, editor page/grid 374px, no horizontal overflow.

## Interaction review

- Initial state: `요원 배치` is disabled while skill marker count is zero.
- After one map click in `스킬 배치`: skill marker count becomes 1 and `요원 배치` becomes enabled.
- After switching to `요원 배치` and clicking the map: agent marker count becomes 1.
- After switching to `경로 그리기` and clicking twice: path point count becomes 2.
- Skill/agent markers expose delete controls and the path reset control is visible.
- Sova controls expose charge level and bounce count; they are conditional on Sova selection.

## Visual review

- Desktop uses a two-column editor: map canvas on the left and form controls on the right.
- Mobile collapses the editor into a single column and keeps the map controls usable.
- Marker colors follow the requested difficulty mapping: green/easy, orange/medium, red/hard.
- During QA, an invalid CSS `min()` subtraction was found and corrected to `calc(100% - …)` for lineup list/detail/editor widths.

## Verdict

`PASS` — no remaining layout blocker or interaction blocker found.
