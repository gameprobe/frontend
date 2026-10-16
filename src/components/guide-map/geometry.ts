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

/** 원본 좌표를 표시용으로만 회전한다. size=1은 API 좌표, size=0은 이동 벡터다. */
export function rotatePoint(point: Point, degrees: number, size = MINIMAP_SIZE): Point {
  switch (((degrees % 360) + 360) % 360) {
    case 90: return { x: size - point.y, y: point.x };
    case 180: return { x: size - point.x, y: size - point.y };
    case 270: return { x: point.y, y: size - point.x };
    default: return { ...point };
  }
}
