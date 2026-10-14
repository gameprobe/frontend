import { Link, Navigate, useSearchParams } from "react-router-dom";
import { LineupHeading, LineupSteps } from "@/features/lineups/LineupSteps";
import { mapImagePath } from "@/lib/assets";
import { findLineupMap, LINEUP_MAPS } from "@/mocks/lineups";
import { smokeCount } from "@/mocks/smokes";

const SMOKE_STEPS = ["맵 선택", "스모크 보기"];

/** 09 스모크 - 맵 선택 (TASK-FE-057). 시안이 없어 라인업 맵 선택(Figma 72:3)과 같은 모양이다. */
export function SmokeMapSelectPage() {
  const [params] = useSearchParams();
  // 예전 주소 /smokes?map=bind&side=… 는 /smokes/bind?side=… 로 옮긴다
  const legacyMap = findLineupMap(params.get("map") ?? undefined);
  if (legacyMap) {
    const rest = new URLSearchParams(params);
    rest.delete("map");
    const query = rest.toString();
    return <Navigate to={`/smokes/${legacyMap.mapId}${query ? `?${query}` : ""}`} replace />;
  }

  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-20">
      <LineupSteps current={1} steps={SMOKE_STEPS} label="스모크 단계" />
      <LineupHeading
        label="스모크"
        title="어떤 맵의 스모크를 볼까요?"
        description="맵을 고르면 연막을 어디에 설치하면 좋은지 미니맵 위에서 바로 확인할 수 있어요."
      />
      <ul aria-label="맵 목록" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
        {LINEUP_MAPS.map((map) => (
          <li key={map.mapId}>
            <Link
              to={`/smokes/${map.mapId}`}
              className="flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-line-strong"
            >
              <img src={mapImagePath(map.mapId)} alt="" loading="lazy" className="h-[126px] w-full object-cover" />
              <span className="flex flex-wrap items-center justify-between gap-x-2 px-4 pt-3 pb-4">
                <span className="text-16 font-semibold">{map.name}</span>
                <span className="text-13 text-sub">스모크 {smokeCount(map.mapId)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
