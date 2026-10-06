# TASK-015UI11E: 라운드 상세 / 성과 / 분석 정리 (API 신청용)

## Status

IMPLEMENTED_VERIFIED (구조 정리분) + HUMAN-DECISION-GATE (라운드 이벤트분) + DEFERRED (분석 실질분)

**분류:**
- 라운드 결과·구간·성과 카드 문법 정리(기존 데이터): **Safe with existing data**
- 라운드 첫 킬/스파이크/클러치 이벤트 표시: **Requires new mock data** (UI9C 게이트)
- 평균 대비 비교·통계 기반 분석 실질: **Should wait until after API approval** (Phase 5)

## Goal

경기 상세의 **라운드 상세·성과·분석 탭**을 카드 문법·정보 위계 측면에서 정리한다.
UI8B 라운드 타임라인을 보존하고, 기존 데이터로 가능한 정돈을 먼저 한다. **라운드
이벤트(신규 Mock)**와 **통계 기반 분석(기준 통계)**은 각각 게이트/후순위로 분리한다.

## Background

- 라운드 탭은 UI8B 타임라인(결과 칩·구간 요약·압축 로그·선택 상세)을 갖췄으나,
  `MatchRound`에는 endType·scoreAfterRound만 있고 **첫 킬/스파이크/클러치 이벤트
  필드가 없다**(reference audit).
- 성과 탭은 `CombatStats` 기반 지표를, 분석 탭은 Mock Preview 예시 점수(72/68/—/61)를
  보여준다. 평균 대비 비교 기준 통계는 아직 없다(Phase 5 의존).

## User Value for Riot API Application

- 라운드 흐름과 성과를 일관된 카드 문법으로 정돈하면 경기 상세의 완성도가 오른다.
- 데이터가 없는 이벤트/통계를 임의로 만들지 않고 **정직하게 표현**하는 것이 심사
  신뢰에 유리하다(과장된 분석은 오히려 위험).

## Reference Direction

- 참고: 라운드별 결과·이긴 방식 표기, 성과 지표의 비교 맥락 표현의 **구조**만.
- 금지: 데이터 없는 이벤트/그래프 신설, 디자인 픽셀 복제, 표본 없는 단정적 분석.

## Allowed Changes

- `frontend/src/components/MatchRoundsTab.tsx` — UI8B 타임라인 보존하며 카드/라벨
  위계 정리(endType·scoreAfterRound 기존 필드 한정).
- `frontend/src/components/MatchPerformanceTab.tsx` — 기존 `CombatStats` 지표의
  카드 문법/그룹 정리.
- `frontend/src/components/MatchAnalysisTab.tsx` — Mock Preview 고지 강화/정돈
  (예시값 명시 유지).
- `frontend/src/app/globals.css` — 위 탭 스타일만.
- 문서: 이 Task 문서.

> 라운드 이벤트 표시, 평균 대비 비교 수치는 Allowed에서 제외(게이트/후순위).

## Forbidden Changes

- 신규 Mock 데이터/타입 필드(라운드 이벤트: 첫 킬/스파이크/클러치/멀티킬 등) —
  **UI9C 결정 전 금지**.
- 표본 없는 통계 기반 단정 분석·평균 대비 수치 신설 — **API 승인/Phase 5 전 금지**.
- 신규 외부 자산·패키지, backend/docker/scripts.
- 상단/요약·최근 경기·스코어보드·사이드바 구현 착수.
- OP.GG/Tracker pixel-perfect 복제, 런타임 외부 URL, `Math.random`.
- Git add/commit/push.

## Existing Data / Assets Available

- `MatchRound`: roundNumber, winningTeam, **endType**, scoreAfterRound
  (attackers/defenders). → 라운드 결과·이긴 방식·점수 진행 표시 가능.
- 성과: `MatchParticipant.CombatStats`(kills/deaths/assists/ACS/adr/HS%),
  `MatchInsight`(kast, damageDealt/Received, roundsPlayed). → 기존 지표 정리 가능.
- 분석: 기존 Mock Preview 예시 점수(표시는 예시값 명시).
- **없음**: 라운드 이벤트(첫 킬/스파이크/클러치), 평균 대비 기준 통계.

## Required UI Changes

### 즉시 가능 (Safe with existing data)
1. UI8B 라운드 타임라인을 보존하며 라운드 결과·`endType`·점수 진행의 카드/라벨
   위계를 정리한다.
2. 성과 탭의 기존 지표를 카드 문법으로 그룹·정렬(지표 추가 없음).
3. 분석 탭의 예시값이 **Mock Preview**임을 명확히 유지/강화한다.

### Human Decision Gate / Deferred (이 Task에서 구현하지 않음)
4. 라운드 첫 킬/스파이크/클러치 등 이벤트 표시 → **UI9C Mock 결정** 승인 후.
5. 평균 대비 비교·통계 기반 분석 코멘트 → **API 승인 후 Phase 5**(기준 통계).

## Required Human Decisions

- **(게이트) 라운드 이벤트 Mock**: 첫 킬/스파이크/클러치 등 신규 이벤트 Mock·
  schema 추가 승인 여부(UI9C). 미승인 시 endType/score만 표시.
- **(후순위) 분석 실질**: 평균 대비 비교를 Phase 5 기준 통계 확보 후로 미루는 것
  확정(기본). 그 전까지 예시값 명시 유지.
- 성과 지표 그룹핑 기준.

## Acceptance Criteria

1. UI8B 라운드 타임라인이 보존되고, 라운드 결과·성과 카드 문법이 정돈된다.
2. 라운드 이벤트/평균 대비 수치 등 데이터 없는 표시는 추가되지 않는다.
3. 분석 탭 예시값이 Mock Preview로 명시된다.
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
# 라운드 이벤트/난수 미사용 확인
grep -RnE "firstKill|firstBlood|clutch|multikill|spike planter|defuser|Math.random|https?://" frontend/src/components/MatchRoundsTab.tsx frontend/src/components/MatchPerformanceTab.tsx frontend/src/components/MatchAnalysisTab.tsx || true
# UI8B 타임라인 보존 확인
grep -RnE "ROUND_PHASES|round-chip|round-phase" frontend/src/components/MatchRoundsTab.tsx
git status --porcelain -- frontend/src/components/PlayerHeaderCard.tsx frontend/src/components/MatchSummaryList.tsx frontend/src/components/MatchScoreboardTab.tsx frontend/src/components/ProfileSidebar.tsx
```

## Stop Conditions

- 라운드 이벤트나 평균 대비 통계가 필요해지면 즉시 중단하고 UI9C/Phase 5 결정을
  요청한다(가드레일 5장: 신규 Mock 금지).
- 라운드/성과/분석 외 영역을 건드려야 하면 중단.
- 같은 검증 실패 3회 반복 시 `BLOCKED` 보고.

## Codex Implementation Notes

- UI8B 타임라인 구조(`ROUND_PHASES`, `round-chip`, `round-phase`)는 유지했다.
- 라운드 탭은 기존 `MatchRound.roundNumber`, `winningTeam`, `endType`,
  `scoreAfterRound`만 사용해 구간 범위, 승/패, 종료 스코어, 종료 타입, 선택 라운드
  상세의 위계를 정리했다. 첫 킬/스파이크/클러치/멀티킬 이벤트는 추가하지 않았다.
- 성과 탭은 기존 `CombatStats`의 K/D/A, K/D, ACS, ADR, HS%와 참가자 ACS 정렬만
  사용해 개인 핵심 지표와 팀별 ACS leader 영역을 분리했다.
- 분석 탭은 기존 예시값 72/68/—/61을 유지하고, `Mock Preview only`, `예시값`,
  `미산정` 표시로 실제 분석/공식 지표가 아님을 강화했다.
- 신규 Mock 데이터, 신규 타입 필드, 신규 외부 자산, 신규 패키지, backend/docker/
  scripts 변경은 없다.
- 상단/요약, 최근 경기 리스트, 스코어보드, 사이드바, UI11F/G 범위는 수정하지
  않았다.
- 검증: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check`,
  금지 경로/라운드 이벤트 grep, UI8B 타임라인 보존 grep 모두 통과.
- Git add/commit/push는 Task 금지 사항에 따라 수행하지 않았다.

## Cursor Review Notes

(리뷰 후 기록: 라운드 이벤트/통계 미착수 확인, 분석 예시값 명시, AC 충족,
BLOCKER/MAJOR/MINOR, 커밋 가능 여부.)
