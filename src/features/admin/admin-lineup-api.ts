import type { GuideEntry } from "./model";

// 화면은 512px 미니맵, API는 0~1 좌표를 사용한다. 변환할 때 반올림하지 않는다.
const MAP_SIZE = 512;
type Point = { x: number; y: number };
export type LineupPayload = {
  title: string;
  mapId: string;
  agentId: string;
  abilitySlot: GuideEntry["abilitySlot"];
  side: GuideEntry["side"];
  site: GuideEntry["site"];
  destination: { id: string; name: string; point: Point };
  start: Point;
  path: Point[];
  videoUrl: string;
  notes: string;
  status: GuideEntry["status"];
};
export type LineupRecord = LineupPayload & { id: string; createdAt: string; updatedAt: string };
type ListResponse = { items: LineupRecord[]; total: number; limit: number; offset: number; unsupportedCount: number };

export class AdminApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export function toLineupPayload(entry: GuideEntry): LineupPayload {
  if (!entry.start || !entry.destination.point) throw new Error("출발 위치와 도착 위치를 지정해 주세요.");
  const normalize = (point: Point): Point => ({ x: point.x / MAP_SIZE, y: point.y / MAP_SIZE });
  return {
    title: entry.title.trim(), mapId: entry.mapId, agentId: entry.agentId,
    abilitySlot: entry.abilitySlot, side: entry.side, site: entry.site,
    destination: { id: entry.destination.id, name: entry.destination.name.trim(), point: normalize(entry.destination.point) },
    start: normalize(entry.start), path: entry.path.map(normalize),
    videoUrl: entry.videoUrl.trim(), notes: entry.notes, status: entry.status,
  };
}

export function fromLineupRecord(record: LineupRecord): GuideEntry {
  const display = (point: Point): Point => ({ x: point.x * MAP_SIZE, y: point.y * MAP_SIZE });
  return {
    id: record.id, kind: "lineup", shape: "circle", title: record.title,
    mapId: record.mapId, agentId: record.agentId, side: record.side, site: record.site,
    abilitySlot: record.abilitySlot, status: record.status,
    videoUrl: record.videoUrl, notes: record.notes,
    destination: { ...record.destination, point: display(record.destination.point) },
    start: display(record.start), path: record.path.map(display),
  };
}

function apiUrl(baseUrl: string | undefined, path: string): URL {
  let origin: URL;
  try { origin = new URL(baseUrl?.trim() ?? ""); }
  catch { throw new Error("VITE_BACKEND_URL에 백엔드 서버 주소를 설정해 주세요."); }
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("VITE_BACKEND_URL에는 경로와 인증정보 없는 HTTP(S) 서버 주소를 설정해 주세요.");
  }
  return new URL(path, origin);
}

/** 토큰은 헤더로만 보낸다. 실패한 쓰기 요청을 자동으로 재시도하지 않는다. */
export function createAdminLineupApi(baseUrl: string | undefined) {
  async function request<T>(path: string, token: string, method = "GET", body?: LineupPayload): Promise<T> {
    if (!token) throw new AdminApiError(401, "관리자 토큰을 다시 입력해 주세요.");
    const url = apiUrl(baseUrl, path);
    let response: Response;
    try {
      response = await fetch(url, {
        method, mode: "cors", credentials: "omit", redirect: "error", cache: "no-store",
        headers: { "X-Admin-Token": token, ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new Error(method === "GET" || path.endsWith("/session")
        ? "서버에 연결하지 못했습니다. 백엔드 실행과 연결 설정을 확인한 뒤 다시 시도해 주세요."
        : "서버 응답을 받지 못했습니다. 저장 여부를 목록에서 확인한 뒤 다시 시도해 주세요.");
    }
    if (!response.ok) {
      const error = await response.json().catch(() => null) as { detail?: unknown } | null;
      const message = typeof error?.detail === "string" ? error.detail
        : response.status === 422 ? "입력값을 확인해 주세요. 필수 항목과 좌표 범위가 맞아야 합니다."
        : `요청을 처리하지 못했습니다 (HTTP ${response.status}).`;
      throw new AdminApiError(response.status, message);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
  return {
    async authenticate(token: string) {
      const body = await request<{ authenticated: boolean }>("/api/admin/session", token, "POST");
      if (body.authenticated !== true) throw new Error("관리자 인증 응답을 확인할 수 없습니다.");
    },
    list: (token: string, offset = 0) => request<ListResponse>(`/api/admin/lineups?limit=100&offset=${offset}`, token),
    get: (token: string, id: string) => request<LineupRecord>(`/api/admin/lineups/${encodeURIComponent(id)}`, token),
    create: (token: string, payload: LineupPayload) => request<LineupRecord>("/api/admin/lineups", token, "POST", payload),
    update: (token: string, id: string, payload: LineupPayload) => request<LineupRecord>(`/api/admin/lineups/${encodeURIComponent(id)}`, token, "PUT", payload),
    remove: (token: string, id: string) => request<void>(`/api/admin/lineups/${encodeURIComponent(id)}`, token, "DELETE"),
  };
}
