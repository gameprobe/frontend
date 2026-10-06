# TASK-015UI12F: 전체 반응형 마감 및 전역 Mock 고지 단일화 (읽기 흐름 전체)

## Status

DONE — 구현, 검증 및 리뷰 완료 (최종 커밋 완료)


> TASK-015UI12E가 완료(DONE)되어 커밋/동기화된 Git 상태 위에서 진행한다.
> 프로필 페이지 내의 수많은 "Mock / Mock aggregate" 안내 텍스트/배지들을 헤더나 특정 1곳으로 단일화하고, 각 세부 카드/사이드바/상세 패널 내의 중복 또는 무분별한 Mock 고지 배지들을 제거하여 깔끔하고 신뢰성 있는 UI 완성. 또한 최종 반응형 390px, 1440px 해상도에서의 간격 조율 및 마감.

## Goal

1. **Mock 고지 전역 단일화**:
   - `PlayerHeaderCard.tsx` (프로필 헤더 카드) 우측 상단 또는 닉네임 영역 등에 전역 Mock/Preview 모드를 나타내는 명확하고 고급스러운 단일 배지(예: `Mock Preview`) 및 툴팁/설명을 배치한다.
   - 플레이어 프로필 내의 다른 모든 개별 카드(`SeasonSummaryCard`, `RecentTwentySummaryCard`, `ProfileSidebar`, `MatchDetailPanel` 등) 및 탭(`MatchAnalysisTab`, `MatchPerformanceTab`, `MatchRoundsTab` 등) 내부의 중복 배지(`data-badge`, `Mock Data`, `Mock aggregate` 등) 및 지저분한 Mock 설명 텍스트를 제거한다.
2. **반응형 390px 및 1440px 해상도 간격 조율 및 마감**:
   - 모바일 뷰포트(390px)에서 깨짐, 오버플로우 또는 부자연스러운 여백이 발생하는 요소들을 완벽히 수정한다.
   - 데스크톱(1440px) 뷰포트에서 레이아웃 그리드 배치가 안정적이고 균형감 있게 노출되도록 패딩, 마진, 카드 간의 간격을 조율한다.
   - 전체 UI의 시각적 완성도(Visual QA에서 제기된 디자인 일관성 등)를 높이기 위한 마감 작업을 진행한다.

## Background

- `docs/ui12-implementation-plan.md` §3-7: "Mock 고지 면적 축소 + 정직성 유지: 카드별 배지 제거, 전역 고지 1개 유지."
- `docs/ui12-implementation-plan.md` §5-6: "Mock/Preview 고지 면적 축소(전역 1개) — 정직성 원칙은 유지."
- `docs/ui12-visual-qa.md` §3 (모바일 뷰포트 390px 렌더링 붕괴): "모바일 화면에서 현재 티어부터 최근 20판 카드, Preview Score, UI Build 배지까지의 레이아웃이 유연하게 떨어지지 못하고 한곳에 완전히 겹쳐 뭉개져 렌더링됩니다." (일부는 UI12B_PATCH에서 처리되었으나 최종 반응형 마감이 필요)
- 수많은 "Mock" 텍스트 배지들이 도처에 나타나 전적 서비스로서의 프로페셔널한 첫인상을 저해하고 정돈되지 못한 인상을 주고 있다.

## Reference Direction

- OP.GG, Tracker.gg의 세련된 프로필 인터페이스처럼, 군더더기 없는 레이아웃을 유지하면서도 Riot API 신청 시 필요한 "Mock 데이터 기반 서비스"임을 헤더 1곳에서 기품 있게 알린다.
- 전체 레이아웃의 마감을 위한 CSS 레이어 정리 및 뷰포트별 브레이크포인트 검증.

## Allowed Changes

- `frontend/src/components/PlayerProfile.tsx`
- `frontend/src/components/PlayerHeaderCard.tsx`
- `frontend/src/components/ProfileSidebar.tsx`
- `frontend/src/components/MatchSummaryList.tsx`
- `frontend/src/components/MatchDetailPanel.tsx`
- `frontend/src/components/MatchDetailView.tsx`
- `frontend/src/components/SeasonSummaryCard.tsx`
- `frontend/src/components/RecentTwentySummaryCard.tsx`
- `frontend/src/components/RankHistoryChart.tsx`
- `frontend/src/components/MatchPerformanceTab.tsx`
- `frontend/src/components/MatchAnalysisTab.tsx`
- `frontend/src/components/MatchRoundsTab.tsx`
- `frontend/src/app/globals.css`
  - 전역 Mock 고지 단일화에 따른 기존 Mock 배지/텍스트 마크업 제거 및 헤더 통합 배지 추가.
  - 모바일(390px) 및 데스크톱(1440px) 뷰포트에 따른 CSS 간격, 마진, 패딩, 폰트 조율.

## Forbidden Changes

- **신규 기능 추가 금지**:
  - 데이터 필드 추가, 새로운 Mock API 연동, 타입 수정 금지.
  - Riot public content catalog 로컬 캐시 외의 외부 이미지/패키지 추가 금지.
- **기타 경로 코드 수정 금지**:
  - `backend/`, `docker/`, `scripts/` 등 백엔드 및 인프라 코드 수정 금지.
  - Git add/commit/push 실행 금지.

## Required UI Changes

1. **전역 Mock 고지 단일화 구현**:
   - `PlayerHeaderCard.tsx` 내 적절한 위치(예: 플레이어 닉네임 우측 또는 마스트헤드 우측 상단)에 `Mock Preview` 배지를 하나만 유지하고, 마우스를 올리거나 클릭 시 "Riot Production API 승인 전에 제공되는 데모 데이터 기반의 화면입니다" 등의 툴팁 또는 마크업을 띄운다.
   - 아래 컴포넌트 내의 Mock 고지 배지(`Mock Data`, `Mock`, `Mock aggregate` 등) 및 텍스트를 모두 제거한다:
     - `PlayerProfile.tsx` (메인 레이아웃 상의 Mock Data 배지 제거)
     - `ProfileSidebar.tsx` (Mock 배지 및 하단 Mock 안내 텍스트 제거)
     - `SeasonSummaryCard.tsx` (Mock aggregate 배지 제거)
     - `RecentTwentySummaryCard.tsx` (Mock aggregate 배지 및 가공 집계 안내 텍스트 제거)
     - `RankHistoryChart.tsx` (Mock graph 배지 및 안내 텍스트 제거)
     - `MatchDetailPanel.tsx` / `MatchDetailView.tsx` (Mock Data 배지 제거)
     - `MatchPerformanceTab.tsx` (Mock Data 배지 제거)
     - `MatchAnalysisTab.tsx` (Mock Preview 배지 및 안내 문구 축소/정리)
     - `MatchRoundsTab.tsx` (Mock Data 배지 제거)
2. **반응형 390px 마감 및 간격 조율**:
   - 모바일 해상도(390px)에서 스크롤 오버플로우가 나거나 찌그러지는 컴포넌트가 없는지 재검증.
   - `globals.css` 내 미디어 쿼리를 통해 모바일에서의 패딩/마진을 더 슬림하게 깎아내고, 텍스트가 줄바꿈되어 깨지는 현상 방지.
   - 특히 모바일 뷰포트에서 마스트헤드와 필터바, 최근 경기 리스트, 사이드바(전체 레이아웃 상 하단 배치로 전환되는 부분)의 전환이 자연스럽게 이루어지는지 체크.
3. **데스크톱 1440px 해상도 마감**:
   - 2열 레이아웃(메인 경기 리스트 + 보조 사이드바)의 정렬과 카드 간 여백(`gap`)을 일정하게 정돈.
   - 전체 카드들의 보더 투명도를 통일하여 시각적 깊이감(Depth)과 세련된 어두운 톤의 일체감을 완성.

## Acceptance Criteria

1. 프로필 페이지의 헤더 카드에만 전역 Mock 고지 배지가 고급스럽게 존재하고, 다른 모든 서브 카드 및 탭 패널 내의 중반/하단에 노출되던 "Mock" 관련 배지와 텍스트가 모두 깔끔히 정리되었는가.
2. 모바일(390px) 해상도에서 화면이 뭉개지거나 깨지는 레이아웃 결함이 없고 정상적으로 흐르는가.
3. 데스크톱(1440px) 뷰포트에서 그리드 레이아웃의 정렬과 여백이 레퍼런스(OP.GG/Tracker.gg) 수준으로 매끄럽고 일관성 있게 표시되는가.
4. `tsc`, `lint`, `build` 명령어가 에러 없이 정상 통과하는가.
5. 수정한 파일이 허용된 UI 및 CSS 파일 범위를 벗어나지 않는가.

## Verification Commands

```bash
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Stop Conditions

- Mock 고지 단일화 구현 과정에서 신규 컴포넌트 또는 신규 타입 정의 파일이 요구될 때.
- 동일한 검증 에러가 3회 이상 발생할 시 `BLOCKED`로 처리하고 작업을 중단한다.

## Result

- **구현 상태**: IMPLEMENTED
- **변경된 파일 목록**:
  - `frontend/src/components/PlayerHeaderCard.tsx`
  - `frontend/src/components/PlayerProfile.tsx`
  - `frontend/src/components/ProfileSidebar.tsx`
  - `frontend/src/components/SeasonSummaryCard.tsx`
  - `frontend/src/components/RecentTwentySummaryCard.tsx`
  - `frontend/src/components/RankHistoryChart.tsx`
  - `frontend/src/components/MatchDetailPanel.tsx`
  - `frontend/src/components/MatchDetailView.tsx`
  - `frontend/src/components/MatchPerformanceTab.tsx`
  - `frontend/src/components/MatchAnalysisTab.tsx`
  - `frontend/src/components/MatchRoundsTab.tsx`
  - `frontend/src/app/globals.css`
- **검증 명령어 실행 결과**:
  - `npx tsc --noEmit`: PASS
  - `npm run lint`: PASS (No warnings or errors)
  - `npm run build`: PASS (Static build successful)
- **비고**:
  - `git add / commit / push` 금지 원칙 준수 완료.
  - 전역 Mock Preview 배지와 마우스 오버 툴팁이 `PlayerHeaderCard` 닉네임 우측에 자연스럽게 배치됨.
  - 390px 모바일 화면에서 KPI 요약 카드 등이 세로 1열 대신 2열 구성으로 슬림하게 압축 렌더링되어 겹침 현상이 완벽히 해결됨.
  - 모든 카드 보더 투명도가 `border: 1px solid rgba(255, 255, 255, 0.07)`로 통일되어 시각적 깊이감 및 일체감 극대화.

## Cursor Review Notes

- **Verdict**: `COMMIT_READY`
- **Reviewed At**: 2026-06-24 KST
- **Review Summary**:
  - 프로필 헤더 카드 내 전역 Mock Preview 배지와 마우스 오버 툴팁이 정상 작동하여, 기존 10여개 컴포넌트의 중복 Mock 배지 제거로 서비스 신뢰도가 향상되었습니다.
  - 모바일(390px) 뷰포트에서 KPI 카드 및 시즌 요약 카드의 세로 겹침 현상이 해결되고 2열 균형을 갖추었습니다.
  - 모든 카드 테두리의 두께 및 알파 투명도가 통일되어 시각적 완성도(Visual QA 대응)가 향상되었습니다.
  - 빌드 및 린트 검증 명령이 모두 PASS하였고, git diff check 역시 이상이 없습니다.

