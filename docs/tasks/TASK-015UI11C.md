# TASK-015UI11C: 최근 경기 리스트 정리 (API 신청용)

## Status

READY (Cursor 리뷰 → 승인 시 Codex 구현)

**분류: Safe with existing data.** (신규 Mock/자산/타입 불필요)

## Goal

프로필 페이지의 **최근 경기 리스트**(`MatchSummaryList`)를 실제 전적 서비스처럼
빠르게 스캔되도록 정보 위계를 정리한다. 승패 강조·핵심 지표 압축·행 밀도만
다루며, **기존 데이터로 표현 가능한 UI만** 허용한다. OP.GG/Tracker는 정보 구조
참고용이며 디자인을 복제하지 않는다.

이 Task는 UI11 마스터 플랜(`TASK-015UI11A`)의 두 번째 영역이며 **최근 경기
리스트만** 다룬다(상단/요약은 UI11B, 경기 상세는 UI11D 이후).

## Background

- UI7B에서 날짜 그룹·하이라이트 태그·인라인 펼침·KAST/DDΔ/R 구조가, UI9A에서
  `match-stat-pill` 기반 스캔성이 도입됐다.
- 현재 행은 K/D/A·K/D·ACS·ADR·KAST·DDΔ/R·HS%·티어 변동을 모두 노출해 지표가
  많고 승패 시각 강조가 약하다는 점이 reference audit에서 지적됐다.

## User Value for Riot API Application

- 심사자가 경기 목록에서 **승패·핵심 성과·맵/모드**를 즉시 읽을 수 있으면
  "운영 중인 전적 서비스"의 첫인상을 준다.
- 모든 값은 기존 Mock이며 `Mock / Preview` 맥락을 유지해 데이터 출처를 정직하게
  드러낸다.

## Reference Direction

- 참고: 좌측 승패 컬러 바, 맵/모드/시간, 요원 아이콘, KDA + 핵심 지표 2~3개,
  펼침 상세의 **배치·읽기 흐름**만.
- 금지: 색/타이포/아이콘 픽셀 복제, 광고 행, 외부 위젯.

## Allowed Changes

- `frontend/src/components/MatchSummaryList.tsx` — 행 레이아웃·승패 강조·지표
  위계 정리.
- (선택) 경기 행/지표용 작은 보조 presentational 컴포넌트(기존 타입만 사용).
- `frontend/src/app/globals.css` — 최근 경기 리스트 관련 스타일만.
- 문서: 이 Task 문서(Result/Notes).

## Forbidden Changes

- 신규 Mock 데이터/타입 필드(`frontend/src/data`·`frontend/src/types`).
- 신규 외부 자산(`public/assets`·`SOURCES.md`·`asset-map.ts`), 신규 패키지.
- backend/docker/scripts.
- 상단/요약(UI11B)·스코어보드(UI11D)·라운드/성과/분석(UI11E)·사이드바(UI11F)
  구현 착수.
- OP.GG/Tracker pixel-perfect 복제, 런타임 외부 URL, `Math.random`.
- Git add/commit/push.

## Existing Data / Assets Available

- `MatchSummary`: map, mapId, mode, startedAt, result, agent, agentId, team,
  score(roundsWon/Lost), `CombatStats`(kills/deaths/assists/ACS/adr/HS%),
  primaryWeapon.
- `MatchInsight`: kast, damageDealt/Received, roundsPlayed, tierChange,
  highlightTags(source가 derived/mock로 이미 표기됨).
- `DailyMatchGroup`: 날짜 그룹·count·wins·losses·avgKd·avgDdDeltaPerRound·
  avgHeadshotPercentage·avgAcs.
- 에셋: 요원 PNG는 jett/sova/omen만 실물, 나머지는 placeholder fallback. 맵은
  ascent/haven/split만 실물. → 아이콘 **정렬/표시**는 가능하나 전체 커버리지
  완성은 신규 자산(UI9B/UI9D 영역)으로 분리.

## Required UI Changes

1. 행 좌측에 **승패 시각 강조**(컬러 바/마커)를 추가한다 — `result` 기반, 기존
   데이터.
2. 지표를 **핵심 우선순위로 압축**한다: KDA·K/D·ACS를 1차, 나머지(ADR·KAST·
   DDΔ/R·HS%)는 보조 위계 또는 펼침으로. 지표 자체는 추가/삭제하지 않는다.
3. 맵/모드/시간·요원 아이콘 정렬을 정돈해 스캔성을 높인다(요원/맵 아이콘은 기존
   에셋, 없는 경우 placeholder 유지).
4. 날짜 그룹 헤더의 일별 요약(`DailyMatchGroup`) 위계를 정리한다.
5. UI7B 펼침 상세·하이라이트 태그·인라인 상세 연결을 보존한다.

## Required Human Decisions

- 핵심 지표 1차 노출 집합(KDA·K/D·ACS 기본) vs 더 압축(KDA·결과만).
- 보조 지표를 펼침으로 숨길지, 축약 표기로 항상 노출할지.
- 요원/맵 아이콘 전체 커버리지(신규 자산)는 이 Task가 아니라 UI9B/UI9D 게이트로
  둘지 확인(기본: 둠).

## Acceptance Criteria

1. 행에서 승패가 즉시 구분되고 핵심 지표(KDA·K/D·ACS)가 우선 읽힌다.
2. 기존 지표·날짜 그룹·하이라이트 태그·펼침 상세가 보존된다(지표 추가/삭제 없음).
3. 신규 Mock/타입/자산/패키지 추가가 없다.
4. 상단/요약·스코어보드·라운드/성과/분석·사이드바는 변경되지 않는다.
5. `tsc`/`lint`/`build` 통과.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts
git diff -- frontend/src/lib/asset-map.ts frontend/src/lib/score-gameprobe.ts
# 다른 UI11 영역 미착수 확인
git status --porcelain -- frontend/src/components/PlayerHeaderCard.tsx frontend/src/components/MatchScoreboardTab.tsx frontend/src/components/MatchRoundsTab.tsx frontend/src/components/MatchPerformanceTab.tsx frontend/src/components/MatchAnalysisTab.tsx frontend/src/components/ProfileSidebar.tsx
grep -RnE "https?://|Math.random" frontend/src/components frontend/src/app/globals.css || true
```

## Stop Conditions

- 보여주려는 지표/값이 기존 데이터에 없으면 중단·보고(신규 Mock 금지).
- 요원/맵 아이콘 전체 커버리지 등 신규 자산이 필요해지면 중단(UI9B/UI9D 게이트).
- 리스트 외 영역을 건드려야 하면 중단(다른 UI11 Task 범위).
- 같은 검증 실패 3회 반복 시 `BLOCKED` 보고.

## Codex Implementation Notes

(구현 후 기록: 실제 변경 파일, 사용한 기존 필드, 승패 강조/지표 압축 방식,
검증 결과, Stop Condition 해당 여부.)

## Cursor Review Notes

(리뷰 후 기록: Allowed/Forbidden 준수, 다른 영역 미착수, AC 충족, 디자인 복제
아님, BLOCKER/MAJOR/MINOR, 커밋 가능 여부.)
