"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { StatsShell } from "./StatsShell";
import { StatsHeader } from "./StatsHeader";
import { StatsFooter } from "./StatsFooter";
import { useLocale } from "./locale";
import { createMainNavigation } from "./navigation";
import s from "./SupportPage.module.css";

/** 안내 화면의 외곽. Insights는 wide로 홈·프로필 폭을 쓰고, 문서는 기본 읽기 폭을 유지한다. */
export function SupportPage({ children, compact = false, wide = false }: { children: ReactNode; compact?: boolean; wide?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // 정책 페이지 사이를 이동해도 이전 화면의 More 메뉴가 남지 않도록 한다.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <StatsShell className={`${s.page}${wide && !compact ? ` ${s.wide}` : ""}`}>
      <StatsHeader
        mode="home"
        searchHref="/#riot-id"
        items={createMainNavigation(pathname === "/insights" ? "insights" : undefined)}
        menu={{
          open: menuOpen,
          onToggle: () => setMenuOpen(open => !open),
          buttonRef: menuButtonRef,
          controlsId: "support-more-navigation",
          onKeyDown: event => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          },
        }}
      />
      <div className={s.frame}>
        <div className={`${s.content}${compact ? ` ${s.compact}` : ""}`}>{children}</div>
      </div>
      <div className={s.footerFrame}><StatsFooter mode="home" /></div>
    </StatsShell>
  );
}

type LocalizedText = string | { ko: string; en: string };

/** 기존/합성 경기와 플레이어 조회 실패가 공유하는 표시 UI. 조회 판단과 복귀 주소는 호출자가 정한다. */
export function MissingRecordPage({ title, description, eyebrow, backHref = "/players/ied-agent-allen" }: {
  title: LocalizedText;
  description: LocalizedText;
  eyebrow: string;
  backHref?: string;
}) {
  const { t, copy } = useLocale();
  // 조회 페이지는 서버에 유지하고 직렬화 가능한 번역만 받아 현재 언어로 표시한다.
  const translate = (text: LocalizedText) => typeof text === "string" ? text : t(text.ko, text.en);

  return (
    <SupportPage compact>
      <section aria-labelledby="record-not-found-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="record-not-found-heading">{translate(title)}</h1>
        <p>{translate(description)}</p>
        <div className={s.actions}>
          <Link href={backHref}>{copy.returnDemoProfile}</Link>
          <Link href="/">{copy.returnHome}</Link>
        </div>
      </section>
    </SupportPage>
  );
}
