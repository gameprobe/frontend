import type { LineupRecord } from "@/features/admin/admin-lineup-api";
import type { LineupImageSlot } from "@/features/admin/model";
import type { Lineup, Point } from "@/mocks/lineups";

export type PublicLineupRecord = Omit<LineupRecord, "status">;
export type LineupFilters = { mapId?: string; agentId?: string; side?: "attack" | "defense" };
type LineupPage = { items: PublicLineupRecord[]; total: number; limit: number; offset: number };

export class PublicLineupError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "PublicLineupError";
  }
}

function apiUrl(baseUrl: string | undefined, path: string): URL {
  let origin: URL;
  try { origin = new URL(baseUrl?.trim() ?? ""); }
  catch { throw new Error("라인업 서버 연결이 설정되지 않았습니다. 잠시 후 다시 시도해 주세요."); }
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("라인업 서버 연결 설정을 확인해 주세요.");
  }
  return new URL(path, origin);
}

/** 파일 주소는 응답의 임의 URL을 따라가지 않고 공개 조회 경로로 만든다. */
export function publicLineupImageUrl(baseUrl: string | undefined, lineupId: string, slot: LineupImageSlot, imageId: string): string {
  const url = apiUrl(baseUrl, `/api/lineups/${encodeURIComponent(lineupId)}/images/${slot}`);
  url.searchParams.set("v", imageId);
  return url.href;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isPoint(value: unknown): value is Point {
  return isObject(value) && [value.x, value.y].every((coordinate) => typeof coordinate === "number" && Number.isFinite(coordinate) && coordinate >= 0 && coordinate <= 1);
}
function isRecord(value: unknown): value is PublicLineupRecord {
  if (!isObject(value)) return false;
  const strings = ["id", "title", "mapId", "agentId", "videoUrl", "createdAt", "updatedAt"];
  if (!strings.every((key) => typeof value[key] === "string" && value[key] !== "")) return false;
  if (typeof value.notes !== "string" || !["Q", "E", "C", "X"].includes(String(value.abilitySlot)) || !["attack", "defense"].includes(String(value.side))) return false;
  if (!isObject(value.destination) || typeof value.destination.id !== "string" || typeof value.destination.name !== "string" || !isPoint(value.destination.point)) return false;
  if (!isPoint(value.start) || !Array.isArray(value.path) || !value.path.every(isPoint)) return false;
  if (value.images === undefined) return true;
  if (!isObject(value.images)) return false;
  return ["position", "aim"].every((slot) => {
    const image = (value.images as Record<string, unknown>)[slot];
    return image === null || (isObject(image) && typeof image.id === "string" && typeof image.url === "string"
      && typeof image.sizeBytes === "number" && Number.isFinite(image.sizeBytes) && image.sizeBytes > 0
      && ["image/jpeg", "image/png", "image/webp"].includes(String(image.contentType)));
  });
}

/** API의 0~1 좌표를 기존 지도 렌더러의 512px 좌표로 한 번만 변환한다. */
export function toPublicLineup(record: PublicLineupRecord): Lineup {
  const display = (point: Point): Point => ({ x: point.x * 512, y: point.y * 512 });
  return {
    id: record.id, title: record.title, agentId: record.agentId,
    skillId: `${record.agentId}-${record.abilitySlot.toLowerCase()}`,
    side: record.side, landing: display(record.destination.point), throwFrom: display(record.start),
    path: record.path.map(display), destinationId: record.destination.id, destinationName: record.destination.name,
    videoUrl: record.videoUrl, description: record.notes || undefined,
    images: record.images ?? { position: null, aim: null }, addedAt: record.createdAt,
    // 이전 예시 지도 타입과 맞추되 실제 화면에서는 서버에 없는 평가 수치를 표시하지 않는다.
    charge: null, bounce: null, difficulty: "보통", votes: 0, videoLength: "", steps: [],
  };
}

/** 공개 조회에는 관리자 토큰이나 쿠키를 전송하지 않는다. */
export function createPublicLineupApi(baseUrl: string | undefined) {
  async function request(path: string, signal?: AbortSignal): Promise<unknown> {
    const url = apiUrl(baseUrl, path);
    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET", mode: "cors", credentials: "omit", redirect: "error", cache: "no-store", signal,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error("라인업을 불러오지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
    }
    if (!response.ok) {
      throw new PublicLineupError(response.status, response.status === 404
        ? "공개된 라인업을 찾을 수 없습니다. 삭제되었거나 비활성 상태일 수 있어요."
        : `라인업을 불러오지 못했습니다 (HTTP ${response.status}). 잠시 후 다시 시도해 주세요.`);
    }
    try { return await response.json(); }
    catch { throw new Error("라인업 응답 형식을 확인할 수 없습니다. 다시 시도해 주세요."); }
  }

  return {
    async listAll(filters: LineupFilters = {}, signal?: AbortSignal): Promise<PublicLineupRecord[]> {
      const items: PublicLineupRecord[] = [];
      const seen = new Set<string>();
      let offset = 0;
      while (true) {
        signal?.throwIfAborted();
        const query = new URLSearchParams({ limit: "100", offset: String(offset) });
        if (filters.mapId) query.set("mapId", filters.mapId);
        if (filters.agentId) query.set("agentId", filters.agentId);
        if (filters.side) query.set("side", filters.side);
        const body = await request(`/api/lineups?${query}`, signal);
        signal?.throwIfAborted();
        if (!isObject(body) || !Array.isArray(body.items) || !body.items.every(isRecord)
          || !Number.isInteger(body.total) || (body.total as number) < 0
          || !Number.isInteger(body.limit) || (body.limit as number) <= 0 || body.offset !== offset) {
          throw new Error("라인업 목록 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.");
        }
        const page = body as LineupPage;
        for (const item of page.items) {
          if (seen.has(item.id)) throw new Error("조회 중 라인업 목록이 변경되었습니다. 다시 불러와 주세요.");
          seen.add(item.id);
          items.push(item);
        }
        offset += page.items.length;
        if (offset >= page.total) return items;
        if (page.items.length === 0) throw new Error("라인업 목록 일부를 불러오지 못했습니다. 다시 시도해 주세요.");
      }
    },
    async get(id: string, signal?: AbortSignal): Promise<PublicLineupRecord> {
      const body = await request(`/api/lineups/${encodeURIComponent(id)}`, signal);
      if (!isRecord(body)) throw new Error("라인업 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.");
      return body;
    },
  };
}
