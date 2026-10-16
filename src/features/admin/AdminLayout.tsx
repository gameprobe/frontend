import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { AdminTokenForm } from "./AdminGatePage";
import { clearAdminLineups, loadAdminLineups, useAdminLineups } from "./admin-lineup-store";
import { clearAdminSmokes, clearDemoSmokes, loadAdminSmokes, useAdminSmokes, useDemoSmokes } from "./admin-smoke-store";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { endDemoSession, useAdminMode, useAdminToken } from "@/features/admin/admin-session";
import { useGuideEntries } from "@/features/admin/guide-store";
import { KIND_LABEL, KIND_PATH } from "@/features/admin/model";
import { cx } from "@/lib/cx";

/** /admin/* 공통 틀: 예시 입장 확인, 체험 고지, 왼쪽 자료 메뉴 */
export function AdminLayout() {
  const demoEntries = useGuideEntries();
  const real = useAdminLineups();
  const realSmokes = useAdminSmokes();
  const demoSmokes = useDemoSmokes();
  const mode = useAdminMode();
  const token = useAdminToken();
  const reauthRef = useRef<HTMLDivElement>(null);
  const reauth = mode === "real" && !token;
  useEffect(() => {
    if (!reauth) return;
    const dialog = reauthRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    dialog.querySelector<HTMLInputElement>("input")?.focus();
    const keepFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) dialog.querySelector<HTMLInputElement>("input")?.focus();
    };
    const cycleFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const fields = Array.from(dialog.querySelectorAll<HTMLElement>("input:not(:disabled),button:not(:disabled),a[href]"));
      const first = fields[0];
      const last = fields[fields.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("focusin", keepFocus);
    dialog.addEventListener("keydown", cycleFocus);
    return () => {
      document.removeEventListener("focusin", keepFocus);
      dialog.removeEventListener("keydown", cycleFocus);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [reauth]);
  const entries = mode === "real" ? real.entries : demoEntries;
  useEffect(() => {
    if (mode === "real" && token) { void loadAdminLineups(); void loadAdminSmokes(); }
  }, [mode, token]);
  const navigate = useNavigate();

  if (!mode) return <Navigate to="/admin" replace />;

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
            if (!window.confirm("관리자 화면에서 나갈까요? 저장하지 않은 내용은 사라집니다.")) return;
            clearAdminLineups(); clearAdminSmokes(); clearDemoSmokes();
            endDemoSession();
            navigate("/admin");
          }}
          className="text-14 text-sub hover:text-main"
        >
          {mode === "real" ? "로그아웃" : "체험 종료"}
        </button>
      </div>

      <p role="note" className="rounded-lg border border-line border-l-2 border-l-caution bg-surface px-4 py-3 text-14 text-sub">
        <b className="mr-2 font-semibold text-caution">{mode === "real" ? "DB 자료 관리" : "화면 체험 중"}</b>
        {mode === "real"
          ? "저장·수정·삭제는 연결된 DB에 반영됩니다. 활성 스모크는 공개 지도에 표시됩니다. 공개 라인업은 아직 예시 화면입니다."
          : "입력한 내용은 이 탭에서만 유지되고 새로고침하면 초기화됩니다. 체험 스모크는 공개 지도에 표시되지 않습니다. 활성 라인업은 이 탭의 라인업 화면에서 미리 볼 수 있습니다."}
      </p>

      {reauth && (
        <div ref={reauthRef} role="dialog" aria-modal="true" aria-labelledby="admin-reauth-title" className="fixed inset-0 z-50 flex items-center justify-center bg-page/95 p-4">
          <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-card border border-line bg-surface p-6">
            <h2 id="admin-reauth-title" className="text-20 font-semibold">관리자 인증이 필요합니다</h2>
            <p className="text-14 text-sub">편집 중인 내용은 유지됩니다. 다시 인증한 뒤 저장이나 삭제를 다시 눌러 주세요.</p>
            <AdminTokenForm onAuthenticated={() => undefined} />
            <Button variant="secondary" onClick={() => {
              if (!window.confirm("저장하지 않은 내용을 버리고 나갈까요?")) return;
              clearAdminLineups(); clearAdminSmokes(); clearDemoSmokes(); endDemoSession(); navigate("/admin");
            }}>로그인 화면으로</Button>
          </div>
        </div>
      )}
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
              <span className="text-13 text-sub">{kind === "smoke" ? (mode === "real" ? realSmokes.entries.length : demoSmokes.length) : entries.filter((entry) => entry.kind === kind).length}</span>
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
