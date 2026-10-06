"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnalysisExampleCards } from "../../components/AnalysisExampleCards";
import { HomeSearch } from "../../components/HomeSearch";

// 프로필과 공유하는 표시 설정. 데모 신원/진입은 API 형태 합성 표본을 사용한다.
import { branding } from "../stats-shell/branding";
import { useLocale } from "../stats-shell/locale";
import { StatsShell } from "../stats-shell/StatsShell";
import { StatsHeader } from "../stats-shell/StatsHeader";
import { createMainNavigation } from "../stats-shell/navigation";
import { StatsFooter } from "../stats-shell/StatsFooter";
import { demoProfile } from "../tracker-profile/data/provider";
import s from "./HomeLanding.module.css";

// 일반 탐색은 익숙한 디자인 데모로 유지한다. 새 데이터는 이름이 명시된 링크에서만 연다.
const previewHref = "/players/ied-agent-allen";

function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12h16M14 5l7 7-7 7" />
    </svg>
  );
}

export function HomeLanding() {
  const { t, copy } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <StatsShell className={s.home}>
      <StatsHeader
        mode="home"
        items={createMainNavigation("home")}
        menu={{
          open: menuOpen,
          onToggle: () => setMenuOpen(!menuOpen),
          buttonRef: menuButtonRef,
          controlsId: "home-more-navigation",
          onKeyDown: event => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          },
        }}
      />

      <div className={s.container}>
        <section className={s.hero} aria-labelledby="home-heading">
          <div className={s.heroArt} aria-hidden="true">
            <span className={s.heroLetters}>JETT</span>
            <div className={s.heroSlash} />
            <Image className={s.heroAgent} src="/assets/agents/jett_full.png" alt="" width={760} height={760} priority />
          </div>
          <div className={s.heroCopy}>
            <div className={s.eyebrow}><span /> VALORANT STATS</div>
            <h1 id="home-heading">{t("당신의 플레이,", "Your game,")}<br />{t("더 선명하게.", "in focus.")}</h1>
            <p className={s.intro}>{t("전적을 살펴보고, 다음 경기를 준비하세요.", "Review your matches. Get ready for the next one.")}</p>
            <div className={s.searchArea}>
              <HomeSearch />
              <p className={s.mockNote}><span>{copy.demoPreview}</span> {copy.searchUnavailable} {t("아래 두 데모를 비교해 보세요.", "Compare the two demos below.")}</p>
            </div>
            <div className={s.demoLinks}>
              <span>{t("데모 비교하기", "Compare demos")}</span>
              {/* 새 원본 데이터 연결과 기존 디자인 확인을 각각 바로 열 수 있는 비교용 진입점. */}
              <Link href={demoProfile.href}>{t("새 데이터 데모", "New data demo")}<small>· {demoProfile.name}</small><Arrow size={13} /></Link>
              <Link href="/players/ied-agent-allen">{t("기존 디자인 데모", "Original design demo")}<small>· IED agent</small><Arrow size={13} /></Link>
            </div>
          </div>
          <nav className={s.heroProfiles} aria-label={t("데모 프로필 카드", "Demo profiles")}>
            <Link href={demoProfile.href} className={s.heroProfile} aria-label={t("새 데이터 데모 프로필 보기", "View new data demo profile")}>
              <Image src="/assets/agents/jett.png" alt="" width={48} height={48} />
              <span><small>{t("새 데이터 데모", "New data demo")}</small><strong>{demoProfile.name} <em>{t("예시 기록", "Sample stats")}</em></strong></span>
              <Arrow size={16} />
            </Link>
            <Link href="/players/ied-agent-allen" className={s.heroProfile} aria-label={t("기존 디자인 데모 프로필 보기", "View original design demo profile")}>
              <Image src="/assets/agents/jett.png" alt="" width={48} height={48} />
              <span><small>{t("기존 디자인 데모", "Original design demo")}</small><strong>IED agent <em>#Allen</em></strong></span>
              <Arrow size={16} />
            </Link>
          </nav>
          <div className={s.heroCaption} aria-hidden="true">01 / DUELIST <span>JETT</span></div>
        </section>

        <section className={s.explore} aria-labelledby="explore-heading">
          <div className={s.sectionHeading}>
            <h2 id="explore-heading">{t("게임을 더 깊이 들여다보세요", "Take a closer look at your game")}</h2>
            <span>EXPLORE {branding.name.toUpperCase()}</span>
          </div>
          <div className={s.exploreGrid}>
            <Link href={previewHref} className={`${s.featureCard} ${s.profileCard}`}>
              <div className={s.featureIcon}>
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 20V11h4v9M10 20V4h4v16M16 20V8h4v12" />
                </svg>
              </div>
              <div className={s.featureText}>
                <span>PLAYER OVERVIEW</span>
                <h3>{t("최근 경기를 한눈에", "Your recent matches at a glance")}</h3>
                <p>{t("시즌 성적부터 요원·맵별 기록까지, 내 플레이의 흐름을 확인하세요.", "Track your progress with season, agent and map stats.")}</p>
                <strong>{t("전적 프로필 보기", "View player profile")} <Arrow size={15} /></strong>
              </div>
              <div className={s.miniChart} aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
              </div>
            </Link>
            <Link href="/lineups" className={`${s.featureCard} ${s.lineupCard}`}>
              <div className={s.featureText}>
                <span>TACTICAL LIBRARY</span>
                <h3>{t("다음 라운드의 한 수", "Your next round starts here")}</h3>
                <p>{t("맵과 요원에 맞는 라인업을 찾아보세요.", "Find lineups for your map and agent.")}</p>
                <strong>{t("라인업 둘러보기", "Explore lineups")} <Arrow size={15} /></strong>
              </div>
              <span className={s.mapTag}>ASCENT</span>
            </Link>
          </div>
        </section>

        <section className={s.analysisArea} aria-labelledby="analysis-heading">
          <div className={s.sectionHeading}>
            <h2 id="analysis-heading">{t("플레이 분석 미리보기", "Performance analysis preview")} <span className={s.sampleBadge}>{t("예시", "Sample")}</span></h2>
            <span>{t("분석 화면을 위한 예시 점수입니다.", "Illustrative scores for the analysis preview.")}</span>
          </div>
          <AnalysisExampleCards />
        </section>

        <StatsFooter mode="home" />
      </div>
    </StatsShell>
  );
}
