import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LoginCard } from "@/features/my/LoginCards";
import { useMockSession } from "@/features/my/my-store";
import { cx } from "@/lib/cx";
import { formatRiotId } from "@/lib/riot-id";

const TABS = [
  { label: "라이엇 계정 연동", path: "/my" },
  { label: "내 전적 바로가기", path: "/my/record" },
  { label: "즐겨찾기 관리", path: "/my/favorites" },
  { label: "설정", path: "/my/settings" },
] as const;

/** 로그인 흐름 화면(동의·실패)은 로그인 여부와 관계없이 가운데 카드로 보여준다. */
const AUTH_PATHS = ["/my/consent", "/my/login-failed"];

/** 가운데 정렬 카드 틀 (Figma 25~27: 위아래 80px, 폭 520px) */
export function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="container-page pt-8 pb-20 md:pt-20">
      <div className="mx-auto max-w-[520px]">{children}</div>
    </div>
  );
}

/** 07 마이페이지 공통 틀: 로그인 전에는 로그인 카드(25), 로그인 후에는 인사 + 탭(28~31). */
export function MyLayout() {
  const { pathname } = useLocation();
  const { session } = useMockSession();
  const path = pathname.replace(/\/$/, "");

  if (AUTH_PATHS.includes(path)) {
    return (
      <CenteredCard>
        <Outlet />
      </CenteredCard>
    );
  }

  if (!session) {
    return (
      <CenteredCard>
        <LoginCard />
      </CenteredCard>
    );
  }

  return (
    <div className="container-page flex flex-col gap-9 pt-8 pb-20 md:pt-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-16 font-medium text-sub">마이페이지</p>
          <h1 className="text-24 font-semibold md:text-28 xl:text-32">{formatRiotId(session)} 님, 반가워요</h1>
        </div>
        <nav aria-label="마이페이지 메뉴" className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {TABS.map((tab) => {
            const active = path === tab.path;
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
      <div className="w-full max-w-[720px]">
        <Outlet />
      </div>
    </div>
  );
}
