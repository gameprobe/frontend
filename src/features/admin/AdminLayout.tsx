import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { endDemoSession, hasDemoSession } from "@/features/admin/admin-session";
import { useGuideEntries } from "@/features/admin/guide-store";
import { KIND_LABEL, KIND_PATH } from "@/features/admin/model";
import { cx } from "@/lib/cx";

/** /admin/* 공통 틀: 예시 입장 확인, 체험 고지, 왼쪽 자료 메뉴 */
export function AdminLayout() {
  const entries = useGuideEntries();
  const navigate = useNavigate();

  if (!hasDemoSession()) return <Navigate to="/admin" replace />;

  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-20 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p lang="en" className="text-12 font-semibold tracking-wider text-sub-weak">
            GAMEPROBE / CONTENT STUDIO
          </p>
          <h1 className="text-28 font-bold">전술 자료 관리</h1>
          <p className="text-15 text-sub">자료를 찾아 수정하거나 새 공략을 등록하세요.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            endDemoSession();
            navigate("/admin");
          }}
          className="text-14 text-sub hover:text-main"
        >
          체험 종료
        </button>
      </div>

      <p role="note" className="rounded-lg border border-line border-l-2 border-l-caution bg-surface px-4 py-3 text-14 text-sub">
        <b className="mr-2 font-semibold text-caution">화면 체험 중</b>
        입력한 내용은 이 탭에서만 유지되고 새로고침하면 초기화됩니다. 게시 상태로 저장한 공략은 이 탭의 공개 라인업·스모크 화면에서 미리 볼 수 있습니다.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav aria-label="자료 관리" className="flex shrink-0 gap-2 rounded-card border border-line bg-surface p-3 lg:w-[200px] lg:flex-col">
          <p className="hidden px-2 pt-1 pb-2 text-13 font-medium text-sub lg:block">자료 관리</p>
          {(["lineup", "smoke"] as const).map((kind) => (
            <NavLink
              key={kind}
              to={`/admin/${KIND_PATH[kind]}`}
              className={({ isActive }) =>
                cx(
                  "flex h-11 flex-1 items-center justify-between gap-3 rounded-lg px-3 text-15 font-semibold lg:flex-none",
                  isActive ? "bg-elevated text-main" : "text-sub hover:text-main",
                )
              }
            >
              {KIND_LABEL[kind]} 관리
              <span className="text-13 text-sub">{entries.filter((entry) => entry.kind === kind).length}</span>
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
