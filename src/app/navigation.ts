/** 헤더 메뉴. 순서와 이름은 Figma Header / PC(98:8105) 기준. */
export const NAV_ITEMS = [
  // 프로필·매치 상세도 전적 검색 메뉴 아래 화면이다 (Figma 02·03 섹션 헤더 Active = 전적 검색)
  { label: "전적 검색", to: "/search", alsoActive: ["/players", "/matches"] },
  { label: "랭킹", to: "/ranking" },
  { label: "메타 통계", to: "/meta" },
  { label: "라인업", to: "/lineups" },
  // 스모크는 Figma 헤더에 빠져 있어 사용자 결정으로 라인업 뒤에 둔다 (TASK-FE-051)
  { label: "스모크", to: "/smokes" },
  { label: "게임 정보", to: "/game-info" },
  { label: "마이페이지", to: "/my" },
] as const;

/**
 * 아직 구현하지 않은 Figma 섹션. 경로 접두사로 '준비 중' 화면의 제목을 고른다.
 * 01~08 섹션을 모두 구현해 지금은 비어 있다. 약관 등 새 화면을 시안 전에 열어 둘 때 쓴다.
 */
export const UPCOMING_SECTIONS: { prefix: string; section: string; title: string }[] = [];

export function isNavItemActive(item: (typeof NAV_ITEMS)[number], pathname: string): boolean {
  const prefixes = [item.to, ...("alsoActive" in item ? item.alsoActive : [])];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function findUpcomingSection(pathname: string) {
  return UPCOMING_SECTIONS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
