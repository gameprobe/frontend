export interface BackendHealth {
  status: "UP";
}

function healthUrl(baseUrl: string | undefined): URL {
  const configuredUrl = baseUrl?.trim();
  if (!configuredUrl) {
    throw new Error("VITE_BACKEND_URL이 설정되지 않았습니다.");
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("VITE_BACKEND_URL에는 절대 HTTP(S) 주소를 설정해야 합니다.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash || url.pathname !== "/"
  ) {
    throw new Error("VITE_BACKEND_URL에는 경로·인증정보·쿼리·해시 없는 서버 주소만 설정해야 합니다.");
  }

  return new URL("/health", url);
}

// Creating or importing the client never sends a request. Validate only when called.
export function createBackendClient(baseUrl: string | undefined) {
  return {
    async getHealth(signal?: AbortSignal): Promise<BackendHealth> {
      const response = await fetch(healthUrl(baseUrl), {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
        signal,
      });

      if (!response.ok) {
        throw new Error(`백엔드 상태 확인에 실패했습니다 (HTTP ${response.status}).`);
      }

      const body: unknown = await response.json();
      if (
        typeof body !== "object" || body === null ||
        !("status" in body) || body.status !== "UP"
      ) {
        throw new Error("백엔드 health 응답 형식이 올바르지 않습니다.");
      }

      return { status: "UP" };
    },
  };
}
