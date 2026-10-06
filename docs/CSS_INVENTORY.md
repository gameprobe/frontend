# CSS Inventory & Visual Baseline (PR-0)

This document contains a comprehensive audit and inventory of the 4,617-line `globals.css` and the inline styles inside the components of the GameProbe project.

---

## 1. globals.css Section Map

The 4,617 lines of `globals.css` are structured into the following functional areas:

| Line Range | Primary Target UI Component / Task | Major Selectors | Affected Screens |
| :--- | :--- | :--- | :--- |
| **1 – 62** | Global Resets & Root variables | `:root`, `*`, `body`, `a`, `button` | All screens |
| **63 – 409** | Layout Shell & Global Navigation | `.site-shell`, `.site-header`, `.site-brand`, `.home`, `.search-panel` | Header, Footer, Home Screen |
| **410 – 469** | Initial Legacy Match Card Style | `.match-card`, `.match-card-header` | Matches list (legacy reference) |
| **470 – 859** | Main Dashboard Grid & Sidebar Frame | `.profile-dashboard-grid`, `.profile-sidebar`, `.rank-history-card` | Profile page main layout |
| **860 – 1444** | Player Masthead Details | `.player-hero-card`, `.player-hero-bg-agent`, `.player-hero-rank`, `.player-hero-kpi-grid` | Profile page upper hero |
| **1445 – 1759** | Match List Container & Detailed Drawer | `.match-card-list`, `.match-card-shell`, `.match-detail-panel` | Matches list layout |
| **1760 – 1992** | Scoreboard Detailed Tab | `.scoreboard-table`, `.scoreboard-row` | Match Details -> Scoreboard |
| **1993 – 2589** | Rounds Detailed Tab | `.round-phase-summary`, `.round-card`, `.round-log-button` | Match Details -> Rounds |
| **2590 – 3011** | Performance Detailed Tab | `.duel-matrix-card`, `.duel-matrix` | Match Details -> Performance |
| **3012 – 3164** | Analysis Detailed Tab (Charts) | `.team-delta-row`, `.team-delta-track`, `.economy-chart` | Match Details -> Analysis |
| **3165 – 3913** | Slim Diet Match Summary List | `.match-card-main`, `.match-card-outcome`, `.match-card-header`, `.match-card-title`, `.match-card-extra` | Matches list cards |
| **3914 – 4043** | UI12B~F Post-Audits (Filters, Badges) | `.badge-preview`, `.tooltip`, `.disabled-preview-bar` | Player Filters, Mock badges |
| **4044 – 4318** | Desktop/Mobile Responsive Final Polish | `@media (max-width: 1440px)`, `@media (max-width: 640px)` | Responsive layouts |
| **4319 – 4617** | Lineups Page Search & Cards | `.lineup-card-grid`, `.lineup-card`, `.lineups-hero` | `/lineups` page |

---

## 2. @media Block Inventory

There are exactly 9 `@media` query blocks in `globals.css`:

| Line No. | Breakpoint / Dimension | Type | Target Selectors | Has `!important`? | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **355** | `max-width: 900px` | Breakpoint | `.home`, `.analysis-grid` | No | Shrink Home Grid columns to 2 |
| **365** | `max-width: 640px` | Breakpoint | `.site-header`, `.site-nav`, `.home`, `.search-panel` | No | Rearrange Header navigation vertically |
| **3470** | `max-width: 1023px` | Breakpoint | `.profile-layout`, `.profile-dashboard-grid`, `.profile-sidebar`, `.side-panel` | No | Collapse dashboard layout to 1 column |
| **3647** | `max-width: 640px` | Breakpoint | `.profile-sidebar`, `.profile-score-hero`, `.player-hero-card` | No | Single-column collapse on small mobile |
| **4045** | `max-width: 1440px` | Container | `.profile-layout`, `.profile-dashboard-grid`, `.profile-main` | No | Prevent layout stretching at 1440px width |
| **4068** | `max-width: 640px` | Breakpoint | `.season-metric-grid`, `.player-hero-kpi-grid`, `.player-hero-rank-context` | **Yes** | Refit KPI grids and layout for mobile |
| **4090** | `max-width: 420px` | Breakpoint | `.profile-page`, `.player-hero-card`, `.player-hero-kpi-grid` | **Yes** | Extra padding & text shrinkage for narrow screens |
| **4566** | `max-width: 1023px` | Breakpoint | `.lineups-hero`, `.lineup-card-grid` | No | Lineup search 2-column card wrapping |
| **4580** | `max-width: 640px` | Breakpoint | `.lineups-page`, `.lineups-hero`, `.lineup-filter-grid` | No | Lineups page vertical layout on mobile |

---

## 3. !important Usages Inventory

There are 22 instances of `!important` currently used in `globals.css`.

| Line | Target Selector | Attribute | Purpose | Can Remove? | Prerequisites |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **985–987** | `.badge-region:hover` | `background`, `color`, `border-color` | Force override of state hover styling | Yes | Specific pseudo-selector chain alignment |
| **1316** | `.color-win` | `color` | Hardcode green outcome color | Yes | Decouple color from utilities, map to variables |
| **1320** | `.color-loss` | `color` | Hardcode rose outcome color | Yes | Decouple color from utilities, map to variables |
| **1324** | `.color-draw` | `color` | Hardcode grey outcome color | Yes | Decouple color from utilities, map to variables |
| **1795** | `.scoreboard-row-you` | `border` | Highlight personal row border in scoreboard | Yes | Increase selector specificity (`.scoreboard-table .scoreboard-row-you`) |
| **3808** | `.match-card-shell-expanded...` | `display` | Hide collapsed arrow state when active | Yes | Control state strictly via React `active` prop |
| **3940–3942** | `.disabled-preview-bar` | `border-color`, `background`, `color` | Force state styling when inputs disabled | Yes | Style properly via `:disabled` pseudo-selector |
| **3946** | `.disabled-preview-bar span`| `color` | Force text muted color for children | Yes | CSS nesting rules alignment |
| **4075–4076** | `.player-hero-kpi-grid` | `grid-template-columns`, `gap` | Force 2-column grid inside mobile media query | Yes | Refactor mobile classes, remove conflicting rules |
| **4080–4082** | `.player-hero-rank-context` | `flex-direction`, `gap` | Force row direction on mobile layout | Yes | Clean up conflicting base CSS hierarchy |
| **4092–4093** | `.profile-page` | `padding-right`, `padding-left` | Force small padding on narrow screen sizes | Yes | Implement fluid container padding |
| **4097** | `.player-hero-card` | `padding` | Force small padding inside narrow hero card | Yes | Move responsive styling closer to base selector |
| **4101** | `.player-hero-kpi-grid` | `gap` | Force micro gaps | Yes | Consolidate grid rule cascade |
| **4105** | `.kpi-card` | `padding` | Force compact card spacing | Yes | Move responsive styling closer to base selector |
| **4109** | `.kpi-value` | `font-size` | Scale text down to avoid breakage | Yes | Use fluid typography scaling |

---

## 4. Global Utility Classes Matrix

These classes are shared and repeated across different TSX components:

| Class Name | Primary Visual Styling | Referenced TSX File(s) | Usage Context |
| :--- | :--- | :--- | :--- |
| **`.eyebrow`** | Small uppercase metadata text | `HomeSearch.tsx`, `MatchScoreboardTab.tsx` | Visual kickers/small category headers |
| **`.section-kicker`** | Teal highlighted small text | `ProfileSidebar.tsx` | Sidebar title subtitles |
| **`.badge-preview`** | Rounded rose warning tag | `PlayerHeaderCard.tsx`, `ProfileFilterBar.tsx` | Mock/preview warning indicator |
| **`.badge-region`** | Rounded teal info tag | `PlayerHeaderCard.tsx` | Player region badge |
| **`.tooltip`** | Glassmorphic floating window | `PlayerHeaderCard.tsx` | Mock warning detailed info |
| **`.color-win`** | Primary accent/teal text | `MatchSummaryList.tsx`, `MatchScoreboardTab.tsx` | Winning stats indicator |
| **`.color-loss`** | Rose/red outcome text | `MatchSummaryList.tsx`, `MatchScoreboardTab.tsx` | Losing stats indicator |

---

## 5. TSX Inline Styles List

Inline styles have been audited across all frontend source files:

| File Name | Component Name | Style Code | Intended Purpose | Tokenization Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **`MatchEconomyChart.tsx`** | `MatchEconomyChart` | `height: (val/max)*100%` | Dynamically size the loadout bar height | **Exclude** (Dynamic chart render) |
| **`PlayerHeaderCard.tsx`** | `PlayerHeaderCard` | `objectFit: "contain"...` | Position agent background illustration | **Tokenize** (Move to CSS/Utility class) |
| **`ProfileSidebar.tsx`** | `ProfileSidebar` | `width: value%` | Draw progress bar widths dynamically | **Exclude** (Dynamic chart render) |
| **`TeamDeltaChart.tsx`** | `TeamDeltaChart` | `width: myWidth%` | Position custom chart bar indicator | **Exclude** (Dynamic chart render) |
| **`WeaponDistribution.tsx`**| `WeaponDistribution` | `width: percentage%` | Scale weapon kill-share gauge bar | **Exclude** (Dynamic chart render) |

---

## 6. Hardcoded Values Frequency Table

The table below breaks down occurrences of raw spacing, radii, font sizes, and color values inside `globals.css`:

### A. Colors (Direct Matches vs Variable Mappings)
- **`#07111f` (Primary Dark-Blue)**: Over 12 occurrences of hardcoded background colors instead of mapping to `var(--bg)`.
- **`rgb(45 212 191 / 0.xx)` (Accent Teal opacity variants)**: 15+ hardcoded usages for hover states, custom borders, and graphs.
- **`rgb(251 113 133 / 0.xx)` (Rose/Red opacity variants)**: 8+ occurrences for hover states, losses, and warnings.
- **`rgb(148 163 184 / 0.xx)` (Grey opacity variants)**: 10+ occurrences for separators and grids.

### B. Spacing (Paddings, Margins, Gaps)
- **4px / 8px / 12px / 16px / 24px (Systematic Spacing)**: Highly frequent. Good candidates for standard spacing tokens (`var(--space-1)` to `var(--space-6)`).
- **6px / 10px / 14px / 18px / 22px (Irregular Spacing)**: Mixed usage throughout cards and headers (e.g. `padding: 10px 12px;` or `gap: 18px;`). Needs consolidation into closest grid step.

### C. Radii
- **`4px` (Rounded Small)**: Mostly used on `round-card` and button states (14 occurrences).
- **`5px` (Irregular)**: Used on `economy-chart` (1 occurrence).
- **`6px` (Rounded Medium)**: Used on `kpi-card` and scoreboard (8 occurrences).
- **`8px` (Rounded Large)**: Used on `player-hero-rank img` (4 occurrences).
- **`999px` (Pill)**: Used on timeline and badges (5 occurrences).
- *Prerequisite*: Standardize to `var(--radius-sm)` (4px), `var(--radius-md)` (6px), `var(--radius-lg)` (8px).

### D. Typography
- **`10px`**: Micro labels (e.g., accuracy stack, timestamp).
- **`11px`**: Sidebar kickers and secondary details.
- **`12px` / `13px`**: Secondary text/numbers (inconsistent).
- **`14px`**: Standard body text.
- **`18px` / `20px`**: Headings, name labels.
- **`32px`**: Page hero title.
- *Prerequisite*: Map strictly to `var(--text-xs)` (10px), `var(--text-sm)` (12px), `var(--text-base)` (14px), `var(--text-lg)` (18px), `var(--text-xl)` (24px), `var(--text-xxl)` (32px).
