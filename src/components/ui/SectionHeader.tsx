import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type CardTitleRowProps = {
  title: string;
  action?: ReactNode;
};

/** 카드 상단 제목(20 SemiBold) + 오른쪽 보조 동작. */
export function CardTitleRow({ title, action }: CardTitleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-20 font-semibold">{title}</h2>
      {action}
    </div>
  );
}

type TextLinkProps = {
  to: string;
  children: ReactNode;
};

/** 카드·섹션 오른쪽의 primary 링크(14 Medium). */
export function TextLink({ to, children }: TextLinkProps) {
  return (
    <Link to={to} className="shrink-0 text-14 font-medium whitespace-nowrap text-primary hover:underline">
      {children}
    </Link>
  );
}

type SectionHeaderProps = {
  label: string;
  title: string;
  action?: ReactNode;
};

/** 카드 밖 섹션 제목: 라벨(14 Medium) / 제목(24 SemiBold), 기본 스케일 A-4. */
export function SectionHeader({ label, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-14 font-medium text-sub">{label}</p>
        <h2 className="text-20 font-semibold md:text-24">{title}</h2>
      </div>
      {action}
    </div>
  );
}
