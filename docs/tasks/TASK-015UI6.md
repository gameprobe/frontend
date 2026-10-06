# TASK-015UI6: 프로필 데스크톱 레이아웃 폭·2열 비율 수정 + 사이드바 Mock 데이터 채우기

## Status

READY

## Goal

TASK-015UI5(DONE)로 만들어진 GameProbe 프로필 페이지(`/players/[puuid]`)의
**데스크톱 레이아웃 폭과 2열 비율을 수정**하고, 현재 `—`/"예정"으로 비어
있는 **사이드바 항목에 명확한 Mock 데이터를 채운다**. 점수 모델·탭·인라인
패널 등 UI5의 기능 구조는 유지하고, 이번에는 (1) 레이아웃/폭/겹침/잘림
버그 수정과 (2) 사이드바 Mock 데이터 보강에만 집중한다.

## Context

### 현재 구조 (TASK-015UI5 결과, 변경 전)

- `frontend/src/app/players/[puuid]/page.tsx` — `<main className="placeholder-page">`
  안에서 `PlayerProfile`을 렌더링한다. **이 래퍼 클래스 `.placeholder-page`가
  `width: min(100%, 920px)`로 폭을 제한**하는 것이 데스크톱이 좁고 사이드바·
  중앙이 비좁아 보이는 **근본 원인**이다(globals.css:310 부근).
- `frontend/src/components/PlayerProfile.tsx` — **서버 컴포넌트**.
  `.profile-layout`(좌측 `ProfileSidebar` + 우측 `.profile-main`) 구조.
  `.profile-main`에 `ProfileScoreCard`와 최근 경기 섹션(`MatchSummaryList`).
- `frontend/src/components/ProfileScoreCard.tsx` — `.profile-score-card` 안에
  `.profile-score-hero`(좌: `<h1>` Riot ID + `<p>` 티어, 우: `MatchScoreBadge`).
  hero는 `grid-template-columns: minmax(0,1fr) auto`인데, **제목을 감싼 내부
  `<div>`에 `min-width:0`이 없어** 긴 Riot ID가 줄바꿈되지 않고 우측 Score
  배지 영역을 침범(겹침)할 수 있다. `<h1>` 폰트는 `clamp(34px,5vw,56px)`로
  큼.
- `frontend/src/components/ProfileSidebar.tsx` — 현재 랭크(실값)와 주 사용
  요원(topAgents 실값)만 채워져 있고, 나머지는 `PlaceholderStat`(`—` + "예정")
  으로만 표시: **최고 랭크, 역할별 승률, 정확도 분포, 주 무기, 맵별 승률,
  활동 시간대, 자주 함께한 플레이어**. 이 7개가 이번 Task의 Mock 데이터
  대상이다.
- `frontend/src/components/MatchSummaryList.tsx` — **클라이언트 컴포넌트**.
  카드(`.match-card`)는 `grid-template-columns:
  4px minmax(170px,1.3fr) minmax(280px,2fr) minmax(150px,auto) 28px`의 5열
  (컬러 strip · 제목영역 · `.match-compact-stats` · `.match-card-score` ·
  화살표). 최소 합계 폭이 약 630px+ 인데, 920px 페이지에서 사이드바(280)와
  gap을 빼면 중앙(`.profile-main`)이 약 560~570px만 남아 **우측 Match Score
  영역과 화살표가 잘리고, compact-stats가 강제 줄바꿈**된다.

### 현재 레이아웃 CSS 핵심 (globals.css)

```css
.placeholder-page { width: min(100%, 920px); margin: 0 auto; padding: 48px 24px; }
.profile-layout  { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 18px; }
.profile-score-hero { grid-template-columns: minmax(0,1fr) auto; gap: 18px; align-items: center; }
.match-card { grid-template-columns: 4px minmax(170px,1.3fr) minmax(280px,2fr) minmax(150px,auto) 28px; }
/* 반응형: @media (max-width: 900px) → profile-layout 1fr, sidebar 2열, match-card 3열 */
/*        @media (max-width: 640px) → 단일 컬럼 */
```

→ 핵심 문제는 모두 **920px 폭 상한**과 그에 따른 비좁은 중앙 폭에서
비롯된다. 폭을 1200~1280px로 늘리고 2열 비율을 조정하면 겹침·잘림·줄바꿈이
함께 해소된다.

### 폭 상한 해소 방법 (래퍼가 라우트에 있음)

`920px` 상한은 **라우트 파일의 `.placeholder-page`**에서 오며, 이 클래스는
`/matches`, `/privacy`, `/terms`, `/connect` 등 다른 페이지와 공유된다.
프로필만 넓히기 위해 다음 중 하나를 사용한다(구현자 선택, **globals.css
우선**):

1. **(권장, 라우트 무수정)** globals.css에서
   `.placeholder-page:has(.profile-layout)`(또는 프로필 전용 추가 클래스)에
   대해 `width: min(100%, 1280px)`로 상향한다. 다른 페이지의
   `.placeholder-page`(920px)는 그대로 둔다.
2. **(대안, 최소 라우트 수정)** `players/[puuid]/page.tsx`의 래퍼에 프로필
   전용 클래스(예: `placeholder-page profile-page`)를 추가하고 globals.css에서
   그 클래스만 넓힌다. **이 경우에도 래퍼 클래스명 외 로직은 변경하지
   않는다.**

두 방법 모두 `/matches`·`/privacy`·`/terms`·`/connect` 등 다른 페이지 폭에
영향을 주지 않아야 한다.

### 데이터 구조 방침 (사이드바 Mock)

- 기존 `Player`/`MatchSummary`/`MatchDetail`/`CombatStats` 타입을 무리하게
  확장·오염시키지 않는다. 사이드바 보조 통계는 **별도 Mock 타입/데이터
  구조**로 관리한다.
- UI 컴포넌트 내부에 Mock 값을 하드코딩하지 않는다. Mock 데이터는
  `frontend/src/data/`(JSON) 또는 별도 mock 모듈(`frontend/src/data/*.ts`)에
  두고, 타입은 `frontend/src/types/`에 둔다.
- **기존 로더(`getDemoPlayerByPuuid`/`getRecentMatchesForPlayer`/
  `getMatchDetail`) 시그니처는 변경하지 않는다.** 사이드바용 신규 로더
  (예: `getProfileSidebarMock(puuid: string)`)를 추가하는 것은 허용한다.
- `PlayerProfile`을 불필요하게 client component로 바꾸지 않는다(사이드바는
  정적 Mock 데이터 표시이므로 서버 컴포넌트로 충분하다).

### Task ID에 대해

TASK-015UI~UI5에 이어 같은 Phase 2 UI 개선 계열 후속이므로 `TASK-015UI6`로
명명한다. TASK-016~038의 번호/상태는 변경하지 않는다.

## Dependencies

- TASK-015UI5 (DONE) — `PlayerProfile`/`ProfileScoreCard`/`ProfileSidebar`/
  `MatchSummaryList`/`MatchScoreBadge`, `score-gameprobe.ts`, `.profile-*`·
  `.match-card*` 스타일, `CombatStats.adr`.
- TASK-015UI3 (DONE) — `asset-map.ts` 자산 매핑 함수(주 무기/요원 이미지에
  사용, 시그니처 변경 없이).

## 사이드바 Mock 데이터 모델 (제안)

별도 타입(`frontend/src/types/`에 예: `ProfileSidebarStats`)과 데이터
(`frontend/src/data/`에 puuid 키 기반)로 구성한다. 모든 값은 Mock이며 서로
일관되게 구성한다.

- **최고 랭크(peakRank)**: 단일 라벨 문자열(예: `"Immortal 1"`). 현재
  랭크보다 같거나 높은 합리적 값.
- **역할별 승률(roleWinRates)**: `{ role, matchesPlayed, wins, losses,
  winRate }[]`. **`matchesPlayed === wins + losses`**, `winRate ===
  round(wins / matchesPlayed * 100)`로 논리 일치. 역할 예: 타격대/척후대/
  감시자/전략가.
- **정확도 분포(accuracy)**: `{ headPct, bodyPct, legsPct }`이며 **세 값의
  합 === 100**(정수).
- **주 무기(topWeapons)**: `{ weaponId, displayName, kills, headshotPercentage }[]`
  구조만 제공. `weaponId`는 `asset-map.ts`로 이미지 매핑 가능한 슬러그
  (예: `vandal`/`phantom`/`operator`). **과도한 허위 정밀도 금지**(킬 수는
  정수, 비율은 정수 % 수준; 소수점 다단 수치 금지).
- **맵별 승률(mapWinRates)**: `{ mapId, mapName, matchesPlayed, wins, losses,
  winRate }[]`. 역할별과 동일한 논리 일치 규칙. `mapId`는 `ascent`/`haven`/
  `split` 등.
- **활동 시간대(activityByTimeSlot)**: `{ slotLabel, matches }[]`. **"최근
  20경기 Mock 기준"임을 UI에 표시**한다(합계가 20 부근이 되도록 구성 권장).
- **자주 함께한 플레이어(frequentTeammates)**: `{ riotId(또는 name),
  matchesPlayed, winRate }[]`, **3~5명**.

표시 원칙:

- 각 사이드바 패널에 Mock임을 명확히 표시한다(기존 `.data-badge`("Mock")
  패턴 재사용).
- 실제 Riot API 제공값처럼 표현하지 않는다. 기존 "실제 API 연동 전 단계"
  고지(`RiotConnectNotice` 등)는 유지한다.

## 레이아웃 변경 사양

- 전체 콘텐츠 최대 폭: **1200~1280px**(중앙 정렬, 양옆 과도한 빈 공간 제거).
- 좌측 사이드바: **280~320px**(고정 또는 `clamp`).
- 중앙 콘텐츠: 나머지 **1fr**(`minmax(0,1fr)`로 오버플로 방지).
- 열 간격: **20~24px**.
- `.profile-score-hero`: 제목 블록과 Score 배지를 별도 grid/flex 영역으로
  분리하고, 제목 내부 컨테이너에 `min-width:0` + 줄바꿈 허용을 적용해 **긴
  이름이 Score 카드와 겹치지 않게** 한다. 최소 너비 이하에서만 세로 배치.
- 최근 경기 카드: 중앙 폭을 충분히 사용하고, 한 줄에서 다음 우선순위가
  잘리지 않게 배치 — **승패/시간 → 요원/맵 → KDA/ACS/ADR/HS% →
  Preview Score → 펼침 화살표**. 카드 높이는 조밀하게 유지하고, 작은
  화면에서만 정보 줄바꿈을 허용한다.
- 데스크톱에서 태블릿처럼 과도하게 축소되지 않도록 2열→1열 전환 breakpoint를
  재검토한다(현재 900px에서 너무 일찍 무너질 수 있음).

## 반응형

- **데스크톱**(예: ≥1024px): 2열(사이드바 + 중앙). 1200px 이상에서 중앙
  폭이 충분히 확보되고 최근 경기 카드가 잘리지 않는다.
- **태블릿**(예: 640–1023px): 사이드바가 위로 이동하거나 2열이 축소된다.
- **모바일**(예: ≤640px): 모든 영역 단일 컬럼, 최근 경기 카드 정보 줄바꿈
  허용.
- 최근 경기 카드가 잘리지 않도록 breakpoint를 재검토한다.

## Allowed changes

```
frontend/src/components/PlayerProfile.tsx     # 사이드바 데이터 주입(서버 컴포넌트 유지)
frontend/src/components/ProfileScoreCard.tsx  # hero 겹침 수정(min-width/줄바꿈)
frontend/src/components/ProfileSidebar.tsx    # —/예정 → Mock 데이터 패널 렌더
frontend/src/components/MatchSummaryList.tsx  # 카드 우선순위/줄바꿈(필요 시 클래스만)
frontend/src/data/**                          # 사이드바 Mock 데이터(별도 모듈/JSON)
frontend/src/lib/**                           # 사이드바 Mock 로더 추가(기존 시그니처 유지)
frontend/src/types/**                         # ProfileSidebarStats 등 별도 타입
frontend/src/app/globals.css                  # 폭/2열 비율/hero/카드/breakpoint
frontend/src/app/players/[puuid]/page.tsx     # (옵션) 래퍼 클래스만 추가 — 로직 변경 금지
docs/tasks/TASK-015UI6.md                      # 이 문서의 Result 갱신
docs/PLAN.md                                   # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                               # 작업 로그 추가
```

> `players/[puuid]/page.tsx`는 폭 상한 해소를 위한 **래퍼 클래스명 추가에
> 한정**해 허용한다(globals.css `:has()` 방식을 쓰면 수정하지 않아도 된다).
> 데이터 로딩/분기 등 로직은 변경하지 않는다.

## Forbidden changes

- `backend/**`, `docker/**`, `scripts/**`.
- `frontend/package.json`, `frontend/package-lock.json`, 새 npm 패키지 설치.
- 실제 Riot API 호출 코드, 실제 AI 분석 로직.
- 점수 계산 모델(`score-gameprobe.ts`)의 가중치/정규화/등급 변경 — 이번
  Task 범위 아님(레이아웃·데이터 보강만).
- 홈 화면(`frontend/src/app/page.tsx`) 대규모 변경, 공통 헤더/푸터
  (`SiteHeader.tsx`/`SiteFooter.tsx`/`layout.tsx`) 대규모 변경.
- `/matches`·`/privacy`·`/terms`·`/connect` 등 다른 페이지의 `.placeholder-page`
  기본 폭(920px) 변경(프로필만 넓혀야 함).
- 전체 Riot 자산 카탈로그 확장(주 무기 Mock은 기존 `vandal`/`phantom`/
  `operator` 등 이미 매핑된 슬러그를 우선 사용; 신규 무기/요원/맵 자산 대량
  추가는 이번 Task 범위 아님).
- 기존 로더(`getDemoPlayerByPuuid`/`getRecentMatchesForPlayer`/
  `getMatchDetail`) 시그니처 변경.
- `PlayerProfile`을 불필요하게 client component로 전환.
- `MatchDetailPanel`/`Match*Tab`/`MatchScoreboard`/`MatchRoundTimeline`/
  `MatchDetailView` 및 `/matches/[matchId]` 라우트 구조 변경.
- 사이드바 Mock 값에 **과도한 허위 정밀도**(다단 소수점 등) 부여, 또는
  실제 API 값처럼 표기.
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`~`TASK-015UI5.md`, 그 외
  `docs/tasks/TASK-0XX.md`.
- TASK-015UI7 또는 TASK-016 이상 작업 시작.

## Acceptance criteria

### 1. 레이아웃 폭·2열 비율

- [x] 프로필 페이지 전체 콘텐츠 최대 폭이 **1200~1280px** 범위이고 중앙
  정렬되며 양옆 과도한 빈 공간이 제거된다.
- [x] 좌측 사이드바 폭이 **280~320px**, 중앙이 나머지 `1fr`, 열 간격이
  **20~24px**다.
- [x] 다른 페이지(`/matches`·`/privacy`·`/terms`·`/connect`)의
  `.placeholder-page` 폭(920px)은 변경되지 않는다.

### 2. 겹침·잘림·줄바꿈 수정

- [x] 중앙 프로필 카드의 제목(Riot ID)과 Preview Score 카드가 **겹치지
  않는다**(긴 이름에서도 충돌 없음, 최소 너비 이하에서만 세로 배치).
- [x] 최근 경기 카드의 **Match Score 영역과 펼침 화살표가 잘리지 않는다**.
- [x] 데스크톱 폭에서 최근 경기 카드 텍스트가 **강제 줄바꿈되지 않는다**
  (작은 화면에서만 줄바꿈 허용).
- [x] 데스크톱에서 태블릿처럼 과도하게 축소되지 않도록 2열→1열 breakpoint가
  조정된다.

### 3. 사이드바 Mock 데이터

- [x] 기존 `—`/"예정"이던 7개 항목(최고 랭크·역할별 승률·정확도 분포·주
  무기·맵별 승률·활동 시간대·자주 함께한 플레이어)에 Mock 데이터가
  표시된다.
- [x] 각 패널에 Mock임을 알리는 표시(`.data-badge` "Mock" 등)가 있고, 실제
  Riot API 값처럼 표현되지 않으며, 기존 API 연동 전 단계 고지가 유지된다.
- [x] **정확도 Head/Body/Legs 합계가 정확히 100%**다.
- [x] **역할별 승률**: 각 역할의 `matchesPlayed === wins + losses`,
  `winRate === round(wins/matchesPlayed*100)`로 논리 일치한다.
- [x] **맵별 승률**도 동일한 논리 일치 규칙을 만족한다.
- [x] 주 무기 통계는 킬 수·정확도 등 **구조만** 제공하고 과도한 허위 정밀도가
  없다.
- [x] 활동 시간대에 "최근 20경기 Mock 기준" 표시가 있다.
- [x] 자주 함께한 플레이어가 **3~5명** 표시된다.

### 4. 데이터 구조/컴포넌트 원칙

- [x] 사이드바 Mock은 기존 `Player`/`Match*` 타입을 오염시키지 않고 **별도
  타입/데이터 구조**로 관리된다.
- [x] Mock 값이 UI 컴포넌트 내부에 하드코딩되지 않고 `frontend/src/data/`
  (또는 별도 mock 모듈)에서 로드된다.
- [x] 기존 로더 시그니처가 변경되지 않는다(신규 사이드바 로더 추가는 허용).
- [x] `PlayerProfile`이 client component로 전환되지 않는다.

### 5. 반응형

- [x] 데스크톱(2열)·태블릿(사이드바 상단/축소)·모바일(단일 컬럼) 레이아웃이
  CSS에 정의된다.
- [x] 1200px 이상에서 중앙 폭이 충분히 확보되고 최근 경기 카드가 잘리지
  않는다.

### 6. 빌드 및 범위

- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.
- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/app/matches`
  출력이 비어 있다.

## Verification commands

```bash
# 1) 타입 검사
cd frontend && npx tsc --noEmit

# 2) Lint
cd frontend && npm run lint

# 3) 빌드
cd frontend && npm run build

# 4) 다른 페이지 폭(920px) 미변경 확인 — 기본 .placeholder-page 규칙 유지
grep -n "placeholder-page" frontend/src/app/globals.css

# 5) 사이드바에 더 이상 모든 항목이 placeholder(—/예정)만은 아님 확인
#    (PlaceholderStat 7개 전부가 아니라 실제 Mock 패널이 추가됐는지 육안/코드 확인)
grep -n "PlaceholderStat\|side-panel\|data-badge" frontend/src/components/ProfileSidebar.tsx

# 6) 기존 로더 시그니처 유지 확인
grep -n "export function getDemoPlayerByPuuid\|export function getRecentMatchesForPlayer\|export function getMatchDetail" frontend/src/lib/mock-data.ts

# 7) 변경되지 않아야 하는 영역 확인 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts \
  frontend/src/app/matches
```

## Stop conditions

다음 상황에서는 작업을 중단하고 `BLOCKED`로 보고한다:

1. 레이아웃 수정에 새 npm 패키지 설치가 불가피한 경우.
2. 폭 상한 해소가 `globals.css`(`:has()`) 또는 래퍼 클래스명 추가만으로
   불가능하고, 라우트/공통 레이아웃 로직의 구조 변경이 불가피한 경우.
3. 사이드바 Mock 데이터의 논리 일치(정확도 합 100, 역할/맵 승률 일치)를
   만족시키지 못하는 구조적 충돌이 있는 경우.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

다음은 BLOCKED가 **아니다** (계속 진행):

- `:has()` 대신 래퍼 클래스명 추가 방식을 선택한 경우(둘 다 허용).
- 주 무기 Mock 슬러그가 일부 placeholder 이미지로 표시되는 경우(기존
  fallback 정상 동작).
- 활동 시간대 합이 정확히 20이 아니라 그 부근인 경우(표본 표기 기준만
  명확하면 됨).

## Result

Status: DONE (2026-06-16)

### 변경된 파일

- `frontend/src/app/players/[puuid]/page.tsx`
- `frontend/src/app/globals.css`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/ProfileScoreCard.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/data/profile-sidebar-stats.ts`
- `frontend/src/lib/profile-sidebar-stats.ts`
- `frontend/src/types/index.ts`
- `frontend/src/types/profile-sidebar.ts`
- `docs/PLAN.md`
- `docs/PROGRESS.md`
- `docs/tasks/TASK-015UI6.md`

### 작업 내용

- 프로필 라우트에 `profile-page` 전용 클래스를 추가해 기본
  `.placeholder-page` 920px 폭은 유지하면서 프로필만 `1240px` 폭으로
  확장했다.
- 프로필 레이아웃을 `clamp(280px, 24vw, 320px) minmax(0, 1fr)`와 `22px`
  gap으로 조정하고, 1023px 이하에서는 단일 컬럼/축소형 사이드바로 전환했다.
- 프로필 제목 영역에 `min-width: 0`과 긴 Riot ID 줄바꿈 안전 처리를 추가하고,
  Preview Score 카드와 최근 N경기 기준 문구가 겹치거나 부자연스럽게 깨지지
  않도록 조정했다.
- 최근 경기 카드 그리드를 넓어진 중앙 폭에 맞게 재조정하고 Match Preview
  Score/화살표 영역이 잘리지 않도록 `minmax(0, 1fr)` 및 `max-content`
  기반 컬럼을 적용했다.
- `ProfileSidebarStats` 전용 타입, Mock 데이터, `getProfileSidebarStats(puuid)`
  조회 함수를 추가했다. 기존 `Player`/`Match*` 타입과 기존 로더 시그니처는
  변경하지 않았다.
- 최고 랭크, 역할별 승률, 정확도 분포, 주 무기, 맵별 승률, 활동 시간대,
  자주 함께한 플레이어 패널에 구조화된 Mock 데이터를 표시하고 모든 신규
  패널에 Mock 배지를 유지했다.

### 실행한 명령어 및 검증 결과

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `grep -n "placeholder-page" frontend/src/app/globals.css`: 성공. 기본
  `.placeholder-page`는 `width: min(100%, 920px)`로 유지되고, 프로필 전용
  `.profile-page`만 `1240px`로 확장됨을 확인했다.
- `grep -n "PlaceholderStat\|side-panel\|data-badge" frontend/src/components/ProfileSidebar.tsx`:
  성공. `PlaceholderStat` 출력은 없고 `side-panel`/`data-badge` 기반 Mock
  패널이 확인됐다.
- `grep -n "export function getDemoPlayerByPuuid\|export function getRecentMatchesForPlayer\|export function getMatchDetail" frontend/src/lib/mock-data.ts`:
  성공. 기존 로더 시그니처가 유지됐다.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/app/matches`:
  성공. 출력 없음.
- 사이드바 Mock 데이터 일관성 검증(Node): 성공. 정확도 합계 100, 역할/맵/
  함께한 플레이어의 경기 수·승패·승률, 활동 시간대 20경기 기준, 함께한
  플레이어 4명 조건을 확인했다.
- `rg -n "^\"use client\"|use client" frontend/src/components/PlayerProfile.tsx frontend/src/components/ProfileSidebar.tsx frontend/src/components/ProfileScoreCard.tsx`:
  성공. 출력 없음.

### 남은 위험

- 사이드바 통계는 Mock/Preview 데이터이며 Riot API가 직접 제공한 실제 통계가
  아니다.
- 실제 브라우저 육안 QA는 수행하지 않았다. 레이아웃은 CSS/빌드/정적 검증으로
  확인했다.
