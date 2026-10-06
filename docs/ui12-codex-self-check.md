# UI12 Codex Feasibility Self Check

## Verdict

`docs/ui12-codex-feasibility.md`는 사용자 의도를 대체로 이해했다. 특히 UI11처럼
영역별 부분 수정이 아니라 `PlayerProfile` 전체 레이아웃을 다시 조립해야 한다는
판단, 신규 Mock/자산/타입 없이 가능한 작업과 Human Decision Gate를 분리한 점은
맞다.

다만 문서는 아직 “구현 가능성 제안서” 성격이 강하고, 실제 첫 화면이 어떤 전적검색
서비스 구조로 보여야 하는지에 대한 **구체적인 화면 우선순위와 제거/축소 기준**은
더 선명해질 수 있다.

## What I Understood Correctly

- 사용자는 UI11B~G처럼 기존 컴포넌트를 조금씩 polish하는 수준으로는 부족하다고
  판단한다.
- 목표는 GameProbe를 Riot Production API 신청 전에 “실제로 운영 가능한 VALORANT
  전적검색/전적분석 서비스”처럼 보이게 하는 것이다.
- 기존 컴포넌트 구조를 절대적으로 보존할 필요는 없다.
- 신규 Mock/자산/타입 없이 가능한 구조 대수술이 우선이고, 없는 데이터로 가짜 UI를
  만들면 안 된다.
- OP.GG / Tracker.gg는 색·타이포·레이아웃 복제가 아니라 정보 구조 참고 대상이다.
- 최근 경기 리스트와 선택 경기 상세가 페이지의 중심이 되어야 한다.
- `PlayerProfile`의 현재 흐름은 상단 요약, 사이드바, 시즌 카드, 그래프, 최근 20판
  카드가 비슷한 무게로 쌓여 있어 무엇을 먼저 봐야 하는지 흐린 상태다.

## What I May Have Misunderstood

- “전적분석 서비스처럼 보이게”라는 요구를 충분히 시각적/제품적 문제로 다루기보다,
  일부는 코드 책임 분리 문제로 과하게 해석했을 수 있다.
- 사용자는 화면의 보기 불편함을 먼저 해결하고 싶어 하는데, 문서에서는
  `MatchSummaryList` 분리, CSS primitive 정리 같은 엔지니어링 개선을 다소 앞세운
  부분이 있다.
- `ProfileSidebar` 분해를 제안했지만, 실제 신청 전 첫 화면에서는 사이드바 자체를
  크게 줄이거나 접는 편이 더 맞을 수 있다.
- `SelectedMatchDetail`을 리스트 아래/오른쪽 rail로 옮기는 안은 좋지만, 어떤
  viewport에서 어디에 위치해야 하는지 더 구체적인 규칙이 필요하다.

## VALORANT Understanding Check

문서는 VALORANT 전적 서비스 문맥을 어느 정도 반영했다.

- 핵심 전적 지표: WR, K/D, K/D/A, ACS, ADR, HS%, KAST, DDΔ/R를 기존 데이터 기반
  표시 대상으로 이해했다.
- 경기 문맥: 승/패, 맵, 모드, 요원, 점수, 최근 경기 row, 스코어보드, 라운드 흐름,
  4탭 상세를 페이지 핵심 구조로 봤다.
- 분석/게이트: 평균 대비 분석, 라운드 첫 킬/스파이크/클러치/멀티킬, 참가자 랭크,
  econ, 무기별 Head/Body/Legs는 현재 데이터에 없으므로 Gate로 분리했다.
- 자산 문맥: 요원 PNG, 역할군 아이콘, 무기/맵 이미지 커버리지는 신규 자산 또는
  fallback 유지 문제로 구분했다.

부족한 점:

- “요원/역할군”의 전적 서비스상 중요도를 더 명확히 다뤄야 한다. 현재 문서는 요원
  집계가 없다는 제약은 잘 설명했지만, 그 부재를 화면에서 어떻게 덜 어색하게 만들지
  대안이 약하다.
- 스코어보드가 경기 상세 신뢰도의 핵심이라는 점은 언급했지만, UI12에서 스코어보드를
  어떤 위치와 크기로 보여줄지 더 구체화하지 않았다.
- 라운드/분석 탭은 보존 대상으로만 다뤘고, “분석 서비스처럼 보이는 정보 위계”를
  더 구체적으로 제안하지 않았다.

## Implementation Feasibility Quality

좋았던 점:

- 신규 데이터 계약 변경 없이 가능한 큰 구조 변경을 분리했다.
- `PlayerProfile` 레이아웃 재배치, 최근 경기 중심 전환, support rail 이동은 실제
  Codex가 바로 구현 가능한 수준이다.
- `MatchSummaryList` 책임 분리와 selected detail 패턴은 코드 구조상 타당하다.
- Human Decision Gate 항목이 비교적 명확하다.
- UI12A~E로 Task를 분할한 것은 회귀 위험을 줄이는 데 도움이 된다.

부족한 점:

- UI12A의 “한 번에 구현 가능한 범위”가 여전히 다소 크다. `PlayerProfile` 재배치와
  `globals.css` layout grid 수정은 가능하지만, 실제로는 먼저 “최근 경기 중심
  workspace”만 바꾸고, support rail 내부 재배치는 별도 Task로 나누는 편이 더 안전할
  수 있다.
- CSS primitive 정리는 대수술 후 안정화 단계로 두는 것이 맞는데, 문서에서는
  중요도가 다소 높게 보일 수 있다.
- 구현 시 어떤 컴포넌트를 삭제하지 않고 “숨김/축소/이동”할지, 어떤 컴포넌트는 정말
  통합해서 제거할지 기준이 더 필요하다.

## Too Conservative Or Not

부분적으로 보수적이다.

문서는 기존 컴포넌트를 유지하면서 위치를 바꾸는 접근을 우선 제안했다. 이는 안전하지만,
사용자의 “전체 구조 변화가 부족하다”는 문제의식에는 약간 부족할 수 있다. 더 과감하게
다음 결론을 앞세웠어야 한다.

- 첫 화면 중앙은 최근 경기 리스트여야 한다.
- 시즌 카드/최근 20판 카드/랭크 그래프는 첫 화면 메인에서 내려야 한다.
- 사이드바는 “좌측 보조 컬럼”이 아니라 “오른쪽 support rail 또는 하단 support
  section”으로 재정의해야 한다.
- 인라인 상세는 행 내부 접힘보다 selected detail 패턴으로 바꾸는 것이 전적 서비스
  느낌에 더 가깝다.
- 카드 개수를 줄이고, stat strip/table row 중심으로 바꿔야 한다.

즉, REWRITE 수준은 아니지만 REVISE가 필요하다.

## Missing Technical Risks

- selected detail 패턴 전환 시 client state 위치가 바뀐다. `MatchSummaryList` 내부
  state를 상위로 올리거나 새 container로 감싸야 하며, hydration/initial selected
  match 정책이 필요하다.
- 최근 경기 리스트가 메인 첫 화면이 되면, profile summary cards 일부가 DOM 순서상
  뒤로 밀린다. 접근성 heading order를 다시 점검해야 한다.
- `PlayerHeaderCard`와 summary cards를 통합하면 중복된 `id`/`aria-labelledby`
  구조가 깨질 수 있다.
- `globals.css` primitive 정리 중 기존 페이지(home/privacy/terms/connect)에 의도치
  않은 영향이 갈 수 있다.
- 모바일에서 selected detail을 리스트 아래에 둘 경우, 사용자가 선택 후 상세 위치로
  이동했는지 인지하기 어렵다. scroll/focus 정책이 필요할 수 있지만 과한 JS 동작은
  별도 검토가 필요하다.
- 4탭 상세를 오른쪽 rail로 옮기면 desktop에서는 좋지만, tablet/mobile에서는 rail이
  아래로 떨어지며 리스트와 상세의 관계가 흐려질 수 있다.
- `AppVersionBadge` fixed 위치가 모바일 하단 콘텐츠를 가릴 수 있다. UI12 구현 시
  최종 viewport 확인이 필요하다.
- Playwright 브라우저 바이너리 부재로 실제 screenshot QA가 현재 환경에서 막힐 수
  있다. 설치/다운로드 여부는 별도 결정이 필요하다.

## Recommended Revision

`docs/ui12-codex-feasibility.md`는 유지하되 다음 방향으로 개정하는 것이 좋다.

1. 제안 A를 “권장안”으로 명확히 고정한다.
2. 첫 viewport 기준을 추가한다:
   - 데스크톱 첫 화면: masthead + filters + match feed 상단 + support rail 일부.
   - 모바일 첫 화면: compact masthead + filters + match feed 첫 그룹.
3. `SeasonSummaryCard`, `RecentTwentySummaryCard`, `RankHistoryChart`는 메인 첫
   화면에서 내려야 한다고 더 단정적으로 쓴다.
4. `MatchSummaryList` 분리는 UI12A가 아니라 UI12B로 유지하되, UI12A에서도
   `MatchSummaryList`의 위치를 메인 최상단으로 옮긴다.
5. support rail의 첫 화면 노출 카드는 최대 3~4개로 제한한다.
6. CSS 개선은 “primitive 리팩터링”보다 “카드 과다 제거, stat strip/table-like row”
   방향을 먼저 강조한다.
7. Human Decision Gate에 “게이트 미해결 상태에서 신청 가능한 최소 표현”을 덧붙인다.

## Final Self-Assessment

문서는 사용자 의도를 대체로 정확히 이해했고, 신규 데이터 없이 가능한 구조 대수술을
제안했다. 그러나 실제 전적검색 서비스처럼 보이게 만드는 화면 우선순위와 첫 화면
구성 기준이 아직 약하다. 다음 구현 Task를 바로 만들 수는 있지만, 그 전에 문서를 한 번
개정하면 Codex 구현 범위가 더 명확해진다.

REVISE
