import type { Lineup, LineupPoint, LineupSide } from "../../types/lineup";

export interface LineupDestinationGroup {
  key: string;
  name: string;
  point: LineupPoint;
  entries: Lineup[];
}

/** 지도에 표시할 수 있는 원본 방향의 정규화 좌표만 허용한다. */
export function isValidPoint(point: unknown): point is LineupPoint {
  if (!point || typeof point !== "object") return false;
  const candidate = point as Partial<LineupPoint>;
  return typeof candidate.x === "number" && typeof candidate.y === "number"
    && Number.isFinite(candidate.x) && Number.isFinite(candidate.y)
    && candidate.x >= 0 && candidate.x <= 1 && candidate.y >= 0 && candidate.y <= 1;
}

/** API의 기존 자료는 공략별로 유지한다. 같은 좌표나 스킬이라고 도착점을 합치지 않는다. */
export function groupLineupDestinations(lineups: readonly Lineup[]): LineupDestinationGroup[] {
  const groups = new Map<string, LineupDestinationGroup>();
  for (const lineup of lineups) {
    const preview = lineup.mapPreview;
    if (!isValidPoint(preview?.skillPosition)) continue;
    const destinationId = preview?.destinationId?.trim();
    const key = JSON.stringify([
      destinationId ? "destination" : "lineup",
      lineup.mapId, lineup.side, lineup.agentId, lineup.ability.abilityId,
      destinationId || lineup.id,
    ]);
    const group = groups.get(key);
    if (group) group.entries.push(lineup);
    else groups.set(key, {
      key,
      name: preview?.destinationName?.trim() || lineup.title,
      point: { ...preview!.skillPosition! },
      entries: [lineup],
    });
  }
  return Array.from(groups.values());
}

/** 모든 자료의 pathPoints는 중간점이다. 출발·중간·도착을 같은 순서로 연결한다. */
export function buildLineupRoute(
  start: LineupPoint | undefined,
  destination: LineupPoint | undefined,
  path: readonly LineupPoint[] = [],
): LineupPoint[] {
  if (!Array.isArray(path) || !path.every(isValidPoint)) return [];
  if (!isValidPoint(start) || !isValidPoint(destination)) return [];
  return [start, ...path, destination].map(point => ({ ...point }));
}

export function getLineupRoute(lineup: Lineup): LineupPoint[] {
  const preview = lineup.mapPreview;
  return buildLineupRoute(preview?.agentPosition, preview?.skillPosition, preview?.pathPoints);
}

/** 기존 공개 라인업 지도 회전과 동일하게 원본 좌표를 공수별 화면 방향으로 바꾼다. */
export function orientLineupPoint(point: LineupPoint, side: LineupSide): LineupPoint {
  return side === "attack" ? { x: 1 - point.y, y: point.x } : { x: point.y, y: 1 - point.x };
}
