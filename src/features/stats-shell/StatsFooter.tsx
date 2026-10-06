"use client";

import Link from "next/link";
import { branding } from "./branding";
import { useLocale } from "./locale";
import { riotDisclaimer, serviceContact } from "./service-notices";
import s from "./StatsShell.module.css";

/** 홈 H06·프로필 P09·보조 페이지의 공통 안내. mode는 화면별 여백·글자 스타일을 유지한다. */
export function StatsFooter({ mode }: { mode: "home" | "profile" }) {
  const { copy, t } = useLocale();
  return (
    <footer className={`${s.footer}${mode === "home" ? ` ${s.homeFooter}` : ""}`}>
      <div className={s.footerHeading}>
        <Link className={s.footerBrand} href="/">{branding.name}</Link>
        <nav className={s.footerLinks} aria-label={t("정책 및 문의", "Policies and contact")}>
          <Link href="/privacy">{t("개인정보처리방침", "Privacy")}</Link>
          <Link href="/terms">{t("이용약관", "Terms")}</Link>
          <Link href="/privacy#privacy-contact">{t("문의 안내", "Contact")}</Link>
        </nav>
      </div>
      <div className={s.footerNotices}>
        <p>{t(riotDisclaimer.ko, riotDisclaimer.en)}</p>
        <p>{copy.footerNotice}</p>
        {/* 실제 문의 창구: 메일 작성 앱만 열며 자동 발송하지 않는다. */}
        <p className={s.footerContact}>
          <span>{t(serviceContact.label.ko, serviceContact.label.en)}: <a href={`mailto:${serviceContact.email}`}>{serviceContact.email}</a></span>
          <span>{t(serviceContact.notice.ko, serviceContact.notice.en)}</span>
        </p>
      </div>
    </footer>
  );
}
