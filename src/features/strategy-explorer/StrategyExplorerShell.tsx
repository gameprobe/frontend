"use client";

import { useRef, useState, type ReactNode } from "react";
import { StatsShell } from "../stats-shell/StatsShell";
import { StatsHeader } from "../stats-shell/StatsHeader";
import { createMainNavigation } from "../stats-shell/navigation";
import { StatsFooter } from "../stats-shell/StatsFooter";
import type { StrategyNotice } from "./status";
import s from "./StrategyExplorerShell.module.css";

type StrategyExplorerShellProps = {
  current: "lineups" | "smokes";
  eyebrow: string;
  title: string;
  description: string;
  notice: StrategyNotice;
  children: ReactNode;
};

/** /lineups·/smokes의 공통 외곽. 지도·필터·데이터 상태는 각 탐색 화면에서 관리한다. */
export function StrategyExplorerShell({ current, eyebrow, title, description, notice, children }: StrategyExplorerShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <StatsShell className={s.root}>
      <StatsHeader
        mode="home"
        searchHref="/#riot-id"
        items={createMainNavigation(current)}
        menu={{
          open: menuOpen,
          onToggle: () => setMenuOpen(!menuOpen),
          buttonRef: menuButtonRef,
          controlsId: `${current}-more-navigation`,
          onKeyDown: event => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          },
        }}
      />

      <div className={s.content}>
        {/* 탐색 본문은 한국어를 유지하고 헤더·푸터는 기존 언어 선택을 따른다. */}
        <div lang="ko">
          <section className={s.hero} aria-labelledby={`${current}-heading`}>
            <div className={s.intro}>
              <p className={s.eyebrow}>{eyebrow}</p>
              <h1 id={`${current}-heading`}>{title}</h1>
              <p>{description}</p>
            </div>
            <aside className={s.notice} data-tone={notice.tone} role="status" aria-label="자료 상태" aria-atomic="true">
              <strong>{notice.title}</strong>
              <span>{notice.message}</span>
            </aside>
          </section>
          {children}
        </div>
        <StatsFooter mode="home" />
      </div>
    </StatsShell>
  );
}
