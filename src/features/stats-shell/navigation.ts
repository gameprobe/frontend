import type { StatsNavItem } from "./StatsHeader";

// 홈·프로필·라인업·스모크의 Search 옆 메뉴에서 공유하는 이동 주소와 표시 이름.
// 일반 Overview 진입은 기존 디자인 데모를 유지하고, 프로필 내부 전환은 아래 콜백을 사용한다.
const routes = {
  home: { label: "Home", href: "/" },
  overview: { label: "Overview", href: "/players/ied-agent-allen" },
  lineups: { label: "Lineups", href: "/lineups" },
  smokes: { label: "Smokes", href: "/smokes" },
  insights: { label: "Insights", href: "/insights" },
} as const;

type MainPage = keyof typeof routes;
// 관련 전술 가이드 둘을 붙이고, 경기 후 분석 예시를 마지막에 배치한다.
const tacticalPages = ["lineups", "smokes", "insights"] as const;

/** 홈·전술·상세·안내 화면의 이동 메뉴. 소속 메뉴가 없는 안내/관리자는 current를 생략한다. */
export function createMainNavigation(current?: MainPage): StatsNavItem[] {
  const pages: MainPage[] = ["home", "overview", ...tacticalPages];
  return pages.map(page => ({ ...routes[page], current: page === current }));
}

/** TrackerProfile의 기존 탭 순서·현재 선택·전환 콜백을 그대로 공통 링크 사이에 배치한다. */
export function createProfileNavigation(tabs: StatsNavItem[]): StatsNavItem[] {
  return [routes.home, ...tabs, ...tacticalPages.map(page => routes[page])];
}
