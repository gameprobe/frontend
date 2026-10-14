import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import tierGemIcon from "@/assets/icons/tier-gem.svg";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { cx } from "@/lib/cx";
import { hasMetaData, META_ACTS, META_TIERS, type MetaAct, type MetaTier } from "@/mocks/meta";

const TABS = [
  { label: "요원 티어리스트", path: "" },
  { label: "팀 조합 통계", path: "/comps" },
  { label: "맵별 승률", path: "/maps" },
  { label: "무기 통계", path: "/weapons" },
] as const;

const parseAct = (value: string | null): MetaAct => META_ACTS.find((option) => option.value === value)?.value ?? "v26a5";
const parseTier = (value: string | null): MetaTier =>
  META_TIERS.find((option) => option.value === value)?.value ?? "diamond";

/** 05 메타 통계 공통 틀: 제목 + 탭 + 액트·티어 필터 (Figma 96:372). */
export function MetaLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const act = parseAct(searchParams.get("act"));
  const tier = parseTier(searchParams.get("tier"));
  const actLabel = META_ACTS.find((option) => option.value === act)?.label;
  const tierLabel = META_TIERS.find((option) => option.value === tier)?.label;

  // 탭을 오가도 액트·티어는 유지한다. 탭 안의 필터(역할군·정렬·맵)는 그 탭에서만 쓴다.
  const filterQuery = new URLSearchParams();
  if (act !== "v26a5") filterQuery.set("act", act);
  if (tier !== "diamond") filterQuery.set("tier", tier);
  const search = filterQuery.size ? `?${filterQuery}` : "";

  const changeFilter = (key: "act" | "tier", next: string, fallback: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === fallback) params.delete(key);
    else params.set(key, next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="container-page flex flex-col gap-4 pt-8 pb-20 md:pt-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-16 font-medium text-sub">
            메타 통계 · {actLabel} · {tierLabel}
          </p>
          <h1 className="text-24 font-semibold md:text-28 xl:text-32">지금 이기는 요원과 조합</h1>
        </div>
        <div className="flex flex-col-reverse gap-3 border-line lg:flex-row lg:items-end lg:justify-between lg:border-b">
          <nav
            aria-label="메타 통계 메뉴"
            className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none] lg:border-b-0"
          >
            {TABS.map((tab) => (
              <NavLink
                key={tab.label}
                to={`/meta${tab.path}${search}`}
                end
                className={({ isActive }) =>
                  cx(
                    "-mb-px flex h-11 shrink-0 items-center border-b-2 px-3 text-15 font-semibold whitespace-nowrap md:px-4 md:text-16",
                    isActive ? "border-primary text-main" : "border-transparent text-sub hover:text-main",
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex gap-2 lg:pb-1.5">
            <Dropdown label="액트" options={META_ACTS} value={act} onChange={(next) => changeFilter("act", next, "v26a5")} />
            <Dropdown
              label="티어"
              options={META_TIERS}
              value={tier}
              onChange={(next) => changeFilter("tier", next, "diamond")}
              icon={tier === "diamond" ? tierGemIcon : undefined}
            />
          </div>
        </div>
      </div>

      {hasMetaData(act, tier) ? (
        <Outlet />
      ) : (
        <Card as="section" role="status" className="flex flex-col gap-1 p-6 md:p-8">
          <h2 className="text-18 font-semibold">이 액트·티어의 통계 예시 데이터가 없어요</h2>
          <p className="text-14 text-sub">백엔드를 연결하기 전까지는 ‘V26 액트 5 · 다이아몬드 이상’만 볼 수 있어요.</p>
        </Card>
      )}
    </div>
  );
}
