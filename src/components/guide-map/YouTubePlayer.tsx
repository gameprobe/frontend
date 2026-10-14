import playIcon from "@/assets/icons/play.svg";
import { youtubeEmbedUrl } from "@/lib/youtube";

type YouTubePlayerProps = {
  url: string;
  title: string;
  /** 출발지를 눌러 연 경우 바로 재생한다 */
  autoplay?: boolean;
};

/** 공략 영상. 유튜브 주소는 nocookie embed로 넣고, 아니면 새 탭 링크로 보여준다. */
export function YouTubePlayer({ url, title, autoplay = false }: YouTubePlayerProps) {
  const embedUrl = youtubeEmbedUrl(url, autoplay);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-thumb border border-line bg-elevated p-4 text-center">
        <img src={playIcon} alt="" width={32} height={32} className="opacity-60" />
        <p className="text-14 text-sub">유튜브 영상 주소가 아니라 화면 안에서 재생할 수 없습니다.</p>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-14 font-medium break-all text-primary hover:underline">
            새 탭에서 열기 ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <iframe
      key={embedUrl}
      src={embedUrl}
      title={`${title} 영상`}
      className="aspect-video w-full rounded-thumb border border-line bg-elevated"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
