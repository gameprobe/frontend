import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/app/Footer";
import { Header } from "@/app/Header";

export function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="border-b border-line bg-primary-soft">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 text-13">
          <p className="text-sub"><span className="mr-2 font-semibold text-primary">공개 데모</span>전적·랭킹·메타·분석은 예시이며, Riot 로그인과 실제 전적 조회는 준비 중이에요.</p>
          <Link to="/review" className="shrink-0 font-medium text-primary hover:underline">서비스 안내 / Demo guide →</Link>
        </div>
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
