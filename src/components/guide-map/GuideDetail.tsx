import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import playIcon from "@/assets/icons/play.svg";
import { YouTubePlayer } from "@/components/guide-map/YouTubePlayer";
import { Card } from "@/components/ui/Card";
import { cx } from "@/lib/cx";

/**
 * 라인업·스모크 상세 페이지 공용 틀 (Figma 222:6350, TASK-FE-059).
 * 위: 태그 · 제목 · 수치 줄 + 목록 링크. 왼쪽: 영상 + 단계 카드. 오른쪽: 경로 지도 카드 + 설명 카드.
 */
type GuideDetailProps = {
  tags: string[];
  title: string;
  meta: string;
  back: { to: string; label: string };
  video: { url?: string; placeholder: string };
  /** 라인업의 영상·이미지 전환처럼 별도 자료 보기가 필요할 때 사용한다. */
  media?: ReactNode;
  steps: { title: string; text: string; screenshot?: string }[];
  mapTitle: string;
  map: ReactNode;
  description: string;
  info: { label: string; value: string }[];
  actions: ReactNode;
};

export function GuideDetail({ tags, title, meta, back, video, media, steps, mapTitle, map, description, info, actions }: GuideDetailProps) {
  return (
    <div className="container-page flex flex-col gap-5 pt-8 pb-20 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag} className="rounded-md bg-elevated px-2 py-1 text-12 font-medium text-sub">
                {tag}
              </li>
            ))}
          </ul>
          <h1 className="text-20 font-semibold">{title}</h1>
          <p className="text-13 text-sub">{meta}</p>
        </div>
        <Link to={back.to} className="text-15 font-medium text-primary hover:underline">
          ← {back.label}
        </Link>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          {media ?? (video.url ? (
            <YouTubePlayer url={video.url} title={title} autoplay />
          ) : (
            <div aria-label={`${video.placeholder} (준비 중)`} className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-card border border-line bg-surface">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary">
                <img src={playIcon} alt="" width={16} height={16} />
              </span>
              <span className="text-12 font-medium text-sub">{video.placeholder}</span>
            </div>
          ))}
          {steps.length > 0 && (
            <ol className={cx("grid gap-4", steps.length >= 3 ? "sm:grid-cols-3" : steps.length === 2 && "sm:grid-cols-2")}>
              {steps.map((step, index) => (
                <Card as="li" key={step.title} className="flex gap-3 p-4">
                  <span lang="en" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-12 font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-14 font-semibold">{step.title}</p>
                      <p className="text-13 text-sub">{step.text}</p>
                    </div>
                    {step.screenshot && (
                      <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed border-line bg-elevated text-12 text-disabled">
                        {step.screenshot}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </ol>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Card as="section" aria-label="던지는 위치 → 착지 지점" className="flex flex-col gap-4 p-5">
            <h2 className="text-16 font-semibold">{mapTitle}</h2>
            {map}
          </Card>
          <Card as="section" aria-labelledby="guide-description" className="flex flex-col gap-4 p-5">
            <h2 id="guide-description" className="text-16 font-semibold">
              설명
            </h2>
            <p className="text-15 leading-[1.5] text-main">{description}</p>
            <dl className="flex flex-col">
              {info.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 border-t border-line py-2.5 text-14">
                  <dt className="text-sub">{row.label}</dt>
                  <dd className="font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2">{actions}</div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/** 보드의 영상 자리: 누르면 상세 페이지로 간다 (TASK-FE-059) */
export function VideoLink({ to, label, className }: { to: string; label: string; className?: string }) {
  return (
    <Link
      to={to}
      aria-label={`${label} — 상세 페이지에서 보기`}
      className={cx(
        "group flex h-[158px] flex-col items-center justify-center gap-2 rounded-thumb bg-elevated transition-colors hover:bg-line",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-primary transition-transform group-hover:scale-110">
        <img src={playIcon} alt="" width={16} height={16} />
      </span>
      <span className="text-12 font-medium text-sub">{label}</span>
    </Link>
  );
}
