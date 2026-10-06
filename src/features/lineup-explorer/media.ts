export type MediaPresentation = {
  url: string;
  kind: "image" | "youtube" | "video" | "link";
  embedUrl?: string;
};

/** 등록 주소를 보존하되, 지원하는 영상 제공자만 페이지 안에 삽입한다. */
export function getMediaPresentation(type: "VIDEO" | "IMAGE", value?: string): MediaPresentation | null {
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
  if (type === "IMAGE") return { kind: "image", url: url.href };

  const youtubeHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"];
  let videoId: string | null = null;
  if (url.hostname === "youtu.be") videoId = url.pathname.split("/")[1] ?? null;
  else if (youtubeHosts.includes(url.hostname)) {
    if (url.pathname === "/watch") videoId = url.searchParams.get("v");
    else if (/^\/(embed|shorts)\//.test(url.pathname)) videoId = url.pathname.split("/")[2] ?? null;
  }
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return { kind: "youtube", url: url.href, embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` };
  }
  if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) return { kind: "video", url: url.href };
  return { kind: "link", url: url.href };
}
