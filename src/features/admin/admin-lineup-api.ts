import type { GuideEntry, LineupImage, LineupImages, LineupImageSlot } from "./model";

export type { LineupImage, LineupImages, LineupImageSlot } from "./model";
export const MAX_LINEUP_IMAGE_BYTES = 10_000_000;
export const LINEUP_IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// 화면은 512px 미니맵, API는 0~1 좌표를 사용한다. 변환할 때 반올림하지 않는다.
const MAP_SIZE = 512;
type Point = { x: number; y: number };
export type LineupPayload = {
  title: string;
  mapId: string;
  agentId: string;
  abilitySlot: GuideEntry["abilitySlot"];
  side: GuideEntry["side"];
  destination: { id: string; name: string; point: Point };
  start: Point;
  path: Point[];
  videoUrl: string;
  notes: string;
  status: GuideEntry["status"];
};
export type LineupRecord = LineupPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
  images?: LineupImages;
};
type ListResponse = { items: LineupRecord[]; total: number; limit: number; offset: number; unsupportedCount: number };
export type UploadUsage = { usedBytes: number; reservedBytes: number; limitBytes: number };

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
    abilitySlot: entry.abilitySlot, side: entry.side,
    destination: { id: entry.destination.id, name: entry.destination.name.trim(), point: normalize(entry.destination.point) },
    start: normalize(entry.start), path: entry.path.map(normalize),
    videoUrl: entry.videoUrl.trim(), notes: entry.notes, status: entry.status,
  };
}

export function fromLineupRecord(record: LineupRecord): GuideEntry {
  const display = (point: Point): Point => ({ x: point.x * MAP_SIZE, y: point.y * MAP_SIZE });
  return {
    id: record.id, kind: "lineup", shape: "circle", title: record.title,
    mapId: record.mapId, agentId: record.agentId, side: record.side,
    abilitySlot: record.abilitySlot, status: record.status,
    videoUrl: record.videoUrl, notes: record.notes,
    images: {
      position: record.images?.position ? { ...record.images.position } : null,
      aim: record.images?.aim ? { ...record.images.aim } : null,
    },
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

/** 서버도 실제 수신 크기와 파일 형식을 다시 검사한다. 여기서는 잘못 고른 파일을 즉시 안내한다. */
export function lineupImageFileError(file: Pick<Blob, "size" | "type">): string {
  if (!LINEUP_IMAGE_CONTENT_TYPES.some((type) => type === file.type)) return "JPG, PNG, WebP 이미지를 선택해 주세요.";
  if (file.size === 0) return "빈 이미지 파일은 등록할 수 없습니다.";
  if (file.size > MAX_LINEUP_IMAGE_BYTES) return "이미지 한 장은 10MB(10,000,000바이트) 이하여야 합니다.";
  return "";
}

function imagePath(id: string, slot: LineupImageSlot): string {
  if (!id) throw new Error("라인업을 먼저 저장한 뒤 이미지를 등록해 주세요.");
  if (slot !== "position" && slot !== "aim") throw new Error("이미지는 위치 또는 에임 항목에만 등록할 수 있습니다.");
  return `/api/admin/lineups/${encodeURIComponent(id)}/images/${slot}`;
}

type RequestOptions = { method?: string; body?: BodyInit; contentType?: string; signal?: AbortSignal };

/** 토큰은 설정된 백엔드의 고정 경로에 헤더로만 보낸다. 실패한 쓰기는 자동 재시도하지 않는다. */
export function createAdminLineupApi(baseUrl: string | undefined) {
  async function request(path: string, token: string, options: RequestOptions = {}): Promise<Response> {
    if (!token) throw new AdminApiError(401, "관리자 토큰을 다시 입력해 주세요.");
    const url = apiUrl(baseUrl, path);
    const method = options.method ?? "GET";
    let response: Response;
    try {
      response = await fetch(url, {
        method, mode: "cors", credentials: "omit", redirect: "error", cache: "no-store",
        headers: { "X-Admin-Token": token, ...(options.contentType ? { "Content-Type": options.contentType } : {}) },
        body: options.body,
        signal: options.signal,
      });
    } catch (error) {
      if (options.signal?.aborted) throw error;
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
    return response;
  }

  async function json<T>(path: string, token: string, method = "GET", body?: LineupPayload): Promise<T> {
    const response = await request(path, token, {
      method,
      ...(body ? { body: JSON.stringify(body), contentType: "application/json" } : {}),
    });
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  return {
    async authenticate(token: string) {
      const body = await json<{ authenticated: boolean }>("/api/admin/session", token, "POST");
      if (body.authenticated !== true) throw new Error("관리자 인증 응답을 확인할 수 없습니다.");
    },
    list: (token: string, offset = 0) => json<ListResponse>(`/api/admin/lineups?limit=100&offset=${offset}`, token),
    get: (token: string, id: string) => json<LineupRecord>(`/api/admin/lineups/${encodeURIComponent(id)}`, token),
    create: (token: string, payload: LineupPayload) => json<LineupRecord>("/api/admin/lineups", token, "POST", payload),
    update: (token: string, id: string, payload: LineupPayload) => json<LineupRecord>(`/api/admin/lineups/${encodeURIComponent(id)}`, token, "PUT", payload),
    remove: (token: string, id: string) => json<void>(`/api/admin/lineups/${encodeURIComponent(id)}`, token, "DELETE"),
    async uploadImage(token: string, id: string, slot: LineupImageSlot, file: Blob): Promise<LineupImage> {
      const error = lineupImageFileError(file);
      if (error) throw new Error(error);
      const response = await request(imagePath(id, slot), token, { method: "PUT", body: file, contentType: file.type });
      return response.json() as Promise<LineupImage>;
    },
    async getImage(token: string, id: string, slot: LineupImageSlot, signal?: AbortSignal): Promise<Blob> {
      const response = await request(imagePath(id, slot), token, { signal });
      return response.blob();
    },
    async removeImage(token: string, id: string, slot: LineupImageSlot): Promise<void> {
      await request(imagePath(id, slot), token, { method: "DELETE" });
    },
    usage: (token: string) => json<UploadUsage>("/api/admin/uploads/usage", token),
  };
}
