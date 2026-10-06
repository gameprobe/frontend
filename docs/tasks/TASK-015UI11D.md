# TASK-015UI11D: 경기 상세 스코어보드 정리 (API 신청용)

## Status

READY (구조 정리분) + HUMAN-DECISION-GATE (요원 이미지/랭크 컬럼분)

**분류:**
- 구조 정리(팀 구분·자기 행 하이라이트·컬럼 정렬): **Safe with existing data**
- 요원 이미지 placeholder 제거(10요원 완성): **Requires new assets** (UI9B 게이트)
- 참가자별 랭크 컬럼: **Requires new mock data** (현재 데이터에 없음)

## Goal

경기 상세 **스코어보드**(`MatchScoreboardTab`)를 실제 전적 서비스처럼 팀 구분·
자기 행 강조·컬럼 위계로 정리한다. 기존 데이터로 가능한 구조 정리를 먼저 하고,
**신규 자산/Mock이 필요한 부분은 Human Decision Gate**로 분리한다.

## Background

- 스코어보드는 `MatchDetail.participants`(10명)를 표시하나, 요원 PNG가 3/10만
  실물이고 7명은 placeholder다(reference audit).
- 팀 구분/자기 행 하이라이트/컬럼 위계가 약해 "운영 서비스" 밀도가 부족하다.

## User Value for Riot API Application

- 팀별 구분·자기 행 강조·정렬된 컬럼은 전적 서비스 스코어보드의 표준이며,
  심사자에게 익숙한 신뢰 구조를 제공한다.
- 요원 이미지가 완성되면 완성도가 크게 오르지만, 자산 확보(라이선스/출처)가
  선행돼야 하므로 사람 결정 게이트로 둔다.

## Reference Direction

- 참고: 팀 분리 헤더, 자기 행 하이라이트, 컬럼 구성(요원·KDA·ACS·ADR·HS%)의
  **배치·정렬·강조**만.
- 금지: 디자인 픽셀 복제, 데이터 없는 컬럼(econ rating, 참가자 티어 등) 신설.

## Allowed Changes

- `frontend/src/components/MatchScoreboardTab.tsx` — 팀 구분·자기 행 하이라이트·
  기존 컬럼 정렬/위계 정리(기존 `CombatStats` 컬럼 한정).
- `frontend/src/app/globals.css` — 스코어보드 스타일만.
- 문서: 이 Task 문서.

> 요원 이미지 자산 추가, 신규 컬럼(랭크/econ)은 **Allowed에서 제외**. 자산/Mock
> 결정 승인 후 별도 범위로만 진행한다.

## Forbidden Changes

- 신규 외부 자산(요원 PNG 포함)·`public/assets`·`SOURCES.md`·`asset-map.ts`
  변경 — **UI9B 결정 전 금지**.
- 신규 Mock 데이터/타입 필드(참가자 티어·econ 등) — **금지**.
- 신규 패키지, backend/docker/scripts.
- 상단/요약(UI11B)·최근 경기(UI11C)·라운드/성과/분석(UI11E)·사이드바(UI11F)
  구현 착수.
- OP.GG/Tracker pixel-perfect 복제, 런타임 외부 URL, `Math.random`.
- Git add/commit/push.

## Existing Data / Assets Available

- `MatchDetail.participants[]` = `MatchParticipant`: puuid, riotId, team, agent,
  agentId, `CombatStats`(kills/deaths/assists/ACS/adr/HS%). → 팀 구분·자기 행
  매칭(puuid)·컬럼 정렬 **가능**.
- 에셋: 요원 PNG는 jett/sova/omen만 실물(나머지 placeholder fallback), 티어
  이미지 다수 존재.
- **없음**: 참가자별 티어/랭크, econ/loadout 값 → 신규 Mock 필요(이 Task 금지).

## Required UI Changes

### 즉시 가능 (Safe with existing data)
1. **팀 분리 헤더**(아군/적군 또는 팀 A/B)로 10명을 두 그룹으로 나눈다.
2. **자기 행 하이라이트**(프로필 puuid와 일치하는 participant 강조).
3. 기존 컬럼(요원·KDA·ACS·ADR·HS%)을 정렬/위계 정리(컬럼 추가 없음).

### Human Decision Gate (이 Task에서 구현하지 않음)
4. 요원 이미지 10요원 완성(placeholder 제거) → **UI9B 자산 결정** 승인 후.
5. 참가자별 랭크 컬럼 → 신규 Mock 결정 필요(현재 데이터 없음).

## Required Human Decisions

- **(게이트) 요원 이미지 자산**: 누락 7요원 PNG 취득/출처/라이선스 승인 여부
  (UI9B). 미승인 시 placeholder 유지.
- **(게이트) 참가자 랭크 컬럼**: 신규 Mock 필드 추가 승인 여부. 미승인 시 컬럼
  신설하지 않음.
- 자기 행 강조 기준(프로필 puuid 매칭) 확정.

## Acceptance Criteria

1. 스코어보드가 팀별로 구분되고 자기 행이 강조된다(기존 데이터만).
2. 기존 컬럼이 정렬/정돈되며, 데이터 없는 신규 컬럼(랭크/econ)은 추가되지 않는다.
3. 요원 placeholder는 정직하게 유지된다(임의 이미지/더미 없음).
4. 신규 Mock/타입/자산/패키지 추가가 없다.
5. 다른 UI11 영역 미변경. `tsc`/`lint`/`build` 통과.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts
git diff -- frontend/src/lib/asset-map.ts frontend/src/lib/score-gameprobe.ts
git status --porcelain -- frontend/src/components/PlayerHeaderCard.tsx frontend/src/components/MatchSummaryList.tsx frontend/src/components/MatchRoundsTab.tsx frontend/src/components/MatchPerformanceTab.tsx frontend/src/components/MatchAnalysisTab.tsx frontend/src/components/ProfileSidebar.tsx
grep -RnE "https?://|Math.random" frontend/src/components frontend/src/app/globals.css || true
```

## Stop Conditions

- 요원 이미지 완성·랭크 컬럼 등 자산/Mock이 필요한 작업이 시작되면 즉시 중단하고
  UI9B/Mock 결정을 요청한다(가드레일 5장).
- 스코어보드 외 영역을 건드려야 하면 중단.
- 같은 검증 실패 3회 반복 시 `BLOCKED` 보고.

## Codex Implementation Notes

- 변경 파일:
  - `frontend/src/components/MatchScoreboardTab.tsx`
  - `frontend/src/app/globals.css`
- 팀 구분/자기 행 강조 방식:
  - 기존 `matchSummary.team`과 participant `team` 값으로 우리 팀/상대 팀 분리 유지.
  - 팀 헤더에 기존 라운드 스코어, 팀 K/D/A 합계, 평균 ACS를 표시해 팀별 흐름을
    빠르게 읽히도록 정리.
  - `viewerPuuid`와 일치하는 participant 행은 기존 `YOU` 배지와 강조 배경/좌측
    accent를 유지·강화.
- 사용한 기존 필드:
  - `MatchSummary.score.roundsWon/roundsLost`, `MatchSummary.team`, `MatchSummary.result`
  - `MatchParticipant.team`, `MatchParticipant.puuid`, `riotId`, `agent`, `agentId`
  - `CombatStats.kills/deaths/assists/averageCombatScore/adr/headshotPercentage`
- 게이트 항목 미착수:
  - 참가자별 랭크/econ 컬럼 추가 없음.
  - 누락 요원 이미지 자산 추가 없음. 기존 `getAgentAssetPath` fallback/placeholder 유지.
  - 신규 Mock, 타입 필드, 외부 자산, 패키지 없음.
- 검증 결과:
  - `cd frontend && npx tsc --noEmit`: 성공.
  - `cd frontend && npm run lint`: 성공.
  - `cd frontend && npm run build`: 성공.
  - `git diff --check`: 성공.
  - Forbidden scope checks: 성공.

## Cursor Review Notes

(리뷰 후 기록: 게이트 준수(자산/랭크 미착수), AC 충족, BLOCKER/MAJOR/MINOR,
커밋 가능 여부.)
