import { toSmokePayload } from "./smoke-model";
import type { PublicSmoke, SmokePage, SmokePayload, SmokeRecord, SmokeSide } from "./smoke-model";

export class SmokeApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "SmokeApiError";
    this.status = status;
  }
}

/** 메시지 표시 자체는 로그인 상태를 변경하지 않는다. 세션 검사는 관리자 저장소에서 처리한다. */
export function smokeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다. 다시 시도해 주세요.";
}

function apiUrl(baseUrl: string | undefined, path: string): URL {
  let origin: URL;
  try {
    origin = new URL(baseUrl?.trim() ?? "");
  } catch {
    throw new Error("VITE_BACKEND_URL에 백엔드 서버 주소를 설정해 주세요.");
  }
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("VITE_BACKEND_URL에는 경로와 인증정보 없는 HTTP(S) 서버 주소를 설정해 주세요.");
  }
  return new URL(path, origin);
}

/** 공개 요청에는 인증정보를 보내지 않으며, 실패한 저장·삭제를 자동으로 재시도하지 않는다. */
export function createSmokeApi(baseUrl: string | undefined, fetchImpl: typeof fetch = (url, options) => fetch(url, options)) {
  async function request<T>(path: string, options: {
    token?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    payload?: SmokePayload;
    signal?: AbortSignal;
  } = {}): Promise<T> {
    const { token, method = "GET", payload, signal } = options;
    if (token !== undefined && !token) throw new SmokeApiError(401, "관리자 토큰을 다시 입력해 주세요.");
    const url = apiUrl(baseUrl, path);
    const body = payload ? JSON.stringify(toSmokePayload(payload)) : undefined;
    let response: Response;
    try {
      response = await fetchImpl(url, {
        method, mode: "cors", credentials: "omit", redirect: "error", cache: "no-store", signal,
        headers: {
          ...(token !== undefined ? { "X-Admin-Token": token } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body } : {}),
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new Error(method === "GET"
        ? "서버에 연결하지 못했습니다. 백엔드 실행과 연결 설정을 확인한 뒤 다시 시도해 주세요."
        : "서버 응답을 받지 못했습니다. 저장 여부를 목록에서 확인한 뒤 다시 시도해 주세요.");
    }
    if (!response.ok) {
      const error = await response.json().catch(() => null) as { detail?: unknown } | null;
      const message = typeof error?.detail === "string" ? error.detail
        : response.status === 422 ? "입력값을 확인해 주세요. 필수 항목과 좌표 범위가 맞아야 합니다."
        : `요청을 처리하지 못했습니다 (HTTP ${response.status}).`;
      throw new SmokeApiError(response.status, message);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  return {
    listPublic: (mapId: string, side: SmokeSide, offset = 0, signal?: AbortSignal) => {
      const query = new URLSearchParams({ mapId, side, limit: "100", offset: String(offset) });
      return request<SmokePage<PublicSmoke>>(`/api/smokes?${query}`, { signal });
    },
    getPublic: (id: string, signal?: AbortSignal) => request<PublicSmoke>(`/api/smokes/${encodeURIComponent(id)}`, { signal }),
    list: (token: string, offset = 0) => request<SmokePage<SmokeRecord>>(`/api/admin/smokes?limit=100&offset=${offset}`, { token }),
    get: (token: string, id: string) => request<SmokeRecord>(`/api/admin/smokes/${encodeURIComponent(id)}`, { token }),
    create: (token: string, payload: SmokePayload) => request<SmokeRecord>("/api/admin/smokes", { token, method: "POST", payload }),
    update: (token: string, id: string, payload: SmokePayload) => request<SmokeRecord>(`/api/admin/smokes/${encodeURIComponent(id)}`, { token, method: "PUT", payload }),
    remove: (token: string, id: string) => request<void>(`/api/admin/smokes/${encodeURIComponent(id)}`, { token, method: "DELETE" }),
  };
}
