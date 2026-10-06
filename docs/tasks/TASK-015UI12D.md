# TASK-015UI12D: 경기 상세 탭 정리 및 스코어보드 우선화 (읽기 흐름 ③상세)

## Status

DONE (경기 상세 탭 정리 및 스코어보드 우선화 · Codex 구현 완료)

> UI12C가 완료(DONE)되어 커밋/동기화된 Git 상태 위에서 진행한다.
> 경기 상세 패널의 시각적 위계를 정리하여 1순위 정보인 스코어보드를 우선적으로 스캔할 수 있도록 개선하고, 나머지 3개 탭(라운드/성과/분석)의 면적과 여백을 콤팩트하게 압축한다.

## Goal

1. **스코어보드 탭 우선 노출**: 경기 상세 펼침 시 스코어보드(Scoreboard) 탭을 1순위 기본 활성 상태로 유지하고 탭 순서의 가장 처음에 오게 정렬한다.
2. **팀 구분 및 본인(YOU) 강조 강화**: 아군과 적군의 구분을 시각적으로 뚜렷하게(예: 은은한 아군/적군 색상 테두리, 배경 톤 분리) 조정하고, 플레이어 본인(YOU) 행에 대한 강조 스타일(Highlighting)을 강화하여 정보 가독성을 높인다.
3. **나머지 탭 노출 압축**: 라운드(Rounds), 성과(Performance), 분석(Analysis) 탭의 세로 높이, 카드 패딩, 글꼴 크기를 콤팩트하게 압축하여 불필요한 스크롤을 줄이고 정보 밀도를 높인다.

## Background

- `docs/ui12-implementation-plan.md` §3-5 및 §5-9: 사용자가 최근 경기를 읽어 내려갈 때 "상세 정보"는 스코어보드를 중심으로 빠르게 파악해야 한다.
- 현재 스코어보드는 팀 스코어 라인은 존재하지만 아군/적군 영역의 시각적 대비가 약하고, 플레이어 본인(YOU)을 나타내는 행의 강조도 배경이 밋밋하여 한눈에 식별하기 어렵다.
- 라운드 흐름, 근거 지표(성과), 분석 미리보기 탭 등은 현재의 Mock 데이터 한계 내에서 지나치게 넓은 공간을 낭비하고 있다. 이를 슬림화하여 스캔 면적을 확보할 필요가 있다.
- `docs/ui12-visual-qa.md` §4-3: 불필요하게 두껍고 산만한 개별 카드 테두리(Border)를 억제하고 플랫하고 깔끔한 면 분할 또는 어두운 톤으로 일체화하는 요구사항이 경기 상세 패널 전체에도 동일하게 적용되어야 한다.

## Reference Direction

- OP.GG / Tracker.gg의 경기 상세 영역 디자인 참고.
- 본인 행은 아군 내에서 확실하게 구분되는 배경색과 보더 처리를 제공한다.
- 탭 내부의 여백과 텍스트 크기를 콤팩트하게 축소하여 전체적으로 일체감 있고 완성도 높은 화면을 구축한다.

## Allowed Changes

- `frontend/src/components/MatchDetailPanel.tsx`
  - 상세 패널의 탭 기본 순서(Scoreboard 우선) 및 전체 컨테이너 여백 조정.
- `frontend/src/components/MatchScoreboardTab.tsx`
  - 팀 헤더 스타일 보강(아군/적군 색상 톤 분리).
  - 본인 행(YOU)의 배경 하이라이팅 및 좌측 보더 강조 추가.
- `frontend/src/components/MatchRoundsTab.tsx`
  - 라운드 결과 칩 스트립, 구간 요약 및 라운드 카드 목록의 여백(padding), 글꼴 크기를 축소하여 콤팩트하게 압축.
- `frontend/src/components/MatchPerformanceTab.tsx`
  - 핵심 전투 지표 카드 및 MVP 카드 레이아웃의 컴팩트화.
  - "연동 후 제공 예정" 안내 영역의 불필요한 세로 높이 압축.
- `frontend/src/components/MatchAnalysisTab.tsx`
  - 분석 카드 그리드의 크기, 패딩, 보더 두께 축소 및 안내 문구 배너 영역 다이어트.
- 관련 CSS
  - `frontend/src/app/globals.css` 내의 경기 상세 및 스코어보드, 탭 관련 스타일 클래스 수정.

## Forbidden Changes

- **타 단계 범위 침범 금지**:
  - 사이드바/support rail 내부 수정 (UI12E): `ProfileSidebar.tsx` 수정 금지.
  - 마스트헤드 수정: `PlayerHeaderCard.tsx` 수정 금지.
  - 경기 리스트 행 구조 수정 (UI12C): `MatchSummaryList.tsx` 수정 금지.
- **제품 코드 외 변경 금지**:
  - 신규 Mock 데이터 모델, 타입 필드 추가 금지 (기존 데이터 구조 그대로 사용).
  - backend, docker, scripts 경로 변경 금지.
  - 외부 Riot CDN 참조 추가 및 `Math.random` 사용 금지.
  - Git add/commit/push 실행 금지.

## Existing Data / Assets Available

- 기존의 `MatchDetail`, `MatchParticipant`, `MatchRound` 데이터 및 `getAgentAssetPath` 에셋 매핑 함수 사용.
- 신규 자산 추가 없이, 기존에 복사된 요원 이미지 파일들만 사용.

## Required UI Changes

1. **스코어보드 팀 구분 및 YOU 강조**:
   - 아군(우리 팀) 스코어보드와 적군(상대 팀) 스코어보드의 헤더 영역에 각각 블루/레드 계열의 은은한 배경 톤이나 좌측 보더(예: 3px 블루/레드 세로선)를 추가하여 팀 소속 구분을 직관적으로 돕는다.
   - 플레이어 본인(YOU)이 포함된 테이블 행(`.scoreboard-row-viewer`)의 배경색을 다른 행보다 대비가 확실한 톤으로 어둡게 깔고, 좌측에 테두리 강조선 등을 추가하여 스캔성을 극대화한다.
2. **라운드 탭 압축**:
   - 라운드 타임라인 칩 리스트(`.round-timeline`)와 구간별 요약 영역의 간격을 좁히고, 라운드 상세 패널(`.round-selected-detail`)의 세로 높이와 여백을 축소하여 한눈에 모든 라운드 정보가 들어오도록 조정한다.
3. **성과 및 분석 탭 다이어트**:
   - 성과 탭의 전투 지표 카드들과 분석 탭의 점수 카드들의 두껍고 불투명한 테두리를 투명하거나 얇은 보더로 억제한다.
   - 텍스트 크기와 카드 패딩을 줄여 카드 컴포넌트의 면적을 대폭 깎고, 미연동/Mock 안내 배너의 크기를 한 줄 수준으로 슬림하게 줄인다.

## Acceptance Criteria

1. 경기 상세를 열었을 때 `Scoreboard` 탭이 가장 왼쪽에 위치하고 기본으로 선택되어 있는가.
2. 스코어보드 상에서 우리 팀과 상대 팀 구분이 명확하게 보이고, 플레이어 본인 행이 확연히 강조되어 나타나는가.
3. 라운드 흐름, 성과 지표, 분석 카드 영역들의 패딩과 마진이 콤팩트하게 다이어트되어 공간 낭비가 없는가.
4. `tsc`, `lint`, `build`가 에러 없이 성공하는가.
5. 수정한 파일이 허용된 5개 컴포넌트 파일 및 CSS(globals.css 등) 스타일 파일로 제한되는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
git diff --check

# 변경 파일이 허용 범위 내에 있는지 검증
git status --porcelain | grep -v "docs/tasks/TASK-015UI12D.md"
```

## Stop Conditions

- 상세 패널의 스타일 조정을 위해 사이드바(`ProfileSidebar.tsx`)나 마스트헤드(`PlayerHeaderCard.tsx`) 등 허용되지 않은 파일 수정을 시도해야 할 때.
- 기존의 데이터 로더나 타입 정의의 대규모 수정을 강제하는 충돌이 일어날 때.
- 동일한 검증 에러가 3회 이상 발생할 시 `BLOCKED`로 처리하고 작업을 중단한다.

## Codex Implementation Notes

- **스코어보드 탭 기본 활성 및 정렬**: 경기 상세 펼침 시 스코어보드가 기본 탭이 되도록 유지하고 탭 순서에서 1순위로 표시되는 구조를 유지했습니다.
- **스코어보드 팀 구분 및 YOU 강조**: `MatchScoreboardTab.tsx`에서 아군과 적군 스코어보드에 각각 `scoreboard-team-blue`, `scoreboard-team-red` 클래스를 동적으로 주입하고, `globals.css`에서 은은한 블루/레드 배경색 톤과 좌측 3px 보더 세로선을 적용해 가독성을 높였습니다. 플레이어 본인 행(`.scoreboard-row-viewer`)에 강력한 1px 보더 강조, 어두운 대비의 배경색, 4px 인셋 보더 및 글로우 효과를 적용하여 빠르게 식별이 가능하도록 했습니다. 요원 이미지의 폭/높이를 28px(CSS 24px)로 축소하여 정보 밀도를 압축했습니다.
- **나머지 탭 압축**:
  - `MatchRoundsTab.tsx`: 안내 텍스트를 줄여 세로 길이를 압축하고 globals.css에서 타임라인 칩 패딩, min-width, 로그 버튼 및 요약 카드 영역의 간격을 콤팩트하게 다이어트했습니다.
  - `MatchPerformanceTab.tsx`: 미연동 전투 지표 안내를 인라인 형태의 한 줄 텍스트로 단순화해 공간 낭비를 줄였습니다.
  - `MatchAnalysisTab.tsx`: 중복 예시 복사본 문단을 삭제하고, 4개 분석 카드의 설명 문구를 콤팩트하게 요약 정돈했습니다.
  - `globals.css`: 각 탭 카드들의 패딩, 마진, 폰트 크기, 보더 두께를 축소해 불필요한 스크롤 없이 한눈에 정보가 들어오도록 공간을 깎아냈습니다.
- **검증 완료**: `npx tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check` 검증이 에러 없이 PASS했습니다.

## Cursor Review Notes

- **기본 탭 1순위 및 순서**: `MatchDetailPanel.tsx`에서 `activeTab`의 초기값이 `scoreboard`로 잘 세팅되어 있고, `MatchTabs.tsx`에서 탭 1순위로 스코어보드가 오도록 구현되어 있어 Acceptance Criteria 1을 잘 충족합니다.
- **팀 구분 및 본인 강조 시각 검증**: `MatchScoreboardTab.tsx`에 블루/레드 계열의 배경색 톤과 세로 보더선이 추가되어 아군/적군 구분이 명확해졌으며, 본인 행(`.scoreboard-row-viewer`)의 인셋 보더 및 글로우 효과, 어두운 배경색이 적용되어 스캔 가독성이 매우 뛰어납니다.
- **탭별 다이어트 및 정보 압축**: 라운드 칩, 전투 지표 카드, 분석 카드의 패딩, 마진, 폰트 크기 다이어트가 globals.css에 촘촘하게 반영되었고, 안내 배너를 한 줄로 슬림화하거나 중복 문단을 축소하여 정보 밀도가 잘 향상되었습니다.
- **Allowed/Forbidden 범위 준수**: 허용된 5개 컴포넌트 파일 및 globals.css로 수정한 파일이 제한되며, 사이드바(`ProfileSidebar.tsx`), 마스트헤드(`PlayerHeaderCard.tsx`), 경기 리스트(`MatchSummaryList.tsx`)와 같은 타 범위 파일 수정이 없으며 신규 Mock/타입/자산/패키지 추가가 전혀 없는 깔끔한 구현을 유지했습니다.
- **검증 성공**: `tsc`, `lint`, `build` 및 `git diff --check` 검증 명령을 최종적으로 모두 PASS하였습니다.
- **최종 Verdict**: **`COMMIT_READY`** (커밋 진행 가능)
