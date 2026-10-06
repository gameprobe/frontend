# TASK-015UI12G-D: 분석 탭 재설계 — 팀 전투/피해 델타 + 경제(Bank/Loadout) 그래프

## Status

READY (선행 TASK-015UI12G-C DONE·커밋 `1e50c62` 완료로 승격, Phase G 마지막 구현 Task)

> 마스터 플랜 `docs/tasks/TASK-015UI12G.md` 및 `ux_evaluation_report.md` §4 기준.
> 신규 Mock+타입 전체 승인(2026-06-24) 범위 내에서 분석 슬라이스(damageDealt/Received·economy)만 추가한다.

## Goal

정적 좌표 오버레이뿐이던 `MatchAnalysisTab.tsx`를 **팀 단위 종합 분석 화면**으로 재설계한다.

1. **팀 델타 막대 차트**: 우리 팀 vs 상대 팀을 좌우 비교 막대로 표시한다 — 총 전투 점수(ACS 합), 총 피해량(damageDealt 합), 총 킬. 어느 팀/누가 캐리·약점인지 한눈에 파악.
2. **경제(Cred) 그래프**: 라운드별 양 팀 로드아웃 가치(및 Bank)를 이중 라인/막대로 표시하고, 라운드별 경제 델타(우위 팀)를 색상으로 표현한다(에코 라운드·경제 붕괴 가시화).

## Background

- 현재 분석 탭은 색상 원(킬/데스/헤드샷)을 정적 맵에 겹칠 뿐 팀 종합이 없다. **현재 `MatchAnalysisTab`은 props를 받지 않는다**(`MatchDetailPanel.tsx:64` `<MatchAnalysisTab />`) → 본 Task에서 `matchDetail`/`viewerPuuid`를 받도록 시그니처를 바꾸고 패널 배선을 수정해야 한다.
- 총 킬·총 전투점수는 참가자 합으로 파생 가능하나, **총 피해량은 `CombatStats`에 없고** 경제 데이터도 전무 → 신규 Mock 필요(마스터 정본 G-D 슬라이스).

## Allowed Changes

- `frontend/src/types/match.ts` — `CombatStats`에 `damageDealt?: number`, `damageReceived?: number` 추가, `MatchRound.economy?: { attackersLoadout: number; defendersLoadout: number; attackersBank?: number; defendersBank?: number }` 추가(optional + Mock 주석).
- `frontend/src/data/mock-data.json` — `mock-match-ascent-001` 참가자 10명에 `damageDealt`/`damageReceived`, 라운드들에 `economy` Mock 추가(피해량·경제가 스코어/라운드 결과와 모순되지 않게).
- `frontend/src/components/MatchAnalysisTab.tsx` — 팀 델타·경제 그래프로 재구성, `matchDetail`/`viewerPuuid` props 수용.
- `frontend/src/components/MatchDetailPanel.tsx` — `MatchAnalysisTab`에 `matchDetail`/`viewerPuuid` 전달하도록 배선 수정.
- **신규 컴포넌트 허용**: `frontend/src/components/TeamDeltaChart.tsx`, `frontend/src/components/MatchEconomyChart.tsx`(선택).
- `frontend/src/app/globals.css` — 델타 막대·경제 그래프 스타일.

## Forbidden Changes

- 마스터 Forbidden 상속. 스코어보드/라운드/성과 슬라이스(G-A/B/C) 수정 금지(단, `MatchDetailPanel.tsx`는 분석 탭 배선 목적으로만 수정).
- 외부 실 자산·신규 패키지·차트 라이브러리 추가 금지(CSS/SVG 기반). Git 커밋 금지.

## Required UI Changes

1. 팀 델타: 지표별(전투점수·피해량·킬) 좌우 대칭 막대 + 수치, 우위 팀 강조.
2. 경제 그래프: 라운드(X) × 로드아웃 가치(Y) 이중 라인/막대, 라운드별 델타 색상(우위=녹/열위=적), Bank는 보조 표기(선택).
3. 기존 좌표 오버레이는 제거하거나 보조로 축소(좌표 플로터는 G-B에 통합됨).

## Acceptance Criteria

1. 팀 델타 막대가 참가자 합(전투점수·킬)과 신규 damageDealt 합으로 정확히 계산·비교되는가.
2. 경제 그래프가 라운드별 economy Mock으로 양 팀 로드아웃·델타를 정확히 표시하는가.
3. `MatchAnalysisTab`이 `matchDetail`/`viewerPuuid`를 받고 패널 배선이 정합하는가.
4. 신규 타입이 optional+Mock 주석이고 Mock/Preview 고지가 유지되는가.
5. `tsc`/`lint`/`build` 통과 및 Allowed 범위 준수.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
grep -n "damageDealt\|economy" frontend/src/types/match.ts
```

## Stop Conditions

- 외부 실 자산/신규 패키지(차트 라이브러리 포함) 필요 시 중단. 동일 검증 에러 3회 시 `BLOCKED`.

## Result

(구현 후 Codex 작성)
