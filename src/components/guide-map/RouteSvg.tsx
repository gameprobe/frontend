import { useSyncExternalStore } from "react";
import { polylinePoints, type RoutePoint } from "@/components/guide-map/geometry";
import type { Point } from "@/mocks/lineups";

type RouteProps = { from: Point; path?: RoutePoint[]; to: Point };

/**
 * SVG(viewBox 0 0 512 512) 안에 던지는 위치 → 중간 지점 → 도착 경로를 그린다.
 * Figma 투척 경로(185:4375 throw path · bounce point, 206:5458): primary 실선 3px, 꺾인 직선(곡선 없음),
 * 중간 지점은 지름 12px 속이 빈 원. 도착지 묶음의 모든 경로를 같은 모양으로 그린다.
 */
export function RouteLine({ from, path = [], to }: RouteProps) {
  return (
    <g>
      <polyline
        points={polylinePoints([from, ...path, to])}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {path.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="4.5" fill="var(--color-page)" stroke="var(--color-primary)" strokeWidth="3" />
      ))}
    </g>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
  );
}

/** 꺾은선 전체 길이의 한가운데 점 (동작 줄이기 설정일 때 공을 둘 자리) */
function midpoint(points: Point[]): Point {
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let rest = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (const [index, length] of lengths.entries()) {
    if (rest <= length) {
      const t = length === 0 ? 0 : rest / length;
      const a = points[index];
      const b = points[index + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    rest -= length;
  }
  return points[points.length - 1];
}

/**
 * 경로를 따라 던지는 위치 → 도착으로 날아가는 공 (1.6초 반복, ease-in-out).
 * SVG 좌표로 움직여 지도 크기가 바뀌어도 경로 위에 있다. 동작 줄이기 설정이면 경로 가운데에 멈춰 둔다.
 */
export function RouteBall({ from, path = [], to, testId }: RouteProps & { testId?: string }) {
  const reduced = usePrefersReducedMotion();
  const points = [from, ...path, to];
  const ball = { r: 5, fill: "var(--color-surface)", stroke: "var(--color-primary)", strokeWidth: 2.5, "data-testid": testId };

  if (reduced) {
    const mid = midpoint(points);
    return <circle cx={mid.x} cy={mid.y} {...ball} />;
  }
  return (
    <circle cx={0} cy={0} {...ball}>
      <animateMotion
        dur="1.6s"
        repeatCount="indefinite"
        path={`M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")}`}
        calcMode="spline"
        keyPoints="0;1"
        keyTimes="0;1"
        keySplines="0.42 0 0.58 1"
      />
    </circle>
  );
}
