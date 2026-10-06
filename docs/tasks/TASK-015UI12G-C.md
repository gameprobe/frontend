# TASK-015UI12G-C: 성과 탭 재설계 — 듀얼 H2H 매트릭스 + 무기 분포 위젯

## Status

READY (선행 TASK-015UI12G-B DONE·커밋 `8e576bf` 완료로 승격, 다음 구현 후보)

> 마스터 플랜 `docs/tasks/TASK-015UI12G.md` 및 `ux_evaluation_report.md` §3 기준.
> 신규 Mock+타입 전체 승인(2026-06-24) 범위 내에서 성과 슬라이스(weaponKills·duels)만 추가한다.

## Goal

기존 지표를 단순 반복하던 `MatchPerformanceTab.tsx`를 **매치업 분석 화면**으로 재설계한다.

1. **듀얼 H2H 매트릭스**: 로그인 플레이어(`viewerPuuid`) 기준, 상대 팀 5명 각각에 대한 head-to-head 킬/데스를 매트릭스/카드 형태로 표시한다(누가 나를 많이 잡았는지·내가 압도한 상대 식별).
2. **무기 분포 위젯**: 해당 경기에서 플레이어의 무기별 킬 분포(예: Vandal/Phantom/Operator/Sheriff)를 막대 또는 도넛으로 표시한다.

## Background

- 현재 성과 탭은 ACS/ADR/KAST/HS% 등 이미 노출된 지표를 큰 카드로 반복(중복)한다.
- `MatchParticipant.stats`에는 무기별 킬·상대별 듀얼 데이터가 없다(마스터 정본 G-C 슬라이스로 추가). 시즌 단위 무기 통계는 `profile-sidebar-stats.ts`에 있으나 **경기 단위가 아니므로 재사용 불가** → 경기 단위 Mock 신규 추가.
- 상세 데이터는 `mock-match-ascent-001` 1경기에만 있으므로 뷰어 기준 듀얼·무기 분포 Mock을 이 경기에 추가한다.

## Allowed Changes

- `frontend/src/types/match.ts` — `MatchParticipant.weaponKills?: WeaponKillBreakdown[]`, `MatchParticipant.duels?: DuelRecord[]`, `WeaponKillBreakdown`, `DuelRecord` 타입 추가(optional + Mock 주석).
- `frontend/src/data/mock-data.json` — `mock-match-ascent-001` 뷰어(필요 시 전 참가자)에 `weaponKills`·`duels`(opponentPuuid는 상대 팀 참가자 puuid와 일치) Mock 추가.
- `frontend/src/components/MatchPerformanceTab.tsx` — 듀얼 매트릭스·무기 분포로 재구성.
- **신규 컴포넌트 허용**: `frontend/src/components/MatchDuelMatrix.tsx`, `frontend/src/components/WeaponDistribution.tsx`(선택).
- `frontend/src/app/globals.css` — 매트릭스·무기 분포 스타일.

## Forbidden Changes

- 마스터 Forbidden 상속. 스코어보드/라운드/분석 슬라이스(G-A/B/D) 수정 금지.
- 외부 실 자산(무기 아이콘 신규 PNG 등) 신규 취득 금지 — 텍스트/CSS 막대 기반(기존 자산 재사용은 가능). 신규 패키지·Git 커밋 금지.

## Required UI Changes

1. 듀얼 매트릭스: 상대 5명 각 행에 요원·이름·내 킬/상대에게 당한 데스·우열 색상. 합계/요약(가장 많이 잡은/잡힌 상대).
2. 무기 분포: 무기별 킬 수 막대/도넛 + 비율, 상위 N개.
3. 기존 중복 지표 카드는 제거하거나 요약 1줄로 축소.

## Acceptance Criteria

1. 뷰어 기준 상대별 H2H 킬/데스가 매트릭스로 정확히 표시되고 opponentPuuid가 실제 상대 팀과 정합하는가.
2. 무기 분포가 weaponKills 기반으로 정확히 합산·표시되는가.
3. 신규 타입이 optional+Mock 주석이고 Mock/Preview 고지가 유지되는가.
4. 기존 지표 단순 반복이 제거/축소되었는가.
5. `tsc`/`lint`/`build` 통과 및 Allowed 범위 준수.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
grep -n "weaponKills\|duels\|DuelRecord\|WeaponKillBreakdown" frontend/src/types/match.ts
```

## Stop Conditions

- 외부 실 자산/신규 패키지 필요 시 중단. 동일 검증 에러 3회 시 `BLOCKED`.

## Result

(구현 후 Codex 작성)
