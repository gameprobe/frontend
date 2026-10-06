import type {
  Lineup,
  LineupDetailModel,
  LineupAdminPayload,
  AdminLineupStatus,
  LineupDifficulty,
  LineupPoint,
  LineupSide,
  AbilitySlot,
  LineupRegistration,
} from "../types/lineup";
import { isValidPoint } from "../features/lineup-explorer/model";

interface BackendLineupResponse {
  id: string;
  title: string;
  description: string;
  mapId: string;
  side: "ATTACK" | "DEFENSE";
  agentId: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skillMarkers: Array<{
    abilityId: string;
    position: LineupPoint;
    youtubeUrl?: string;
    order?: number;
  }>;
  agentMarkers: Array<{ position: LineupPoint; label?: string }>;
  pathPoints: LineupPoint[];
  registration?: LineupRegistration | null;
  status: string;
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
}

const MAP_NAMES: Record<string, string> = {
  ascent: "어센트",
  haven: "헤이븐",
  split: "스플릿",
};

const AGENT_NAMES: Record<string, string> = {
  jett: "제트",
  omen: "오멘",
  sova: "소바",
};

const ABILITY_NAMES: Record<string, string> = {
  "sova-shock-bolt": "Shock Bolt",
  "sova-recon-bolt": "Recon Bolt",
  "sova-owl-drone": "Owl Drone",
  "jett-cloudburst": "Cloudburst",
  "omen-dark-cover": "Dark Cover",
};

const ABILITY_SLOTS: Record<string, AbilitySlot> = {
  "sova-shock-bolt": "Q",
  "sova-recon-bolt": "E",
  "sova-owl-drone": "C",
  "sova-hunter-fury": "X",
  "jett-cloudburst": "C",
  "jett-updraft": "Q",
  "jett-tailwind": "E",
  "jett-blade-storm": "X",
  "omen-dark-cover": "E",
  "omen-shrouded-step": "C",
  "omen-paranoia": "Q",
  "omen-from-the-shadows": "X",
  "cypher-trapwire": "C",
  "cypher-cyber-cage": "Q",
  "cypher-spycam": "E",
  "cypher-neural-theft": "X",
  "killjoy-nanoswarm": "C",
  "killjoy-alarmbot": "Q",
  "killjoy-turret": "E",
  "killjoy-lockdown": "X",
  "viper-snake-bite": "C",
  "viper-poison-cloud": "Q",
  "viper-toxic-screen": "E",
  "viper-vipers-pit": "X",
};

function toSide(side: "ATTACK" | "DEFENSE" | LineupSide): LineupSide {
  return side.toLowerCase() as LineupSide;
}

function toDifficulty(
  difficulty: "EASY" | "MEDIUM" | "HARD" | LineupDifficulty,
): LineupDifficulty {
  return difficulty.toLowerCase() as LineupDifficulty;
}

function abilityLabel(abilityId: string): string {
  return ABILITY_NAMES[abilityId] ?? abilityId.replace(/[-_]/g, " ");
}

export function normalizeBackendCard(lineup: BackendLineupResponse): Lineup {
  const firstSkill = lineup.skillMarkers[0];
  const abilityId = firstSkill?.abilityId ?? "unknown";
  const registration = lineup.registration;
  return {
    id: lineup.id,
    title: lineup.title,
    description: lineup.description,
    mapId: lineup.mapId,
    mapName: MAP_NAMES[lineup.mapId] ?? lineup.mapId,
    agentId: lineup.agentId,
    agentName: AGENT_NAMES[lineup.agentId] ?? lineup.agentId,
    ability: {
      abilityId,
      slot: registration?.abilitySlot ?? ABILITY_SLOTS[abilityId] ?? "C",
      displayName: abilityLabel(abilityId),
    },
    side: toSide(lineup.side),
    difficulty: toDifficulty(lineup.difficulty),
    media: registration?.media.type === "IMAGE"
      ? { imageUrls: [registration.media.url] }
      : { youtubeUrl: registration?.media.url ?? firstSkill?.youtubeUrl },
    author: { name: lineup.authorId },
    tags: [],
    createdAt: lineup.createdAt ?? "",
    registration,
    // A legacy multi-marker record has no defined origin/target pairing.
    mapPreview: lineup.agentMarkers.length > 1 || lineup.skillMarkers.length > 1 ? undefined : {
      destinationId: registration?.destination.id,
      destinationName: registration?.destination.name,
      agentPosition: lineup.agentMarkers[0]?.position,
      skillPosition: registration?.destination.point ?? firstSkill?.position,
      pathPoints: lineup.pathPoints,
    },
  };
}

export function normalizeBackendLineup(lineup: BackendLineupResponse): LineupDetailModel {
  const firstSkill = lineup.skillMarkers[0];
  return {
    id: lineup.id,
    title: lineup.title,
    description: lineup.description,
    mapId: lineup.mapId,
    mapName: MAP_NAMES[lineup.mapId] ?? lineup.mapId,
    side: toSide(lineup.side),
    agentId: lineup.agentId,
    agentName: AGENT_NAMES[lineup.agentId] ?? lineup.agentId,
    difficulty: toDifficulty(lineup.difficulty),
    skillMarkers: lineup.skillMarkers,
    agentMarkers: lineup.agentMarkers,
    pathPoints: lineup.pathPoints,
    registration: lineup.registration,
    youtubeUrl: lineup.registration?.media.type === "IMAGE"
      ? undefined : lineup.registration?.media.url ?? firstSkill?.youtubeUrl,
    status: lineup.status,
    authorName: lineup.authorId,
    createdAt: lineup.createdAt,
    updatedAt: lineup.updatedAt,
  };
}

export function normalizeMockLineup(lineup: Lineup): LineupDetailModel {
  const preview = lineup.mapPreview;
  const youtubeUrl = lineup.media.youtubeUrl && !/[?&]v=demo-/.test(lineup.media.youtubeUrl)
    ? lineup.media.youtubeUrl : undefined;
  return {
    id: lineup.id,
    title: lineup.title,
    description: lineup.description,
    mapId: lineup.mapId,
    mapName: lineup.mapName,
    side: lineup.side,
    agentId: lineup.agentId,
    agentName: lineup.agentName,
    difficulty: lineup.difficulty,
    skillMarkers: isValidPoint(preview?.skillPosition)
      ? [{ abilityId: lineup.ability.abilityId, position: { ...preview!.skillPosition! }, youtubeUrl }] : [],
    agentMarkers: isValidPoint(preview?.agentPosition) ? [{ position: { ...preview!.agentPosition! } }] : [],
    pathPoints: Array.isArray(preview?.pathPoints)
      ? preview.pathPoints.map(point => ({ ...point })) : [],
    registration: lineup.registration,
    youtubeUrl,
    authorName: lineup.author.name,
    isExample: lineup.isExample,
  };
}

export function getAbilityLabel(abilityId: string): string {
  return abilityLabel(abilityId);
}

export function getMapName(mapId: string): string {
  return MAP_NAMES[mapId] ?? mapId;
}

/** HTTP status is retained so screens can recover authentication without parsing text. */
export class LineupApiError extends Error {
  constructor(public readonly status: number | null, message: string) {
    super(message);
    this.name = "LineupApiError";
  }
}

export function getLineupApiErrorMessage(error: unknown): string {
  return error instanceof LineupApiError
    ? error.message : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}

function statusMessage(status: number): string {
  if (status === 400) return "입력 내용을 확인해 주세요. 필수값, 좌표 또는 자료 주소가 올바르지 않습니다.";
  if (status === 401 || status === 403) return "관리자 토큰을 확인하고 다시 로그인해 주세요.";
  if (status === 404) return "자료가 없거나 더 이상 공개되어 있지 않습니다.";
  if (status === 409) return "등록 정보와 수정 내용이 일치하지 않습니다. 자료를 다시 불러온 뒤 저장해 주세요.";
  if (status >= 500) return "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  return `라인업 요청을 처리하지 못했습니다. (${status})`;
}

function getApiBase(publicApi: boolean): string {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  // 공개 데모에서는 방문자의 localhost에 접속하지 않고 기존 예시/오류 안내를 사용한다.
  if (publicApi && !configured) {
    throw new LineupApiError(null, "공개 라인업 API 주소가 설정되지 않았습니다.");
  }
  return (configured || "http://localhost:8080").replace(/\/+$/, "");
}

async function requestLineupApi(path: string, options: RequestInit = {}, publicApi = false): Promise<Response> {
  const apiBase = getApiBase(publicApi);
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...options, cache: "no-store" });
  } catch {
    throw new LineupApiError(null, "서버에 연결하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
  }
  if (!response.ok) throw new LineupApiError(response.status, statusMessage(response.status));
  return response;
}

async function readResponse<T>(response: Response): Promise<T> {
  try {
    return await response.json() as T;
  } catch {
    throw new LineupApiError(response.status, "서버 응답을 읽지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

function adminHeaders(adminToken: string): Record<string, string> {
  return { Accept: "application/json", "X-Admin-Token": adminToken };
}

/** PUT replaces the path: reject a missing array instead of accidentally clearing it. */
function serializePayload(payload: LineupAdminPayload): string {
  if (!Array.isArray(payload.pathPoints)) {
    throw new LineupApiError(null, "중간 경로 정보가 없습니다. 자료를 다시 불러온 뒤 저장해 주세요.");
  }
  const registration = payload.registration;
  return JSON.stringify({
    title: payload.title,
    description: payload.description,
    mapId: payload.mapId,
    side: payload.side.toUpperCase(),
    agentId: payload.agentId,
    difficulty: payload.difficulty.toUpperCase(),
    skillMarkers: payload.skillMarkers.map(marker => ({
      abilityId: marker.abilityId,
      position: { x: marker.position.x, y: marker.position.y },
      youtubeUrl: marker.youtubeUrl,
      order: marker.order,
    })),
    agentMarkers: payload.agentMarkers.map(marker => ({
      position: { x: marker.position.x, y: marker.position.y },
      label: marker.label,
    })),
    pathPoints: payload.pathPoints.map(point => ({ x: point.x, y: point.y })),
    status: payload.status.toUpperCase(),
    registration: registration ? {
      destination: {
        id: registration.destination.id,
        name: registration.destination.name,
        point: { x: registration.destination.point.x, y: registration.destination.point.y },
      },
      media: { type: registration.media.type, url: registration.media.url },
      site: registration.site,
      abilitySlot: registration.abilitySlot,
    } : registration,
  });
}

export async function fetchLineup(id: string): Promise<LineupDetailModel> {
  const response = await requestLineupApi(`/api/lineups/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  }, true);
  return normalizeBackendLineup(await readResponse<BackendLineupResponse>(response));
}

export async function fetchPublicLineups(): Promise<Lineup[]> {
  const response = await requestLineupApi("/api/lineups", {
    headers: { Accept: "application/json" },
  }, true);
  return (await readResponse<BackendLineupResponse[]>(response)).map(normalizeBackendCard);
}

export async function validateAdminToken(token: string): Promise<{ role: string; adminId: string }> {
  const response = await requestLineupApi("/api/admin/session", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ token }),
  });
  return readResponse<{ role: string; adminId: string }>(response);
}

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem("lineup-admin-token");
}

export async function fetchAdminLineups(adminToken: string): Promise<LineupDetailModel[]> {
  const response = await requestLineupApi("/api/admin/lineups", { headers: adminHeaders(adminToken) });
  return (await readResponse<BackendLineupResponse[]>(response)).map(normalizeBackendLineup);
}

export async function fetchAdminLineup(id: string, adminToken: string): Promise<LineupDetailModel> {
  const response = await requestLineupApi(`/api/admin/lineups/${encodeURIComponent(id)}`, {
    headers: adminHeaders(adminToken),
  });
  return normalizeBackendLineup(await readResponse<BackendLineupResponse>(response));
}

export async function updateLineupStatus(
  id: string,
  status: AdminLineupStatus,
  adminToken: string,
): Promise<LineupDetailModel> {
  const response = await requestLineupApi(`/api/admin/lineups/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { ...adminHeaders(adminToken), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return normalizeBackendLineup(await readResponse<BackendLineupResponse>(response));
}

export async function createLineup(payload: LineupAdminPayload, adminToken: string): Promise<LineupDetailModel> {
  const response = await requestLineupApi("/api/admin/lineups", {
    method: "POST",
    headers: { ...adminHeaders(adminToken), "Content-Type": "application/json", "X-Admin-Id": "admin-preview" },
    body: serializePayload(payload),
  });
  return normalizeBackendLineup(await readResponse<BackendLineupResponse>(response));
}

export async function updateLineup(
  id: string,
  payload: LineupAdminPayload,
  adminToken: string,
): Promise<LineupDetailModel> {
  const response = await requestLineupApi(`/api/admin/lineups/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { ...adminHeaders(adminToken), "Content-Type": "application/json", "X-Admin-Id": "admin-preview" },
    body: serializePayload(payload),
  });
  return normalizeBackendLineup(await readResponse<BackendLineupResponse>(response));
}

export async function deleteLineup(id: string, adminToken: string): Promise<void> {
  await requestLineupApi(`/api/admin/lineups/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: adminHeaders(adminToken),
  });
}
