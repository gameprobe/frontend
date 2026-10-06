# Riot Production Key 신청 문안 — GameProbe

2026-09-29 · TASK-FE-034 · **소유자 검토용 완성 초안, 아직 제출하지 않음**

기술 설명은 현재 구현을 기준으로 작성했다. 아래 URL은 기존 도메인을 유지하는 권고안이다.
정책 보완본은 main8970129에 공개됐다. 새 Insights 페이지는 로컬 구현 단계이므로 공개 전에는 심사 URL에 포함하지 않는다. 운영 정책 최종 검토는 남아 있다.
포털의 실제 양식 항목은 로그인 후 확인하며, 아래 문단을 대응하는 항목에 사용한다.

## Product name
GameProbe

## Short description
GameProbe is a VALORANT post-match review and learning website. It helps players explore match history and agent, map, and weapon statistics, alongside a manually browsed library of lineup and smoke guides. We also plan evidence-based post-match coaching that compares a player’s style with comparable top-tier play patterns.

## Product description and player benefit
Players can review completed matches, compare their performance across agents and maps, and inspect match scoreboards, performance, economy, rounds, and duels. The purpose is reflection and practice between games. Lineup and smoke pages provide manually selected educational examples; they do not read the running game or recommend actions from live match state.

The current review build is a working prototype using prepared examples. The main review dataset contains four synthetic matches for DemoPlayer01, shared consistently across the profile and match-detail screens. Unavailable metrics are displayed as unavailable rather than inferred. The site also retains a separately labeled original design demo. Neither demo is a real player lookup, and the example scores in the design demo are not official ranks or calculated hidden MMR.

## API access requested and intended data use
We are requesting a VALORANT Production API key so that, after approval and RSO onboarding, we can replace the synthetic match provider with official account verification and match data for participating users.

The planned integration uses RSO and the account identity endpoint to identify the linked account, VAL-MATCH-V1 match lists and match details to show completed games, and VAL-CONTENT-V1 where required to resolve supported game-content identifiers. Access is requested for post-match history and derived descriptive statistics. We do not request store data, hidden MMR estimates, pre-match opponent scouting, or live-game instructions. The demonstrated synthetic fields are not a claim that every UI metric is available from the production APIs.

## Planned post-match style comparison and coaching

Our goal is to use completed-match data to develop models that compare a participating player’s play style with comparable patterns from top-tier players. We want to highlight engagement positions, kill-event timing and recurring patterns worth reviewing, then suggest focused practice goals between games.

Reference data would come from lawfully obtained sources with the necessary permissions and consent, including participating top-tier players where available. We have not yet acquired a top-tier training dataset or trained a model. We will confirm with Riot whether the proposed collection, reference comparisons and model-training uses are permitted before conducting them. A Production API key alone will not be treated as permission for unrestricted training or third-party data reuse.

Comparisons would account for map, agent or role, attack/defense side, patch, equipment and sample size. Differences from a top-tier reference would not automatically be labeled mistakes. Reports would distinguish observed events from inferred coaching suggestions, cite supporting rounds, explain data limitations and withhold conclusions when evidence is insufficient.

The official match schema includes kill-event timestamps and location snapshots. These are not a continuous replay and do not establish every movement, aim action, communication or decision intent. The feature will not provide live-game directions, pre-match opponent scouting, hidden-MMR estimates or an alternative skill ranking.

A separate Insights interface preview uses entirely fictional scenes and reference values to demonstrate positioning, timing and habit-review reports. It is not a trained-model output, a real top-tier benchmark, or a calculation from the existing DemoPlayer01 match dataset. Personal review, reference-dataset contribution and model training will be explained as distinct uses, with appropriate consent and retention/deletion controls designed before real-data processing starts. We do not claim that deleting source records automatically removes their influence from an already-trained model.

## Account linking, consent, and other participants
The `/connect` page demonstrates the intended player experience: explanation, disclosure of the account and data to be shared, an unchecked consent checkbox, cancellation, a synthetic profile preview, and withdrawal of consent. Linking and opting in is explained as making the user's Riot ID and match statistics visible to other GameProbe users.

The current flow does not perform Riot authentication, issue tokens, or store consent. It resets when the page is refreshed or left. Withdrawing in this simulation hides its synthetic preview; it does not delete server data or restrict the separate public example pages.

Before offering real player data, we will implement RSO verification, server-side consent records and access controls, and distinct procedures for stopping public sharing, unlinking an account, and deleting stored data. One player's consent will not authorize publishing another participant's information. Match-detail displays will need to enforce each participant's sharing permissions. These live controls are planned work after approval, not completed functionality in this prototype.

## Current review URLs

| Purpose | Proposed submission URL |
|---|---|
| Website | https://www.game-probe.com/ |
| Primary synthetic profile | https://www.game-probe.com/players/demo-player-01 |
| Example completed match | https://www.game-probe.com/matches/demo-match-001 |
| Account-linking and consent simulation | https://www.game-probe.com/connect |
| Privacy policy | https://www.game-probe.com/privacy |
| Terms | https://www.game-probe.com/terms |
| Lineup library | https://www.game-probe.com/lineups |
| Smoke guides | https://www.game-probe.com/smokes |

No reviewer account or Riot credentials are needed to explore the prototype. Select **Language → English** in the header for English account-connection and policy copy. Some tactical guide copy remains Korean.

## Reviewer walkthrough
1. Open the website and select **New-data demo / DemoPlayer01**. The default search action opens the separate original design demo and is explicitly labeled as a demonstration.
2. On DemoPlayer01, inspect four example matches and the 3 wins / 1 loss summary. Open the Jett/Ascent 13–9 match. Visit Scoreboard, Performance, Economy, Rounds, and Duels, then use the separate match link or the profile return link.
3. Open **Connect account**. Start **Try sharing consent**, review the disclosure, and observe that the profile button is disabled until the checkbox is checked. Try cancellation, then repeat and consent.
4. After the synthetic summary appears, select **Try withdrawing consent**. The summary disappears; sharing it again requires a fresh choice. Refreshing resets the simulation.
5. Read Privacy and Terms using the footer links. Optionally explore the lineup and smoke libraries; sample and validation notices describe their limitations.

## Additional Insights preview — not yet a public submission URL
- Local review: http://127.0.0.1:3100/insights
- Proposed public path after release: https://www.game-probe.com/insights
- Open Insights, switch between Positioning, Timing and Habits, compare the fictional examples, and read the practice goals and data limitations.
- Do not give Riot a localhost URL or claim this path is live before deployment is verified.

## Monetization for this application
The submitted prototype will be free to use. Any future monetization will be reviewed separately before introduction.

## Operator, contact and service region
- Individual operator and privacy contact: ShinJungho.
- Support/privacy email: game.probe217@gmail.com. The owner confirmed that the inbox receives mail on 2026-09-29.
- Operated from South Korea, initially focused on Korean users with Korean and English support. The free example demo is accessible from other countries; this does not claim live match-data support across all Riot regions.

## Remaining pre-submission checks
- The existing demo is published. Deploy and verify the new Insights preview before including its URL.
- Hosting/analytics and inquiry deletion are confirmed. Complete the remaining overseas-transfer policy review; policy pages remain drafts.
- Confirm reference-data provenance, permission, consent and Riot approval for the proposed model-training use before collecting or training on real data.
- The prototype is free; future monetization is a separate decision.

## Basis
- [VALORANT policy and RSO sequence](https://developer.riotgames.com/docs/valorant): prototype/user-flow evidence, opt-in restrictions, and RSO after Production Key approval.
- [Production Key Applications](https://support-developer.riotgames.com/hc/en-us/articles/22801383038867-Production-Key-Applications): working site and accessible policy pages; a repository alone is not a substitute.
