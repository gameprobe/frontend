/**
 * 유튜브 주소를 페이지 안에 넣을 수 있는 nocookie embed 주소로 바꾼다.
 * youtube.com/watch?v=, youtu.be/, /shorts/, /embed/ 형식을 받는다 (legacy-next lineup-explorer/media.ts에서 옮김).
 */
const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"];

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function youtubeVideoId(value: string): string | null {
  const url = parseUrl(value);
  if (!url) return null;
  let videoId: string | null = null;
  if (url.hostname === "youtu.be") videoId = url.pathname.split("/")[1] ?? null;
  else if (YOUTUBE_HOSTS.includes(url.hostname)) {
    if (url.pathname === "/watch") videoId = url.searchParams.get("v");
    else if (/^\/(embed|shorts)\//.test(url.pathname)) videoId = url.pathname.split("/")[2] ?? null;
  }
  return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
}

/** 재생 시작 시 바로 틀도록 autoplay를 붙인다. 유튜브 주소가 아니면 null. */
export function youtubeEmbedUrl(value: string, autoplay = false): string | null {
  const videoId = youtubeVideoId(value);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`;
}

/** 인증 정보 없는 http(s) 주소인지만 본다. 주소의 실제 자료는 조회하지 않는다. */
export function isSafeHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  const authority = trimmed.match(/^https?:\/\/([^/?#]+)/i)?.[1];
  // eslint-disable-next-line no-control-regex
  if (!authority || authority.includes("@") || /[\s\u0000-\u001f\u007f\\]/.test(trimmed)) return false;
  return parseUrl(trimmed) !== null;
}
