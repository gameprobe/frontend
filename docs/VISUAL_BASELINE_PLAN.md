# Visual Baseline Plan (PR-0)

This document maps out the strategy to capture and freeze the exact visual state of GameProbe before commencing the PR-1 design token transition.

---

## 1. Visual Baseline Capture Targets

We will capture the screen state for the following 11 combinations to form our `screenshots/page-states/` baseline catalog:

| Target ID | Route / URL Path | Screen State Description | Target Viewport(s) |
| :--- | :--- | :--- | :--- |
| **BL-01-A** | `/` | Home Search & Layout | **390px** (Mobile) |
| **BL-01-B** | `/` | Home Search & Layout | **1440px** (Desktop) |
| **BL-02-A** | `/players/demo-puuid-seoul-duelist-001` | Profile Page (All cards collapsed) | **390px** (Mobile) |
| **BL-02-B** | `/players/demo-puuid-seoul-duelist-001` | Profile Page (All cards collapsed) | **1023px** (Tablet) |
| **BL-02-C** | `/players/demo-puuid-seoul-duelist-001` | Profile Page (All cards collapsed) | **1440px** (Desktop) |
| **BL-03-A** | `/players/demo-puuid-seoul-duelist-001` | Match 1 Expanded (Scoreboard Tab) | **390px** (Mobile) |
| **BL-03-B** | `/players/demo-puuid-seoul-duelist-001` | Match 1 Expanded (Scoreboard Tab) | **1440px** (Desktop) |
| **BL-04-A** | `/players/demo-puuid-seoul-duelist-001` | Match 1 Expanded (Rounds Tab) | **1023px** (Tablet) |
| **BL-04-B** | `/players/demo-puuid-seoul-duelist-001` | Match 1 Expanded (Rounds Tab) | **1440px** (Desktop) |
| **BL-05**   | `/players/demo-puuid-seoul-duelist-001` | Match 1 Expanded (Performance & Analysis) | **1440px** (Desktop) |
| **BL-06-A** | `/lineups` | Lineup Search Filter (Default/Filter before) | **390px** (Mobile) |
| **BL-06-B** | `/lineups` | Lineup Search Filter (Default/Filter before) | **1440px** (Desktop) |
| **BL-07**   | `/lineups` | Lineup Search Filter (No results fallback) | **390px** (Mobile) |

---

## 2. Capture Mechanism & Steps

We will utilize Playwright (using custom automation inside the agent browser tools) to load the page states under active local server runtime (`http://localhost:3000`) and output full-page PNG screenshots.

### Execution Protocol
1. Launch local development server (`npm run dev` in background).
2. For each Target ID:
   - Instantiate browser at specified width (e.g., width 1440, height 1200 or fullpage).
   - Navigate to route.
   - Wait for animations/charts to stabilize (1-2 seconds delay).
   - If Tab selection is required (e.g., Rounds/Performance/Analysis), simulate `click()` on tab button element.
   - If Match Expand is required, click on the target match-card toggler.
   - Take screenshot and save to `screenshots/page-states/<Target_ID>_<Width>.png`.
3. Stop the development server.

---

## 3. Proposal for PR-1: Design System Tokenization

After freezing the baseline in PR-0, the next PR (PR-1) will safely introduce:

1. **Primitive Tokens (`:root` variables)**:
   - Define exact spacing steps: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-5` (24px), `--space-6` (32px).
   - Define typography scales: `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-xxl`.
   - Define radius scale: `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px).
2. **Safe Substitution**:
   - Replace raw hardcoded pixel units in `globals.css` with token variables.
   - Eliminate redundant CSS classes.
3. **Regression Check**:
   - Re-run the automated screenshot script and compare before/after images using pixel diffing.
