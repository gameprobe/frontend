import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { agentIconPath } from "@/lib/assets";
import { formatNumber } from "@/lib/format";
import { META_MAPS, metaAgentName, TEAM_COMPS } from "@/mocks/meta";

const MAP_OPTIONS = META_MAPS.map((map) => ({ value: map.mapId, label: map.name }));
const GRID =
  "grid grid-cols-[48px_minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4";

/** 승률 막대는 40~60% 구간을 0~100%로 그린다 (시안 57.8% ≈ 87%, 50.8% ≈ 53%). */
const winRateBar = (rate: number) => Math.min(Math.max((rate - 40) / 20, 0), 1) * 100;

/** 16 메타 - 팀 조합 (Figma 56:729). 맵은 ?map= 으로 고른다. */
export function CompsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapId = MAP_OPTIONS.find((option) => option.value === searchParams.get("map"))?.value ?? "ascent";
  const mapName = MAP_OPTIONS.find((option) => option.value === mapId)?.label;

  const changeMap = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === "ascent") params.delete("map");
    else params.set("map", next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <FilterChipGroup label="맵" options={MAP_OPTIONS} value={mapId} onChange={changeMap} size="xl" />
      <Card className="overflow-x-auto px-5 py-2 md:px-6">
        <div role="table" aria-label={`${mapName} 팀 조합`} className="min-w-[720px]">
          <div role="row" className={`${GRID} border-b border-line py-3 text-15 font-semibold text-sub`}>
            {["#", "조합", "승률", "픽률", "경기 수"].map((column) => (
              <span key={column} role="columnheader">
                {column}
              </span>
            ))}
          </div>
          {TEAM_COMPS[mapId].map((comp, index) => (
            <div key={comp.agentIds.join()} role="row" className={`${GRID} border-b border-line-light py-4 text-15`}>
              <span role="cell" lang="en" className="font-semibold text-sub-weak">
                {index + 1}
              </span>
              <span role="cell" className="flex h-[61px] gap-2">
                {comp.agentIds.map((agentId) => (
                  <span key={agentId} className="flex w-[52px] flex-col items-center gap-1">
                    <img src={agentIconPath(agentId)} alt="" className="size-11 rounded-lg object-cover" />
                    <span className="text-11 whitespace-nowrap text-sub">{metaAgentName(agentId)}</span>
                  </span>
                ))}
              </span>
              <span role="cell" className="flex items-center gap-3">
                <span lang="en" className="font-semibold">
                  {comp.winRate.toFixed(1)}%
                </span>
                <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                  <span className="block h-full bg-main" style={{ width: `${winRateBar(comp.winRate)}%` }} />
                </span>
              </span>
              <span role="cell" lang="en">
                {comp.pickRate.toFixed(1)}%
              </span>
              <span role="cell" className="text-sub">
                {formatNumber(comp.games)}경기
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
