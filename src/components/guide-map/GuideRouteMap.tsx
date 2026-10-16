import { minimapView, type MinimapSide } from "@/data/minimap-layout";
import type { ReactNode } from "react";
import { MINIMAP_SIZE, pct, type RoutePoint } from "@/components/guide-map/geometry";
import { RouteBall, RouteLine } from "@/components/guide-map/RouteSvg";
import { agentIconPath, mapMiniPath } from "@/lib/assets";
import type { Point } from "@/mocks/lineups";

/** Figma 222:6654 minimap crop: 512 미니맵을 320×260 창으로 잘라 보여준다 */
const VIEW_W = 320;
const VIEW_H = 260;

type GuideRouteMapProps = {
  side?: MinimapSide;
  mapId: string;
  mapName: string;
  agentId: string;
  landing: Point;
  throwFrom: Point;
  path?: RoutePoint[];
  /** 착지 지점 마커(라인업 스킬 마커 · 스모크 마커) */
  marker: ReactNode;
};

/** 창의 왼쪽 위 좌표: 경로 전체의 가운데를 창 가운데에 두되 지도 밖으로 나가지 않게 한다 */
function viewOrigin(points: Point[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));
  return {
    x: clamp((Math.min(...xs) + Math.max(...xs)) / 2 - VIEW_W / 2, MINIMAP_SIZE - VIEW_W),
    y: clamp((Math.min(...ys) + Math.max(...ys)) / 2 - VIEW_H / 2, MINIMAP_SIZE - VIEW_H),
  };
}

/**
 * 상세 페이지의 '던지는 위치 → 착지 지점' 지도 (Figma 222:6651, TASK-FE-059).
 * 공략 하나의 경로만 그리고, 경로를 따라 공이 계속 날아간다. 지도 폭이 바뀌어도 같은 범위를 보여준다.
 */
export function GuideRouteMap({ mapId, mapName, agentId, landing, throwFrom, path = [], marker, side = "attack" }: GuideRouteMapProps) {
  const view = minimapView(mapId, side);
  const at = view.at;
  const shownStart = view.project(throwFrom);
  // 던지는 위치 아래 라벨(약 40px)까지 창 안에 들어오게 한다
  const origin = viewOrigin([shownStart, { x: shownStart.x, y: shownStart.y + 44 }, ...path.map((point) => view.project(point)), view.project(landing)]);
  // 512 지도를 창 크기에 맞춰 키우고, 창 왼쪽 위가 origin이 되도록 민다
  const mapStyle = {
    width: `${(MINIMAP_SIZE / VIEW_W) * 100}%`,
    height: `${(MINIMAP_SIZE / VIEW_H) * 100}%`,
    left: `${(-origin.x / VIEW_W) * 100}%`,
    top: `${(-origin.y / VIEW_H) * 100}%`,
  };
  const labelLeft = shownStart.x > 440;

  return (
    <div className="relative aspect-[320/260] w-full overflow-hidden rounded-thumb bg-page">
      <div {...view.attributes} className="absolute" style={mapStyle}>

        <img style={view.imageStyle} src={mapMiniPath(mapId)} alt={`${mapName} 미니맵`} className="size-full object-contain" draggable={false} />
        <svg style={view.imageStyle} aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 size-full">
          <RouteLine from={throwFrom} path={path} to={landing} />
        </svg>
        <span className="absolute z-10 flex -translate-1/2 items-center justify-center" style={at(landing)}>
          {marker}
        </span>
        <span aria-hidden className="absolute z-10 flex -translate-1/2 rounded-full bg-win p-0.5" style={at(throwFrom)}>
          <img src={agentIconPath(agentId)} alt="" className="size-10 rounded-full bg-elevated object-cover" />
        </span>
        <span
          className="absolute z-10 rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap text-main"
          style={{ left: pct(shownStart.x), top: pct(shownStart.y + 28), transform: labelLeft ? "translateX(-85%)" : "translateX(-50%)" }}
        >
          던지는 위치
        </span>
        <svg style={view.imageStyle} aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 z-20 size-full">
          <RouteBall from={throwFrom} path={path} to={landing} testId="throw-dot" />
        </svg>
      </div>
    </div>
  );
}
