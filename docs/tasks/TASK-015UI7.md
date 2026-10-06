# TASK-015UI7: 프로필 페이지 최종 시안 재구성 (분리됨 → TASK-015UI7A + TASK-015UI7B)

## Status

SPLIT (2026-06-16) — 구현하지 않음

## 분리 안내

이 Task는 범위가 커서 구현 전에 두 개의 독립 Task로 분리됐다. 이 문서는
구현 대상이 아니며, 아래 두 Task가 원래 TASK-015UI7의 전체 범위를 대체한다.

- **[TASK-015UI7A](TASK-015UI7A.md)** — 프로필 상단 구조 재구성: 상단
  플레이어 카드, 전체 폭 필터 바, 좌측 사이드바 재구성(현재 시즌 최고 기록
  제거 → 전체 시즌 최고 기록 + 이전 시즌 티어 + 헤드샷률/역할군/무기/맵),
  중앙 이번 시즌 성적 카드, 날짜별 티어 변동 그래프, 최근 20판 요약, 필요한
  티어 공식 자산 선별 추가. 또한 **DDΔ/R·KAST의 공유 정의/가공 집계(Mock)
  타입을 도입**한다(최근 20판 요약에서 처음 노출). 선행: TASK-015UI6.
- **[TASK-015UI7B](TASK-015UI7B.md)** — 날짜별 최근 전적 그룹화(그룹 헤더 +
  그날 요약 통계), 개별 경기 행 재설계(맵 사진 제거), 경기별·날짜별 KAST·
  DDΔ/R 적용(UI7A 정의 재사용), 긍정/부정 하이라이트 태그(임의 생성 금지),
  기존 인라인 4탭 상세 연결, 아래로 계속 이어지는 전적 목록. 선행:
  TASK-015UI7A.

## 두 Task 사이의 경계

- **UI7A**: 페이지 골격(헤더/필터/2열 레이아웃) + 좌측 사이드바 전체 + 중앙
  상단(이번 시즌 성적·티어 그래프·최근 20판 요약). 공유 데이터 모델 중
  `PlayerHeaderProfile`, `MatchFilterState`, `SeasonSummary`, `CareerPeakRank`,
  `PreviousSeasonRank`, `RankHistoryPoint`, `RecentTwentySummary`와 **DDΔ/R·
  KAST의 표준 정의/타입**, `getTierAssetPath`를 도입한다. `MatchSummaryList`의
  경기 행 구조는 변경하지 않는다(위치/래퍼만 유지).
- **UI7B**: 중앙 하단 최근 전적(`MatchSummaryList`)의 날짜 그룹화·행 재설계·
  KAST/DDΔ/R 경기별 적용·하이라이트 태그·인라인 상세 연결. 공유 데이터 모델
  중 `MatchInsight`, `MatchHighlightTag`, `DailyMatchGroup`를 도입하고 UI7A의
  DDΔ/R·KAST 정의를 재사용한다. 상단 구조는 변경하지 않는다.

## 공유 데이터 모델

- `score-gameprobe.ts`(기존, 변경 금지) — 경기별/프로필 Preview Score, 등급.
- DDΔ/R·KAST 정의/가공 집계 타입 — **UI7A에서 도입**, UI7B에서 경기별·날짜별
  재사용. 표기는 **DDΔ/R**로 통일.
- 모든 신규 통계는 기존 `Player`/`Match*` 타입을 오염시키지 않고 별도 타입/
  데이터/로더로 관리하며, 기존 로더·`asset-map` 함수 시그니처는 유지한다.

원래 TASK-015UI7의 상세 요구사항(시각 방향, Forbidden, 자산 정책, 반응형
등)은 두 후속 Task 문서에 각각 분배·재기술됐다.
