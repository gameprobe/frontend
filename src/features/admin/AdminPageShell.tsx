"use client";

import type { ReactNode } from "react";
import { ContentPageShell } from "../stats-shell/ContentPageShell";
import s from "./AdminPageShell.module.css";

/** 관리자 화면의 표시 범위만 공유한다. 인증과 편집 상태는 각 화면이 소유한다. */
export function AdminPageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <ContentPageShell>
      <div className={`${s.admin} ${className}`}>{children}</div>
    </ContentPageShell>
  );
}
