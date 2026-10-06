# TASK-015UI4: 최근 경기 카드 인라인 펼침 + 4탭 상세 패널

## Status

DONE (2026-06-15)

## Goal

`PlayerProfile`의 "최근 경기" 목록(`MatchSummaryList`)에서 각 경기 카드를
클릭하면, 페이지 이동 없이 카드 내부에 **인라인 상세 패널**이 펼쳐지고
OP.GG·Tracker.gg 스타일의 **4개 탭**(스코어보드/라운드/성과/분석)으로 경기
정보를 확인할 수 있게 한다. 기존 "경기 상세 보기" 링크(→
`/matches/[matchId]`)는 이 UI에서 제거하지만, `/matches/[matchId]` 라우트
자체는 삭제하지 않고 유지한다(향후 동일 탭 컴포넌트를 재사용할 수 있는
별도 Task의 대상).

### 확정 UX

- 카드 전체 클릭 가능, 오른쪽에 펼침 화살표 표시. 카드 클릭과 화살표는
  **같은 펼침/접힘 상태**를 제어한다.
- 다시 클릭하면 접힘.
- 한 번에 하나의 경기만 펼쳐진다 — 다른 경기를 열면 기존에 열려 있던
  경기는 자동으로 닫힌다.
- 펼쳐질 때 짧은 슬라이드 애니메이션(CSS transition, 새 패키지 없이).
- 기본 탭은 **스코어보드**.
- 탭 전환은 같은 페이지 안에서 내용만 바뀐다(라우팅 없음).

## Context

### 현재 구조 (TASK-015UI2/UI3 결과, 변경 전)

- `frontend/src/components/MatchSummaryList.tsx` — 최근 경기 카드 목록.
  각 카드 끝에 `<Link href="/matches/{matchId}">경기 상세 보기</Link>`가
  있다. 이 Task에서 이 링크를 제거하고, 카드를 펼침/접힘 가능한
  아코디언으로 바꾼다.
- `frontend/src/components/PlayerProfile.tsx` — `MatchSummaryList`를
  렌더링하며 `player.puuid`, `recentMatches`(=`MatchSummary[]`)를 갖고
  있다. "본인(YOU)" 판별에 필요한 `player.puuid`를
  `MatchSummaryList`에 새 prop(예: `viewerPuuid`)으로 전달해야 한다.
- `frontend/src/lib/mock-data.ts`의 `getMatchDetail(matchId)`는
  `mock-data.json`을 그대로 읽는 순수 함수이며 서버 전용 API를 쓰지
  않으므로 클라이언트 컴포넌트에서도 호출 가능하다. 인라인 패널은 펼쳐질
  때 이 함수로 `MatchDetail`을 얻는다.
- `/matches/[matchId]/page.tsx` → `MatchDetailView.tsx` →
  `MatchScoreboard.tsx` / `MatchRoundTimeline.tsx`는 현재 매우 단순한
  플레이스홀더 수준 구현이다. **이 Task에서는 이 4개 파일을 수정하지
  않는다.** 이번에 만드는 4개 탭 컴포넌트는 향후 이 라우트에서 재사용할
  수 있도록 독립적으로 설계하지만, 실제로 그 라우트에 연결하는 작업은
  별도 Task의 범위다.

### 타입/Mock 데이터 최소 확장

현재 `frontend/src/types/match.ts`의 `MatchParticipant`에는 스코어보드
탭에 필요한 `agentId`(요원 이미지)와 `stats.headshotPercentage`(헤드샷률)가
없다. 다음 두 가지를 **최소 확장**한다(TASK-015UI2에서 도입한
"Mock/가공 집계 필드" 주석 컨벤션을 따른다):

1. `MatchParticipant.agentId: string` 추가.
   - `MatchSummary.agentId`와 동일한 슬러그 컨벤션(예: `jett`, `kayo`,
     `sage`, `omen`, `killjoy`, `raze`, `fade`, `cypher`, `phoenix`,
     `viper`). `MatchSummary.agentId`에는 별도 Mock 주석이 없으므로
     동일하게 추가 주석 없이 둔다(요원 이미지 매핑용 식별자 슬러그).
   - `frontend/src/lib/asset-map.ts`의 `agentAssetPaths`에는 현재
     `jett`/`sova`/`omen`만 존재한다. 나머지 슬러그는 기존
     `getAgentAssetPath`의 fallback 동작(`placeholder.svg`)으로 자연스럽게
     처리되므로 `asset-map.ts`는 수정할 필요가 없다(필요하면 수정해도
     되지만 필수는 아님).
2. `MatchParticipant.stats`를 인라인 타입 대신 기존 `CombatStats`
   인터페이스로 교체한다. `CombatStats`는 이미
   `headshotPercentage: number`와 그에 대한 "Mock/aggregated field" 주석을
   갖고 있으므로, 새 주석을 추가로 작성할 필요 없이 그대로 재사용한다.
   필드 구성(`kills`/`deaths`/`assists`/`averageCombatScore`/
   `headshotPercentage`)은 동일하다.

`frontend/src/data/mock-data.json`의 `matchDetails[0].participants`
(10명) 각각에 위 두 필드 값을 추가한다:

- `agentId`: 각 `agent` 표시 이름에 대응하는 슬러그(소문자, 공식
  캐릭터명 기준 — 예: `KAY/O` → `kayo`).
- `stats.headshotPercentage`: 합리적인 범위(예: 15~35)의 Mock 정수값.

`MatchRound`, `MatchDetail`의 다른 필드 구조는 변경하지 않는다(아래
"라운드 탭 데이터 처리 원칙" 참조).

### 라운드 탭 데이터 처리 원칙 (임의 생성 금지)

현재 `MatchRound`는 `roundNumber`, `winningTeam`("attackers"|"defenders"),
`endType`("Elimination"|"Defuse"|"Spike Detonation"), `scoreAfterRound`
(`{attackers, defenders}`)만 갖고 있고, 라운드별 킬 이벤트나 별도의
공격/수비 진영 필드는 없다. 새 필드를 추가하지 않고, 기존 값만으로
다음과 같이 표시한다:

- **라운드 번호**: `roundNumber`.
- **공격/수비**: 현재 Mock 데이터는 발로란트의 하프타임 진영 교체를
  반영하지 않는다(`MatchSummary.team`이 경기 전체에서 고정값). 따라서
  "우리 팀"의 진영은 해당 경기의 `MatchSummary.team`(예: `attackers`)을
  모든 라운드에 동일하게 표시하고, 코드 주석으로 "Mock 데이터는 진영
  교체를 반영하지 않음 — 실제 데이터 연동 시 라운드별 진영 정보로
  교체 필요"를 명시한다. 새 필드를 만들거나 라운드별로 다른 값을
  추정하지 않는다.
- **승리 팀**: `winningTeam`을 "공격팀"/"수비팀"으로 번역해 표시.
- **라운드 결과**: `winningTeam === MatchSummary.team` 여부로 "우리 팀
  승리"/"우리 팀 패배"를 표시.
- **스파이크 설치/해제**: `endType`에서 파생한다.
  - `Spike Detonation` → "스파이크 설치 · 폭발"
  - `Defuse` → "스파이크 설치 · 해제"
  - `Elimination` → "스파이크 정보 없음" (설치 여부를 `endType`만으로는
    알 수 없으므로 임의로 만들지 않는다)
- **주요 킬 이벤트**: 현재 Mock 데이터에 라운드별 킬 이벤트 데이터가
  전혀 없다. "데이터 없음 (Mock 데이터에 라운드별 킬 이벤트 정보 없음)"
  과 같은 고정 안내 문구를 표시한다. 임의의 킬 이벤트를 생성하지 않는다.

### 성과 탭 계산 가능/불가능 항목

`participants[].stats`(위 확장 후 `headshotPercentage` 포함)로 계산
가능한 항목만 표시한다:

- **팀 MVP**: 우리 팀/상대 팀 각각에서 `averageCombatScore`가 가장 높은
  참가자 1명.
- **개인 ACS 순위**: 전체 10명을 ACS 내림차순으로 정렬했을 때 본인의
  순위(예: "3/10").
- **K/D**: 본인의 `kills`/`deaths`.
- **헤드샷률**: 본인의 `headshotPercentage`.

다음은 라운드별 킬 이벤트 데이터가 없어 계산할 수 없으므로, 값을
만들어내지 않고 "데이터 없음(PENDING — 라운드별 킬 이벤트 데이터 필요)"
형태로만 표시한다:

- **첫 킬/첫 데스**
- **멀티킬 수**

### 분석 탭

실제 AI 분석은 구현하지 않는다. "분석 준비 중" 안내와, 기존
`AnalysisExampleCards.tsx`(`.analysis-grid`/`.analysis-card`, 홈 화면의
Phase 5 미리보기에서 이미 사용 중인 패턴)와 유사한 형태의 Mock 예시를
보여주고, "향후 랭커 비교 분석 결과가 표시될 자리"임을 텍스트로
안내한다. `AnalysisExampleCards`를 그대로 import해 재사용하거나, 동일한
CSS 클래스를 사용하는 별도 Mock 데이터로 구성해도 된다(구현자 선택).

### 컴포넌트 설계 (제안 — 실제 이름/분리는 구현자 결정 가능)

- `MatchSummaryList.tsx` (수정): 클라이언트 컴포넌트로 전환
  (`"use client"`). 한 번에 하나만 펼치는 `expandedMatchId` 상태를
  가진다. 각 카드를 펼침/접힘 가능한 버튼으로 감싸고, "경기 상세 보기"
  링크를 제거한다. 펼쳐진 카드 안에 상세 패널 컴포넌트를 렌더링한다.
  `viewerPuuid` prop을 받아 하위 컴포넌트(스코어보드 탭)에 전달한다.
- `MatchDetailPanel.tsx` (신규): `matchSummary: MatchSummary`,
  `matchDetail: MatchDetail | null`, `viewerPuuid: string`을 받아 공통
  상단 요약(맵/최종 스코어/승패/모드/경기 시간)과 `MatchTabs`, 활성 탭의
  내용을 렌더링한다. `matchDetail`이 `null`인 경우(Mock 데이터에 해당
  matchId의 상세가 없는 경우) 명확한 안내를 표시한다.
- `MatchTabs.tsx` (신규): 탭 4개의 네비게이션과 활성 탭 상태(또는 상위에서
  제어). 기본값 "스코어보드".
- `MatchScoreboardTab.tsx` (신규): 우리 팀/상대 팀 구분, 팀별 ACS
  내림차순, 본인 행 강조 + YOU 배지, 데스크톱 테이블형/모바일 2줄
  카드형.
- `MatchRoundsTab.tsx` (신규): 위 "라운드 탭 데이터 처리 원칙"에 따른
  라운드별 카드/행.
- `MatchPerformanceTab.tsx` (신규): 위 "성과 탭" 계산 항목 + PENDING
  항목.
- `MatchAnalysisTab.tsx` (신규): "분석 준비 중" + Mock 예시.

`MatchScoreboard.tsx`/`MatchRoundTimeline.tsx`/`MatchDetailView.tsx`/
`/matches/[matchId]/page.tsx`는 이번 Task에서 수정하지 않는다(향후 재사용
연결은 별도 Task).

### 스타일

`frontend/src/app/globals.css`의 기존 토큰을 사용한다(`--accent`,
`--accent-strong`(승리 팀 청록·민트), `--danger`(패배 팀 붉은색),
`--line`, `--line-strong`, `--bg-panel`, `--bg-panel-soft`, `--text`,
`--text-muted`, `--shadow` 등). 기존 `.match-card`, `.match-card-header`,
`.match-result`/`.match-result-loss`, `.data-badge`,
`.profile-summary-grid`, `.analysis-grid`/`.analysis-card` 클래스와 시각적
일관성을 유지한다. 펼침 애니메이션은 `max-height`/`grid-template-rows`
전환 등 순수 CSS로 구현한다(새 npm 패키지 금지).

### Task ID에 대해

TASK-015UI(DONE) → TASK-015UI2(DONE) → TASK-015UI3(DONE)에 이어 같은
Phase 2 UI 개선 계열의 후속 작업이므로 `TASK-015UI4`로 명명한다.
TASK-016~038의 번호/상태는 변경하지 않는다.

## Dependencies

- TASK-015UI2 (DONE) — `MatchSummary`/`Player`/`CombatStats` 타입, Mock
  데이터, `MatchSummaryList`/`PlayerProfile`의 현재 구조.
- TASK-015UI3 (DONE) — `asset-map.ts`의 `getAgentAssetPath` 등 자산 매핑
  함수(시그니처 변경 없이 그대로 사용).

## Allowed changes

```
frontend/src/components/**          # MatchSummaryList 수정 + 신규 탭/패널 컴포넌트
frontend/src/types/**                # MatchParticipant.agentId, stats: CombatStats
frontend/src/data/mock-data.json     # participants에 agentId/headshotPercentage 추가
frontend/src/lib/**                  # 필요 시 mock-data.ts에 보조 함수 추가(선택)
frontend/src/app/globals.css         # 아코디언/탭/스코어보드/라운드/성과 스타일 추가
docs/tasks/TASK-015UI4.md             # 이 문서의 Result 갱신
docs/PLAN.md                          # Phase 2 표·현재 상태 갱신
docs/PROGRESS.md                      # 작업 로그 추가
```

## Forbidden changes

- `backend/**`, `docker/**`, `scripts/**`.
- `frontend/package.json`, `frontend/package-lock.json` (새 패키지/의존성
  추가 포함 — 애니메이션/탭 구현에 새 라이브러리 사용 금지, 순수
  React state + CSS로 구현).
- `frontend/src/app/matches/[matchId]/**` 라우트 삭제. 이 라우트의
  `page.tsx`, `MatchDetailView.tsx`, `MatchScoreboard.tsx`,
  `MatchRoundTimeline.tsx`는 이번 Task에서 수정하지 않는다(불가피한 이유가
  있다면 Stop condition 참조).
- 홈 화면(`frontend/src/app/page.tsx` 등)의 대규모 변경 — 이 Task와
  무관한 섹션/레이아웃 변경 금지.
- 공통 헤더/푸터(`layout.tsx` 등)의 대규모 변경.
- 실제 Riot API 호출 코드 추가, 실제 AI 분석 로직 구현.
- `MatchRound`/`MatchDetail` 타입에 새 필드 추가(라운드별 킬 이벤트,
  진영 필드 등) — 위 "라운드 탭 데이터 처리 원칙"대로 기존 필드만 사용.
- `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/DECISIONS.md`, `docs/tasks/TASK-015UI.md`,
  `docs/tasks/TASK-015UI2.md`, `docs/tasks/TASK-015UI3.md`, 그 외
  `docs/tasks/TASK-0XX.md`.
- TASK-016 이상 번호의 작업 시작(코드/문서 어느 쪽이든).

## Acceptance criteria

### 1. 타입/Mock 데이터

- [x] `MatchParticipant`에 `agentId: string` 필드가 추가된다
  (`MatchSummary.agentId`와 동일한 슬러그 컨벤션).
- [x] `MatchParticipant.stats`가 `CombatStats`를 사용해 `headshotPercentage`를
  포함한다(기존 `CombatStats`의 Mock/aggregated 주석 유지, 중복 주석
  추가 없음).
- [x] `mock-data.json`의 `matchDetails[0].participants` 10명 모두에
  `agentId`, `stats.headshotPercentage`가 채워진다.
- [x] `MatchRound`/`MatchDetail`/`MatchSummary`/`Player` 등 다른 타입과
  기존 필드 구조는 변경되지 않는다.

### 2. 카드 펼침/접힘 (MatchSummaryList)

- [x] 카드 전체가 클릭 가능하고, 오른쪽에 펼침/접힘 화살표 아이콘이
  표시된다.
- [x] 카드 클릭과 화살표 클릭이 동일한 펼침/접힘 상태를 토글한다(같은
  핸들러/상태).
- [x] 한 번에 하나의 경기만 펼쳐진다. 다른 카드를 펼치면 기존에 열려
  있던 카드는 자동으로 닫힌다.
- [x] 펼쳐질 때 짧은 CSS 슬라이드/트랜지션 애니메이션이 적용된다.
- [x] 기존 "경기 상세 보기" `Link`(`/matches/[matchId]`)가 제거된다.
- [x] `.data-badge`(Mock Data/Demo Profile) 표시가 유지된다.

### 3. 공통 상단 요약 + 탭

- [x] 펼친 패널 상단에 맵, 최종 스코어, 승패, 모드, 경기 시간이
  표시된다.
- [x] 탭은 스코어보드/라운드/성과/분석 4개이며 기본 탭은 스코어보드다.
- [x] 탭을 전환해도 페이지 이동(라우팅) 없이 같은 패널 안에서 내용만
  바뀐다.
- [x] 모바일 너비에서도 탭이 한 줄 또는 가로 스크롤 가능한 형태로
  유지된다(탭 자체가 줄바꿈되어 레이아웃이 깨지지 않음).

### 4. 스코어보드 탭

- [x] 우리 팀/상대 팀이 구분되어 표시되고, 각 팀 헤더에 승/패가 표시된다
  (승리 팀: 청록/민트 계열 `--accent`/`--accent-strong`, 패배 팀:
  `--danger`).
- [x] 각 팀 내부는 ACS 내림차순으로 정렬된다.
- [x] 본인(`participant.puuid === viewerPuuid`)의 행은 배경이 강조되고
  YOU 배지가 표시된다.
- [x] 각 행에 요원 이미지(`getAgentAssetPath(agentId)`), 플레이어명, ACS,
  K/D/A, K/D, 헤드샷률이 표시된다. 대표 무기/티어 컬럼은 없다.
- [x] 데스크톱은 테이블형, 모바일은 각 행이 2줄 카드형(1줄: 요원 이미지 +
  플레이어명 + YOU 배지, 2줄: ACS/KDA/K-D/HS%)으로 전환되고 불필요한
  가로 스크롤이 생기지 않는다.

### 5. 라운드 탭

- [x] 22개 라운드가 카드 또는 행 형태로 순서대로 표시된다.
- [x] 각 라운드에 라운드 번호, 공격/수비(고정값 + Mock 한계 주석),
  승리 팀, 라운드 결과(우리 팀 기준 승/패), 스파이크 설치/해제(또는
  "스파이크 정보 없음")가 표시된다.
- [x] "주요 킬 이벤트"는 임의 데이터 없이 "데이터 없음" 안내 문구로
  표시된다.

### 6. 성과 탭

- [x] 팀 MVP(우리 팀/상대 팀 ACS 최고), 개인 ACS 순위, K/D, 헤드샷률이
  계산되어 표시된다.
- [x] 첫 킬/첫 데스, 멀티킬 수는 "데이터 없음(PENDING)" 형태로 표시되고
  임의 값이 생성되지 않는다.

### 7. 분석 탭

- [x] "분석 준비 중" 안내와 Mock 데이터 기반 예시가 표시된다.
- [x] 향후 랭커 비교 분석 결과가 들어갈 자리임을 안내하는 텍스트가
  있다.
- [x] 실제 AI 분석 로직은 구현되지 않는다.

### 8. 라우트 유지

- [x] `frontend/src/app/matches/[matchId]/page.tsx`가 삭제되지 않고
  그대로 존재한다.
- [x] `MatchDetailView.tsx`, `MatchScoreboard.tsx`,
  `MatchRoundTimeline.tsx`는 이 Task에서 변경되지 않는다.

### 9. 빌드 및 정적 검사

- [x] `cd frontend && npx tsc --noEmit` 성공.
- [x] `cd frontend && npm run lint` 성공.
- [x] `cd frontend && npm run build` 성공.

### 10. 범위 확인

- [x] `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/app/matches`
  출력이 비어 있다.
- [x] `grep -rn "경기 상세 보기" frontend/src/components` 출력이 비어
  있다.

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

# 5) 기존 "경기 상세 보기" 링크 제거 확인 (출력 없어야 함)
grep -rn "경기 상세 보기" frontend/src/components

# 6) 이 Task에서 변경되지 않아야 하는 영역 확인 (출력 없어야 함)
cd .. && git status --porcelain -- \
  frontend/package.json frontend/package-lock.json backend docker scripts \
  frontend/src/app/matches
```

## Stop conditions

다음 상황에서는 작업을 중단하고 `BLOCKED`로 보고한다:

1. 슬라이드 애니메이션이나 탭 UI 구현에 새 npm 패키지 설치가 불가피한
   경우.
2. `/matches/[matchId]` 라우트 또는 `MatchDetailView`/`MatchScoreboard`/
   `MatchRoundTimeline`을 수정하지 않으면 이 Task의 Acceptance criteria를
   만족할 수 없는 경우(예: 타입 공유 충돌). 이 경우 변경 없이 BLOCKED로
   보고하고 충돌 내용을 기록한다.
3. "라운드 탭 데이터 처리 원칙"/"성과 탭 계산 가능/불가능 항목"에서 정한
   범위를 넘어서는 데이터(예: 라운드별 킬 이벤트, 멀티킬 수)가 없으면
   Acceptance criteria 4~7을 만족할 수 없다고 판단되는 경우 — 임의로
   데이터를 생성하지 말고, 어떤 항목이 부족한지 구체적으로 보고한다.
4. 동일한 `tsc`/`lint`/`build` 실패가 3회 이상 반복되는 경우.

다음은 BLOCKED가 **아니다** (계속 진행):

- `agentId` 슬러그가 `asset-map.ts`에 매핑되어 있지 않아 일부 요원
  이미지가 placeholder로 표시되는 경우 — 기존 fallback 설계의 정상
  동작이다.
- "데이터 없음"/PENDING 표시가 여러 탭에 걸쳐 나타나는 경우 — 의도된
  동작이다.

## Result

DONE (2026-06-15)

변경 파일:

- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchTabs.tsx`
- `frontend/src/components/MatchScoreboardTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/types/match.ts`
- `frontend/src/data/mock-data.json`
- `frontend/src/app/globals.css`
- `docs/tasks/TASK-015UI4.md`
- `docs/PLAN.md`
- `docs/PROGRESS.md`

구현 결과:

- `MatchSummaryList`를 클라이언트 컴포넌트로 전환하고 `expandedMatchId`
  단일 상태로 카드 전체 클릭/화살표 클릭이 동일한 펼침 상태를 제어하게 했다.
  다른 경기를 열면 기존 패널은 자동으로 닫힌다.
- 최근 경기 카드의 기존 `경기 상세 보기` 링크를 제거했다. `/matches/[matchId]`
  라우트와 기존 상세 컴포넌트는 수정하지 않았다.
- 펼친 패널에 공통 요약과 스코어보드/라운드/성과/분석 4개 탭을 추가했다.
  기본 탭은 스코어보드이며 탭 전환은 라우팅 없이 React state로만 동작한다.
- 스코어보드 탭은 우리 팀/상대 팀을 구분하고, 팀별 ACS 내림차순 정렬,
  승패 색상, 본인 행 강조와 YOU 배지, 요원 이미지, ACS, K/D/A, K/D,
  헤드샷률을 표시한다. 대표 무기와 티어는 표시하지 않는다.
- 라운드 탭은 기존 `MatchRound` 값만 사용해 22개 라운드를 표시한다.
  라운드별 킬 이벤트는 임의 생성하지 않고 데이터 없음 문구로 처리했다.
  Mock 데이터의 진영 교체 미표현 한계를 화면 문구로 명시했다.
- 성과 탭은 팀 MVP, 개인 ACS 순위, K/D, 헤드샷률만 계산하고 첫 킬/첫 데스,
  멀티킬 수는 PENDING으로 표시했다.
- 분석 탭은 실제 AI 분석 없이 Mock Data 배지와 분석 준비 중 예시 영역만
  제공한다.
- `MatchParticipant.agentId`와 `MatchParticipant.stats: CombatStats`를
  적용하고, `matchDetails[0].participants` 10명에 `agentId`와
  `headshotPercentage`를 추가했다.

검증 결과:

- `cd frontend && npx tsc --noEmit`: 성공.
- `cd frontend && npm run lint`: 성공.
- `cd frontend && npm run build`: 성공.
- `ls "frontend/src/app/matches/[matchId]/page.tsx"`: 파일 존재 확인.
- `grep -rn "경기 상세 보기" frontend/src/components`: 출력 없음.
- `git status --porcelain -- frontend/package.json frontend/package-lock.json backend docker scripts frontend/src/app/matches`: 출력 없음.
- `git diff --name-only -- frontend/src/app/matches frontend/src/components/MatchDetailView.tsx frontend/src/components/MatchScoreboard.tsx frontend/src/components/MatchRoundTimeline.tsx`: 출력 없음.

남은 위험:

- 현재 `matchDetails` 상세 데이터는 첫 번째 Mock 경기(`mock-match-ascent-001`)
  에만 존재한다. 다른 최근 경기의 펼침 패널은 "상세 데이터 없음" 안내를
  표시한다.
- 일부 참가자 요원(`kayo`, `sage`, `killjoy`, `raze`, `fade`, `cypher`,
  `phoenix`, `viper`)은 아직 공식 로컬 이미지 매핑이 없어 기존 placeholder
  fallback을 사용한다.
