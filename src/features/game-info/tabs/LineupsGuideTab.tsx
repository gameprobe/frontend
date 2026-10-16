import { minimapView } from "@/data/minimap-layout";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { agentIconPath, mapMiniPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { guideLineups, MAP_INFOS, type Lineup } from "@/mocks/game-info";
import { metaAgentName } from "@/mocks/meta";

const MAP_OPTIONS = MAP_INFOS.map((map) => ({ value: map.mapId, label: map.name }));

function LineupBoard({ mapId, mapName, lineups }: { mapId: string; mapName: string; lineups: Lineup[] }) {
  const [selected, setSelected] = useState(0);
  const view = minimapView(mapId);

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[520px_minmax(0,1fr)]">
      <Card className="p-4 md:p-6">
        <div {...view.attributes} className="relative mx-auto aspect-square w-full max-w-[470px]">

          <img style={view.imageStyle} src={mapMiniPath(mapId)} alt={`${mapName} 미니맵`} className="size-full object-contain opacity-85" />
          {lineups.map((lineup, index) => {
            const active = index === selected;
            return (
              <button
                key={lineup.title}
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`라인업 ${index + 1} 위치`}
                aria-pressed={active}
                className={cx(
                  "absolute flex items-center justify-center rounded-full border-2 border-page p-1 text-12 font-semibold text-on-primary",
                  active ? "h-8 min-w-[18px] bg-primary" : "h-6 min-w-5 bg-main",
                )}
                style={view.at({ x: lineup.x * 5.12, y: lineup.y * 5.12 })}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </Card>
      <ol aria-label={`${mapName} 라인업`} className="flex flex-col gap-2">
        {lineups.map((lineup, index) => {
          const active = index === selected;
          return (
            <li key={lineup.title}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-pressed={active}
                className={cx(
                  "flex w-full items-center gap-4 rounded-thumb border px-4 py-4 text-left transition-colors md:px-5",
                  active ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <span
                  className={cx(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-12 font-semibold text-on-primary",
                    active ? "bg-primary" : "bg-main",
                  )}
                >
                  {index + 1}
                </span>
                <img src={agentIconPath(lineup.agentId)} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-16 font-semibold">{lineup.title}</span>
                  <span className="text-13 text-sub">
                    {metaAgentName(lineup.agentId)} · {lineup.how}
                  </span>
                </span>
                <span className="flex h-5 shrink-0 items-center rounded-md border border-line px-2 text-12 font-semibold text-sub">
                  {lineup.site}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** 23 게임 정보 - 라인업 (Figma 57:847). 맵은 ?map= 으로 고르고, 목록·미니맵 번호를 누르면 함께 선택된다. */
export function LineupsGuideTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapId = MAP_OPTIONS.find((option) => option.value === searchParams.get("map"))?.value ?? "ascent";
  const mapName = MAP_OPTIONS.find((option) => option.value === mapId)?.label ?? "";
  const lineups = guideLineups(mapId);

  return (
    <div className="flex flex-col gap-5">
      <FilterChipGroup
        label="맵"
        options={MAP_OPTIONS}
        value={mapId}
        onChange={(next) => setSearchParams(next === "ascent" ? {} : { map: next }, { replace: true })}
        size="xl"
      />
      {lineups.length > 0 ? (
        <LineupBoard key={mapId} mapId={mapId} mapName={mapName} lineups={lineups} />
      ) : (
        <Card as="section" role="status" className="flex flex-col gap-1 p-6 md:p-8">
          <h2 className="text-18 font-semibold">{mapName} 라인업 예시는 아직 없어요</h2>
          <p className="text-14 text-sub">이 맵에 등록된 예시 라인업이 없어요.</p>
        </Card>
      )}
    </div>
  );
}
