import type { Point } from "@/mocks/lineups";

/** 512×512 미니맵 좌표 (MinimapStage·SmokeMinimap과 같은 단위) */
export const MINIMAP_SIZE = 512;

/** 경로가 꺾이는 중간 지점. 벽에 맞고 튕기는 지점도 중간 지점으로 본다(사용자 정의 2026-10-12) */
export type RoutePoint = Point;

/** 512px 좌표를 %로 바꿔 지도 크기가 바뀌어도 같은 자리에 그린다. */
export const pct = (value: number) => `${(value / MINIMAP_SIZE) * 100}%`;
export const at = (point: Point) => ({ left: pct(point.x), top: pct(point.y) });

/** 출발 → 중간 지점 → 도착 순서의 SVG polyline points */
export const polylinePoints = (points: Point[]) => points.map((point) => `${point.x},${point.y}`).join(" ");
