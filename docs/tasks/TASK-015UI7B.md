# TASK-015UI7B: 날짜별 최근 전적 + 경기 행 재설계 + KAST/DDΔ/R + 하이라이트 태그 + 인라인 상세 연결

## Status

DONE (2026-06-16)

## Goal

TASK-015UI7A(상단 구조 재구성)에 이어, 프로필 페이지(`/players/[puuid]`)의
**중앙 하단 최근 전적 영역**을 확정 시안 기준으로 재구성한다. 이 Task(UI7B)는
다음을 담당한다:

1. 날짜별 최근 전적 그룹화(그룹 헤더 + 그날 요약 통계)
2. 개별 경기 행 재설계(맵 사진 제거, 아이콘/맵명만)
3. 경기 행·날짜 그룹에 KAST·DDΔ/R 적용(UI7A에서 도입한 공유 정의 재사용)
4. 긍정/부정 하이라이트 태그(임의 생성 금지)
5. 기존 인라인 4탭 상세(스코어보드/라운드/성과/분석) 연결 유지
6. 최근 전적이 페이지 아래로 계속 이어지는 구조(내부 중첩 스크롤 금지)

상단 플레이어 카드·필터·사이드바·이번 시즌 성적·티어 그래프·최근 20판
요약은 **TASK-015UI7A에서 완료된 것으로 전제**하고 변경하지 않는다.

## Context

### 선행 상태 (TASK-015UI7A 완료 후 전제)

UI7A 완료 시 다음이 존재한다고 가정한다(미존재 시 Stop condition 참조):

- 상단 플레이어 카드 + 전체 폭 필터 바 + 재구성된 좌측 사이드바.
- 중앙 이번 시즌 성적 카드 + 티어 변동 그래프 + 최근 20판 요약.
- **DDΔ/R·KAST의 표준 정의와 가공 집계(Mock) 타입**(UI7A에서 도입). 최근
  20판 요약에서 집계 수준으로 이미 노출됨.
- 신규 Mock/가공 집계 타입·로더(헤더/시즌/티어이력/최근20)와 `getTierAssetPath`.

### 현재 경기 목록 (변경 대상)

- `frontend/src/components/MatchSummaryList.tsx` — 클라이언트 컴포넌트.
  카드 전체 클릭 인라인 펼침(한 번에 하나), `MatchScoreBadge`(경기별 Preview
  Score), `MatchDetailPanel`(4탭). **평면 목록**이며 날짜 그룹이 없다. UI6에서
  맵 사진은 이미 제거(컬러 strip만). 행에 ACS/KDA/K-D/HS%/ADR + 양 팀 요원
  요약이 있다.
- `MatchDetailPanel` + `MatchTabs`/`MatchScoreboardTab`/`MatchRoundsTab`/
  `MatchPerformanceTab`/`MatchAnalysisTab` — 인라인 4탭. **그대로 재사용**.

### 데이터/타입

- `MatchSummary { matchId, map, mapId, mode, startedAt, result, agent,
  agentId, team, score{roundsWon,roundsLost}, stats(CombatStats), primaryWeapon }`.
- `CombatStats { kills, deaths, assists, averageCombatScore,
  headshotPercentage(Mock), adr(Mock) }`.
- `MatchDetail`(ascent만): participants 10(agentId·stats 포함), rounds 22.
- `lib/score-gameprobe.ts`: `computeMatchSummaryScore`, `getGameProbeGrade`.
  재사용.
- UI7A 도입 공유 정의/타입(DDΔ/R·KAST). 재사용.

### Mock 데이터 한계 (중요)

현재 Mock에는 **라운드별 킬 이벤트·데미지(가한/받은)·KAST·클러치·첫 킬/첫
데스·멀티킬/에이스·경기별 티어 변동이 없다**. → 경기별 KAST·DDΔ/R·티어
변동·이벤트 기반 태그는 모두 **Mock/가공 집계**이며, 별도 타입/주석으로
구분한다. **라운드별 킬 이벤트 근거가 필요한 태그(멀티킬/에이스/클러치/FK/
FD)는 런타임에서 임의 생성하지 않는다.**

### 계산 가능 vs Mock 구분 (이 Task 범위)

- **기존 데이터로 계산 가능**: 경기별 Preview Score(`score-gameprobe`), 최종
  스코어·승패·K/D/A·K/D·ACS·ADR·HS%·맵·모드(MatchSummary), 라운드 승률,
  팀 내 ACS 최고(MVP, `matchDetail.participants` 있는 경기 한정), 날짜별
  그룹 평균(K/D·HS%·ACS), 임계값 기반 태그(High/Low ACS·HS·KAST 등).
- **Mock/가공 집계 신규(경기별)**: KAST, DDΔ/R(근거 또는 사전 계산값),
  경기별 티어 변동, 이벤트 기반 하이라이트 태그.

## 데이터 모델 (신규/공유)

UI7A가 도입한 DDΔ/R·KAST 정의·타입을 **재사용**한다. 경기별 가공치는 별도
타입(matchId 키)으로 둔다. UI 내부 숫자 하드코딩 금지, 기존 로더 시그니처
유지. 이름은 구현자 결정 가능:

- **MatchInsight**(경기별, matchId 키) — `{ matchId, kast(Mock),
  damageDealt?, damageReceived?, roundsPlayed?, ddDeltaPerRound(파생/Mock),
  tierChange?: { from, to } | rrDelta, highlightTags: MatchHighlightTag[] }`.
- **MatchHighlightTag** — `{ kind: "positive" | "negative", label, code,
  source: "derived" | "mock" }`.
- **DailyMatchGroup**(렌더 시 그룹화) — `{ dateLabel, matches, count, wins,
  losses, avgKd, avgDdDeltaPerRound, avgHeadshotPercentage, avgAcs }`.

신규 로더(예: `getMatchInsight(matchId)`)와 날짜 그룹화 유틸을 추가한다.
DDΔ/R 분모(roundsPlayed)가 0/없으면 `—`. 양수 청록/음수 붉은색/0 중립,
툴팁 제공.

## 하이라이트 태그 규칙 (임의 생성 금지)

- **파생 태그(source: "derived")**: 기존/Mock 수치로 결정적으로 계산 —
  High ACS / High HS / High KAST / Low ACS / Low HS / Low KAST / 팀 내 최고
  DDΔ/R / MVP(팀 내 ACS 최고, participants 있는 경기 한정). **임계값을 코드
  상수와 문서에 함께 명시**한다.
- **이벤트 태그(source: "mock")**: 멀티킬 3K/4K·에이스·1v1/1v2/1v3 클러치·
  가장 많은 FK·가장 많은 FD 등은 라운드별 킬 이벤트가 필요. 현재 근거가
  없으므로 **런타임 생성 금지**. `MatchInsight.highlightTags`에 명시적으로
  작성된 Mock 태그가 있을 때만 표시, 없으면 `—`/미표시.
- 약어: FK = First Kill, FD = First Death.
- 색상: 긍정 청록/녹색, 부정 붉은색/주황.
- 개수 제한: 한 행 최대 2~3개(모바일 1~2개) 노출, 나머지 `+N`/펼침 상세.

## 날짜별 최근 전적 / 인라인 상세

- 최근 전적을 날짜별로 그룹화하고, 그룹 헤더에 날짜·그날 경기 수·승/패·평균
  K/D·평균 DDΔ/R·평균 HS%·평균 ACS를 표시한다.
- 개별 경기 행: **맵 사진 사용 금지**(맵 아이콘 또는 맵명만). 승패·최종
  스코어·요원 이미지·요원명·K/D/A·K/D·ACS·ADR·KAST·DDΔ/R·HS%·맵·모드·티어
  변동·GameProbe Preview Score·Preview 등급·펼침 화살표.
- 최근 전적이 페이지 아래로 계속 이어지고 **내부 중첩 스크롤 없음**(길면 "더
  보기" 사용 가능).
- 인라인 4탭(스코어보드/라운드/성과/분석)을 유지하고 동일 경기 상세 데이터
  모델을 재사용한다. 펼침 시 날짜 그룹 헤더는 유지하고 **중복 요약 카드 추가
  금지**, 행에 이미 보이는 정보 반복 최소화.

## 반응형

- 최근 전적은 전체 폭(태블릿)·단일 컬럼(모바일). 모바일 행은 2~3줄 카드형
  (날짜 그룹 헤더 유지), 태그 최대 1~2개. 페이지 내부 중첩 스크롤 금지.

## Dependencies

- TASK-015UI7A (선행) — 상단 구조 + DDΔ/R·KAST 공유 정의/타입 + 신규 로더.

## Allowed changes

```
frontend/src/components/MatchSummaryList.tsx   # 날짜 그룹화 + 행 재설계 + 태그
frontend/src/components/**                      # 신규 날짜그룹/경기행/하이라이트 태그 컴포넌트
frontend/src/types/**                           # MatchInsight/MatchHighlightTag/DailyMatchGroup 등
frontend/src/data/**                            # 경기별 insight Mock 데이터
frontend/src/lib/**                             # getMatchInsight·날짜 그룹화·태그 deriver
frontend/src/app/globals.css                    # 날짜 그룹/경기 행/태그/반응형 스타일
docs/tasks/TASK-015UI7B.md                       # 이 문서의 Result 갱신
docs/PLAN.md                                     # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                                 # 작업 로그 추가
```

> 인라인 상세 컴포넌트(`MatchDetailPanel`/`MatchTabs`/`Match*Tab`)는 연결만
> 유지하고 4탭 구조를 변경하지 않는다. 상단 구조(헤더/필터/사이드바/시즌/
> 그래프/최근20)는 UI7A 산출물이므로 이 Task에서 재설계하지 않는다(태그/행과
> 무관한 변경 금지).

## Forbidden changes

- `backend/**`, `docker/**`, `scripts/**`.
- `frontend/package.json`, `frontend/package-lock.json`, 새 npm 패키지 설치
  (순수 React + CSS/SVG).
- 실제 Riot API 호출, 실제 AI 분석 로직.
- `score-gameprobe.ts`의 가중치/정규화/등급 변경, UI7A가 정한 DDΔ/R·KAST
  정의 변경.
- OP.GG/Tracker.gg 디자인 복제.
- 홈/privacy/terms/connect·공통 헤더/푸터 대규모 변경.
- `/matches/[matchId]` 라우트 삭제, `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline` 구조 변경, 인라인 4탭 구조 변경.
- 기존 로더·`asset-map` 함수 시그니처 변경.
- 상단 구조(플레이어 카드/필터/사이드바/시즌 성적/티어 그래프/최근20 요약)
  재설계(UI7A 범위).
- 경기 행에 **맵 사진(큰 맵 이미지)** 사용.
- 라운드별 킬 이벤트 근거 없이 멀티킬/에이스/클러치/FK/FD 태그 런타임 생성.
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI7A.md`, 그 외
  `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 작업 시작.

## Acceptance criteria

### 1. 날짜별 그룹화

- [x] 최근 전적이 날짜별로 그룹화되고, 그룹 헤더에 날짜·그날 경기 수·승/패·
  평균 K/D·평균 DDΔ/R·평균 HS%·평균 ACS가 표시된다.
- [x] 최근 전적이 페이지 아래로 계속 이어지고 내부 중첩 스크롤이 없다(길면
  "더 보기" 사용 가능).

### 2. 경기 행 재설계

- [x] 개별 경기 행에 **맵 사진을 사용하지 않고**(맵 아이콘/맵명만) 승패·최종
  스코어·요원 이미지·요원명·K/D/A·K/D·ACS·ADR·KAST·DDΔ/R·HS%·맵·모드·티어
  변동·GameProbe Preview Score·Preview 등급·펼침 화살표가 표시된다.
- [x] KAST·DDΔ/R가 UI7A 정의를 재사용하며, DDΔ/R는 양수=청록/음수=붉은색/0=
  중립으로 표시되고 접근 가능한 툴팁/설명이 있다. 분모가 없으면 `—`.
- [x] KAST·DDΔ/R·경기별 티어 변동이 가공 집계(Mock) 필드임이 타입/주석으로
  명시된다.

### 3. 하이라이트 태그

- [x] 개별 경기 행에 긍정(청록/녹색)·부정(붉은색/주황) 태그가 표시되고, 한
  행 최대 2~3개(모바일 1~2개) 노출 후 나머지는 `+N`/펼침 상세로 표시된다.
- [x] 파생 태그의 임계값이 코드·문서에 명시된다.
- [x] 이벤트 기반 태그(멀티킬/에이스/클러치/FK/FD)는 Mock 근거가 있을 때만
  표시되고 근거가 없으면 생성되지 않는다.

### 4. 인라인 상세 / 구조

- [x] 인라인 4탭(스코어보드/라운드/성과/분석)이 유지되고, 펼침 시 날짜 그룹
  헤더가 유지되며 중복 요약 카드가 추가되지 않는다.
- [x] 상단 구조(UI7A 산출물)는 이 Task에서 재설계되지 않는다.
- [x] 모바일 행이 2~3줄 카드형으로 전환되고 날짜 그룹 헤더가 유지되며 페이지
  내부 중첩 스크롤이 없다.

### 5. 데이터 모델

- [x] 경기별 가공치(KAST/DDΔ/R/티어 변동/태그)가 기존 `Player`/`Match*`
  타입을 오염시키지 않고 별도 타입/데이터/로더(matchId 키)로 관리되며 UI
  내부 숫자 하드코딩이 없다.
- [x] 기존 로더·`asset-map` 함수 시그니처가 불변이다.

### 6. 빌드 및 범위

- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.
- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`
  출력이 비어 있다.
- [x] `grep -rn "riotcdn.net\|media.valorant-api" frontend/src` 출력이 비어
  있다.

## Verification commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build

# 경기 행에 큰 맵 listview 이미지 사용 없음 확인 (육안/코드 검토)
grep -rn "getMapAssetPath" frontend/src/components

# DDΔ/R 표기 통일 및 양수/음수/0 처리 확인
grep -rn "DDΔ/R\|ddDeltaPerRound" frontend/src

# 외부 Riot CDN 런타임 참조 없음 (출력 없어야 함)
grep -rn "riotcdn.net\|media.valorant-api" frontend/src

# 기존 로더 시그니처 유지
grep -n "export function getRecentMatchesForPlayer\|export function getMatchDetail" frontend/src/lib/mock-data.ts

# 변경 금지 영역 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts
```

## Stop conditions

`BLOCKED`로 보고:

1. 새 npm 패키지 설치가 반드시 필요한 경우.
2. 기존 로더 또는 `asset-map` 함수 시그니처 변경이 불가피한 경우.
3. TASK-015UI7A 산출물(상단 구조·DDΔ/R·KAST 공유 정의/타입·신규 로더)이
   없어 이 Task를 시작할 수 없는 경우 — UI7A 완료를 먼저 요청한다.
4. 실제 Riot API 호출 없이는 필수 전적 행 구조 구현이 불가능한 경우.
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

BLOCKED가 **아님**(계속 진행):

- `matchDetails`가 ascent 1건뿐이라 일부 경기에서 MVP/팀 내 최고 DDΔ/R 등
  participant 기반 태그가 비고 다른 경기는 행 단위 지표만 표시되는 경우.
- 날짜별 그룹이 각 1경기씩 3개로 나뉘는 경우(현재 Mock이 3개 날짜이므로
  정상).
- 이벤트 기반 태그가 Mock 근거 없는 경기에서 표시되지 않는 경우(의도된
  동작).

## Result

### 변경 파일

- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/data/match-insights.ts`
- `frontend/src/lib/match-insights.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/match-insight.ts`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI7B.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

### 구현 결과

- 최근 전적을 `DailyMatchGroup` 기준 날짜별 그룹으로 렌더링하고, 그룹 헤더에
  날짜, 경기 수, 승/패, 평균 K/D, 평균 DDΔ/R, 평균 HS%, 평균 ACS를 표시했다.
- 경기 행은 맵 사진 없이 CSS 기반 작은 맵 아이콘과 맵명만 표시한다.
- 경기 행에 승패, 시간, 모드, 스코어, 요원, K/D/A, K/D, ACS, ADR, KAST,
  DDΔ/R, HS%, 티어 변동, Match Preview Score, 등급, 펼침 화살표를 표시했다.
- `MatchInsight`, `MatchHighlightTag`, `DailyMatchGroup`을 별도 타입으로 추가하고
  `getMatchInsight(matchId)` 로더와 날짜 그룹화/태그 파생 유틸을 추가했다.
  기존 `Player`/`Match*` 타입과 기존 Mock 데이터 로더 시그니처는 변경하지 않았다.
- KAST, DDΔ/R, 티어 변동, 이벤트 기반 태그는 `MatchInsight`의 Mock/가공 집계
  필드로 분리했다.
- 기존 인라인 `MatchDetailPanel` 4탭 연결을 유지했다. 펼침 시 기존 상세 패널만
  연결하며 날짜 그룹 헤더와 경기 행 구조를 유지한다.
- 내부 중첩 스크롤을 추가하지 않았다. 모바일에서는 경기 행이 2~3줄 카드형으로
  자연스럽게 줄바꿈되도록 CSS grid를 조정했다.

### 파생 태그 임계값

파생 태그는 `frontend/src/lib/match-insights.ts`의
`MATCH_HIGHLIGHT_THRESHOLDS` 단일 상수로 관리한다.

- High ACS: `ACS >= 260`
- Low ACS: `ACS < 180`
- High HS: `HS% >= 30`
- Low HS: `HS% < 20`
- High KAST: `KAST >= 75`
- Low KAST: `KAST < 65`
- High DDΔ/R: `DDΔ/R >= 15`
- Low DDΔ/R: `DDΔ/R <= -10`
- MVP: 상세 참가자 데이터가 있는 경기에서 사용자 팀 내 ACS 최고일 때만 표시

멀티킬/클러치 등 이벤트 기반 태그는 런타임에서 생성하지 않고,
`MatchInsight.highlightTags`에 명시된 Mock 근거가 있을 때만 표시한다.

### 검증 결과

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `grep -rn "getMapAssetPath" frontend/src/components`: `MatchSummaryList`에는
  사용 없음. 기존 다른 컴포넌트 사용만 남아 있다.
- `grep -rn "DDΔ/R\|ddDeltaPerRound" frontend/src`: 성공. UI7A/7B 정의와
  표기 확인.
- `grep -rn "riotcdn.net\|media.valorant-api" frontend/src`: 출력 없음.
- `grep -n "export function getRecentMatchesForPlayer\|export function getMatchDetail" frontend/src/lib/mock-data.ts`:
  기존 로더 시그니처 유지 확인.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`:
  출력 없음.

### 남은 위험

- 경기별 KAST, DDΔ/R, 티어 변동, 이벤트 태그는 Mock/가공 집계 값이다. 실제 Riot
  API 연동 후 Backend 집계로 교체해야 한다.
- 현재 Mock 경기 3개가 서로 다른 날짜라 날짜 그룹은 각 1경기씩 표시된다.
