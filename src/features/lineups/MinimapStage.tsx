import { minimapView, type MinimapSide } from "@/data/minimap-layout";
import { groupByDestination, useOpenDestination } from "@/components/guide-map/destination-groups";
import { RouteBall, RouteLine } from "@/components/guide-map/RouteSvg";
import { agentIconPath, mapMiniPath, skillIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { destinationKey, type Lineup } from "@/mocks/lineups";

/** 512px 미니맵 좌표를 %로 바꾼다. 화면 폭이 줄어도 같은 위치에 그린다. */

type MinimapStageProps = {
  mapId: string;
  side?: MinimapSide;
  mapName: string;
  agentId: string;
  lineups: Lineup[];
  selected?: Lineup;
  onSelect: (lineup: Lineup) => void;
  /** 출발지(요원 초상)를 눌렀을 때. 상세를 열고 영상을 바로 튼다 */
  onPlay: (lineup: Lineup) => void;
};

/**
 * 23 라인업 미니맵 (Figma 74:175 · 74:321). 상세를 열면 고른 마커만 강조하고, 던지는 위치 → 착지 지점을 잇는다.
 * 펼쳐진 도착지(호버·고정·고른 라인업)의 모든 경로 위로 공이 날아간다(RouteBall).
 * TASK-FE-056: 착지 지점이 같은 라인업은 마커 하나로 묶고, 마커에 마우스를 올리면 연결된 출발지·경로를 모두 켠다(Figma 206:5458).
 */
export function MinimapStage({ mapId, mapName, agentId, lineups, selected, onSelect, onPlay, side = "attack" }: MinimapStageProps) {
  const view = minimapView(mapId, side);
  const at = view.at;
  const groups = groupByDestination(lineups);
  const { openKey, hover, leave, togglePin } = useOpenDestination(selected ? destinationKey(selected) : null);
  const open = groups.find((group) => group.key === openKey);
  const dimmed = Boolean(selected || open);

  return (
    <div {...view.attributes} className="relative mx-auto aspect-square w-full max-w-[512px]" onMouseLeave={leave}>

      <img style={view.imageStyle} src={mapMiniPath(mapId)} alt={`${mapName} 미니맵`} className="size-full object-contain" />
      {(open || selected) && (
        <svg style={view.imageStyle} aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 size-full">
          {open?.guides
            .filter((lineup) => lineup.id !== selected?.id)
            .map((lineup) => (
              <RouteLine key={lineup.id} from={lineup.throwFrom} path={lineup.path} to={lineup.landing} />
            ))}
          {selected && <RouteLine from={selected.throwFrom} path={selected.path} to={selected.landing} />}
        </svg>
      )}
      {groups.map((group) => {
        const active = group.guides.some((lineup) => lineup.id === selected?.id);
        const isOpen = group.key === openKey;
        const single = group.guides.length === 1;
        const first = group.guides[0];
        return (
          <button
            key={group.key}
            type="button"
            onMouseEnter={() => hover(group.key)}
            onFocus={() => hover(group.key)}
            onBlur={leave}
            onClick={() => (single ? onSelect(first) : togglePin(group.key))}
            aria-label={single ? `${first.title} 라인업 보기` : `${group.name} 착지 지점 · 출발지 ${group.guides.length}곳 보기`}
            aria-pressed={single ? active : undefined}
            aria-expanded={single ? undefined : isOpen}
            className={cx(
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-opacity",
              active
                ? "z-10 size-11 border-main bg-primary drop-shadow-[0_0_8px_rgba(91,140,255,0.45)]"
                : "size-9 border-primary bg-surface hover:opacity-100",
              dimmed && !active && !isOpen && "opacity-35",
            )}
            style={at(group.landing)}
          >
            <img src={skillIconPath(first.skillId)} alt="" className={active ? "size-7" : "size-[22px]"} />
            {!single && (
              <span lang="en" className="absolute -top-1.5 -right-1.5 flex size-[18px] items-center justify-center rounded-full bg-main text-11 font-bold text-on-primary">
                {group.guides.length}
              </span>
            )}
          </button>
        );
      })}
      {open?.guides
        .filter((lineup) => lineup.id !== selected?.id)
        .map((lineup) => (
          <button
            key={lineup.id}
            type="button"
            onMouseEnter={() => hover(open.key)}
            onClick={() => onPlay(lineup)}
            aria-label={`${lineup.title} 던지는 위치 · 영상 보기`}
            title={lineup.title}
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-110"
            style={at(lineup.throwFrom)}
          >
            <img src={agentIconPath(agentId)} alt="" className="size-9 rounded-full bg-elevated object-cover" />
          </button>
        ))}
      {selected && (
        <>
          <button
            type="button"
            onClick={() => onPlay(selected)}
            aria-label={`${selected.title} 던지는 위치 · 영상 보기`}
            className="absolute z-20 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-main bg-surface"
            style={at(selected.throwFrom)}
          >
            <img src={agentIconPath(agentId)} alt="" className="size-10 rounded-full object-cover" />
          </button>
          <span
            className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-md border border-line bg-elevated px-2 py-1 text-12 font-semibold whitespace-nowrap"
            style={view.labelAt(selected.throwFrom, 28)}
          >
            던지는 위치
          </span>
        </>
      )}
      {open && !selected && open.guides.length > 1 && (
        <span
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap"
          style={view.labelAt(open.landing, -46)}
        >
          {open.name} · 출발지 {open.guides.length}곳
        </span>
      )}
      {open && (
        <svg style={view.imageStyle} aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 z-30 size-full">
          {open.guides.map((lineup) => (
            <RouteBall
              key={lineup.id}
              from={lineup.throwFrom}
              path={lineup.path}
              to={lineup.landing}
              testId={lineup.id === selected?.id ? "throw-dot" : undefined}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
