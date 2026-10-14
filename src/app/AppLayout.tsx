import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
      <main className="flex-1">
        <Outlet />
      </main>
      {/* 메인 홈 시안의 푸터에는 예시 데이터 문구가 없다 */}
      <Footer showDataNotice={pathname !== "/"} />
    </div>
  );
}
