/** 라인업·스모크 상세 페이지 주소와, 상세에서 보드로 돌아가는 주소 (TASK-FE-059) */
export const lineupDetailPath = (mapId: string, agentId: string, lineupId: string) =>
  `/lineups/${mapId}/${agentId}/${encodeURIComponent(lineupId)}`;

export const smokeDetailPath = (mapId: string, smokeId: string) => `/smokes/${mapId}/${encodeURIComponent(smokeId)}`;

/**
 * 보드로 돌아가는 주소. 보드에서 넘어왔으면 그때의 쿼리(진영·필터)를 살리고,
 * 바로 들어왔으면 공략의 진영만 맞춘다. 어느 쪽이든 그 공략을 고른 상태로 연다.
 */
export function boardPath(base: string, selectKey: string, selectId: string, from: string | undefined, defaults: Record<string, string>) {
  const params = new URLSearchParams(from ?? "");
  if (from === undefined) for (const [key, value] of Object.entries(defaults)) params.set(key, value);
  params.set(selectKey, selectId);
  return `${base}?${params.toString()}`;
}
