# UI12 Codex Feasibility — 프로필/전적 페이지 대수술 제안

## 목적

Riot Production API 신청 전에 GameProbe 프로필/전적검색 페이지가 실제 VALORANT
전적검색/전적분석 서비스처럼 보이도록, **구현 가능성 관점**에서 과감한 재구성안을
정리한다.

이 문서는 구현 문서가 아니다. 제품 코드는 수정하지 않는다. 레퍼런스(OP.GG /
Tracker.gg)는 정보 구조와 읽기 흐름만 참고하며, 시각 디자인을 복제하지 않는다.

## 1. 현재 코드 구조가 화면 개선을 막는 부분

### 1.1 PlayerProfile이 “페이지 편집기”가 아니라 “컴포넌트 나열”에 가깝다

현재 `PlayerProfile`은 상단 헤더, 필터, 좌측 사이드바, 중앙 요약 카드, 최근 경기
목록을 순서대로 배치한다. 데이터 로딩과 섹션 배치를 한 파일에서 처리하는 점은
단순하지만, 화면의 주된 읽기 흐름을 크게 바꾸기 어렵다.

문제는 컴포넌트 개수가 아니라 **정보 우선순위**다. 실제 전적 서비스에서는 최근 경기
목록과 현재 랭크/핵심 KPI가 가장 먼저 읽혀야 하는데, 현재는 `ProfileSidebar`,
`SeasonSummaryCard`, `RankHistoryChart`, `RecentTwentySummaryCard`가 비슷한 카드
문법으로 쌓여 최근 경기까지 시선이 늦게 도달한다.

### 1.2 같은 정보가 여러 카드에 반복된다

`PlayerHeaderCard`, `SeasonSummaryCard`, `RecentTwentySummaryCard`,
`ProfileSidebar`가 모두 승률, 티어, 시즌, 최근 폼, Preview Score를 조금씩 반복한다.
반복 자체보다 문제는 “어디가 최종 요약인지”가 불명확하다는 점이다.

UI11B~G는 각 영역을 정리했지만, 전체 구조는 여전히 여러 개의 좋은 카드가 병렬로
쌓인 형태다. 신청용 완성도 관점에서는 카드 품질보다 **한 화면에서 무엇을 먼저
판단하게 할지**가 더 중요하다.

### 1.3 MatchSummaryList가 너무 많은 책임을 가진다

`MatchSummaryList`는 날짜 그룹, 경기 행, 경기 상세 데이터 조회, MatchInsight 파생,
하이라이트 태그, Preview Score, 인라인 상세 패널까지 모두 담당한다. 이 구조에서는
최근 경기 행의 레이아웃을 과감히 바꾸거나, “선택된 경기 상세를 별도 영역으로
분리”하는 작업이 부담스럽다.

현재 구현은 기능적으로 동작하지만, 실제 전적 서비스처럼 빠르게 스캔되는 리스트를
만들려면 `DailyMatchGroup`, `MatchRow`, `MatchRowMetrics`, `SelectedMatchDetail`
같은 책임 분리가 필요하다.

### 1.4 MatchDetailPanel이 각 경기 행 안에 중첩된다

인라인 상세는 편리하지만, 화면 밀도를 높이면 각 행 안에 4탭 패널이 열리는 구조가
페이지를 길고 복잡하게 만든다. 실제 서비스형 UI로 보이게 하려면 최근 경기 리스트와
상세 패널을 “행 내부 접힘”보다 **선택 경기 상세 영역**으로 재배치하는 편이 낫다.

신규 데이터 없이도 가능하다. 이미 `getMatchDetail(matchId)`와 `MatchDetailPanel`
이 있으므로, 선택 상태를 리스트 상위로 끌어올리는 구조 변경만 필요하다.

### 1.5 ProfileSidebar가 보조 정보 전체를 떠안는다

`ProfileSidebar`는 최고 티어, 이전 시즌, 정확도, 역할, 무기, 맵, 활동 시간대, 팀원
까지 모두 포함한다. UI11F로 정보는 정돈됐지만, 전적 서비스 화면에서는 이 중 일부만
첫 화면에 남기고 나머지는 접거나 하단/탭으로 내려야 한다.

특히 현재 데이터에는 요원 집계가 없으므로 “전적 사이트의 좌측 모스트 요원 영역”을
흉내 내면 오히려 빈약해 보인다. 사이드바는 **지원 정보 rail**로 줄이고, 경기 리스트
와 핵심 요약이 메인 화면을 차지해야 한다.

### 1.6 globals.css가 화면 재설계를 어렵게 만든다

`globals.css`는 페이지 레이아웃, 카드 문법, 사이드바, 최근 경기, 상세 탭, 반응형
규칙이 한 파일에 계속 누적되어 있다. 클래스 이름은 영역별로 나뉘어 있지만,
공통 카드 스타일과 섹션별 예외가 섞여 있어 대수술 시 회귀 위험이 크다.

신규 패키지 없이도 개선 가능하다. CSS Modules로 옮기지 않아도, 같은 파일 안에서
최소한 아래처럼 레이어를 나누는 것이 먼저다.

- layout: page shell, grid, rail, content column
- primitives: card, section header, stat cell, meter, badge
- profile: masthead, summary strip, side rail
- matches: daily group, match row, selected detail
- responsive: breakpoint별 override만 모음

## 2. 유지할 컴포넌트

다음은 데이터 계약과 동작이 이미 충분하므로 유지하는 편이 안전하다.

- `AppVersionBadge`: 신청 전 배포 확인 장치로 유지.
- `MatchScoreBadge`: GameProbe Preview Score 표시용 공통 컴포넌트로 유지.
- `ProfileFilterBar`: 실제 필터 동작은 없지만 Preview filter 고지가 명확하므로 유지.
- `MatchTabs`: 접근성 구조(`role=tab`, `aria-selected`)가 있으므로 유지.
- `MatchScoreboardTab`, `MatchRoundsTab`, `MatchPerformanceTab`, `MatchAnalysisTab`:
  탭 내부 데이터 표현은 유지하되, 패널이 놓이는 위치만 바꿀 수 있다.
- `RankHistoryChart`: 그래프 자체는 유지하되 첫 화면 우선순위는 낮춘다.
- `asset-map` 기반 이미지 fallback: 신규 자산 없이 정직하게 유지.

## 3. 통합/분리/재배치할 컴포넌트

### 통합 대상

- `PlayerHeaderCard` + `SeasonSummaryCard` + `RecentTwentySummaryCard`의 핵심 KPI를
  `ProfileSnapshot` 또는 `ProfileOverviewPanel`로 통합한다.
  - 목표: 상단에서 Riot ID, 현재 티어, 승률, K/D, ACS, HS%, 최근 20판 폼을 한 번에
    판단하게 한다.
  - 기존 카드 3개를 모두 유지하면 첫 화면이 계속 무겁다.

- `SeasonSummaryCard`와 `RecentTwentySummaryCard`의 상세 수치는 “상단 요약 아래
  compact stat strip” 또는 “오른쪽 rail의 세부 카드”로 내려야 한다.

### 분리 대상

- `MatchSummaryList`를 최소 4개로 분리한다.
  - `DailyMatchGroup`: 날짜별 header와 그룹 통계.
  - `MatchRow`: 승패, 맵, 요원, 점수, 주요 KDA/ACS만 표시.
  - `MatchRowMetrics`: K/D, KAST, DDΔ/R, HS%, 티어 변화 등 보조 지표.
  - `SelectedMatchDetail`: 선택된 경기의 4탭 상세 패널.

- `ProfileSidebar`를 `ProfileInsightRail`과 작은 카드들로 분리한다.
  - `PeakRankCard`
  - `AccuracyCard`
  - `RoleWinRateCard`
  - `TopWeaponsCard`
  - `MapWinRateCard`
  - `ActivityCard`
  - `TeammatesCard`

분리 이유는 재사용보다 **첫 화면 노출 순서 제어**다. 지금처럼 사이드바 하나에 모두
묶여 있으면 어떤 카드를 위/아래/접힘/하단으로 보낼지 조정하기 어렵다.

### 재배치 대상

- `RankHistoryChart`: 첫 화면 중앙이 아니라 오른쪽 rail 또는 “Season detail” 영역으로
  이동한다.
- `ProfileSidebar`의 이전 시즌/팀원/활동 시간대: 첫 화면 하단 또는 접힘 영역으로
  내린다.
- `MatchDetailPanel`: 각 `MatchRow` 내부가 아니라 최근 경기 리스트 옆/아래의
  selected detail 영역으로 이동한다.

## 4. PlayerProfile 전체 레이아웃 재구성안

### 제안 A — 권장안: 신청 전 가장 현실적인 대수술

신규 Mock/자산/타입 없이 가장 효과가 큰 안이다.

```text
ProfilePage
└─ ProfileMasthead (full width)
   ├─ player identity / current rank / preview score
   └─ compact KPI strip: WR, K/D, ACS, ADR, HS%, Recent 20 WR/KAST

└─ ProfileControlBar
   └─ queue / season / period preview filters + Mock/Preview note

└─ ProfileWorkspace (desktop 12-col)
   ├─ MainColumn (8~9 cols)
   │  ├─ MatchFeedHeader
   │  ├─ MatchFeed (recent matches, dense rows)
   │  └─ SelectedMatchDetail (4 tabs for selected/expanded match)
   │
   └─ InsightRail (3~4 cols)
      ├─ SeasonSnapshot compact
      ├─ RankHistory compact
      ├─ Accuracy / Role / Map / Weapon compact cards
      └─ Activity / Teammates lower priority cards
```

핵심은 최근 경기 리스트를 중앙 주인공으로 올리는 것이다. 지금은 “프로필 요약 카드
묶음”이 메인을 차지하고 최근 경기 리스트가 아래로 밀린다. 전적검색 서비스처럼 보이려면
메인 컬럼은 최근 경기와 선택 경기 상세가 차지해야 한다.

첫 viewport 기준은 아래처럼 잡는다.

- desktop: `ProfileMasthead` + `ProfileControlBar` + 최근 경기 첫 날짜 그룹 +
  support rail 상단 3~4개 카드가 보여야 한다.
- tablet: `ProfileMasthead` + `ProfileControlBar` + 최근 경기 첫 그룹이 먼저
  보이고, support rail은 그 아래로 내려간다.
- mobile: compact masthead + filters + 최근 경기 첫 그룹이 첫 화면의 주된
  콘텐츠여야 한다. 랭크 그래프나 시즌 상세 카드가 최근 경기보다 먼저 길게
  노출되면 안 된다.

메인 첫 화면에서 내려야 할 것:

- `SeasonSummaryCard`: 핵심 수치만 masthead stat strip에 흡수하고, 상세 수치는
  support rail 또는 하단 season detail로 내린다.
- `RecentTwentySummaryCard`: 최근 폼/승률/KAST 같은 대표 수치만 상단에 남기고,
  자세한 분포는 rail/lower section으로 내린다.
- `RankHistoryChart`: “신뢰 보조 정보”로 유지하되 최근 경기보다 먼저 큰 영역을
  차지하지 않는다.
- `ProfileSidebar`의 활동 시간대/팀원/이전 시즌: 첫 화면 밖 또는 접힘 후보로 둔다.

support rail의 첫 화면 노출은 최대 3~4개 카드로 제한한다. 우선순위는 현재 랭크/시즌
스냅샷, 정확도/역할, 맵/무기 정도이며, 활동 시간대/팀원/이전 시즌은 하단으로 보낸다.

### 제안 B — 더 과감한 상세 중심형

최근 경기 리스트에서 한 경기 선택 시, 오른쪽 rail이 해당 경기 상세로 전환되는
구조다.

```text
MainColumn: MatchFeed
RightRail default: ProfileInsightRail
RightRail when match selected: SelectedMatchDetail tabs
```

이 안은 화면이 훨씬 서비스처럼 보일 수 있지만, 모바일에서 선택 상세 위치와 스크롤
동작을 조심해야 한다. 구현 난이도는 제안 A보다 높다.

### 제안 C — 현 구조 유지 보수형

현재 2열과 인라인 상세를 유지하되 CSS만 대폭 수정하는 안이다. 구현은 쉽지만,
사용자가 지적한 “전체 구조 변화 부족”을 해결하기 어렵다. UI12의 목표에는 부족하다.

## 5. globals.css 개선 방향

### 5.1 먼저 카드 과다와 정보 밀도를 줄인다

UI12의 CSS 우선순위는 primitive 리팩터링 자체가 아니라 “카드가 너무 많아 보이는
화면”을 줄이는 것이다. 첫 단계에서는 아래 방향이 더 중요하다.

- 요약 수치는 독립 카드보다 masthead 안의 compact stat strip으로 묶는다.
- 최근 경기 행은 카드 더미가 아니라 table-like row에 가깝게 만든다.
- support rail은 작은 카드들을 끝없이 쌓지 말고 group header와 compact row 중심으로
  압축한다.
- 섹션 배경과 카드 경계는 줄이고, 승패/맵/점수/요원/핵심 KPI의 대비로 읽히게 한다.

### 5.2 새 스타일을 계속 덧붙이지 말고 레이어를 재정렬한다

현재 `globals.css`는 누적형이다. UI12에서는 리팩터링 범위를 명시하고 아래 순서로
정리하는 것이 좋다.

1. design tokens / base
2. common primitives
   - `.ui-card`
   - `.ui-section-head`
   - `.ui-stat-grid`
   - `.ui-stat-cell`
   - `.ui-meter`
   - `.ui-data-note`
3. profile page layout
4. profile masthead / summary
5. match feed
6. match detail tabs
7. side rail cards
8. responsive overrides

CSS Modules를 도입하지 않아도 된다. 다만 이 작업은 첫 레이아웃 대수술 이후
안정화 단계로 두는 편이 안전하다. 신규 패키지 없이 가능한 정리는 `globals.css`
내부를 섹션별로 재정렬하고, 중복 카드 스타일을 공통 primitive로 합치는 것이다.

### 5.3 카드가 너무 많아 보이는 문제를 CSS로만 해결하지 않는다

현재 UI는 모든 것을 카드로 감싼다. 카드 스타일을 더 다듬어도 “정보가 쪼개져
보이는 문제”는 남는다. UI12에서는 일부 섹션을 카드가 아니라 **한 영역 안의 stat
strip / table-like row / rail group**으로 바꿔야 한다.

### 5.4 반응형은 컴포넌트 구조와 함께 재설계한다

현재 모바일 대응은 많은 grid override로 해결한다. UI12에서는 구조 자체를 아래처럼
단순화해야 한다.

- desktop: masthead → control bar → main feed + rail
- tablet: masthead → control bar → main feed → rail
- mobile: masthead compact → filters → match feed → selected detail → supporting stats

## 6. 신규 데이터 없이 가능한 것

아래는 기존 Mock/타입/자산만으로 구현 가능하다.

- PlayerProfile 레이아웃 전면 재배치.
- 최근 경기 리스트를 첫 화면 중앙 주인공으로 이동.
- `SeasonSummary`/`RecentTwentySummary`/`CareerPeakRank` 기반 상단 통합 요약.
- `MatchSummary`/`MatchInsight` 기반 경기 행 재구성.
- 선택된 경기 상세 패널을 행 내부에서 리스트 아래 또는 오른쪽 rail로 이동.
- 기존 `MatchDetail` 기반 4탭 유지.
- `ProfileSidebarStats` 기반 support rail 재배치.
- `RankHistoryChart` 위치/크기 변경.
- `Mock / Preview`, `데이터 없음`, `미연동`, `예시값` 고지 일관화.
- CSS 레이어 재정리와 공통 primitive 도입.
- 모바일/태블릿/데스크톱 레이아웃 재정의.

## 7. 신규 Mock/자산/타입이 필요한 것

아래는 Human Decision Gate로 분리해야 한다.

- 모스트/탑 요원 카드: `ProfileSidebarStats`에 요원별 집계 필드가 없음.
- 요원별 게임수/승률/KD: 신규 Mock 또는 Riot API 승인 후 aggregation 필요.
- 누락 요원 PNG와 역할군 아이콘: 신규 외부 자산 및 출처/라이선스 확인 필요.
- 무기별 Head/Body/Legs 분포: 현재는 전체 accuracy만 있고 무기별 분포 필드 없음.
- 라운드 첫 킬/스파이크/클러치/멀티킬: `MatchRound`에 이벤트 필드 없음.
- 평균 대비 분석/벤치마크/백분위: Phase 5 기준 통계 필요.
- 마지막 갱신 시각/업데이트 버튼: 신뢰 가능한 timestamp/동작 출처가 없음.
- 참가자 랭크/econ 컬럼: 현재 `MatchParticipant`에 해당 필드 없음.

게이트 미해결 상태에서 신청 가능한 최소 표현은 아래처럼 제한한다.

- 모스트 요원 영역은 만들지 않는다. 필요하면 “요원 집계 없음” 수준의 정직한 빈 상태만
  둔다.
- 누락 이미지나 역할군 아이콘은 기존 fallback만 사용하고, 새로운 외부 자산처럼 보이는
  placeholder를 추가하지 않는다.
- 분석 탭은 현재 데이터에서 계산 가능한 Preview 지표만 보여주고, 평균 대비/백분위
  문구는 쓰지 않는다.
- 라운드 탭은 기존 라운드 점수와 흐름 중심으로 유지하고, 첫 킬/클러치/스파이크 이벤트
  chip은 만들지 않는다.
- 무기/맵/역할 정보는 현재 집계 수준까지만 표시하며, 세부 accuracy breakdown을
  암시하지 않는다.

## 8. Codex 구현 우선순위

### P0 — 구조 대수술의 최소 단위

1. `PlayerProfile`을 `ProfileMasthead`, `ProfileControlBar`, `ProfileWorkspace` 흐름으로
   재배치한다.
2. 최근 경기 리스트를 메인 컬럼 최상단으로 올린다.
3. 기존 `SeasonSummaryCard`, `RecentTwentySummaryCard`, `RankHistoryChart`,
   `ProfileSidebar`는 오른쪽 rail/support 영역으로 내린다.
4. support rail 첫 화면 노출은 3~4개 카드로 제한한다.
5. 신규 데이터 없이 기존 컴포넌트 props만 재배치한다.
6. `MatchSummaryList` 내부 분해, KPI 통합, sidebar 카드 분해는 이 단계에서 하지
   않는다.

이 단계만으로도 “전체 구조 변화 부족” 문제를 가장 크게 줄인다.

### P1 — MatchSummaryList 책임 분리

1. `MatchSummaryList`를 그룹/행/지표/선택 상세로 분리한다.
2. 인라인 상세를 각 row 안이 아니라 selected detail 영역으로 끌어올린다.
3. 기존 4탭은 유지한다.

이 단계는 코드 안정성과 이후 디자인 변경 가능성을 크게 높인다.

### P2 — 상단 요약 통합

1. `PlayerHeaderCard`의 핵심 정보와 `SeasonSummaryCard`/`RecentTwentySummaryCard`의
   중복 KPI를 통합한다.
2. 기존 카드 2~3개를 compact stat strip으로 줄인다.
3. 상세 수치는 support rail로 이동한다.

### P3 — CSS 레이어 정리

1. `globals.css`를 layout / primitive / profile / matches / detail / rail /
   responsive 순으로 재정렬한다.
2. 반복되는 카드/헤더/stat/meter 스타일을 공통 클래스로 통합한다.
3. 영역별 예외를 줄인다.

### P4 — Human Decision Gate 이후

요원 집계, 역할 아이콘, 누락 이미지, 라운드 이벤트, 벤치마크 분석은 사람 결정 후
별도 Task로 연다.

## 9. 한 번에 구현 가능한 범위와 나눠야 하는 범위

### 한 번에 구현 가능한 범위

다음은 하나의 UI12A Task로 구현 가능하다.

- `PlayerProfile`의 큰 레이아웃 재배치.
- 최근 경기 리스트를 메인 컬럼 상단으로 이동.
- 기존 사이드바/시즌/최근20/랭크 그래프를 support rail로 재배치.
- `globals.css`에 필요한 layout grid와 responsive 규칙 추가.
- 신규 데이터/자산/타입 없이 기존 컴포넌트 props 유지.
- support rail 첫 화면 노출 순서만 조정하고 내부 카드는 크게 재작성하지 않음.

위 범위는 파일 수가 많아 보이지만 실제 데이터 계약 변경이 없으므로 안전하다. 단,
UI12A는 “최근 경기 중심 workspace”를 만드는 작업으로 제한해야 한다. 리스트 내부
분해, KPI 병합, sidebar 세부 카드 분해를 섞으면 회귀 지점이 불분명해진다.

### 반드시 나눠야 하는 범위

다음은 한 번에 같이 하지 않는 것이 좋다.

- `MatchSummaryList` 내부 분해 + selected detail 패턴 변경.
- `PlayerHeaderCard`와 summary cards의 KPI 통합.
- `ProfileSidebar` 카드 분해.
- `globals.css` 대규모 primitive 리팩터링.
- Human Decision Gate 항목.

이유는 각 작업이 화면의 주된 읽기 흐름을 바꾸며, 동시에 진행하면 회귀 지점이
불분명해진다.

## 권장 UI12 Task 분할

### TASK-015UI12A — 페이지 레이아웃 대수술

- 목표: 최근 경기 중심의 `ProfileWorkspace` 구조로 재배치.
- 허용: `PlayerProfile.tsx`, `globals.css`, 필요 시 wrapper 컴포넌트 1~2개.
- 금지: 데이터/타입/자산 변경, MatchSummaryList 내부 로직 변경, KPI 통합,
  ProfileSidebar 내부 카드 분해.

### TASK-015UI12B — 최근 경기 리스트 구조 분해

- 목표: `MatchSummaryList`를 row/group/detail 책임으로 분리하고 selected detail
  패턴으로 전환.
- 허용: `MatchSummaryList.tsx`, `MatchDetailPanel.tsx`, 관련 CSS.
- 금지: 신규 경기 필드, 신규 이벤트, 새로운 분석 수치.

### TASK-015UI12C — 상단 요약/KPI 통합

- 목표: `PlayerHeaderCard`, `SeasonSummaryCard`, `RecentTwentySummaryCard` 중복을 줄여
  상단 판단 속도를 높인다.
- 허용: 해당 컴포넌트와 CSS.
- 금지: 갱신 시각, 신규 KPI, 실분석 문구.

### TASK-015UI12D — 사이드 rail 카드 분해

- 목표: `ProfileSidebar`를 support rail 카드 단위로 쪼개고, 첫 화면 노출 우선순위를
  재정의한다.
- 허용: `ProfileSidebar.tsx`, 작은 카드 컴포넌트, CSS.
- 금지: 요원 집계 카드, 역할 아이콘, 신규 자산.

### TASK-015UI12E — CSS primitive 정리

- 목표: `globals.css`의 카드/헤더/stat/meter 중복을 공통 primitive로 정리.
- 허용: CSS 중심 변경.
- 금지: 화면 정보 구조 추가.

## 추가 기술 리스크

- selected detail 패턴으로 전환할 때 `MatchSummaryList` 내부 state를 상위로 올리면
  initial selected match, hydration, empty state 정책이 필요하다.
- 최근 경기 리스트가 첫 화면 메인이 되면 heading order와 landmark 순서를 다시
  점검해야 한다.
- `PlayerHeaderCard`와 summary cards를 통합하는 단계에서는 중복 `id`나
  `aria-labelledby` 충돌 가능성을 확인해야 한다.
- `globals.css` 공통 primitive 정리는 home/privacy/terms/connect 같은 다른 페이지에
  영향을 줄 수 있으므로 UI12E로 분리한다.
- 모바일에서 selected detail을 리스트 아래에 둘 경우 선택 후 상세 위치를 사용자가
  놓칠 수 있다. scroll/focus 정책은 별도 결정이 필요하다.
- desktop right rail에 상세를 둘 경우 tablet/mobile에서는 rail이 아래로 떨어져
  리스트와 상세의 관계가 흐려질 수 있다.
- `AppVersionBadge` fixed 위치가 모바일 하단 콘텐츠를 가릴 수 있으므로 최종 viewport
  확인이 필요하다.
- screenshot QA가 필요할 때 Playwright 브라우저 바이너리가 없으면 설치/다운로드
  결정이 별도 Human Decision Gate가 된다.

## 최종 판단

현재 화면이 보기 불편한 주된 이유는 세부 카드 polish 부족이 아니라 **페이지의
주인공이 최근 경기인지, 시즌 요약인지, 사이드바 통계인지 불명확한 구조**다.

따라서 UI12의 첫 구현은 작은 CSS polish가 아니라 `PlayerProfile` 전체 레이아웃
재구성이어야 한다. 첫 구현은 `MatchSummaryList`를 메인 첫 화면으로 올리고,
`SeasonSummaryCard`, `RecentTwentySummaryCard`, `RankHistoryChart`, `ProfileSidebar`
를 support rail/lower section으로 낮추는 UI12A가 되어야 한다. 신규 Mock/자산/타입
없이도 이 대수술은 가능하며, 리스트 분해나 KPI 통합은 그 다음 Task로 나누는 편이
안전하다.
