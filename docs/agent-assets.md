# Agent Assets

## Purpose

`.agent-assets/` is the shared local cache for large or external resources that
agents may need while planning or implementing tasks. It is not an app runtime
asset folder and must stay ignored by git.

Use this folder when a resource is useful across agents but too large or too
broad to commit, such as official content catalog ZIPs, unpacked reference
archives, generated lookup indexes, or temporary extraction outputs.

## Rules

- Keep `.agent-assets/` git-ignored.
- Do not commit downloaded ZIPs, extracted catalogs, generated scratch files, or
  bulk external resources.
- Product code must not read from `.agent-assets/`.
- For product use, copy only task-approved files into the proper app directory
  such as `frontend/public/assets/`.
- Every copied app asset must have source evidence in
  `frontend/public/assets/SOURCES.md`.
- Every reusable cache should have a small tracked document in `docs/` that
  explains source, local path, index file, and safe usage.
- A task that uses `.agent-assets/` must name the exact local path it expects.

## Registered Local Resources

| Resource | Local path | Tracked guide | Status |
| --- | --- | --- | --- |
| Riot VALORANT Public Content Catalog 12.08 | `.agent-assets/riot-public-content-catalog/12.08/` | `docs/riot-public-content-catalog.md` | Downloaded, unpacked, indexed |

## Current Riot Catalog Paths

- ZIP:
  `.agent-assets/riot-public-content-catalog/12.08/PublicContentCatalog-release-12.08.zip`
- Extracted root:
  `.agent-assets/riot-public-content-catalog/12.08/extracted`
- Generated index:
  `.agent-assets/riot-public-content-catalog/12.08/catalog-index.json`

## Task Author Checklist

When writing a task that depends on a local agent resource:

1. Include the exact `.agent-assets/...` path in `Existing Data / Assets`.
2. State whether the task may copy files into product assets.
3. Name the allowed destination paths.
4. Name the required source documentation update.
5. Add verification that `.agent-assets/` remains untracked.
6. Keep unrelated resources out of the task scope.
