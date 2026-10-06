# TASK-015UI11B: 프로필 상단/요약 영역 정리 (API 신청용)

## Status

READY (Cursor 리뷰 → 승인 시 Codex 구현)

## Goal

Riot Production API 신청 전에 GameProbe 프로필 페이지의 **상단/요약 영역**을
실제 VALORANT 전적 서비스처럼 보이도록 정보 위계를 정리한다. OP.GG / Tracker.gg의
정보 구조는 참고하되 디자인을 복제하지 않으며, **기존 Mock 데이터로 정직하게
표현 가능한 UI만** 허용한다.

이 Task는 UI11 마스터 플랜(`TASK-015UI11A`)의 첫 구현 Task이며, **프로필 상단/
요약 영역만** 다룬다.

## Background

- UI9A가 정보 구조 골격을, UI10A가 UI Build 배지 + 레퍼런스 감사/가드레일 문서를
  고정했다(HEAD `520f8fa`, push 완료).
- UI11A에서 "신청 전에는 기존 데이터/에셋으로 가능한 완성도부터 높인다"는 기준을
  세웠고, 그 첫 영역이 프로필 상단/요약이다.
- 현재 `PlayerHeaderCard`는 대표 요원 이미지·Riot ID·title·Lv·region·badges·
  현재 티어·GameProbe Preview Score를 보여주지만, **승률·KD·HS% 같은 핵심 KPI
  요약과 최근 폼**이 상단에서 한눈에 들어오지 않는다(해당 지표는 `SeasonSummaryCard`,
  `RecentTwentySummaryCard` 등 하위 카드에 분산).

## Current Problems

- 프로필 상단이 "정체성(요원/ID/티어)"만 강조하고, 전적 서비스의 첫인상에서
  기대되는 **핵심 성과 요약(승률·KD·HS%·최근 폼)**을 상단 위계에서 빠르게 읽기
  어렵다.
- 상단과 요약 카드의 정보 위계·여백·라벨 일관성이 약해, 운영 중인 서비스다운
  신뢰감·밀도가 부족하다.
- 데이터는 이미 존재하나(`SeasonSummary`, `RecentTwentySummary`, `CareerPeakRank`),
  상단 요약으로 끌어올려 보여주는 구성이 없다.

## Reference Direction

- 참고는 **정보 구조·배치·읽기 흐름**까지로 한정한다(가드레일 1·3장).
- 색/타이포/아이콘/레이아웃의 **픽셀 단위 복제 금지**. GameProbe 기존 디자인
  토큰(`globals.css`)으로 재해석한다.
- OP.GG/Tracker식 상단 패턴 중 **핵심 KPI 한 줄 요약·현재 티어 강조·최근 폼**의
  "어디에 무엇을 둘지"만 참고한다. 광고·외부 위젯·고유 배지 그래픽은 가져오지
  않는다.

## User Value for Riot API Application

- Riot 심사자가 프로필 첫 화면에서 **"이 서비스는 실제 전적/성과를 요약해 보여주는
  운영형 플랫폼"**이라고 즉시 인지할 수 있게 한다.
- 핵심 KPI·티어·최근 폼이 상단에 정돈되면, 데이터가 적어도 **완성도 있는 전적
  서비스의 정보 위계**를 갖춘 것으로 보인다.
- 모든 표시는 Mock/Preview임을 명시(`Mock / Preview` 배지, "Riot 공식 점수 아님"
  고지)해 **데이터 출처를 정직하게** 드러낸다 → 심사 신뢰도.

## Allowed Changes

- 프로필 상단/요약 영역의 **레이아웃·정보 위계 정리** (`PlayerHeaderCard`와 상단
  요약 묶음).
- **기존 데이터 기반 KPI 위계 개선**: `SeasonSummary`(winRate·kd·acs·adr·
  headshotPercentage), `RecentTwentySummary`(winRate·kast 등), `CareerPeakRank`/
  `PreviousSeasonRank`에서 이미 존재하는 값만 상단 요약으로 재배치.
- 티어·최근 폼·핵심 지표 **표시 정리**(라벨/값 분리, 단위·강조 정리).
- 기존 **CSS 수정**(`frontend/src/app/globals.css` 상단/요약 관련 클래스).
- 기존 컴포넌트 **분리 또는 작은 보조 컴포넌트 추가**(예: 상단 KPI 요약용 presentational
  컴포넌트). props는 기존 타입만 사용.
- **신규 자산 없이** 가능한 범위의 UI polish.
- UI Build 배지 **유지**(제거·이동 금지, 표시 보존).
- 문서: 이 Task 문서(Result/Notes), `docs/PLAN.md`, `docs/PROGRESS.md`,
  `.agent-reports/CURRENT.md`(`## Codex Implementation` 섹션 및 공통 상태 스냅샷).

### 수정 가능 파일(예상)

- `frontend/src/components/PlayerHeaderCard.tsx`
- (선택) 상단 요약용 신규 보조 컴포넌트 1개(예:
  `frontend/src/components/ProfileHeroStats.tsx`) — 기존 데이터/타입만 사용
- `frontend/src/components/PlayerProfile.tsx` — 상단 요약 마운트/배치 한정
- `frontend/src/app/globals.css` — 상단/요약 스타일 한정

## Forbidden Changes

- **신규 Mock 데이터 생성 금지** (`frontend/src/data/*` 값 추가/변경 금지).
- **신규 타입 필드 추가 금지** (`frontend/src/types/*` 변경 금지).
- **신규 외부 자산 추가 금지** (`frontend/public/assets`, `SOURCES.md`,
  `frontend/src/lib/asset-map.ts` 변경 금지).
- **신규 패키지 추가 금지** (`package.json`/`package-lock.json` 변경 금지).
- **backend/docker/scripts 수정 금지.**
- **최근 경기 리스트 구현 착수 금지** (`MatchSummaryList`).
- **스코어보드 구현 착수 금지** (`MatchScoreboardTab`).
- **라운드/성과/분석 구현 착수 금지** (`MatchRoundsTab`/`MatchPerformanceTab`/
  `MatchAnalysisTab`).
- **사이드바 요원/무기/맵/역할군 구현 착수 금지** (`ProfileSidebar`).
- **OP.GG/Tracker 디자인 pixel-perfect 복제 금지.**
- 런타임 외부 URL, `Math.random` 기반 값 생성 금지.
- Git add/commit/push (사람 승인/지시 전).

## Existing Data / Assets Available

기존 타입/데이터로 상단 요약에 사용 가능한 값(신규 필드 불필요):

- `PlayerHeaderProfile`: title, level, region, currentTier, currentTierId,
  avatarAgentId, badges[].
- `SeasonSummary`: season, tier, rr, wins, losses, **winRate, kd, acs, adr,
  headshotPercentage**, clutchWinRate, previewScore, previewGrade.
- `RecentTwentySummary`: **winRate, kast**, acs, wins, losses, roundWinRate 등
  (최근 폼 표현용).
- `CareerPeakRank` / `PreviousSeasonRank`: 시즌 피크·이전 시즌 티어/전적.
- 에셋: 기존 요원/티어 이미지(`getAgentAssetPath`, `getTierAssetPath`)만 사용.
- `GameProbeProfileScore`(Preview) 및 `Mock / Preview` 고지 — 유지.

> 위 목록 밖의 값(예: 마지막 갱신 timestamp, 최근 N경기 W/L 스트릭 dot)은 기존
> 데이터에 명시적으로 없으면 만들지 않는다. Human Decisions / Stop Conditions 참조.

## Required UI Changes

1. 프로필 상단에 **핵심 KPI 요약 한 줄/블록**을 둔다: 승률·KD·HS%(+ 선택적으로
   ACS/ADR) — 모두 `SeasonSummary` 기존 값. 라벨/값 위계를 분리해 스캔성을 높인다.
2. **현재 티어 강조**와 시즌 피크/이전 시즌 맥락(`CareerPeakRank`/
   `PreviousSeasonRank`)을 상단 읽기 흐름에 맞게 정돈한다(기존 데이터 한정).
3. **최근 폼**을 기존 `RecentTwentySummary`(winRate·kast·wins/losses)로 정직하게
   요약 표시한다. 데이터가 없는 스트릭/그래프를 새로 만들지 않는다.
4. 상단/요약 카드의 **여백·라벨·카드 문법**을 통일해 운영형 서비스다운 밀도를
   확보한다(CSS 한정, 데이터 변경 없음).
5. `Mock / Preview` 고지와 UI Build 배지를 **유지**한다.

## Acceptance Criteria

1. 프로필 상단에서 승률·KD·HS%를 포함한 핵심 KPI 요약이 한눈에 읽힌다(기존
   `SeasonSummary` 값만 사용).
2. 현재 티어·최근 폼이 상단 정보 위계에 정돈되어, 전적 서비스다운 첫인상을 준다.
3. 신규 Mock/타입 필드/외부 자산/패키지 추가가 전혀 없다.
4. 최근 경기 리스트/스코어보드/라운드·성과·분석/사이드바 요원·무기·맵·역할군은
   변경되지 않는다(착수 금지 준수).
5. `Mock / Preview` 고지와 UI Build 배지가 유지된다.
6. UI8A 접근성·UI8B 라운드 타임라인 등 기존 기능이 보존된다.
7. `tsc`/`lint`/`build`가 모두 통과한다.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check
# 금지 범위 미변경 확인
git status --porcelain -- frontend/public/assets frontend/src/data frontend/src/types frontend/package.json frontend/package-lock.json backend docker scripts
git diff -- frontend/src/lib/asset-map.ts frontend/src/lib/score-gameprobe.ts
# 다른 UI11 영역 미착수 확인(상단 외 컴포넌트 변경 없음)
git status --porcelain -- frontend/src/components/MatchSummaryList.tsx frontend/src/components/MatchScoreboardTab.tsx frontend/src/components/MatchRoundsTab.tsx frontend/src/components/MatchPerformanceTab.tsx frontend/src/components/MatchAnalysisTab.tsx frontend/src/components/ProfileSidebar.tsx
# 외부 URL/난수 미사용 확인
grep -RnE "https?://|Math.random" frontend/src/components frontend/src/app/globals.css || true
# UI Build 배지 보존 확인
grep -Rn "AppVersionBadge\|UI Build" frontend/src/components/PlayerProfile.tsx frontend/src/components/AppVersionBadge.tsx
```

## Stop Conditions

- 상단 요약에 보여주려는 값이 기존 데이터/타입에 **없으면** 멈추고 사람 결정을
  요청한다(예: 마지막 갱신 timestamp, 최근 N경기 W/L 스트릭). 신규 Mock/필드를
  임의로 만들지 않는다(가드레일 5장).
- 신규 외부 자산/패키지가 필요해지면 즉시 중단·보고.
- 상단/요약 외 영역(리스트·스코어보드·라운드·사이드바)을 건드려야 하는 상황이면
  중단한다(범위는 다른 UI11 Task).
- 같은 검증 실패가 3회 반복되면 `BLOCKED`로 보고하고 중단한다.

## Human Decisions

- 상단 KPI 요약에 포함할 지표 집합(승률·KD·HS% 기본 / ACS·ADR 추가 여부).
- "최근 폼" 표현 방식: 기존 `RecentTwentySummary` 요약(기본) vs 최근 N경기 W/L
  스트릭(기존 경기 결과 데이터로 표현 가능한지 확인 필요 — 불가 시 보류).
- "마지막 갱신 시각" 표기 포함 여부(신뢰 가능한 timestamp 출처가 없으면 신규
  Mock → PENDING-DECISION, 이 Task에서는 보류 권장).
- 상단 요약을 신규 보조 컴포넌트로 분리할지, `PlayerHeaderCard` 내부 확장으로
  둘지.

## Codex Implementation Notes

- 변경 파일:
  - `frontend/src/components/PlayerHeaderCard.tsx`
  - `frontend/src/components/PlayerProfile.tsx`
  - `frontend/src/app/globals.css`
- 사용한 기존 데이터 필드:
  - `SeasonSummary`: `winRate`, `wins`, `losses`, `kd`, `headshotPercentage`, `acs`,
    `adr`, `rr`, `previewGrade`, `season`
  - `RecentTwentySummary`: `sampleLabel`, `winRate`, `kast`, `wins`, `losses`,
    `roundWinRate`
  - `CareerPeakRank`: `tier`, `season`, `rr`
  - `PreviousSeasonRank`: `tier`, `season`, `wins`, `losses`
- 상단 요약 구성:
  - 헤더 안에 시즌 핵심 KPI(승률, K/D, HS%, ACS/ADR)를 카드형 그리드로 추가.
  - 현재 티어 영역에 RR·Preview grade를 함께 표시.
  - Career Peak, Previous season, 최근 20판 WR/KAST/전적/Round WR을 상단 우측
    요약 패널로 정리.
  - `Mock / Preview` 배지와 `Riot 공식 점수가 아닌 GameProbe Preview입니다.`
    고지를 유지.
  - UI Build 배지(`AppVersionBadge`)는 `PlayerProfile` 하단 마운트를 그대로 유지.
- Stop Condition 해당 없음:
  - 신규 Mock 데이터, 신규 타입 필드, 신규 외부 자산, 신규 패키지 없음.
  - 최근 경기 리스트, 스코어보드, 라운드/성과/분석, 사이드바 구현 착수 없음.
- 검증 결과:
  - `cd frontend && npx tsc --noEmit`: 성공.
  - `cd frontend && npm run lint`: 성공.
  - `cd frontend && npm run build`: 성공.
  - `git diff --check`: 성공.
  - Forbidden scope checks: 성공.
  - `git status --short`: UI11B 변경 4개 파일 외에 기존 untracked UI11C~G/plan 문서가
    표시됨. 해당 untracked 문서는 이번 작업에서 생성하지 않았고 커밋에 포함하지 않음.

## Cursor Review Notes

(리뷰 후 Cursor가 기록: Allowed/Forbidden 준수, 다른 UI11 영역 미착수, AC 충족,
디자인 복제 아님, BLOCKER/MAJOR/MINOR, 커밋 가능 여부.)
