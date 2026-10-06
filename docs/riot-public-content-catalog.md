# Riot Public Content Catalog Local Cache

See also `docs/agent-assets.md` for the shared `.agent-assets/` operating
policy.

## Purpose

This workspace has a local, unpacked copy of the Riot VALORANT Public Content
Catalog so agents can find official VALORANT images without repeatedly
downloading or guessing asset paths.

Do not treat the unpacked catalog as app runtime assets. It is an agent working
cache. Copy only task-approved files into `frontend/public/assets/`, then record
the copied files in `frontend/public/assets/SOURCES.md`.

## Source

- Official ZIP:
  `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip`
- Catalog version: `12.08.00.4578383`
- Metadata inside ZIP: `PublicContentCatalog.json`
- Downloaded and unpacked locally: 2026-06-23

## Local Paths

- ZIP:
  `.agent-assets/riot-public-content-catalog/12.08/PublicContentCatalog-release-12.08.zip`
- Extracted root:
  `.agent-assets/riot-public-content-catalog/12.08/extracted`
- Generated index:
  `.agent-assets/riot-public-content-catalog/12.08/catalog-index.json`
- Local cache README:
  `.agent-assets/riot-public-content-catalog/12.08/README.md`

`.agent-assets/` is intentionally ignored by git. Do not commit the ZIP or the
full extracted catalog.

## Available Catalog Counts

- `characters`: 29
- `weapons`: 35
- `weaponSkins`: 1357
- `armors`: 3
- `maps`: 23
- `playerCards`: 933
- `playerTitles`: 381
- `charms`: 829
- `sprays`: 869
- `flexes`: 19
- `gameModes`: 16
- `acts`: 53
- `characterRoles`: 4
- `matchmakingQueues`: 27

The extracted directory currently contains 10,557 files. The ZIP is about 1.1GB
and the extracted catalog is about 1.1GB.

## Common Image Path Patterns

- Agents:
  `extracted/Characters/{CHARACTER_UUID}.png`
- Agent full portraits:
  `extracted/Characters/{CHARACTER_UUID}_full.png`
- Agent small portraits:
  `extracted/Characters/{CHARACTER_UUID}_small.png`
- Agent abilities:
  `extracted/Abilities/{CHARACTER_UUID}_{AbilitySlot}.png`
- Maps:
  `extracted/Maps/{MAP_UUID}.png`
- Map list images:
  `extracted/Maps/{MAP_UUID}_listview.png`
- Map splash images:
  `extracted/Maps/{MAP_UUID}_splash.png`
- Weapons:
  `extracted/Weapons/{WEAPON_UUID}.png`
- Weapon killfeed images:
  `extracted/Weapons/{WEAPON_UUID}_killstream.png`
- Character roles:
  `extracted/CharacterRoles/{ROLE_UUID}.png`

## How Agents Should Use It

1. Read `.agent-assets/riot-public-content-catalog/12.08/catalog-index.json`.
2. Find the entry by `slug`, `name.enUS`, `name.koKR`, or `id`.
3. Use the `localFiles` array to identify the exact official image file.
4. For product use, copy only the required files into `frontend/public/assets/`
   under a narrow task scope.
5. Update `frontend/public/assets/SOURCES.md` with the official ZIP URL,
   catalog version, ZIP internal source path, local app asset path, mapping
   evidence, and check date.
6. Update `frontend/src/lib/asset-map.ts` only when the task explicitly allows
   product asset mapping changes.

## Current Product Asset Coverage

The app currently maps only the task-approved subset in
`frontend/src/lib/asset-map.ts`:

- Agents: `jett`, `sova`, `omen`
- Maps: `ascent`, `haven`, `split`
- Weapons: `vandal`, `phantom`, `operator`

Other catalog assets are available in the local cache, but are not yet app
runtime assets.

## Safety Rules

- Do not add runtime references to `valorant.dyn.riotcdn.net`.
- Do not commit `.agent-assets/`.
- Do not bulk-copy the full catalog into `frontend/public/assets/`.
- Do not add new mock data, type fields, or UI mappings just because an asset is
  available.
- If a task needs new official images, copy only the specific required files and
  keep placeholders for unmapped IDs.
