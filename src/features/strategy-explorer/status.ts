/** /lineups의 데이터 공급 상태. 요청·필터 동작은 그대로 두고 안내에만 사용한다. */
export type LineupDataState = "loading" | "api" | "fallback";

export type StrategyNotice = {
  title: string;
  message: string;
  tone: "neutral" | "info" | "success" | "preview";
};

/** 탐색 화면 상단과 선택한 맵의 상태 안내에서 함께 사용하는 문구. */
export const LINEUP_NOTICES = {
  loading: {
    title: "라인업을 불러오고 있어요",
    message: "불러오는 동안 예시 라인업을 둘러볼 수 있어요.",
    tone: "info",
  },
  published: {
    title: "공개 라인업",
    message: "공개 승인된 라인업을 보고 있어요. 맵과 요원을 선택해 확인해 보세요.",
    tone: "success",
  },
  empty: {
    title: "공개된 라인업이 없어요",
    message: "자료가 공개되면 이곳에서 확인할 수 있어요.",
    tone: "neutral",
  },
  fallback: {
    title: "예시 라인업을 보고 있어요",
    message: "자료를 불러오지 못해 예시를 표시하고 있어요. 실제 플레이용으로 검증된 자료는 아니에요.",
    tone: "preview",
  },
} satisfies Record<string, StrategyNotice>;

/** LineupsPage 상단: 공개 자료 0건을 성공 메시지나 연결 실패와 구별한다. */
export function getLineupNotice(state: LineupDataState, total: number): StrategyNotice {
  if (state === "loading") return LINEUP_NOTICES.loading;
  if (state === "fallback") return LINEUP_NOTICES.fallback;
  return total === 0 ? LINEUP_NOTICES.empty : LINEUP_NOTICES.published;
}

/** LineupSearchFilter의 표시용 안내. 지도/필터의 실제 결과를 변경하지 않는다. */
export const LINEUP_HINTS = {
  noResults: "선택한 조건에 맞는 라인업이 없어요. 맵·진영·요원·스킬을 변경해 보세요.",
  noExamples: "현재 예시에는 선택한 조건에 맞는 라인업이 없어요. 맵·진영·요원·스킬을 변경해 보세요.",
  chooseAgent: "요원을 선택하면 현재 맵과 진영에 맞는 스킬 위치를 볼 수 있어요.",
  noPosition: "선택한 라인업의 지도 위치가 아직 등록되지 않았어요. 아래 상세 보기에서 자료를 확인해 보세요.",
  chooseSkill: "지도 위 스킬 아이콘을 선택하면 시작 위치를 확인할 수 있어요.",
  chooseStart: "지도 위 요원 아이콘 중 하나를 선택해 시작 위치를 확인해 보세요.",
  noStart: "시작 위치가 아직 등록되지 않았어요. 현재 등록된 스킬 위치만 표시하고 있어요.",
  selected: "선택한 시작 위치를 표시하고 있어요. 자세한 내용은 아래 상세 보기에서 확인해 보세요.",
} as const;

/** SmokesPage 상단 및 SmokeSearchFilter의 예시·빈 결과·선택 안내. */
export const SMOKE_NOTICE: StrategyNotice = {
  title: "예시 스모크 가이드",
  message: "현재 위치·경로·크기·지속시간은 예시예요. 실제 플레이에 사용하기 전 패치별 검증이 필요해요.",
  tone: "preview",
};

export const SMOKE_HINTS = {
  emptyTitle: "선택한 조건에 맞는 연막 예시가 없어요",
  emptyMessage: "맵·진영·사이트·연막 유형을 변경해 보세요.",
  select: "지도 위 연막 아이콘이나 가이드를 선택하면 투척 경로와 설치 방법을 볼 수 있어요.",
} as const;
