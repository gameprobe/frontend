# TASK-015UI7A: 프로필 상단 구조 재구성 (헤더 카드·필터·사이드바·시즌 성적·티어 그래프·최근 20판)

## Status

DONE (2026-06-16)

## Goal

TASK-015UI6(DONE)까지 만들어진 GameProbe 플레이어 프로필 페이지
(`/players/[puuid]`)의 **상단·좌측·중앙 상단 구조**를 확정 시안 기준으로
재구성한다. 이 Task(UI7A)는 다음을 담당한다:

1. 상단 플레이어 카드(좌측 사이드바 + 중앙 전체 폭을 가로지름)
2. 플레이어 카드 바로 아래 전체 폭 필터 바
3. 좌측 고정 통계 사이드바 재구성(현재 시즌 최고 기록 제거)
4. 좌측 — 전체 시즌 최고 기록 큰 카드
5. 좌측 — 이전 시즌 티어 리스트
6. 좌측 — 헤드샷률 / 역할군 승률 / 주요 무기 / 맵별 승률
7. 중앙 — 이번 시즌 성적 카드
8. 중앙 — 날짜별 티어/누적 랭크 점수 변동 그래프
9. 중앙 — 최근 20판 성적 요약(그래프 없음)
10. 필요한 티어 공식 자산 선별 추가

**날짜별 최근 전적 목록·개별 경기 행 재설계·하이라이트 태그·KAST/DDΔ/R의
경기별·날짜별 적용·인라인 상세 연결은 후속 TASK-015UI7B에서 한다.** 이
Task에서는 기존 `MatchSummaryList`(UI6 상태) 렌더링을 그대로 두거나 위치만
유지하고, 행 재설계는 건드리지 않는다.

시각 방향: 현재 GameProbe 다크 네이비·청록 스타일을 유지하고, OP.GG·
Tracker.gg의 정보 구조만 참고하되 디자인을 그대로 복제하지 않는다. 페이지
내부 중첩 스크롤은 금지한다.

## Context

### 현재 구조 (TASK-015UI6 결과, 변경 전)

- `frontend/src/app/players/[puuid]/page.tsx` — `<main className=
  "placeholder-page profile-page">` 안에서 `PlayerProfile`을 렌더링한다.
- `frontend/src/components/PlayerProfile.tsx` — **서버 컴포넌트**.
  `.profile-layout`(2열: `ProfileSidebar` + `.profile-main`). `.profile-main`에
  `ProfileScoreCard` + 최근 경기(`MatchSummaryList`).
- `frontend/src/components/ProfileScoreCard.tsx` — Riot ID, 현재/최고 티어
  텍스트, 종합 Preview Score(`MatchScoreBadge`), 핵심 지표 그리드, 최근 승패
  흐름.
- `frontend/src/components/ProfileSidebar.tsx` — 현재 랭크, 주 사용 요원,
  UI6 Mock 패널(최고 랭크/역할별 승률/정확도 분포/주 무기/맵별 승률/활동
  시간대/자주 함께한 플레이어). `ProfileSidebarStats`를 prop으로 받는다.
- `frontend/src/components/MatchSummaryList.tsx` — 클라이언트 컴포넌트,
  인라인 4탭 펼침. **이 Task에서는 구조를 바꾸지 않고 위치만 유지**한다.

### 현재 데이터/타입 (변경 전)

- `types/player.ts`: `Player { puuid, riotId, currentRank, statsSummary,
  recentMatches }`, `PlayerStatsSummary { matchesPlayed, wins, losses,
  winRate, averageKills, averageDeaths, averageAssists, averageCombatScore,
  topAgents }`.
- `types/match.ts`: `MatchSummary`, `CombatStats { ..., headshotPercentage,
  adr }`(Mock), `MatchDetail`(ascent만).
- `types/profile-sidebar.ts` + `data/profile-sidebar-stats.ts` +
  `lib/profile-sidebar-stats.ts`(`getProfileSidebarStats(puuid)`): UI6
  사이드바 Mock(peakRank, roleWinRates, accuracy, topWeapons, mapWinRates,
  activityByTimeSlot, frequentTeammates).
- `lib/score-gameprobe.ts`: `computeMatchSummaryScore`, `computeProfileScore`,
  `getGameProbeGrade`, `GRADE_THRESHOLDS`. **재사용**(점수 모델 변경 금지).
- `lib/mock-data.ts`: `getDemoPlayerByPuuid`/`getDemoPlayerByRiotId`/
  `getRecentMatchesForPlayer`/`getMatchDetail`. **시그니처 유지.**
- `lib/asset-map.ts`: `getAgentAssetPath`/`getMapAssetPath`/
  `getWeaponAssetPath`. **티어 매핑 함수 없음.**
- `frontend/public/assets/`: agents/maps/weapons(공식 PNG + placeholder.svg),
  SOURCES.md. **`tiers/` 없음.**

### Mock 데이터 한계 (중요)

현재 Mock에는 플레이어 레벨·칭호·지역, 티어 변동 이력, 이전 시즌 티어,
전체 시즌 최고 티어, KAST, 클러치 승률, 데미지(가한/받은)가 **전혀 없다**.
→ 이 Task가 추가하는 헤더(레벨/칭호/지역/배지)·전체 시즌 최고 기록·이전
시즌 티어·티어 이력·KAST·클러치 승률·DDΔ/R 등은 **모두 Mock/가공 집계
데이터**이며, 실제 Riot API 필드처럼 표현하지 않고 별도 타입/주석으로 "가공
집계(Mock)"임을 명시한다.

### 계산 가능 vs Mock 구분 (이 Task 범위)

- **기존 데이터로 계산 가능**: 라운드 승률(`score.roundsWon /
  (roundsWon + roundsLost)`), 경기별/프로필 Preview Score(`score-gameprobe`),
  승률·평균 ACS·K/D(`statsSummary`).
- **Mock/가공 집계 신규**: 헤더(레벨/칭호/지역/배지), 전체 시즌 최고 티어,
  이전 시즌 티어, 티어 변동 이력, KAST(최근 20판 집계), 클러치 승률,
  DDΔ/R(최근 20판 집계).

## DDΔ/R · KAST (이 Task에서 도입하는 공유 정의)

이 Task에서 **DDΔ/R·KAST의 표준 정의와 가공 집계(Mock) 타입을 도입**한다
(최근 20판 요약에서 처음 노출되므로). 후속 TASK-015UI7B가 경기별·날짜별로
**같은 정의/타입을 재사용**한다.

- **DDΔ/R (Damage Delta per Round)**: 화면·코드·문서에서 **DDΔ/R**로 통일
  (단순 "DD" 금지). 정의: `(가한 피해량 - 받은 피해량) ÷ 플레이 라운드 수`.
  근거 데이터(`damageDealt`/`damageReceived`/`roundsPlayed`) 또는 사전 계산값을
  Mock으로 둔다. 분모가 0/없으면 값을 만들지 않고 `—`. 표시: 양수 청록
  (`--accent`/`--accent-strong`), 음수 붉은색(`--danger`), 0 중립. 툴팁으로
  "라운드당 피해량 차이 — (가한 피해량 - 받은 피해량) ÷ 플레이 라운드" 제공.
- **KAST · 라운드 승률 · DDΔ/R**는 **가공 집계(Mock) 필드**임을 타입 주석과
  문서에 명시한다. (라운드 승률은 기존 점수로 계산하되 표기상 집계 지표.)
- 숫자 백분위/랭커 비교는 실제 벤치마크가 없으므로 생성하지 않고 "벤치마크
  준비 중"(또는 동등 문구)으로만 표시한다.

## 데이터 모델 (신규 Mock/가공 집계 — 별도 타입)

기존 `Player`/`Match*` 타입을 오염시키지 않고 별도 타입/데이터/로더로 둔다.
UI 컴포넌트 내부에 숫자를 하드코딩하지 않는다. 이름은 구현자 결정 가능:

- **PlayerHeaderProfile** — `{ puuid, title, level, region, currentTier,
  badges?: string[] }`(RiotId는 기존 `Player`에서 재사용). Mock.
- **MatchFilterState** + 옵션 상수 — `{ queueType, season, period }`. UI
  상태/Mock 선택값만. 실제 필터링 로직 완전 구현은 범위 아님.
- **SeasonSummary** — 이번 시즌 `{ tier, rr, winRate, wins, losses, kd,
  acs, adr, headshotPercentage, clutchWinRate(Mock), previewScore,
  previewGrade }`.
- **CareerPeakRank** — 전체 시즌 최고 `{ tier, rr, season, wins, losses,
  winRate, tierImageId }`. 사이드바 기존 `peakRank` 및 현재 티어와 모순 없게.
- **PreviousSeasonRank[]** — `{ season, finalOrPeakTier, rr, wins, losses,
  tierImageId }`, 3~5개, **현재 시즌 제외**.
- **RankHistoryPoint[]** — `{ date, rankScore, tier }` 시계열(티어 그래프).
  `rankScore`는 티어 내부 0~100 RR이 아니라 그래프용 Mock 누적 랭크 점수이며,
  현재 티어/최고 기록과 모순 없게 한다.
- **RecentTwentySummary** — `{ previewScore, previewGrade, winRate,
  roundWinRate, kast(Mock), acs, ddDeltaPerRound(Mock) }`.

신규 로더(예: `getPlayerHeader(puuid)`, `getSeasonSummary(puuid)`,
`getRankHistory(puuid)`, `getRecentTwentySummary(puuid)`)를 추가한다.
**기존 로더 시그니처는 변경하지 않는다.** Mock 데이터는 `frontend/src/data/`
또는 별도 loader 모듈에서 관리한다.

## 티어 변동 그래프

- 위치: 이번 시즌 성적 카드 안 또는 바로 아래.
- x축 날짜, y축 티어 구간 또는 누적 랭크 점수. 최근 포인트에 현재 티어 라벨.
- 전체 / 60일 / 30일 / 7일 전환 UI(필터 상태 연동 또는 그래프 자체 토글).
- `RankHistoryPoint[]` Mock 기반 Preview 그래프이며 현재 티어/좌측 최고 기록과
  모순되지 않게 한다.
- **새 chart 패키지 설치 금지.** 순수 SVG/CSS로 구현. 데이터는 UI 하드코딩
  금지, 별도 Mock 구조에서 가져온다.

## 공식 자산 (티어 이미지)

- 이 Task에 필요한 범위의 티어 이미지를 선별 추가한다(전체 시즌 최고/이전
  시즌/이번 시즌/그래프 라벨에 쓰이는 티어들).
- 공식 Riot Public Content Catalog 로컬 자산 우선, 외부 런타임 CDN 금지,
  매핑 안 된 자산은 placeholder fallback 허용.
- `asset-map.ts`에 **신규** `getTierAssetPath(tierId)`(+ 내부 매핑,
  `tiers` placeholder fallback)를 추가한다. 기존 함수 시그니처는 변경하지
  않는다. 전체 ZIP/추출 폴더 커밋 금지. `SOURCES.md`에 출처 기록.

## 레이아웃 / 반응형

- **데스크톱**: (1) 플레이어 카드 전체 폭 → (2) 필터 전체 폭 → (3) 좌측
  사이드바 + 중앙 메인 2열. 전체 콘텐츠 폭은 UI6 기준(약 1200~1280px) 유지.
- **태블릿**: 플레이어 카드 유지, 필터 줄바꿈 허용, 사이드바를 중앙 상단으로
  이동하거나 2열 compact grid.
- **모바일**: 단일 컬럼, 필터 가로 스크롤/줄바꿈, 시즌/기간 세로 배치 가능.
- 페이지 내부 중첩 스크롤 금지.

## Dependencies

- TASK-015UI6 (DONE).

## Allowed changes

```
frontend/src/components/**          # 헤더 카드/필터/사이드바 재구성/시즌 카드/티어 그래프/최근20 요약
frontend/src/types/**                # 신규 Mock/가공 집계 타입(별도 파일 권장)
frontend/src/data/**                 # 신규 Mock 데이터(헤더/시즌/티어이력/최근20 등)
frontend/src/lib/**                  # 신규 로더 + asset-map 티어 추가(기존 시그니처 유지)
frontend/src/app/globals.css         # 전체 폭 헤더/필터/2열/그래프/사이드바/반응형 스타일
frontend/src/app/players/[puuid]/page.tsx   # (필요 시) 래퍼/구조 최소 수정
frontend/public/assets/**            # 필요한 티어 등 선별 자산만(placeholder 유지)
frontend/public/assets/SOURCES.md    # 추가 자산 출처 기록
docs/tasks/TASK-015UI7A.md            # 이 문서의 Result 갱신
docs/PLAN.md                          # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                      # 작업 로그 추가
```

> `MatchSummaryList.tsx` 및 인라인 상세(`MatchDetailPanel`/`Match*Tab`)의
> 행 구조·날짜 그룹화·태그는 이 Task에서 변경하지 않는다(TASK-015UI7B 범위).
> 단, 사이드바/메인 레이아웃 재배치로 인해 `MatchSummaryList` 호출 위치/래퍼만
> 바뀌는 것은 허용한다(컴포넌트 내부 행 구조는 불변).

## Forbidden changes

- `backend/**`, `docker/**`, `scripts/**`.
- `frontend/package.json`, `frontend/package-lock.json`, 새 npm 패키지 설치
  (차트/필터/그래프 포함 — 순수 React + SVG/CSS).
- 실제 Riot API 호출, 실제 AI 분석 로직.
- 전체 Public Content Catalog(전체 ZIP/추출 폴더) 커밋, 외부 런타임 CDN fetch.
- `score-gameprobe.ts`의 가중치/정규화/등급 변경.
- OP.GG/Tracker.gg 디자인 복제.
- 홈/privacy/terms/connect 대규모 변경, 공통 헤더/푸터 대규모 변경.
- `/matches/[matchId]` 라우트 삭제, `MatchDetailView`/`MatchScoreboard`/
  `MatchRoundTimeline` 구조 변경.
- 기존 로더·기존 `asset-map` 함수 시그니처 변경.
- `MatchSummaryList`의 경기 행 구조·날짜 그룹화·하이라이트 태그 추가(이는
  TASK-015UI7B 범위).
- `PlayerProfile` 전체를 불필요하게 client component로 전환(필터 등 상태가
  필요한 부분만 최소 범위 client로 분리).
- 실제 벤치마크 없는 숫자 백분위 생성.
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI6.md`,
  `docs/tasks/TASK-015UI7B.md`, 그 외 `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 작업 시작.

## Acceptance criteria

### 1. 상단 플레이어 카드 + 필터

- [x] 상단 플레이어 카드가 좌측 사이드바 + 중앙 영역 전체 폭을 가로지른다.
- [x] 카드에 아바타/대표 요원 이미지, Riot ID, 칭호, 레벨, 지역, 현재 티어,
  대표 업적/배지, GameProbe Preview Score + Preview 등급이 표시되고,
  Mock/Preview 고지가 있으며 Riot 공식 점수처럼 보이지 않는다.
- [x] 플레이어 카드 바로 아래에 동일 가로폭의 필터 바가 있다.
- [x] 필터 바에 매칭 종류(전체/경쟁전/일반전/신속플레이/스파이크 돌격/팀
  데스매치/데스매치), 시즌(에피소드·액트·전체/특정), 조회 기간(전체/60일/
  30일/7일/직접 선택) UI가 있다.
- [x] 필터는 UI 상태·Mock 선택값을 제공하고 Preview/Mock 표시가 있으며(실제
  필터링 로직 완전 구현은 필수 아님), 상태가 필요한 부분만 최소 범위 client
  component로 분리되고 `PlayerProfile` 전체는 server component로 유지된다.

### 2. 좌측 사이드바 재구성

- [x] 좌측에서 **현재 시즌 최고 기록이 제거**된다.
- [x] 전체 시즌 최고 기록이 큰 카드로 표시된다(티어 이미지·최고 티어·RR·
  해당 시즌·시즌 승/패·승률, 점수 바 없이 RR·승패는 텍스트).
- [x] 이전 시즌 티어가 조밀한 가로 카드 목록(시즌명·티어 이미지·최종/최고
  티어·RR·승/패)으로 3~5개 표시되고 현재 시즌은 제외된다.
- [x] 정확도(Head/Body/Legs, 합 100%), 역할군 승률(Duelist/Initiator/
  Controller/Sentinel + 경기 수·승/패·승률), 주요 무기(이미지·무기명·킬 수·
  HS%, 상위 5개 이내), 맵별 승률(맵 아이콘/작은 이미지·맵명·경기 수·승/패·
  승률, 상위 5~8개, 큰 배경 이미지 없음)이 표시된다.
- [x] 좌측 통계가 Mock/Preview임이 사이드바 상단 또는 섹션 단위로 표시되되
  **모든 행마다 Mock 배지를 반복하지 않는다**.

### 3. 이번 시즌 성적 + 티어 그래프

- [x] 이번 시즌 성적 카드에 현재 티어·RR·승률·K/D·ACS·ADR·HS%·클러치 승률·
  GameProbe Preview Score·Preview 등급·시즌 승/패가 표시된다.
- [x] 랭커 비교는 숫자 백분위 없이 "벤치마크 준비 중"(또는 동등 문구)으로
  표시된다.
- [x] 날짜별 티어/누적 랭크 점수 변동 그래프가 카드 안 또는 바로 아래에 있고,
  x축 날짜·y축 누적 랭크 점수·최근 포인트 현재 티어 라벨·전체/60/30/7일 전환
  UI가 있다.
- [x] 그래프는 새 패키지 없이 SVG/CSS로 구현되고 데이터는 별도 Mock 구조에서
  오며 현재 티어/최고 기록과 모순되지 않는다.

### 4. 최근 20판 성적

- [x] 최근 20판 성적 요약에 GameProbe Preview Score·Preview 등급·승률·라운드
  승률·KAST·ACS·DDΔ/R이 표시되고 **그래프는 없다**.
- [x] DDΔ/R 정의·계산 방식이 코드 주석과 이 문서에 기록되고, 양수=청록/음수=
  붉은색/0=중립으로 표시되며 접근 가능한 툴팁/설명이 있다.
- [x] KAST·라운드 승률·DDΔ/R가 가공 집계(Mock) 필드임이 타입/주석으로
  명시된다.

### 5. 데이터 모델 / 자산 / 구조

- [x] 신규 가공 통계가 기존 `Player`/`Match*` 타입을 오염시키지 않고 별도
  타입/데이터/로더로 관리되며 실제 API 값과 가공 집계값이 타입/주석으로
  구분된다. UI 내부 숫자 하드코딩이 없다.
- [x] 기존 로더·`asset-map` 함수 시그니처가 불변이고, 티어 자산은 신규
  `getTierAssetPath` + 선별 자산 + placeholder fallback으로 처리되며
  `SOURCES.md`가 갱신된다.
- [x] 데스크톱/태블릿/모바일 레이아웃이 정의되고 페이지 내부 중첩 스크롤이
  없다. 모든 Mock/가공 데이터 고지가 명확하다.
- [x] `MatchSummaryList`의 경기 행 구조/인라인 4탭은 이 Task에서 변경되지
  않는다(위치/래퍼만 변경 허용).

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

# 티어 자산 매핑 신규 함수 확인
grep -n "getTierAssetPath" frontend/src/lib/asset-map.ts

# DDΔ/R 표기/정의 확인
grep -rn "DDΔ/R\|ddDeltaPerRound" frontend/src

# 외부 Riot CDN 런타임 참조 없음 (출력 없어야 함)
grep -rn "riotcdn.net\|media.valorant-api" frontend/src

# 기존 로더 시그니처 유지
grep -n "export function getDemoPlayerByPuuid\|export function getRecentMatchesForPlayer\|export function getMatchDetail" frontend/src/lib/mock-data.ts

# PlayerProfile이 client component가 아님 (출력 없어야 함)
grep -n "use client" frontend/src/components/PlayerProfile.tsx

# 변경 금지 영역 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts
```

## Stop conditions

`BLOCKED`로 보고:

1. 차트/필터/그래프에 새 npm 패키지 설치가 반드시 필요한 경우.
2. 기존 로더 또는 `asset-map` 함수 시그니처 변경이 불가피한 경우.
3. 실제 Riot API 호출 없이는 필수 상단 구조 구현이 불가능한 경우.
4. 공식 티어 자산을 쓰려면 전체 ZIP 커밋이 필요한 경우(선별 추출 불가).
5. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

BLOCKED가 **아님**(계속 진행):

- 일부 티어/요원/무기/맵 자산이 매핑되지 않아 placeholder로 표시되는 경우.
- 최근 20판 요약이 현재 3경기 표본으로 계산되는 경우(표본 표기 명확하면 됨).

## Result

Status: DONE (2026-06-16)

### 변경된 파일

- `frontend/public/assets/SOURCES.md`
- `frontend/public/assets/tiers/*-1.png`
- `frontend/public/assets/tiers/*-2.png`
- `frontend/public/assets/tiers/*-3.png`
- `frontend/public/assets/tiers/placeholder.svg`
- `frontend/public/assets/tiers/radiant.png`
- `frontend/public/assets/tiers/unranked.png`
- `frontend/src/app/globals.css`
- `frontend/src/components/PlayerHeaderCard.tsx`
- `frontend/src/components/ProfileFilterBar.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/components/RankHistoryChart.tsx`
- `frontend/src/components/RecentTwentySummaryCard.tsx`
- `frontend/src/components/SeasonSummaryCard.tsx`
- `frontend/src/data/profile-overview.ts`
- `frontend/src/lib/asset-map.ts`
- `frontend/src/lib/profile-overview.ts`
- `frontend/src/lib/rank-history.ts`
- `frontend/src/lib/recent-twenty.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/profile-overview.ts`
- `docs/tasks/TASK-015UI7A.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

### 작업 내용

- 프로필 첫 번째 주요 콘텐츠로 전체 폭 `PlayerHeaderCard`를 추가하고, 바로
  아래 전체 폭 `ProfileFilterBar`를 배치했다.
- `PlayerProfile`은 서버 컴포넌트로 유지하고, 상태가 필요한 필터와 그래프
  기간 선택만 별도 client component로 분리했다.
- 좌측 사이드바를 전체 시즌 최고 기록, 이전 시즌 티어, 헤드샷률, 역할군
  승률, 주요 무기, 맵별 승률 순서로 재구성했다. 현재 시즌 최고 기록과
  진행률 바는 추가하지 않았다.
- 중앙 영역에 이번 시즌 성적, SVG 기반 티어/누적 랭크 점수 변화 그래프, 최근
  20판 성적 요약을 추가하고 기존 `MatchSummaryList` 호출은 그 아래에 유지했다.
- `ProfileOverview` 계열 별도 타입/Mock 데이터/로더를 추가해 헤더, 필터,
  시즌 요약, 전체 시즌 최고 기록, 이전 시즌, 티어 히스토리, 최근 20판
  가공 집계를 관리한다. 기존 `Player`/`Match*` 타입과 기존 로더 시그니처는
  변경하지 않았다.
- `getTierAssetPath(tierId)`를 추가하고 Iron/Bronze/Silver/Gold/Platinum/
  Diamond/Ascendant/Immortal의 1/2/3 디비전별 로컬 PNG와 Radiant 단일 PNG
  매핑을 구성했다. 입력값의 대소문자·연속 공백을 정규화해 `Diamond 2`,
  `diamond 2`, `Ascendant   3`, `Immortal 1`, `Radiant`를 각각 정확한 로컬
  파일로 매핑한다. `Diamond`처럼 기본 티어명만 있고 디비전이 없는 값은 해당
  티어의 1 디비전 이미지로 매핑해 혼재된 Mock 입력이 placeholder로 떨어지지
  않게 했다.
- 공식 Public Content Catalog 12.11 ZIP 파일명과 JSON 키를 확인했지만 경쟁
  티어 엠블럼 레코드는 없었다. 이에 Valorant-API
  `competitivetiers?language=ko-KR`를 구현 시 1회성 자산 취득 용도로만 사용해
  `Episode5_CompetitiveTierDataTable`
  (`03621f52-342b-cf4e-4f86-9350a49c6d04`)의 tier 3~27, 총 25개 실사용 티어
  PNG를 로컬에 저장하고 `SOURCES.md`에 비공식·비제휴 출처, tier 번호,
  tierName, 원본 URL을 기록했다. Unrated/Unused 항목은 저장하지 않았다.
- 기존 기본 티어 파일 `iron.png`, `bronze.png`, `silver.png`, `gold.png`,
  `platinum.png`, `diamond.png`, `ascendant.png`, `immortal.png`는 더 이상
  사용하지 않아 삭제했다. `radiant.png`는 Radiant 단일 이미지로 유지했다.
- 같은 Competitive Tier Set의 Iron 1 이전 항목을 확인했다. tier 0은
  `tierName: 랭크 없음`, `division: ECompetitiveDivision::UNRANKED`,
  `divisionName: 랭크 없음`이고 largeIcon/smallIcon을 제공한다. tier 1/2는
  `미사용1`/`미사용2`, `ECompetitiveDivision::INVALID`, 아이콘 없음이라 저장하지
  않았다. tier 0 largeIcon은 회색 물음표 형태의 언랭크 상태 엠블럼으로 확인해
  `tiers/unranked.png`로 저장했다.
- DDΔ/R 계산 유틸을 추가했다. 분모가 0이면 `—` 처리하며 양수/음수/0 색상
  톤을 분리했다.

### 실행한 명령어 및 검증 결과

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `grep -n "getTierAssetPath" frontend/src/lib/asset-map.ts`: 성공.
- `file frontend/public/assets/tiers/*.png`: 성공. 26개 모두 PNG RGBA. 원본
  기준으로 대부분 256x256이며 `ascendant-2.png`, `immortal-2.png`는 275x256.
- `wc -c frontend/public/assets/tiers/*.png`: 성공. 26개 PNG 파일 크기 확인.
- `shasum -a 256 frontend/public/assets/tiers/*.png`: 성공. 26개 SHA-256 모두
  고유해 중복 없음.
- `for f in frontend/public/assets/tiers/*.png; do printf '%s ' "$f"; xxd -p -l 8 "$f"; done`:
  성공. 26개 모두 PNG signature `89504e470d0a1a0a`.
- `file frontend/public/assets/tiers/unranked.png`, `wc -c`,
  `xxd -p -l 8`: 성공. 256x256 PNG RGBA, 19,961 bytes, signature
  `89504e470d0a1a0a`.
- `shasum -a 256 frontend/public/assets/tiers/*.png`: 성공. `unranked.png` 포함
  26개 PNG SHA-256 모두 고유해 기존 25개 티어와 중복 없음.
- `node` 기반 `getTierAssetPath()` 매핑 검증: 성공. 25개 입력, Radiant 단일
  매핑, Unranked/Unrated/언랭크/배치 전/Placement/랭크 없음 매핑, 디비전 없는
  기본 티어의 1 디비전 이미지 fallback 확인.
- `find frontend/public/assets/tiers -maxdepth 1 -type f -name "*.png" | wc -l`:
  성공. 실사용 티어 PNG 정확히 25개.
- `rg "/assets/tiers/(iron|bronze|silver|gold|platinum|diamond|ascendant|immortal)\\.png|tiers/(iron|bronze|silver|gold|platinum|diamond|ascendant|immortal)\\.png" frontend/src frontend/public/assets/SOURCES.md docs/tasks/TASK-015UI7A.md docs/PROGRESS.md`:
  성공. 이전 기본 티어 PNG 경로 사용처 없음.
- `grep -rn "DDΔ/R\|ddDeltaPerRound" frontend/src`: 성공.
- `grep -rn "riotcdn.net\|media.valorant-api" frontend/src`: 성공. 출력 없음.
- `grep -n "export function getDemoPlayerByPuuid\|export function getRecentMatchesForPlayer\|export function getMatchDetail" frontend/src/lib/mock-data.ts`:
  성공. 기존 로더 시그니처 유지.
- `grep -n "use client" frontend/src/components/PlayerProfile.tsx`: 성공. 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts`:
  성공. 출력 없음.
- `git diff -- frontend/src/components/MatchSummaryList.tsx ...`: 성공. 기존 경기
  행 구조와 인라인 상세 관련 파일 변경 없음.
- ProfileOverview Mock 일관성 검증(Node): 성공. 승률/라운드 승률/이전 시즌
  개수/현재 시즌 제외/최신 티어 정합성 확인.
- DDΔ/R 양수/음수/0/rounds=0 경계 검증(Node): 성공.

### 남은 위험

- 티어 PNG는 Riot 공식 Public Content Catalog에서 확인되지 않아 Valorant-API
  메타데이터와 이미지 URL로 1회성 취득했다. 런타임 외부 호출은 없지만, 출처는
  비공식·비제휴 서비스다.
- Mock 데이터에는 `tierImageId: "diamond"`처럼 디비전 없는 값이 남아 있을 수
  있다. 이번 매핑 정책상 이런 값은 해당 티어의 1 디비전 이미지로 표시되며,
  표시 티어 문자열(`Diamond 2` 등)이 있는 컴포넌트는 그 전체 문자열을
  우선 사용한다.
- 필터는 Preview UI이며 실제 서버 데이터 재계산은 수행하지 않는다.
- 최근 20판 성적은 Mock/가공 집계 데이터이며 Riot API 직접 제공값이 아니다.
