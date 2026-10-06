# TASK-015UI12G: 경기 상세 4탭 고밀도 재설계 마스터 플랜 (Scoreboard·Rounds·Performance·Analysis)

## Status

PLAN (마스터) — 구현은 하위 Task G-A~G-D로 분할. G-A READY, G-B/G-C/G-D PLANNED.

> TASK-015UI12F_PATCH(DONE, HEAD `2d8d65c`)가 완료된 Git 상태 위에서 진행한다.
> 이 문서는 구현 Task가 아니라 Phase G 전체 설계 기준이다. 실제 구현은 G-A~G-D 하위 Task에서 한 번에 하나씩 수행한다.

## Final Purpose

경기 상세 인라인 패널의 4개 탭(스코어보드/라운드/성과/분석)을 OP.GG·Tracker.gg 수준의 **고밀도·전술 텔레메트리 화면**으로 재설계해, Riot Production API 신청 시 "실제 운영 가능한 전적 분석 서비스"로 납득되도록 완성한다. 현재 4탭은 단순 MVP/플레이스홀더 인상을 주며(저대비 스코어보드, 세로 텍스트 라운드 목록, 지표 중복 성과, 정적 좌표 분석), 경쟁사 대비 전술 정보 깊이가 부족하다(근거: `ux_evaluation_report.md`).

## Reference & Evidence

- UX 감사 보고서: `~/.gemini/antigravity/brain/d15e72fe-.../ux_evaluation_report.md` (사람 최종 승인 APPROVED).
- 비주얼 캡처: GameProbe 4탭 + OP.GG(scoreboard/rounds/match report/team analysis/cred graph) + Tracker.gg(scoreboard/rounds/performance/economy/duels).
- 현재 구현: `MatchDetailPanel.tsx`(탭 컨테이너), `MatchScoreboardTab.tsx`, `MatchRoundsTab.tsx`, `MatchPerformanceTab.tsx`, `MatchAnalysisTab.tsx`(현재 props 없음), `MatchTabs.tsx`, `MatchRoundTimeline.tsx`.
- 상세 데이터 보유 경기: `mock-match-ascent-001` **1경기만** (참가자 10명·라운드 22개). 나머지는 summary만 존재하므로, 신규 텔레메트리 Mock은 이 1경기에만 추가하면 된다.

## 사람 결정 기록 (Human Decisions — 확정)

이 프로젝트의 가드레일(`docs/ui-design-guardrails.md` "데이터 없는 UI 금지", `AGENTS.md` "데이터 의미 변경/신규 의존성은 사람 결정")에 따라 아래를 사람이 확정했다(2026-06-24).

| 결정 항목 | 확정 내용 |
|-----------|-----------|
| 신규 Mock 데이터 + 신규 타입 필드 | **전체 승인** — FK/FD/MK, 듀얼 매트릭스, 무기 분포, 2D 맵 킬/데스 좌표, 경제(Bank/Loadout) Mock·타입 추가 허용 |
| 티켓 구조 | **탭별 4분할** — G-A Scoreboard · G-B Rounds · G-C Performance · G-D Analysis |

> 단, 승인 범위는 **Mock(데모) 데이터 생성**에 한정된다. 모든 신규 텔레메트리는 실제 Riot 데이터가 아닌 **Mock/Preview**임을 화면과 타입 주석에서 정직하게 고지해야 한다(전역 `Mock Preview` 정책 유지). 외부 실 자산(요원/맵 PNG 등) 신규 취득이 필요하면 별도 사람 결정으로 분리한다.

## 목표 데이터 모델 (단일 정본 — 하위 Task가 슬라이스별로 추가)

각 하위 Task는 자신이 쓰는 필드만 `frontend/src/types/match.ts`와 `frontend/src/data/mock-data.json`(`mock-match-ascent-001`)에 추가한다. 충돌·중복 정의를 막기 위해 **전체 목표 모델을 여기 단일 정본으로 고정**한다. 신규 필드는 기존 스타일대로 optional + `// Mock/aggregated field` 주석을 단다.

- **G-A (스코어보드)** — `CombatStats` 또는 `MatchParticipant` 확장:
  - `firstKills?: number` (FK), `firstDeaths?: number` (FD), `multiKills?: number` (MK).
  - K/D Ratio는 `kills/deaths`로 **파생**(필드 추가 금지). MVP는 팀 내 `averageCombatScore` 최고로 **파생**.
- **G-B (라운드)** — `MatchRound` 확장 + 맵 플로터:
  - `killEvents?: RoundKillEvent[]` — `{ killerPuuid, victimPuuid, weaponId, displayName?, timeSeconds, isFirstKill?, isHeadshot?, killerPos?: MapPoint, victimPoint?: MapPoint }`.
  - `MapPoint = { x: number; y: number }` (0~1 정규화 좌표).
  - 2D 플로터 배경은 **스타일라이즈드 전술 그리드(CSS)** 기본. 실제 미니맵 PNG 사용은 신규 자산이므로 별도 사람 결정(기본은 그리드).
- **G-C (성과)** — `MatchParticipant` 확장:
  - `weaponKills?: WeaponKillBreakdown[]` — `{ weaponId, displayName, kills }[]` (무기 분포).
  - `duels?: DuelRecord[]` — `{ opponentPuuid, kills, deaths }[]` (뷰어 기준 상대별 H2H).
- **G-D (분석)** — `CombatStats` + `MatchRound` 확장:
  - `damageDealt?: number`, `damageReceived?: number` (참가자별, 팀 총 피해량 델타용).
  - `MatchRound.economy?: { attackersLoadout: number; defendersLoadout: number; attackersBank?: number; defendersBank?: number }` (경제 그래프·델타).
  - 팀 총 킬·총 전투점수는 참가자 합으로 **파생**.

## 분할 (G-A ~ G-D)

| Task | 범위 | 신규 데이터 슬라이스 | 상태 |
|------|------|----------------------|------|
| TASK-015UI12G-A | 스코어보드 고밀도화: FK/FD/MK 컬럼·K/D Ratio·MVP 마커·YOU 행 네온 강조·컬럼 압축 | FK/FD/MK | READY |
| TASK-015UI12G-B | 라운드 1-24 수평 스트립 + 라운드별 킬 로그·2D 좌표 플로터 | killEvents·좌표 | PLANNED |
| TASK-015UI12G-C | 성과 탭 재설계: 듀얼 H2H 매트릭스 + 무기 분포 위젯 | weaponKills·duels | PLANNED |
| TASK-015UI12G-D | 분석 탭 재설계: 팀 전투/피해 델타 막대 + 경제(Bank/Loadout) 그래프 | damageDealt/Received·economy | PLANNED |

## 실행 순서 / 게이트

- **순차 진행**: G-A → G-B → G-C → G-D. 네 Task 모두 `types/match.ts`·`mock-data.json`·`globals.css`를 공유 수정하므로, 충돌 방지를 위해 **한 번에 하나만** 구현·검증·커밋 후 다음으로 넘어간다(`CLAUDE.md` "한 번에 하나").
- 각 Task는 Codex 구현 → Cursor 리뷰(COMMIT_READY) → 사람 커밋 후 다음 Task READY 승격.
- `.agent-reports/HANDOFF.json`은 현재 활성 구현 Task(최초 G-A)를 가리키도록 유지·최신화한다.

## 공통 Allowed Changes (하위 Task가 자신 범위만 사용)

- `frontend/src/types/match.ts` (해당 슬라이스 필드만 추가, optional + Mock 주석)
- `frontend/src/data/mock-data.json` (`mock-match-ascent-001`에만 해당 슬라이스 Mock 추가)
- `frontend/src/app/globals.css` (탭별 스타일)
- 탭별 컴포넌트 및 **필요 시 신규 컴포넌트 파일** (G-A~G-D 각 문서에 명시) — 이번 Phase는 재설계이므로 신규 컴포넌트 생성을 허용한다(기존 Task의 "신규 컴포넌트 금지" Stop Condition은 Phase G에 한해 해제).

## 공통 Forbidden Changes

- `backend/`, `docker/`, `scripts/`, `frontend/package.json`/lockfile, 신규 npm 패키지 추가 금지(데이터/타입/컴포넌트만으로 구현).
- 외부 실 자산(신규 요원/맵 PNG 등) 신규 취득 금지(별도 사람 결정). 미니맵은 기본 CSS 그리드.
- 신규 텔레메트리를 **실제 Riot 데이터로 오인되게 표기 금지** — Mock/Preview 고지 유지.
- Git add/commit/push 실행 금지(구현 단계).
- 다른 하위 Task의 슬라이스/탭을 임의로 동시 수정 금지(범위 격리).

## 공통 Acceptance Criteria (각 하위 Task가 상속)

1. 해당 탭이 레퍼런스(OP.GG/Tracker.gg) 수준의 정보 밀도·시각 위계로 재설계되었는가.
2. 신규 Mock/타입이 목표 데이터 모델 정본과 일치하고, optional·Mock 주석 규칙을 지켰는가.
3. 신규 텔레메트리가 Mock/Preview임이 화면에서 정직하게 고지되는가.
4. `npx tsc --noEmit`, `npm run lint`, `npm run build`가 모두 통과하는가.
5. 수정 파일이 해당 하위 Task의 Allowed 범위를 벗어나지 않는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Stop Conditions

- 구현 중 외부 실 자산(신규 PNG 등) 또는 신규 npm 패키지가 필요해질 때 → 중단·사람 결정.
- 동일 검증 에러 3회 반복 시 `BLOCKED` 처리.

## Result

(마스터 플랜 — 하위 Task가 개별 Result 기록)
