import { useId, useState, type KeyboardEvent } from "react";
import { YouTubePlayer } from "@/components/guide-map/YouTubePlayer";
import type { LineupImageSlot, LineupImages } from "@/features/admin/model";
import { publicLineupImageUrl } from "@/features/lineups/lineup-api";
import { isSafeHttpUrl } from "@/lib/youtube";
import { cx } from "@/lib/cx";

type MediaTab = "video" | LineupImageSlot;
const TABS: { value: MediaTab; label: string }[] = [
  { value: "video", label: "영상" },
  { value: "position", label: "서는 위치" },
  { value: "aim", label: "에임 위치" },
];

/** 자료를 전환하면 기존 영상은 제거되어 숨겨진 상태로 계속 재생되지 않는다. */
export function LineupMedia({ lineupId, title, videoUrl, images }: {
  lineupId: string; title: string; videoUrl?: string; images?: LineupImages;
}) {
  const id = useId();
  const [tab, setTab] = useState<MediaTab>("video");
  const [failedSource, setFailedSource] = useState("");
  const [retry, setRetry] = useState(0);
  const selected = TABS.find((item) => item.value === tab)!;
  const image = tab === "video" ? null : images?.[tab];
  let source = "";
  if (image && tab !== "video") {
    try {
      source = publicLineupImageUrl(import.meta.env.VITE_BACKEND_URL, lineupId, tab, image.id);
      if (retry > 0) source += `&retry=${retry}`;
    } catch { /* 잘못된 연결 설정은 아래 이미지 오류 안내로 표시한다. */ }
  }
  const safeVideo = videoUrl && isSafeHttpUrl(videoUrl) ? videoUrl : undefined;

  function changeWithKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next].value);
    document.getElementById(`${id}-${TABS[next].value}`)?.focus();
  }

  return (
    <section aria-label="라인업 영상과 이미지" className="flex min-w-0 flex-col gap-3">
      <div role="tablist" aria-label="라인업 자료 선택" className="flex gap-1 rounded-thumb border border-line bg-surface p-1">
        {TABS.map((item, index) => (
          <button
            key={item.value} id={`${id}-${item.value}`} type="button" role="tab"
            aria-selected={tab === item.value} aria-controls={`${id}-panel`} tabIndex={tab === item.value ? 0 : -1}
            onClick={() => setTab(item.value)} onKeyDown={(event) => changeWithKeyboard(event, index)}
            className={cx("min-w-0 flex-1 rounded-lg px-2 py-2.5 text-14", tab === item.value ? "bg-primary-soft font-semibold text-primary" : "text-sub hover:text-main")}
          >{item.label}</button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} tabIndex={0}>
        {tab === "video" ? (
          safeVideo ? <YouTubePlayer url={safeVideo} title={title} autoplay /> : <MediaNotice>등록된 영상이 없습니다.</MediaNotice>
        ) : !image ? (
          <MediaNotice>등록된 {selected.label} 이미지가 없습니다.</MediaNotice>
        ) : !source || failedSource === source ? (
          <MediaNotice>
            <p role="alert">{selected.label} 이미지를 불러오지 못했습니다.</p>
            <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 text-14 font-semibold text-primary hover:underline">다시 시도</button>
          </MediaNotice>
        ) : (
          <figure className="overflow-hidden rounded-thumb border border-line bg-surface">
            <img key={source} src={source} alt={`${title} · ${selected.label}`} crossOrigin="anonymous"
              referrerPolicy="no-referrer" onError={() => setFailedSource(source)}
              className="aspect-video w-full object-contain" />
            <figcaption className="px-4 py-2 text-13 text-sub">{selected.label}</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}

function MediaNotice({ children }: { children: React.ReactNode }) {
  return <div className="flex aspect-video w-full flex-col items-center justify-center rounded-thumb border border-line bg-surface p-5 text-center text-14 text-sub">{children}</div>;
}
