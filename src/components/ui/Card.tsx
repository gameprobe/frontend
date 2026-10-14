import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/** 다크 카드: 그림자 대신 bg-surface 층 + line 테두리, 라운드 16. */
export function Card<T extends ElementType = "div">({ as, className, children, ...props }: CardProps<T>) {
  const Component = as ?? "div";
  return (
    <Component className={cx("rounded-card border border-line bg-surface", className)} {...props}>
      {children}
    </Component>
  );
}
