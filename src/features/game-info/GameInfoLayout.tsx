import { Link, Outlet, useLocation } from "react-router-dom";
import { cx } from "@/lib/cx";

/** prefixes: 이 탭을 활성으로 보는 경로 접두사 */
const TABS = [
  { label: "요원 정보", path: "/game-info", prefixes: ["/game-info/agents"] },
  { label: "맵 정보", path: "/game-info/maps", prefixes: ["/game-info/maps"] },
  { label: "무기 정보", path: "/game-info/weapons", prefixes: ["/game-info/weapons"] },
  { label: "조준점", path: "/game-info/crosshairs", prefixes: ["/game-info/crosshairs"] },
  { label: "라인업", path: "/game-info/lineups", prefixes: ["/game-info/lineups"] },
  { label: "패치 노트", path: "/game-info/patch-notes", prefixes: ["/game-info/patch-notes"] },
] as const;

function isTabActive(tab: (typeof TABS)[number], pathname: string) {
  const path = pathname.replace(/\/$/, "");
  return path === tab.path || tab.prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** 06 게임 정보 공통 틀: 제목 + 탭 (Figma 96:421). 요원 탭은 /game-info 와 /game-info/agents/:id 에서 활성. */
export function GameInfoLayout() {
  const { pathname } = useLocation();

  return (
    <div className="container-page flex flex-col gap-4 pt-8 pb-20 md:pt-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-16 font-medium text-sub">게임 정보</p>
          <h1 className="text-24 font-semibold md:text-28 xl:text-32">요원 · 맵 · 무기 가이드</h1>
        </div>
        <nav aria-label="게임 정보 메뉴" className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {TABS.map((tab) => {
            const active = isTabActive(tab, pathname);
            return (
              <Link
                key={tab.label}
                to={tab.path}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "-mb-px flex h-11 shrink-0 items-center border-b-2 px-3 text-15 font-semibold whitespace-nowrap md:px-4 md:text-16",
                  active ? "border-primary text-main" : "border-transparent text-sub hover:text-main",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
