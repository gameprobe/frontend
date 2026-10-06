# TASK-015UI5: 프로필 페이지 전적 서비스형 재구성 + GameProbe Score 도입

## Status

DONE (2026-06-16)

## Goal

GameProbe 플레이어 프로필 페이지(`/players/[puuid]`)를 OP.GG·Tracker.gg 같은
전적 서비스의 **정보 밀도와 배치**를 참고해 재구성한다. 디자인을 그대로
복제하지 않고 GameProbe의 분석 중심 구조로 만든다. 핵심은 다음 7가지다:

1. **프로필 종합 GameProbe Score**(Preview) 도입.
2. **경기별 GameProbe Match Score**(Preview) 도입.
3. 프로필 페이지를 **좌측 보조 통계 + 중앙 핵심 영역** 구조로 재배치.
4. 최근 경기 카드를 더 **압축적이고 정보 밀도 높게** 변경(카드 높이 축소).
5. 기존 인라인 4탭 상세 패널(TASK-015UI4 결과)에서 **중복 상단 요약 카드
   5개를 제거**하고 컴팩트하게 재설계.
6. Mock 단계에서도 최종적으로 보여줄 데이터의 **자리와 구조는 완성**한다.
7. 실제 값이 없는 항목은 큰 PENDING 카드가 아니라 **—, "예정", 작은 상태
   배지**로 표시한다. **임의 통계 생성 금지.**

기존 `/matches/[matchId]` 라우트와 그 링크 정책은 TASK-015UI4와 동일하게
유지한다(라우트 삭제 금지, 프로필 화면에 상세 링크 노출 금지).

## Context

### 현재 구조 (TASK-015UI4 결과, 변경 전)

TASK-015UI4(DONE)로 다음이 이미 구현되어 있다:

- `frontend/src/components/PlayerProfile.tsx` — **서버 컴포넌트**, 단일
  컬럼. (1) 프로필 헤더(Riot ID, 현재 랭크), (2) `.profile-summary-grid`
  4칸(최근 승/패·승률·평균 ACS·평균 K/D), (3) `.top-agent-list`(주 사용
  요원), (4) 최근 경기(`MatchSummaryList`) 순서로 렌더링한다.
- `frontend/src/components/MatchSummaryList.tsx` — **클라이언트 컴포넌트**
  (`"use client"`). `matches`, `viewerPuuid` props. 카드 전체 클릭으로
  펼침/접힘(한 번에 하나), 펼침 화살표, `getMatchDetail(match.matchId)`로
  상세 로드, `MatchDetailPanel` 렌더링. 카드(`.match-card`)는 맵 이미지
  (240×120) + 본문(승패/시간/요원/맵/스코어/ACS/KDA/K/D/HS%) + 무기
  (96×44) + 화살표의 3~4열 그리드로 **세로 높이가 큰** 편이다.
- `frontend/src/components/MatchDetailPanel.tsx` — `.match-detail-summary`로
  **맵/최종 스코어/승패/모드/경기 시간을 큰 카드 5개로 반복** 표시한 뒤
  `MatchTabs` + 활성 탭을 렌더링한다. 이 5개 요약 카드가 경기 카드와
  중복되는 부분이며 이번 Task에서 제거 대상이다.
- `MatchTabs.tsx` — 4탭(`scoreboard`/`rounds`/`performance`/`analysis`),
  기본 `scoreboard`.
- `MatchScoreboardTab.tsx` — 우리 팀/상대 팀 구분, 팀별 ACS 내림차순, YOU
  강조, 요원 이미지 + 플레이어명 + ACS + K/D/A + K/D + HS%. (ADR 없음.)
- `MatchRoundsTab.tsx` — 22라운드를 각각 **여러 줄짜리 큰
  `.round-card`** 로 표시(이번 Task에서 한 줄 행/타임라인으로 변경 대상).
- `MatchPerformanceTab.tsx` — `.performance-grid`로 팀 MVP/개인 ACS 순위/
  K/D/HS% + 첫 킬·첫 데스·멀티킬 PENDING. (ADR·클러치·플랜트/해체 없음.)
- `MatchAnalysisTab.tsx` — "분석 준비 중" + `.analysis-grid`에 "준비" 카드
  4개(교전 효율/라운드 영향도/포지션 비교/랭커 기준). 점수·피드백 없음.

### 현재 타입 (변경 전)

`frontend/src/types/match.ts`:

```ts
export interface CombatStats {
  kills: number;
  deaths: number;
  assists: number;
  averageCombatScore: number;
  headshotPercentage: number; // Mock/aggregated
}
// MatchSummary.stats: CombatStats, MatchParticipant.stats: CombatStats
// MatchParticipant: { puuid, riotId, team, agent, agentId, stats }
// MatchRound: { roundNumber, winningTeam, endType, scoreAfterRound }
```

`frontend/src/types/player.ts`:

```ts
export interface PlayerStatsSummary {
  matchesPlayed; wins; losses; winRate;
  averageKills; averageDeaths; averageAssists; averageCombatScore;
  topAgents: AgentPlayRate[]; // Mock/aggregated
}
export interface Player {
  puuid; riotId; currentRank; statsSummary; recentMatches: MatchSummary[];
}
```

**ADR는 현재 어디에도 없다.** 최고 티어/랭크, 상위 백분위, 역할별 승률,
정확도 분포(Head/Body/Legs), 집계 주 무기, 맵별 승률, 활동 시간대, 자주
함께한 플레이어, 라운드별 킬 이벤트(첫 킬/첫 데스/멀티킬/클러치/플랜트/
해제 상세)도 현재 데이터에 **없다**.

### Mock 데이터 현황

`mock-data.json`에는 플레이어 1명(`demo-puuid-seoul-duelist-001`,
recentMatches 3건: ascent/haven/split)과 `matchDetails` 1건(ascent,
10명 participants + 22라운드)만 있다. 즉 **상세(participants/rounds)는
ascent 경기에만 존재**하고, haven/split 카드를 펼치면 현재 "상세 데이터
없음"이 표시된다(정상 동작, 유지).

### 데이터 확장 방침 (이번 Task)

**임의 통계 생성 금지** 원칙 아래, 다음만 확장한다. 그 외 사이드바
항목은 값을 만들지 말고 자리만 잡는다.

A. **ADR 추가 (계산값 표시에 필수)** — `CombatStats`에 `adr: number`를
   추가한다(기존 `headshotPercentage`와 동일한 "Mock/aggregated field —
   향후 Riot Match API 원시 데미지 이벤트에서 Backend 집계" 주석 컨벤션을
   따른다). `CombatStats`는 `MatchSummary.stats`와 `MatchParticipant.stats`
   양쪽에 쓰이므로 한 번 추가하면 경기 카드·스코어보드 양쪽에서 쓸 수
   있다. `mock-data.json`의 다음 위치 전부에 합리적 범위(예: 110~180)의
   Mock 정수 `adr`를 추가한다:
   - `players[0].recentMatches[*].stats` (3건)
   - `matchDetails[0].participants[*].stats` (10명)

B. **GameProbe Score 입력 일관성** — 프로필 종합 점수는 가능한 한 기존
   `PlayerStatsSummary`(ACS/K·D/winRate/assists)와 `recentMatches`에서
   집계한 HS%·ADR로 계산한다(아래 "점수 계산 모델" 참조). `PlayerStatsSummary`
   에 새 평균 필드(`averageHeadshotPercentage`/`averageAdr`)를 추가하는
   것은 **선택**이며, 추가한다면 동일한 Mock/aggregated 주석을 달고
   `recentMatches` 값과 모순되지 않게 채운다. 추가하지 않고 `recentMatches`
   평균으로 계산해도 된다(권장).

C. **확장하지 않는 항목 (자리만, 값 생성 금지)** — 다음은 타입/Mock에
   숫자를 만들어 넣지 않고, UI에 자리만 두고 `—`/"예정"/작은 "Preview"·
   "Mock" 배지로 표시한다:
   - 최고 티어 / 최고 랭크
   - 상위 백분위 (벤치마크 데이터 없음 → 반드시 Mock/Preview 표기)
   - 역할별 승률
   - 정확도 분포(Head/Body/Legs)
   - 집계 "주 무기"(경기별 `primaryWeapon`은 있으나 프로필 집계 주 무기
     통계는 없음)
   - 맵별 승률
   - 활동 시간대
   - 자주 함께한 플레이어
   - 라운드별 파생: 첫 킬/첫 데스, 멀티킬, 클러치, 플랜트/해제 상세

   > 예외: "최고 티어/최고 랭크"는 통계가 아니라 단일 라벨이므로,
   > 구현자가 원하면 `Player`에 명시적 Mock 라벨 필드(예: `peakRank`)로
   > 추가하고 "Preview"로 표기해도 된다(현재 `currentRank`도 Mock 라벨).
   > 추가하지 않으면 `—`/"예정"으로 표시한다. 둘 중 하나를 선택한다.

`MatchRound`/`MatchDetail` 구조는 변경하지 않는다(라운드별 킬 이벤트 등은
계속 없음 → 해당 파생 지표는 `—`).

### 점수 계산 모델 (코드·문서 일치 필수)

`frontend/src/lib/score-gameprobe.ts`(신규, 이름은 구현자 선택 가능)에
**UI와 분리된 순수 함수**로 구현한다(부수효과·전역 상태·난수·시간 의존
없음 → 동일 입력은 항상 동일 출력). 경기별 점수와 등급 로직을 정의하고,
프로필 종합 점수는 경기별 점수들을 **재사용**해 도출한다.

- **명칭/표기**: "GameProbe Preview Score"(또는 "Preview Score" /
  "Mock Score")로 표기한다. Riot 공식 점수·실제 랭킹 지표처럼 보이게 하지
  않는다. 점수 가까이에 작은 "Preview"/"Mock" 배지를 둔다.
- **출력 범위**: 0–1000 정수(`Math.round` 후 `[0, 1000]` clamp).

#### (1) 경기별 GameProbe Preview Score

- **가중치**(합 100%):
  - ACS 30%
  - K/D 25%
  - ADR 15%
  - 승패 10%
  - HS% 10%
  - 어시스트 5%
  - 생존 기여 5%
- **각 컴포넌트는 먼저 0~1로 정규화하고 반드시 `[0, 1]`로 clamp**한다
  (입력 원값과 중간 정규화 값 모두 0~1 범위를 벗어나지 않게 clamp).
  코드 상수와 이 문서가 정확히 일치해야 한다:
  - ACS: `clamp(acs / 350, 0, 1)`
  - K/D: `clamp((kills / deaths) / 2.0, 0, 1)` (deaths=0이면 K/D=kills로
    처리)
  - ADR: `clamp(adr / 200, 0, 1)`
  - 승패: win=1, draw=0.5, loss=0
  - HS%: `clamp(headshotPercentage / 50, 0, 1)`
  - 어시스트: `clamp(assists / 12, 0, 1)`
  - 생존 기여: `clamp(1 - deaths / totalRounds, 0, 1)`,
    `totalRounds = roundsWon + roundsLost`(경기별) 또는 라운드 배열 길이.
- **최종 점수**: 포함된 컴포넌트에 대해
  `round( ( Σ(normᵢ × wᵢ) / Σ(wᵢ) ) × 1000 )`. 즉 정규값(0~1)의 가중평균에
  1000을 곱한다.
- **rounds 처리**: `totalRounds`가 0이거나 없으면 **생존 기여 항목을
  제외**하고, 남은 6개 컴포넌트의 가중치 합으로 비례 재분배한다(위 식의
  `Σ(wᵢ)`가 생존 가중치를 뺀 값이 되어 자동 재분배됨).
- **누락 데이터 처리**: 특정 컴포넌트의 입력이 없으면 **0점으로 넣지 말고
  그 컴포넌트를 제외**하고, 남은 컴포넌트 가중치로 비례 재분배한다(분모
  `Σ(wᵢ)`에서 제외). 모든 컴포넌트가 누락이면 점수는 산출하지 않는다
  (유효하지 않은 경기로 간주 → 아래 프로필 평균에서 제외). 이 규칙을
  코드 주석과 이 문서에 동일하게 기록한다.

#### (2) 프로필 종합 GameProbe Preview Score

- **별도의 혼합 공식을 다시 적용하지 않는다.** 현재 화면에 표시 중인 최근
  경기들 각각의 **유효한 경기별 Preview Score의 산술평균**으로 계산한다
  (`round(Σ validMatchScores / validCount)`).
- 유효한 경기가 하나도 없으면 점수 대신 `—`를 표시한다.
- 평균에 사용된 경기 수를 "최근 N경기 기준"으로 함께 표시한다(현재 Mock은
  3경기이므로 N=유효 경기 수).
- 경기 카드의 점수와 프로필 종합 점수가 **논리적으로 연결**되어야 한다
  (종합 점수 = 카드에 보이는 유효 점수들의 평균과 일치).

#### (3) 등급 (단일 상수로 관리)

경계값은 **코드와 이 문서에서 단일 상수**(예: `GRADE_THRESHOLDS`)로
관리하며 두 곳이 일치해야 한다:

- S: 850 이상
- A: 750 ~ 849
- B: 600 ~ 749
- C: 450 ~ 599
- D: 300 ~ 449
- E: 0 ~ 299

#### (4) 상위 백분위

- 실제 기준 집단(벤치마크) 데이터가 없으므로 **숫자 백분위를 생성하지
  않는다**(Mock 숫자 백분위도 만들지 않는다).
- "벤치마크 준비 중" 또는 "랭커 비교 예정"으로만 표시한다.

권장 구조: 경기별 입력 → `computeMatchScore(input): { score; grade } | null`
(유효하지 않으면 `null`), 프로필 → `computeProfileScore(matchScores):
{ score; grade; usedCount } | null`. `MatchSummary` → input 어댑터를 두어
경기 카드와 프로필이 같은 경기별 코어를 호출하도록 한다.

### 프로필 레이아웃 (재배치)

- **상단 중앙(핵심)**: GameProbe Preview Score(종합) + 등급, 상위 백분위
  (숫자 없이 "벤치마크 준비 중"/"랭커 비교 예정"), 현재 티어, 최고 티어,
  최근 20경기 승률(현재 Mock은 3경기이므로 "최근 경기 승률"로 표기하고
  표본 수를 함께 노출), 평균 ACS, 평균 K/D,
  평균 HS%, 최근 승패 흐름(recentMatches 결과로 W/L 시퀀스 표시).
- **좌측 보조(사이드바)**: 현재 랭크, 최고 랭크, 주 사용 요원(기존
  topAgents 재사용), 역할별 승률(자리), 정확도 분포 Head/Body/Legs(자리),
  주 무기(자리), 맵별 승률(자리), 활동 시간대(자리), 자주 함께한
  플레이어(자리). 값 없는 항목은 `—`/"예정" + 작은 배지.
- **중앙(핵심 본문)**: 최근 경기 목록(`MatchSummaryList`).

### 최근 경기 카드 (압축)

표시 항목: 승패, 경기 시간, 요원 이미지, 맵, 최종 스코어, K/D/A, K/D,
ACS, HS%, **ADR(신규)**, **경기별 GameProbe Match Score + 등급(신규)**,
가능하면 양 팀 요원 아이콘 요약. 카드 높이를 현재보다 줄이고 한눈에
읽히게 한다. 승/패 색상(`--accent`/`--danger`)은 유지하되 과도한 면적
채우기는 피한다(예: 좌측 얇은 컬러 바/배지 수준).

- **양 팀 요원 아이콘 요약**은 `getMatchDetail(matchId)`로 participants가
  있을 때만 표시한다(현재 ascent만 가능). 없으면 생략한다(임의 생성 금지).

### 인라인 상세 패널 (컴팩트)

- `MatchDetailPanel`의 **5개 큰 요약 카드(.match-detail-summary)를 제거**
  한다. 맵/점수/승패/모드/시간은 경기 카드에 이미 있으므로 반복하지
  않는다(필요하면 한 줄 컴팩트 헤더 정도만 허용).
- 펼치면 바로 **얇은 탭 바**가 보이게 한다. 탭은 스코어보드/라운드/성과/
  분석 4개, 기본 스코어보드, 페이지 이동 없음(기존 동작 유지).
- 내부 중첩 스크롤보다 **내용 자체를 압축**한다.
- `/matches/[matchId]` 링크는 계속 노출하지 않는다. 라우트는 유지한다.

#### 스코어보드 탭 (행 높이 축소)
우리 팀/상대 팀 구분, ACS 내림차순, YOU 강조, 요원 이미지, 플레이어명,
ACS, K/D/A, K/D, HS%, **ADR(추가)**. 데스크톱 표 / 모바일 2줄 카드형.

#### 라운드 탭 (컴팩트 행/타임라인)
라운드별 큰 카드 반복 금지. 한 줄짜리 행 또는 타임라인으로 변경
(예: `R1 / 공격 / 승리 / 폭발`). 특정 라운드를 클릭하면 세부가 보이는
구조는 선택(고려). 현재 Mock에 없는 킬 순서·무기·생존자·스파이크 상세는
임의 생성 금지 — 없는 값은 `—` 또는 "연동 후 제공".

#### 성과 탭 (조밀한 지표 그리드)
경기 MVP, 팀 내 ACS 순위, K/D, HS%, **ADR**, 첫 킬/첫 데스, 멀티킬,
클러치, 플랜트/해제를 **조밀한 지표 그리드**로 표시. 계산 가능한 값
(경기 MVP·ACS 순위·K/D·HS%·ADR)은 채우고, 계산 불가능한 값(첫 킬/첫
데스·멀티킬·클러치·플랜트/해제)은 큰 카드가 아니라 `—`로 표시.

#### 분석 탭 (예시 분석 4개)
"준비"만 반복하지 않는다. 예시 분석 4개를 배치한다: 위치 선정, 팀 교전,
첫 교전, 사이트 방어. 각 항목에 숫자 점수와 짧은 피드백 예시를 둔다.
반드시 "Example Analysis" 또는 "Mock Data" 배지를 표시하고, 실제 AI
분석처럼 오해되지 않게 한다.

### 반응형

- 데스크톱: 좌측 보조 통계 + 중앙 본문 2컬럼.
- 태블릿: 좌측 영역을 상단 또는 접이식 보조 섹션으로 이동(`<details>`
  등 순수 CSS/HTML로 구현 가능).
- 모바일: 모든 영역 단일 컬럼, 최근 경기 카드 정보 우선순위 재배치,
  스코어보드 2줄 카드형, 탭 가로 스크롤 허용 가능.
- 페이지 내부 중첩 스크롤은 피한다.

### 컴포넌트 설계 원칙 (제안 — 이름/분리는 구현자 결정 가능)

- 점수 계산은 UI와 분리: `lib/score-gameprobe.ts`(경기별·프로필 함수
  재사용).
- 프로필 레이아웃용 공통 섹션 컴포넌트 분리: `ProfileScoreCard`,
  `ProfileSidebar`, `AccuracyPanel`, `RoleStatsPanel`, `TopWeaponsPanel`,
  `MapStatsPanel`, 활동 시간대/함께한 플레이어 패널 등.
- 경기 카드 점수 배지: `MatchScoreBadge`(경기별·등급 표시, 사이드바/카드
  재사용 가능).
- `PlayerProfile.tsx`는 서버 컴포넌트로 유지해도 되고(상태 불필요),
  접이식 사이드바가 클라이언트 상태를 요구하면 해당 부분만 분리한다.
- 기존 탭 컴포넌트(`MatchScoreboardTab` 등)는 수정해 ADR/컴팩트화한다.

### Task ID에 대해

TASK-015UI(DONE) → UI2(DONE) → UI3(DONE) → UI4(DONE)에 이어 같은 Phase 2
UI 개선 계열 후속이므로 `TASK-015UI5`로 명명한다. TASK-016~038의 번호/
상태는 변경하지 않는다.

## Dependencies

- TASK-015UI2 (DONE) — `CombatStats`/`PlayerStatsSummary`/`Player` 타입,
  Mock 데이터, 프로필·카드 구조.
- TASK-015UI3 (DONE) — `asset-map.ts` 자산 매핑 함수(시그니처 변경 없이
  사용).
- TASK-015UI4 (DONE) — 인라인 펼침 + 4탭 패널(`MatchSummaryList`,
  `MatchDetailPanel`, `MatchTabs`, `Match*Tab`). 이 Task가 그 위에서
  재배치/압축한다.

## Allowed changes

```
frontend/src/components/**        # PlayerProfile 재구성, 신규 프로필 섹션/점수 배지,
                                  # MatchSummaryList 카드 압축, MatchDetailPanel 요약카드 제거,
                                  # Match*Tab 컴팩트화 + ADR/예시 분석
frontend/src/lib/**               # score-gameprobe.ts 신규, 필요 시 mock-data.ts 보조 함수
frontend/src/types/**             # CombatStats.adr 추가(+선택: 프로필 평균 필드, Player.peakRank)
frontend/src/data/mock-data.json  # recentMatches/participants stats에 adr 추가(+선택 필드)
frontend/src/app/globals.css      # 2컬럼 프로필 레이아웃·점수 카드·압축 카드·탭/표 스타일
docs/tasks/TASK-015UI5.md          # 이 문서의 Result 갱신
docs/PLAN.md                       # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                   # 작업 로그 추가
```

## Forbidden changes

- `backend/**`, `docker/**`, `scripts/**`.
- `frontend/package.json`, `frontend/package-lock.json` — 새 npm 패키지/
  의존성 추가 금지(레이아웃·애니메이션·차트 등 순수 React + CSS로 구현).
- 실제 Riot API 호출 코드 추가, 실제 AI 분석 로직 구현.
- 데이터가 없는 항목(역할별 승률·정확도 분포·맵별 승률·활동 시간대·함께한
  플레이어·라운드 파생 지표·상위 백분위 등)에 **임의 통계/숫자 생성**.
  자리만 두고 `—`/"예정"/작은 배지로 표시한다.
- `frontend/src/app/matches/[matchId]/**` 라우트 삭제. `MatchDetailView.tsx`,
  `MatchScoreboard.tsx`, `MatchRoundTimeline.tsx`는 이 Task에서 수정하지
  않는다(불가피하면 Stop condition 참조).
- 홈 화면(`frontend/src/app/page.tsx` 등) 대규모 변경 — 이 Task와 무관한
  섹션/레이아웃 변경 금지(점수 모델/컴포넌트 재사용으로 인한 import 외).
- 공통 헤더/푸터(`SiteHeader.tsx`/`SiteFooter.tsx`/`layout.tsx`) 대규모
  변경.
- `MatchRound`/`MatchDetail`에 새 필드 추가(라운드별 킬 이벤트·진영 등).
- OP.GG·Tracker.gg의 디자인을 그대로 복제(레이아웃 표절). 정보 밀도·배치
  참고는 허용하되 GameProbe 토큰·구조를 유지한다.
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI4.md`, 그 외
  `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 번호의 작업 시작.

## Acceptance criteria

### 1. GameProbe Preview Score (점수 모델)

- [x] `frontend/src/lib/`에 UI와 분리된 **순수 함수** 점수 계산 모듈이
  있고(부수효과·난수·시간 의존 없음 → 동일 입력은 항상 동일 출력), 경기
  카드와 프로필 종합 점수가 **동일한 경기별 코어 함수/가중치/등급 로직**을
  재사용한다.
- [x] 경기별 가중치(ACS 30 / K/D 25 / ADR 15 / 승패 10 / HS% 10 /
  어시스트 5 / 생존 기여 5), 정규화 상수, 등급 경계(S≥850, A 750–849,
  B 600–749, C 450–599, D 300–449, E 0–299)가 **코드와 이 문서에서
  일치**한다. 등급 경계는 단일 상수로 관리된다.
- [x] 각 입력값과 중간 정규화 값이 모두 `[0, 1]`로 clamp되고, 최종 점수는
  0–1000으로 clamp된 정수다.
- [x] `totalRounds`가 0이거나 없으면 생존 기여 항목이 제외되고 남은
  가중치로 비례 재분배된다.
- [x] 누락 데이터는 0점이 아니라 해당 항목을 제외 후 가중치를 비례
  재분배하며, 이 규칙이 코드 주석과 이 문서에 동일하게 기록돼 있다.

### 2. 프로필 종합 점수 + 상단 중앙

- [x] 프로필 종합 점수는 별도 혼합 공식이 아니라, 현재 표시 중인 최근
  경기들의 **유효한 경기별 Preview Score 산술평균**으로 계산된다(종합
  점수 = 카드에 보이는 유효 점수들의 평균과 일치).
- [x] 유효한 경기가 없으면 점수 대신 `—`가 표시된다.
- [x] 평균에 사용된 경기 수가 "최근 N경기 기준"으로 표시된다.
- [x] 프로필 상단 중앙에 GameProbe Preview Score(종합) + 등급이 표시된다.
- [x] 현재 티어, 최고 티어, 최근 경기 승률(+표본 수), 평균 ACS, 평균 K/D,
  평균 HS%, 최근 승패 흐름이 표시된다.
- [x] 상위 백분위는 숫자(실제·Mock 모두) 없이 "벤치마크 준비 중"/"랭커
  비교 예정"으로만 표기된다.

### 2-1. 사용자 고지 (Preview/Mock)

- [x] 프로필과 경기 카드 모두 점수 가까이에 "Preview Score" 또는
  "Mock Score" 표기가 있고, Riot 공식 점수·실제 랭킹 지표처럼 표현되지
  않는다.
- [x] 점수 산정 방식(가중치 기반 Preview)을 짧은 툴팁(`title`/aria 등) 또는
  보조 문구로 확인할 수 있다.

### 2-2. 점수 모델 검증

다음 속성이 확인돼야 한다(새 패키지 없이 가능. 기존 테스트 러너가 없으면
1회성 검증 스크립트나 수동 계산으로 확인하고 결과를 Result에 기록한다.
검증용 임시 스크립트는 커밋하지 않는다):

- [x] **결정성**: 동일 입력에 대해 항상 동일한 점수를 반환한다.
- [x] **범위**: 산출되는 모든 점수가 0~1000 정수 범위 안이다.
- [x] **누락값 재분배**: 일부 컴포넌트 입력을 제거하면 해당 가중치가
  제외·재분배되며, 0점 처리되지 않는다.
- [x] **0 rounds 처리**: `totalRounds`가 0/없을 때 생존 기여가 제외되고
  남은 6개 가중치로 정상 계산된다.
- [x] **등급 경계**: 점수 299/300/449/450/599/600/749/750/849/850에서
  등급이 각각 E/D, D/C, C/B, B/A, A/S 경계로 올바르게 매핑된다.
- [x] **프로필 평균 일치**: 프로필 종합 점수가 유효한 경기별 점수들의
  산술평균(반올림)과 일치한다.

### 3. 프로필 좌측 보조 영역

- [x] 데스크톱에서 좌측 보조 통계와 중앙 본문이 **시각적으로 구분되는
  2컬럼**으로 배치된다.
- [x] 현재 랭크·최고 랭크·주 사용 요원이 표시되고, 역할별 승률·정확도
  분포(Head/Body/Legs)·주 무기·맵별 승률·활동 시간대·자주 함께한 플레이어는
  **자리만** 잡혀 있으며 값 없는 항목은 `—`/"예정" + 작은 배지로 표시된다
  (큰 PENDING 카드 아님).

### 4. 최근 경기 카드 (압축)

- [x] 카드에 승패·경기 시간·요원 이미지·맵·최종 스코어·K/D/A·K/D·ACS·
  HS%·ADR·경기별 GameProbe Match Score + 등급이 표시된다.
- [x] 카드 세로 높이가 TASK-015UI4 대비 줄어든다(맵 이미지 축소/정보
  재배치 등).
- [x] 승/패 색상은 유지하되 카드 전체를 강한 색으로 채우지 않는다.
- [x] 양 팀 요원 아이콘 요약은 상세(participants)가 있는 경기에서만
  표시되고, 없는 경기에서는 생략된다(임의 생성 없음).

### 5. 인라인 상세 패널 (컴팩트)

- [x] `MatchDetailPanel`의 큰 요약 카드 5개(.match-detail-summary)가
  제거된다(맵/점수/승패/모드/시간 반복 표시 없음).
- [x] 펼치면 곧바로 얇은 탭 바가 보이고, 기본 탭은 스코어보드, 탭 전환
  시 페이지 이동이 없다.
- [x] `/matches/[matchId]` 상세 링크가 프로필 화면에 노출되지 않는다.

### 6. 탭별 요구

- [x] 스코어보드: 행 높이 축소, 우리 팀/상대 팀 구분, ACS 내림차순, YOU
  강조, 요원 이미지·플레이어명·ACS·K/D/A·K/D·HS%·ADR, 데스크톱 표/모바일
  2줄 카드형.
- [x] 라운드: 큰 카드 반복이 제거되고 한 줄 행 또는 타임라인으로 표시된다
  (예: `R1 / 공격 / 승리 / 폭발`). 없는 상세는 `—`/"연동 후 제공".
- [x] 성과: 조밀한 지표 그리드. 경기 MVP·팀 내 ACS 순위·K/D·HS%·ADR은
  계산 표시, 첫 킬/첫 데스·멀티킬·클러치·플랜트/해제는 `—`.
- [x] 분석: 위치 선정/팀 교전/첫 교전/사이트 방어 4개 예시에 숫자 점수 +
  짧은 피드백이 있고 "Example Analysis"/"Mock Data" 표기가 있다.

### 7. 반응형

- [x] 모바일에서 모든 영역이 단일 컬럼으로 전환되는 규칙이 CSS에 존재한다.
- [x] 태블릿에서 좌측 보조 영역이 상단/접이식으로 이동하는 규칙이 존재한다.
- [x] 스코어보드가 모바일에서 2줄 카드형으로 전환된다.

### 8. 데이터/타입

- [x] `CombatStats`에 `adr` 필드가 Mock/aggregated 주석과 함께 추가되고,
  `recentMatches`(3건)·`participants`(10명) stats에 mock `adr`가 채워진다.
- [x] `MatchRound`/`MatchDetail` 구조와 다른 기존 필드는 변경되지 않는다.

### 9. 라우트 유지

- [x] `frontend/src/app/matches/[matchId]/page.tsx`가 그대로 존재한다.
- [x] `MatchDetailView.tsx`/`MatchScoreboard.tsx`/`MatchRoundTimeline.tsx`는
  이 Task에서 변경되지 않는다.

### 10. 빌드 및 범위

- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.
- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/app/matches`
  출력이 비어 있다.
- [x] `grep -rn "경기 상세 보기" frontend/src/components` 출력이 비어 있다.

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) /matches/[matchId] 라우트 유지 확인
ls "frontend/src/app/matches/[matchId]/page.tsx"

# 5) 상세 링크 미노출 확인 (출력 없어야 함)
grep -rn "경기 상세 보기" frontend/src/components

# 6) 큰 요약 카드 제거 확인 (.match-detail-summary 미사용 — 출력 없어야 함)
grep -rn "match-detail-summary" frontend/src

# 7) ADR 반영 확인 (타입 + mock 데이터에 adr 존재)
grep -n "adr" frontend/src/types/match.ts
grep -c '"adr"' frontend/src/data/mock-data.json   # 13 (recentMatches 3 + participants 10)

# 8) 변경되지 않아야 하는 영역 확인 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts \
  frontend/src/app/matches
```

## Stop conditions

다음 상황에서는 작업을 중단하고 `BLOCKED`로 보고한다:

1. 레이아웃/점수/차트 구현에 새 npm 패키지 설치가 불가피한 경우.
2. `/matches/[matchId]` 라우트 또는 `MatchDetailView`/`MatchScoreboard`/
   `MatchRoundTimeline`을 수정하지 않으면 Acceptance criteria를 만족할 수
   없는 경우(예: 타입 공유 충돌). 변경 없이 BLOCKED로 보고한다.
3. 정의된 점수 모델(가중치/정규화/등급/fallback)로는 기존 Mock 데이터에서
   안전하게 점수를 계산할 수 없는 경우 — 임의 값 생성 대신 어떤 입력이
   부족한지 보고한다.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

다음은 BLOCKED가 **아니다** (계속 진행):

- `agentId` 슬러그가 `asset-map.ts`에 없어 일부 요원 이미지가 placeholder로
  표시되는 경우(기존 fallback 정상 동작).
- haven/split 경기에 상세(participants/rounds)가 없어 양 팀 요원 요약·탭
  내용이 비고 "상세 데이터 없음"이 표시되는 경우(정상).
- 사이드바 다수 항목이 `—`/"예정"으로 남는 경우(의도된 동작).

## Result

DONE (2026-06-16)

변경 파일:

- `frontend/src/lib/score-gameprobe.ts`
- `frontend/src/components/MatchScoreBadge.tsx`
- `frontend/src/components/ProfileScoreCard.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/types/match.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI5.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

구현 결과:

- `score-gameprobe.ts`에 UI와 분리된 순수 점수 계산 함수를 추가했다.
  경기별 점수와 프로필 종합 점수는 같은 `computeMatchSummaryScore`/
  `computeProfileScore` 흐름과 `GRADE_THRESHOLDS`를 재사용한다.
- `CombatStats.adr`를 Mock/aggregated 필드로 추가하고, `recentMatches` 3건과
  `matchDetails[0].participants` 10명에 `adr`를 채웠다.
- 프로필 페이지를 좌측 보조 통계 + 중앙 핵심 영역 2컬럼으로 재배치했다.
  현재 데이터가 없는 최고 랭크, 역할별 승률, 정확도 분포, 주 무기, 맵별
  승률, 활동 시간대, 자주 함께한 플레이어는 `—`/`예정`으로만 표시했다.
- 프로필 중앙에는 GameProbe Preview Score, 등급, 최근 N경기 기준, 현재
  티어, 최고 티어 `—`, 승률, 평균 ACS, 평균 K/D, 평균 HS%, 최근 승패 흐름을
  표시했다.
- 최근 경기 카드를 압축형으로 변경하고, 승패/시간/요원/맵/스코어/KDA/KD/
  ACS/HS/ADR/경기별 Match Preview Score/등급을 표시했다. 상세 데이터가 있는
  Ascent 경기에는 양 팀 요원 아이콘 요약을 표시하고, 없는 경기에는 생략했다.
- `MatchDetailPanel`의 큰 `.match-detail-summary` 5개 카드 반복을 제거하고
  바로 얇은 탭 바와 내용을 표시하게 했다.
- 스코어보드 탭은 ADR을 추가하고 행 높이를 줄였다.
- 라운드 탭은 큰 카드 반복 대신 한 줄 행 형태로 압축했다. Mock에 없는
  킬 이벤트는 `—`로 표시했다.
- 성과 탭은 조밀한 지표 그리드로 바꾸고, 경기 MVP/ACS 순위/KD/HS/ADR은
  계산 표시, 첫 킬/첫 데스·멀티킬·클러치·플랜트/해체는 `—`로 표시했다.
- 분석 탭은 Example Analysis/Mock Data 맥락에서 위치 선정, 팀 교전, 첫
  교전, 사이트 방어 예시 점수와 짧은 안내를 표시했다. 실제 AI 분석은
  구현하지 않았다.

점수 검증 결과:

- 동일 입력 결정성: 성공.
- 모든 산출 점수 0~1000 정수 범위: 성공.
- 누락값 재분배: 성공. 누락 컴포넌트는 0점이 아니라 가중치에서 제외된다.
- `totalRounds` 0/없음 처리: 성공. 생존 기여를 제외하고 남은 가중치로 계산된다.
- 등급 경계 299/300/449/450/599/600/749/750/849/850: 성공.
- 현재 Mock 경기 점수: 773(A), 499(C), 741(B).
- 프로필 종합 점수: 671(B). 유효 경기별 점수 3개의 산술평균과 일치한다.

검증 결과:

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `ls "frontend/src/app/matches/[matchId]/page.tsx"`: 파일 존재 확인.
- `grep -rn "경기 상세 보기" frontend/src/components`: 출력 없음.
- `grep -rn "match-detail-summary" frontend/src`: 출력 없음.
- `grep -n "adr" frontend/src/types/match.ts`: `CombatStats.adr` 확인.
- `grep -c '"adr"' frontend/src/data/mock-data.json`: 13.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/app/matches`: 출력 없음.
- `git diff --name-only -- frontend/src/app/matches frontend/src/components/MatchDetailView.tsx frontend/src/components/MatchScoreboard.tsx frontend/src/components/MatchRoundTimeline.tsx`: 출력 없음.

남은 위험:

- 현재 상세 데이터는 `mock-match-ascent-001`에만 있으므로 Haven/Split 경기의
  양 팀 요원 요약과 상세 탭 내용은 제공되지 않는다.
- 점수는 Preview/Mock 단계 산식이며 실제 Riot 공식 점수나 랭킹 지표가 아니다.
- 벤치마크 데이터가 없으므로 백분위 숫자는 제공하지 않고, 랭커 비교 예정으로
  남겼다.
