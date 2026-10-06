"use client";

import type { ReactNode } from "react";
import { useLocale } from "./locale";
import theme from "./theme.module.css";
import s from "./StatsShell.module.css";

/** 홈·프로필의 공통 화면 범위. 본문/상태는 children을 제공하는 각 화면이 소유한다. */
export function StatsShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { locale } = useLocale();
  return <main lang={locale} className={`${theme.theme} ${s.page} ${className}`}>{children}</main>;
}
