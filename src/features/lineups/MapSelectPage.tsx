import { Link } from "react-router-dom";
import { LineupHeading, LineupSteps } from "@/features/lineups/LineupSteps";
import { mapImagePath } from "@/lib/assets";
import { LINEUP_MAPS } from "@/mocks/lineups";

/** 08 라인업 - 맵 선택 (Figma 72:3) */
export function MapSelectPage() {
  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-20">
      <LineupSteps current={1} />
      <LineupHeading
        label="라인업"
        title="어떤 맵의 라인업을 볼까요?"
        description="맵을 고르면 요원별 스킬 라인업을 미니맵 위에서 바로 확인할 수 있어요."
      />
      <ul aria-label="맵 목록" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
        {LINEUP_MAPS.map((map) => (
          <li key={map.mapId}>
            <Link
              to={`/lineups/${map.mapId}`}
              className="flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-line-strong"
            >
              <img src={mapImagePath(map.mapId)} alt="" loading="lazy" className="h-[126px] w-full object-cover" />
              <span className="flex flex-wrap items-center justify-between gap-x-2 px-4 pt-3 pb-4">
                <span className="text-16 font-semibold">{map.name}</span>
                <span className="text-13 text-sub">라인업 {map.total}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
