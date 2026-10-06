"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { StatsShell } from "./StatsShell";
import { StatsHeader } from "./StatsHeader";
import { StatsFooter } from "./StatsFooter";
import { createMainNavigation } from "./navigation";
import s from "./ContentPageShell.module.css";

/** 라인업/기존 경기 상세와 관리자 화면의 공통 외곽. 데이터·폼 상태는 각 본문에서 관리한다. */
export function ContentPageShell({ children, current, className = "" }: {
  children: ReactNode;
  current?: Parameters<typeof createMainNavigation>[0];
  className?: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <StatsShell className={`${s.page} ${className}`}>
      <StatsHeader mode="home" searchHref="/#riot-id" items={createMainNavigation(current)}
        menu={{ open: menuOpen, onToggle: () => setMenuOpen(open => !open) }} />
      <div className={s.content} lang="ko">{children}</div>
      <div className={s.footer}><StatsFooter mode="home" /></div>
    </StatsShell>
  );
}
