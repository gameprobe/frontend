# Riot application — current Vite public prototype

Updated 2026-10-15 · TASK-FE-060 · gameprobe/frontend

## Release condition

The user authorized publication on2026-10-15. This replacement text describes TASK-FE-060 after release; verify the public walkthrough and policy links before using it. The earlier main5da6a92 rendered404 for /privacy, /terms, /connect and /insights. Implementation and validation are recorded in TASK-FE-060. Riot portal submission is not included. This compact description replaces the longer draft.

## Form fields

- Product name: GameProbe
- Product URL: https://www.game-probe.com (omit trailing slash to avoid the portal generating //riot.txt)
- Game: VALORANT
- Key: Production API Key
- Initial audience: Korean players; public and free, not a private/personal test tool.
- Operator/privacy contact: ShinJungho
- Email: game.probe217@gmail.com
- Review access: no account/download required.

## Product description

Character count: 672 including spaces/newlines. Conservative compact draft; the current portal's exact maximum was not inspected. Check the final sentence remains after saving.

```text
GameProbe is a free VALORANT website for post-match review and manually browsed lineup/smoke guides, initially for Korean players.

The public demo contains fictional stats, a consent-flow preview and a sample coaching report. No real player data or trained AI is used.

We request a Production API key. We will implement RSO, opt-in, access controls and deletion before real data access. Planned coaching compares completed-match patterns with permitted high-tier records, subject to Riot's data/training approval. No live assistance, opponent scouting or non-opted-in player stats.

Public demo, policies and contact (no login):
https://www.game-probe.com/review?lang=en
```

## Reviewer links after release

| Review | URL | Meaning |
|---|---|---|
| Start | https://www.game-probe.com/review?lang=en | English walkthrough and current/planned status |
| Player | https://www.game-probe.com/players/demo-player-01 | Compatibility redirect to fictional 프로브#KR1 |
| Match | https://www.game-probe.com/matches/demo-match-001 | One detailed sample match, four tabs |
| Consent | https://www.game-probe.com/connect | Redirect to /my/consent; no Riot login |
| Feedback | https://www.game-probe.com/insights?lang=en | Editorial scenarios, not model outputs |
| Lineups | https://www.game-probe.com/lineups | Manual browsing |
| Smokes | https://www.game-probe.com/smokes | Manual browsing |
| Privacy | https://www.game-probe.com/privacy?lang=en | Current demo processing and pending details |
| Terms | https://www.game-probe.com/terms?lang=en | Demo terms draft |

## Review instructions

Open the walkthrough, then follow the four numbered cards. The consent demo starts unchecked. Select the two required options, click “선택하고 예시 연결”, reload to see browser persistence, and click “예시 연결 해제” to remove the demo session. Cancelling does not create a session. It is not RSO or a server-side consent record. The English walkthrough explains the Korean controls.

## Important distinctions from the old application

- Main UI is currently Korean; no claim of full product English support.
- Current player is 프로브#KR1. Old DemoPlayer01 URL is preserved only as a redirect.
- Only one match has detailed data. Other profile rows do not imply complete details.
- Demo connection persists in browser localStorage; it is not only in-memory and not real authentication.
- Rankings/meta and report comparisons are examples, not collected official player results.
- No real trained AI, reference cohort, continuous replay, or guaranteed position/timing inference exists.
- API key/RSO and server-side consent, data controls/deletion are future prerequisites.
- Privacy text retains the previously confirmed operator, email and manual deletion within30days of inquiry resolution. Provider retention/international processing and legal adequacy are not certified.

## Sources

- https://developer.riotgames.com/docs/valorant
- https://support-developer.riotgames.com/hc/en-us/articles/22801383038867-Production-Key-Applications
- https://vercel.com/legal/privacy-notice
- https://policies.google.com/privacy
- https://policies.google.com/technologies/retention

Public page observations and code are the basis for product claims. Policy references do not imply approval or permission to train a model.
