import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { reviewLink, useReviewLanguage } from "@/features/review/review-content";

export function ReviewShell({ eyebrow, title, intro, children }: {
  eyebrow: string; title: string; intro: string; children: ReactNode;
}) {
  const [language, setLanguage] = useReviewLanguage();
  return (
    <div lang={language} className="container-page flex flex-col gap-8 pt-8 pb-20 md:gap-10 md:pt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to={reviewLink("/review", language)} className="text-14 font-medium text-primary hover:underline">GAMEPROBE / {language === "en" ? "Demo guide" : "서비스 안내"}</Link>
        <div role="group" aria-label="Page language" className="flex gap-2">
          <Button size="md" variant={language === "ko" ? "primary" : "secondary"} aria-pressed={language === "ko"} onClick={() => setLanguage("ko")}>한국어</Button>
          <Button size="md" variant={language === "en" ? "primary" : "secondary"} aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</Button>
        </div>
      </div>
      <header className="flex max-w-[800px] flex-col gap-4">
        <p className="text-13 font-semibold tracking-widest text-primary">{eyebrow}</p>
        <h1 className="text-28 font-semibold md:text-40">{title}</h1>
        <p className="text-16 leading-relaxed text-sub">{intro}</p>
      </header>
      {children}
    </div>
  );
}
