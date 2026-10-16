import { minimapView, type MinimapSide } from "@/data/minimap-layout";
import { useState } from "react";
import { type RoutePoint } from "@/components/guide-map/geometry";
import { RouteBall, RouteLine } from "@/components/guide-map/RouteSvg";
import { SmokeMarkerIcon } from "@/features/smokes/SmokeMinimap";
import { agentIconPath, mapMiniPath, skillIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { type Point } from "@/mocks/lineups";

/** 지도에 그릴 공략 한 건. 관리자 미리보기와 공개 화면(FE-056)이 같이 쓴다. */
export type MapGuide = {
  id: string;
  kind: "lineup" | "smoke";
  title: string;
  agentId: string;
  /** 라인업 도착 마커에 쓸 스킬 아이콘 ID (`{요원}-{q|e|c|x}`) */
  skillId?: string;
  destinationId: string;
  destinationName: string;
  landing: Point;
  start: Point;
  path: RoutePoint[];
  videoUrl: string;
};

type GuideMapViewerProps = {
  side?: MinimapSide;
  mapId: string;
  mapName: string;
  guides: MapGuide[];
  /** 재생 중인 공략. 그 경로를 진하게 그린다. */
  playingId?: string;
  onPlay: (guide: MapGuide) => void;
};

type Group = { id: string; name: string; landing: Point; guides: MapGuide[] };

function groupGuides(guides: MapGuide[]): Group[] {
  const groups = new Map<string, Group>();
  for (const guide of guides) {
    const group = groups.get(guide.destinationId);
    if (group) group.guides.push(guide);
    else groups.set(guide.destinationId, { id: guide.destinationId, name: guide.destinationName, landing: guide.landing, guides: [guide] });
  }
  return Array.from(groups.values());
}

/**
 * 도착지 마커에 마우스를 올리거나(포커스) 누르면 그 도착지의 출발지가 모두 나오고,
 * 출발지를 누르면 onPlay로 영상을 튼다. 누른 도착지는 마우스가 지도를 벗어나도 열린 채로 둔다(터치 화면 대응).
 */
export function GuideMapViewer({ mapId, mapName, guides, playingId, onPlay, side = "attack" }: GuideMapViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const view = minimapView(mapId, side);
  const at = view.at;
  const groups = groupGuides(guides);
  const playingGroupId = guides.find((guide) => guide.id === playingId)?.destinationId ?? null;
  const openId = hoveredId ?? pinnedId ?? playingGroupId;
  const open = groups.find((group) => group.id === openId);

  return (
    <div className="flex flex-col gap-3">
      <div {...view.attributes} className="relative mx-auto aspect-square w-full max-w-[512px]" onMouseLeave={() => setHoveredId(null)}>

        <img style={view.imageStyle} src={mapMiniPath(mapId)} alt={`${mapName} 미니맵`} className="size-full object-contain" draggable={false} />
        <svg style={view.imageStyle} aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 size-full">
          {open?.guides.map((guide) => (
            <RouteLine key={`route-${guide.id}`} from={guide.start} path={guide.path} to={guide.landing} />
          ))}
        </svg>
        {groups.map((group) => {
          const active = group.id === openId;
          const first = group.guides[0];
          return (
            <button
              key={group.id}
              type="button"
              aria-label={`${group.name} 도착지 · 공략 ${group.guides.length}개`}
              aria-expanded={active}
              onMouseEnter={() => setHoveredId(group.id)}
              onFocus={() => setHoveredId(group.id)}
              onClick={() => setPinnedId((current) => (current === group.id ? null : group.id))}
              className={cx(
                "absolute flex size-9 -translate-1/2 items-center justify-center rounded-full transition-opacity",
                first.kind === "lineup" && "border-2 bg-page",
                first.kind === "lineup" && (active ? "border-primary" : "border-line-strong"),
                openId && !active && "opacity-40",
              )}
              style={{ ...at(group.landing), zIndex: active ? 10 : undefined }}
            >
              {first.kind === "smoke" ? (
                <SmokeMarkerIcon selected={active} />
              ) : (
                first.skillId && <img src={skillIconPath(first.skillId)} alt="" className="size-5" />
              )}
              {group.guides.length > 1 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-[18px] items-center justify-center rounded-full bg-primary text-11 font-bold text-on-primary">
                  {group.guides.length}
                </span>
              )}
            </button>
          );
        })}
        {open?.guides.map((guide) => {
          const playing = guide.id === playingId;
          return (
            <button
              key={`start-${guide.id}`}
              type="button"
              aria-label={`${guide.title} 영상 재생`}
              aria-pressed={playing}
              title={guide.title}
              onMouseEnter={() => setHoveredId(open.id)}
              onClick={() => onPlay(guide)}
              // Figma 206:5458: 연결된 출발지는 테두리 없는 초상, 재생 중인 출발지만 초록 테두리
              className={cx(
                "absolute z-20 flex -translate-1/2 rounded-full transition-transform hover:scale-110",
                playing && "bg-win p-0.5",
              )}
              style={at(guide.start)}
            >
              <img src={agentIconPath(guide.agentId)} alt="" className="size-9 rounded-full bg-elevated object-cover" />
            </button>
          );
        })}
        {open && (
          <span
            className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap text-main"
            style={view.labelAt(open.landing, -44)}
          >
            {open.name} · 출발지 {open.guides.length}곳
          </span>
        )}
        {open && (
          <svg style={view.imageStyle} aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 z-30 size-full">
            {open.guides.map((guide) => (
              <RouteBall key={`ball-${guide.id}`} from={guide.start} path={guide.path} to={guide.landing} />
            ))}
          </svg>
        )}
      </div>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-13 text-sub" aria-label="지도 표시">
        <li>도착지에 마우스를 올리거나 누르면 출발지가 모두 보입니다.</li>
        <li>출발지(요원 얼굴)를 누르면 영상이 재생됩니다.</li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-full border-[3px] border-primary bg-page" /> 중간 지점
        </li>
      </ul>
    </div>
  );
}
