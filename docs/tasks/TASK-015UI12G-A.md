# TASK-015UI12G-A: 스코어보드 고밀도 재설계 (FK/FD/MK·K/D Ratio·MVP·YOU 강조)

## Status

READY (Phase G 최초 구현 Task)

> 마스터 플랜 `docs/tasks/TASK-015UI12G.md` 및 `ux_evaluation_report.md`를 기준으로 한다.
> 신규 Mock+타입 전체 승인(2026-06-24) 범위 내에서, 스코어보드 슬라이스(FK/FD/MK)만 추가한다.

## Goal

`MatchScoreboardTab.tsx`를 OP.GG/Tracker.gg 스코어보드 수준의 고밀도 표로 재설계한다.

1. **고밀도 컬럼 추가**: 기존(요원·이름·ACS·K/D·K/D/A) 외에 **FK(First Kills)**, **FD(First Deaths)**, 계산된 **K/D Ratio**(`kills/deaths`, 소수 2자리, deaths=0이면 `kills.00`/`Perfect` 표기) 컬럼을 추가한다.
2. **MVP 마커**: 각 팀(또는 전체) `averageCombatScore` 최고 플레이어 옆에 왕관/`MVP` 마커를 표시한다(파생 계산, 신규 필드 없음).
3. **YOU 행 강조**: 로그인 플레이어(`viewerPuuid`) 행을 밝은 네온 보더 + 저투명도 채움으로 명확히 강조한다(현재 저대비 회색 텍스트 → 한눈에 식별).
4. **밀도 압축**: 행 높이·폰트·패딩을 줄여 13컬럼급 고밀도 표가 답답하지 않게 정돈한다.

## Background

- 현재 `MatchScoreboardTab.tsx`는 ACS·K/D·K/D/A만 표시하고 `you-badge`는 평면 텍스트라 대비가 약하다(`MatchScoreboardTab.tsx:109,130,137-139`).
- 팀 분리(`scoreboard-team-blue/red`)와 팀 합계 라인은 이미 존재한다(`:86,95`). MVP는 `averageCombatScore` 정렬로 파생 가능(`:49`).
- 상세 데이터는 `mock-match-ascent-001` 1경기에만 있다. FK/FD/MK Mock은 이 경기 참가자 10명에만 추가한다.

## Allowed Changes

- `frontend/src/types/match.ts` — `CombatStats`에 `firstKills?: number`, `firstDeaths?: number`, `multiKills?: number` 추가(optional + `// Mock/aggregated field` 주석).
- `frontend/src/data/mock-data.json` — `mock-match-ascent-001` 참가자 10명에 `firstKills`/`firstDeaths`/`multiKills` Mock 값 추가(팀 합계가 라운드 수와 모순되지 않게: 팀 FK 합 ≈ 승리 라운드 수 규모).
- `frontend/src/components/MatchScoreboardTab.tsx` — 컬럼·MVP 마커·YOU 강조·밀도 재설계.
- `frontend/src/app/globals.css` — 스코어보드 표 스타일(네온 YOU 행, MVP 마커, 고밀도 셀).

## Forbidden Changes

- 마스터 Forbidden 상속. 특히 라운드/성과/분석 탭·슬라이스(G-B/C/D) 수정 금지, 외부 실 자산·신규 패키지 금지, Git 커밋 금지.
- FK/FD/MK 외 신규 필드 추가 금지(K/D Ratio·MVP는 파생).

## Required UI Changes

1. 표 헤더에 FK·FD·K/D Ratio 컬럼을 추가하고, 모바일에서는 핵심 컬럼만 노출되도록 반응형 처리(가로 스크롤 또는 컬럼 우선순위).
2. 팀별 `averageCombatScore` 최고 1명에 `MVP` 마커(왕관 아이콘/배지) 표시.
3. `viewerPuuid` 행: `box-shadow`/`border`로 네온 강조 + 저투명도 배경 채움. 기존 `you-badge`도 대비 강화.
4. 행 높이·폰트·패딩 압축으로 고밀도 정돈, 팀 win/loss 톤(`scoreboard-team-win/loss`) 유지.

## Acceptance Criteria

1. 스코어보드에 FK·FD·K/D Ratio 컬럼이 표시되고, FK/FD는 Mock 값, K/D Ratio는 `kills/deaths` 파생값으로 정확히 계산되는가(deaths=0 안전 처리).
2. 팀별 ACS 최고 플레이어에 MVP 마커가 정확히 1명씩 표시되는가.
3. 로그인 플레이어 행이 네온 보더+채움으로 한눈에 식별되는가.
4. 신규 FK/FD/MK가 optional+Mock 주석으로 추가되고 Mock/Preview임이 유지되는가.
5. `tsc`/`lint`/`build` 통과 및 Allowed 범위 준수.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
grep -n "firstKills\|firstDeaths\|multiKills" frontend/src/types/match.ts
```

## Stop Conditions

- 외부 실 자산/신규 패키지 필요 시 중단. 동일 검증 에러 3회 시 `BLOCKED`.

## Result

(구현 후 Codex 작성)
