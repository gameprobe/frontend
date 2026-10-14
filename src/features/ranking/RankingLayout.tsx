import type { ReactNode } from "react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { useSettings } from "@/features/my/my-store";
import { cx } from "@/lib/cx";
import { hasRankingData, RANKING_ACTS, RANKING_REGIONS } from "@/mocks/ranking";

const findRegion = (value: string | null) => RANKING_REGIONS.find((option) => option.value === value)?.value;
const parseAct = (value: string | null) => RANKING_ACTS.find((option) => option.value === value)?.value ?? "v26a5";

const TABS = [
  { label: "공식 리더보드", path: "" },
  { label: "업적 랭킹", path: "/achievements" },
] as const;

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <p className="flex h-[30px] shrink-0 items-center text-14 font-medium text-sub">{label}</p>
      {children}
    </div>
  );
}

/** 04 랭킹 공통 틀: 제목 + 지역·액트 필터 + 탭 (Figma 96:361). */
export function RankingLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  // 마이페이지 설정의 '기본 서버 지역'을 쿼리가 없을 때의 기본값으로 쓴다.
  const [settings] = useSettings();
  const defaultRegion = settings.region;
  const region = findRegion(searchParams.get("region")) ?? defaultRegion;
  const act = parseAct(searchParams.get("act"));

  const regionLabel = RANKING_REGIONS.find((option) => option.value === region)?.label;
  const actLabel = RANKING_ACTS.find((option) => option.value === act)?.label;

  // 탭을 오가도 지역·액트는 유지한다. 업적 종류(?type=)는 업적 탭 안에서만 쓴다.
  const filterQuery = new URLSearchParams();
  if (region !== defaultRegion) filterQuery.set("region", region);
  if (act !== "v26a5") filterQuery.set("act", act);
  const search = filterQuery.size ? `?${filterQuery}` : "";

  const changeFilter = (key: "region" | "act", next: string, fallback: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === fallback) params.delete(key);
    else params.set(key, next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="container-page flex flex-col gap-4 pt-8 pb-20 md:pt-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-16 font-medium text-sub">랭킹</p>
          <h1 className="text-24 font-semibold md:text-28 xl:text-32">
            {regionLabel} · {actLabel}
          </h1>
        </div>
        <Card as="section" aria-label="랭킹 필터" className="flex flex-col gap-3 px-5 py-5 md:px-6">
          <FilterRow label="지역">
            <FilterChipGroup
              label="지역"
              options={RANKING_REGIONS}
              value={region}
              onChange={(next) => changeFilter("region", next, defaultRegion)}
            />
          </FilterRow>
          <FilterRow label="액트">
            <FilterChipGroup
              label="액트"
              options={RANKING_ACTS}
              value={act}
              onChange={(next) => changeFilter("act", next, "v26a5")}
            />
          </FilterRow>
        </Card>
        <nav aria-label="랭킹 메뉴" className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
          {TABS.map((tab) => (
            <NavLink
              key={tab.label}
              to={`/ranking${tab.path}${search}`}
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
      </div>

      {hasRankingData(region, act) ? (
        <Outlet />
      ) : (
        <Card as="section" role="status" className="flex flex-col gap-1 p-6 md:p-8">
          <h2 className="text-18 font-semibold">이 지역·액트의 랭킹 예시 데이터가 없어요</h2>
          <p className="text-14 text-sub">백엔드를 연결하기 전까지는 ‘한국 · V26 액트 5’만 볼 수 있어요.</p>
        </Card>
      )}
    </div>
  );
}
