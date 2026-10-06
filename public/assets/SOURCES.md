# Asset Sources

Checked on 2026-06-15.

Expanded on 2026-09-16:
- Riot Public Content Catalog `12.08` was used to add the complete available agent portrait set under `agents/` and all four ability icons per agent under `abilities/`.
- These assets are bundled locally; the app does not hotlink Riot or third-party image URLs at runtime.

Official source:
- Riot Public Content Catalog ZIP:
  `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip`
- ZIP catalog version: `12.08.00.4578383`
- Metadata source inside ZIP: `PublicContentCatalog.json`

Use in this repository:
- No external image host is used at runtime.
- The full Riot Public Content Catalog ZIP and extracted catalog directory are not stored
  in this repository.
- Only the images needed by current Mock data are copied into
  `frontend/public/assets/`.
- The four `placeholder.svg` files are kept only for unmapped fallback IDs.
- Tier images required by TASK-015UI7A were checked against the available
  `PublicContentCatalog.json` categories (`characters`, `weapons`, `maps`,
  `playerCards`, `playerTitles`, `acts`, etc.) and the
  `PublicContentCatalog-release-12.11.zip` file list. Competitive tier emblem
  records were not present in the official Public Content Catalog copy. The
  26 tier/status PNG files below were therefore obtained from Valorant-API metadata as
  one-time local assets; the app does not call Valorant-API at runtime.

| Target | Asset kind | Catalog version | Official ZIP URL | ZIP internal source path | Local path | Mapping ID / name evidence | Checked on | Status | Placeholder reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Jett | agent | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Characters/ADD6443A-41BD-E414-F6AD-E58D267F4E95_small.png` | `agents/jett.png` | `PublicContentCatalog.json` `characters[]`: id `ADD6443A-41BD-E414-F6AD-E58D267F4E95`, `name.defaultText` `Jett`; local id `jett` maps to this record. | 2026-06-15 | official | N/A |
| Jett Full | agent | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Characters/ADD6443A-41BD-E414-F6AD-E58D267F4E95_full.png` | `agents/jett_full.png` | Full agent illustration for Jett | 2026-06-23 | official | N/A |
| Omen | agent | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Characters/8E253930-4C05-31DD-1B6C-968525494517_small.png` | `agents/omen.png` | `PublicContentCatalog.json` `characters[]`: id `8E253930-4C05-31DD-1B6C-968525494517`, `name.defaultText` `Omen`; local id `omen` maps to this record. | 2026-06-15 | official | N/A |
| Omen Full | agent | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Characters/8E253930-4C05-31DD-1B6C-968525494517_full.png` | `agents/omen_full.png` | Full agent illustration for Omen | 2026-06-23 | official | N/A |
| Sova | agent | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Characters/320B2A48-4D9B-A075-30F1-1F93A9B638FA_small.png` | `agents/sova.png` | `PublicContentCatalog.json` `characters[]`: id `320B2A48-4D9B-A075-30F1-1F93A9B638FA`, `name.defaultText` `Sova`; local id `sova` maps to this record. | 2026-06-15 | official | N/A |
| Sova Full | agent | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Characters/320B2A48-4D9B-A075-30F1-1F93A9B638FA_full.png` | `agents/sova_full.png` | Full agent illustration for Sova | 2026-06-23 | official | N/A |
| Ascent | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/7EAECC1B-4337-BBF6-6AB9-04B8F06B3319_listview.png` | `maps/ascent.png` | `PublicContentCatalog.json` `maps[]`: id `7EAECC1B-4337-BBF6-6AB9-04B8F06B3319`, `name.defaultText` `Ascent`; local id `ascent` maps to this record. | 2026-06-15 | official | N/A |
| Ascent ListView | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/7EAECC1B-4337-BBF6-6AB9-04B8F06B3319_listview.png` | `maps/ascent_listview.png` | ListView image for Ascent | 2026-06-23 | official | N/A |
| Ascent Splash | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/7EAECC1B-4337-BBF6-6AB9-04B8F06B3319_splash.png` | `maps/ascent_splash.png` | Splash image for Ascent | 2026-06-23 | official | N/A |
| Haven | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/2BEE0DC9-4FFE-519B-1CBD-7FBE763A6047_listview.png` | `maps/haven.png` | `PublicContentCatalog.json` `maps[]`: id `2BEE0DC9-4FFE-519B-1CBD-7FBE763A6047`, `name.defaultText` `Haven`; local id `haven` maps to this record. | 2026-06-15 | official | N/A |
| Haven ListView | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/2BEE0DC9-4FFE-519B-1CBD-7FBE763A6047_listview.png` | `maps/haven_listview.png` | ListView image for Haven | 2026-06-23 | official | N/A |
| Haven Splash | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/2BEE0DC9-4FFE-519B-1CBD-7FBE763A6047_splash.png` | `maps/haven_splash.png` | Splash image for Haven | 2026-06-23 | official | N/A |
| Split | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/D960549E-485C-E861-8D71-AA9D1AED12A2_listview.png` | `maps/split.png` | `PublicContentCatalog.json` `maps[]`: id `D960549E-485C-E861-8D71-AA9D1AED12A2`, `name.defaultText` `Split`; local id `split` maps to this record. | 2026-06-15 | official | N/A |
| Split ListView | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/D960549E-485C-E861-8D71-AA9D1AED12A2_listview.png` | `maps/split_listview.png` | ListView image for Split | 2026-06-23 | official | N/A |
| Split Splash | map | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Maps/D960549E-485C-E861-8D71-AA9D1AED12A2_splash.png` | `maps/split_splash.png` | Splash image for Split | 2026-06-23 | official | N/A |
| Vandal | weapon | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Weapons/9C82E19D-4575-0200-1A81-3EACF00CF872.png` | `weapons/vandal.png` | `PublicContentCatalog.json` `weapons[]`: id `9C82E19D-4575-0200-1A81-3EACF00CF872`, `name.defaultText` `Vandal`; local id `vandal` maps to this record. | 2026-06-15 | official | N/A |
| Phantom | weapon | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Weapons/EE8E8D15-496B-07AC-E5F6-8FAE5D4C7B1A.png` | `weapons/phantom.png` | `PublicContentCatalog.json` `weapons[]`: id `EE8E8D15-496B-07AC-E5F6-8FAE5D4C7B1A`, `name.defaultText` `Phantom`; local id `phantom` maps to this record. | 2026-06-15 | official | N/A |
| Operator | weapon | `12.08.00.4578383` | `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.08.zip` | `Weapons/A03B24D3-4319-996D-0F8C-94BBFBA1DFC7.png` | `weapons/operator.png` | `PublicContentCatalog.json` `weapons[]`: id `A03B24D3-4319-996D-0F8C-94BBFBA1DFC7`, `name.defaultText` `Operator`; local id `operator` maps to this record. | 2026-06-15 | official | N/A |
| Agent placeholder | fallback | `N/A` | `N/A` | `N/A` | `agents/placeholder.svg` | Used only when an `agentId` has no local mapping. | 2026-06-15 | placeholder | Fallback for unmapped IDs. |
| Map placeholder | fallback | `N/A` | `N/A` | `N/A` | `maps/placeholder.svg` | Used only when a `mapId` has no local mapping. | 2026-06-15 | placeholder | Fallback for unmapped IDs. |
| Weapon placeholder | fallback | `N/A` | `N/A` | `N/A` | `weapons/placeholder.svg` | Used only when a `weaponId` has no local mapping. | 2026-06-15 | placeholder | Fallback for unmapped IDs. |
| Tier placeholder | fallback | `N/A` | `N/A` | `N/A` | `tiers/placeholder.svg` | Used only when a tier id has no local mapping. | 2026-06-16 | placeholder | Fallback for unmapped tier IDs. |

## Competitive Tier Emblems

Checked on 2026-06-16.

Official Public Content Catalog result:
- Riot Public Content Catalog ZIP checked:
  `https://valorant.dyn.riotcdn.net/x/content-catalog/PublicContentCatalog-release-12.11.zip`
- ZIP catalog version: `12.11`
- Metadata source inside ZIP: `PublicContentCatalog.json`
- Result: no official competitive tier emblem category or tier image path was present.
  Matches for `RankV26A3_*`, `Iron`, `Bronze`, `Silver`, `Gold`, `Platinum`,
  `Diamond`, `Ascendant`, `Immortal`, and `Radiant` were player buddy, weapon
  skin, spray, agent text, or queue text records, not competitive tier emblems.

Valorant-API one-time asset source:
- Asset copyright: Riot Games.
- Metadata and image URL provider: Valorant-API.
- Valorant-API is an unofficial, unaffiliated service.
- Endpoint:
  `https://valorant-api.com/v1/competitivetiers?language=ko-KR`
- Selected Competitive Tier Set UUID:
  `03621f52-342b-cf4e-4f86-9350a49c6d04`
- Selection reason: among the 5 returned sets, `Episode5_CompetitiveTierDataTable`
  is the latest set in the response and the only set that includes tier 21-23
  Ascendant/초월자 plus all Iron through Radiant tiers.

The local files use exact division-aware tier names where the tier string
contains a division. `getTierAssetPath()` maps `Diamond 2`, `Ascendant 3`, and
`Immortal 1` to their matching division files. Divisionless base tier inputs
such as `Diamond` map to that tier's division 1 image so mixed Mock inputs like
`tierImageId: "diamond"` do not fall back to the placeholder. The
`unranked.png` mapping is for competitive rank status only and should not be
used as the normal queue label for Unrated games.

| Target | Competitive Tier Set UUID | Tier number | tierName | division / divisionName | Original largeIcon URL | Local path | Checked on | Status |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| Unranked | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 0 | `랭크 없음` | `ECompetitiveDivision::UNRANKED` / `랭크 없음` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/0/largeicon.png` | `tiers/unranked.png` | 2026-06-16 | local PNG |
| Iron 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 3 | `아이언 1` | `ECompetitiveDivision::IRON` / `아이언` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/3/largeicon.png` | `tiers/iron-1.png` | 2026-06-16 | local PNG |
| Iron 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 4 | `아이언 2` | `ECompetitiveDivision::IRON` / `아이언` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/4/largeicon.png` | `tiers/iron-2.png` | 2026-06-16 | local PNG |
| Iron 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 5 | `아이언 3` | `ECompetitiveDivision::IRON` / `아이언` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/5/largeicon.png` | `tiers/iron-3.png` | 2026-06-16 | local PNG |
| Bronze 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 6 | `브론즈 1` | `ECompetitiveDivision::BRONZE` / `브론즈` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/6/largeicon.png` | `tiers/bronze-1.png` | 2026-06-16 | local PNG |
| Bronze 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 7 | `브론즈 2` | `ECompetitiveDivision::BRONZE` / `브론즈` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/7/largeicon.png` | `tiers/bronze-2.png` | 2026-06-16 | local PNG |
| Bronze 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 8 | `브론즈 3` | `ECompetitiveDivision::BRONZE` / `브론즈` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/8/largeicon.png` | `tiers/bronze-3.png` | 2026-06-16 | local PNG |
| Silver 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 9 | `실버 1` | `ECompetitiveDivision::SILVER` / `실버` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/9/largeicon.png` | `tiers/silver-1.png` | 2026-06-16 | local PNG |
| Silver 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 10 | `실버 2` | `ECompetitiveDivision::SILVER` / `실버` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/10/largeicon.png` | `tiers/silver-2.png` | 2026-06-16 | local PNG |
| Silver 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 11 | `실버 3` | `ECompetitiveDivision::SILVER` / `실버` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/11/largeicon.png` | `tiers/silver-3.png` | 2026-06-16 | local PNG |
| Gold 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 12 | `골드 1` | `ECompetitiveDivision::GOLD` / `골드` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/12/largeicon.png` | `tiers/gold-1.png` | 2026-06-16 | local PNG |
| Gold 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 13 | `골드 2` | `ECompetitiveDivision::GOLD` / `골드` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/13/largeicon.png` | `tiers/gold-2.png` | 2026-06-16 | local PNG |
| Gold 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 14 | `골드 3` | `ECompetitiveDivision::GOLD` / `골드` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/14/largeicon.png` | `tiers/gold-3.png` | 2026-06-16 | local PNG |
| Platinum 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 15 | `플래티넘 1` | `ECompetitiveDivision::PLATINUM` / `플래티넘` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/15/largeicon.png` | `tiers/platinum-1.png` | 2026-06-16 | local PNG |
| Platinum 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 16 | `플래티넘 2` | `ECompetitiveDivision::PLATINUM` / `플래티넘` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/16/largeicon.png` | `tiers/platinum-2.png` | 2026-06-16 | local PNG |
| Platinum 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 17 | `플래티넘 3` | `ECompetitiveDivision::PLATINUM` / `플래티넘` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/17/largeicon.png` | `tiers/platinum-3.png` | 2026-06-16 | local PNG |
| Diamond 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 18 | `다이아몬드 1` | `ECompetitiveDivision::DIAMOND` / `다이아몬드` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/18/largeicon.png` | `tiers/diamond-1.png` | 2026-06-16 | local PNG |
| Diamond 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 19 | `다이아몬드 2` | `ECompetitiveDivision::DIAMOND` / `다이아몬드` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/19/largeicon.png` | `tiers/diamond-2.png` | 2026-06-16 | local PNG |
| Diamond 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 20 | `다이아몬드 3` | `ECompetitiveDivision::DIAMOND` / `다이아몬드` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/20/largeicon.png` | `tiers/diamond-3.png` | 2026-06-16 | local PNG |
| Ascendant 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 21 | `초월자 1` | `ECompetitiveDivision::ASCENDANT` / `초월자` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/21/largeicon.png` | `tiers/ascendant-1.png` | 2026-06-16 | local PNG |
| Ascendant 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 22 | `초월자 2` | `ECompetitiveDivision::ASCENDANT` / `초월자` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/22/largeicon.png` | `tiers/ascendant-2.png` | 2026-06-16 | local PNG |
| Ascendant 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 23 | `초월자 3` | `ECompetitiveDivision::ASCENDANT` / `초월자` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/23/largeicon.png` | `tiers/ascendant-3.png` | 2026-06-16 | local PNG |
| Immortal 1 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 24 | `불멸 1` | `ECompetitiveDivision::IMMORTAL` / `불멸` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/24/largeicon.png` | `tiers/immortal-1.png` | 2026-06-16 | local PNG |
| Immortal 2 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 25 | `불멸 2` | `ECompetitiveDivision::IMMORTAL` / `불멸` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/25/largeicon.png` | `tiers/immortal-2.png` | 2026-06-16 | local PNG |
| Immortal 3 | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 26 | `불멸 3` | `ECompetitiveDivision::IMMORTAL` / `불멸` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/26/largeicon.png` | `tiers/immortal-3.png` | 2026-06-16 | local PNG |
| Radiant | `03621f52-342b-cf4e-4f86-9350a49c6d04` | 27 | `레디언트` | `ECompetitiveDivision::RADIANT` / `레디언트` | `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/27/largeicon.png` | `tiers/radiant.png` | 2026-06-16 | local PNG |

Tier PNG verification:
- PNG signature: all 26 files start with `89504e470d0a1a0a`.
- Image format: all 26 files are PNG RGBA. The source images are 256x256
  except `ascendant-2.png` and `immortal-2.png`, which are 275x256.
- File sizes: non-zero.
- Duplicate check: SHA-256 values are unique across all 26 files.

## Map Selector Splash Art

Checked on 2026-09-20.

The 12 competitive map selector cards use each map's splash/concept artwork,
separate from the tactical layout image used after a map is selected. These
files were downloaded once from the corresponding public Valorant-API map media
URLs and are bundled locally; the app does not hotlink the API at runtime.

| Maps | Local files | Source pattern | Status |
| --- | --- | --- | --- |
| Ascent, Split, Fracture, Bind, Breeze, Abyss, Lotus, Sunset, Pearl, Icebox, Corrode, Haven | `maps/{map}_splash.png` | `https://media.valorant-api.com/maps/{map-uuid}/splash.png` | local PNG, Riot Games asset |

The map UUIDs were resolved from `https://valorant-api.com/v1/maps?language=en-US`.
Valorant-API is an unofficial, unaffiliated metadata/image index; Riot Games
assets remain subject to Riot's applicable asset terms.

PENDING:
- No TASK-015UI3 target remains on placeholder. Future Riot catalog upgrades should
  re-check the tier mappings against the newer `PublicContentCatalog-release-X.XX.zip`.
- Map explorer map images were downloaded from the public Valorant API map display-icon endpoints on 2026-09-16 and stored locally for the all-map selector; no runtime hotlink is used.
