import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cx } from "@/lib/cx";

type Size = "md" | "lg" | "xl";
type Variant = "primary" | "secondary";

/** Figma Button / Screen(100:1219) Primary. md = 헤더(40px, 14), lg = 기본(44px, 15), xl = 마이페이지 카드(52px, 16, 라운드 12). */
const sizeClass: Record<Size, string> = {
  md: "h-10 rounded-lg text-14",
  lg: "h-11 rounded-lg text-15",
  xl: "h-[52px] rounded-thumb text-16",
};

/** primary = 브랜드 버튼(SemiBold), secondary = elevated 배경 + line 테두리(Medium) */
const variantClass: Record<Variant, string> = {
  primary: "bg-primary font-semibold text-on-primary hover:brightness-110",
  secondary: "border border-line bg-elevated font-medium text-main hover:border-sub-weak",
};

const baseClass =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-[filter,border-color] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-elevated disabled:text-disabled";

const defaultPadding: Record<Size, string> = { md: "px-4", lg: "px-6", xl: "px-2" };

/** 같은 속성 유틸리티가 겹치면 적용 순서가 보장되지 않아, className에 px가 있으면 기본 패딩을 뺀다. */
function buttonClass(size: Size, variant: Variant, className?: string) {
  const padding = className?.includes("px-") ? null : defaultPadding[size];
  return cx(baseClass, variantClass[variant], sizeClass[size], padding, className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { size?: Size; variant?: Variant };

export function Button({ size = "lg", variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(size, variant, className)} {...props} />;
}

type ButtonLinkProps = LinkProps & { size?: Size; variant?: Variant };

export function ButtonLink({ size = "lg", variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(size, variant, className)} {...props} />;
}
