import type { ReactNode } from "react";
import { branding } from "../../stats-shell/branding";
import s from "./ProfilePromotion.module.css";

type ProfilePromotionProps = {
  onExplore: () => void;
  arrowIcon: ReactNode;
};

/** P04: 프로필 상단 홍보 배너. 브랜드 설정을 재사용하며 Performance 이동은 부모가 처리한다. */
export function ProfilePromotion({ onExplore, arrowIcon }: ProfilePromotionProps) {
  return (
    <div className={s.promo}>
      <div className={s.promoVisual}>
        <span className={s.promoLogo}>{branding.logoText}</span>
        <span><b>KNOW YOUR GAME.</b><small>YOUR STATS. YOUR PROGRESS. YOUR NEXT WIN.</small></span>
        <span className={s.promoArrows} aria-hidden="true">❯❯❯</span>
      </div>
      <div className={s.promoAction}>
        <strong>A closer look at every match.</strong>
        <button onClick={onExplore}>Explore your performance {arrowIcon}</button>
      </div>
    </div>
  );
}
