"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getAgentAssetPath } from "../../lib/asset-map";
import { useLocale } from "../stats-shell/locale";
import { createMockProvider, demoProfile, type ProfileResult } from "../tracker-profile/data/provider";
import s from "./AccountConsentDemo.module.css";

const loadDemoProfile = createMockProvider();
type PreviewData = { status: "loading" } | { status: "error" } | { status: "ready"; result: ProfileResult };

/** 동의한 동안만 /connect에 마운트된다. 기존 새 데이터 데모와 같은 공급자/집계를 사용한다. */
export function ConsentProfilePreview() {
  const { t } = useLocale();
  const [data, setData] = useState<PreviewData>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setData({ status: "loading" });
    loadDemoProfile({ puuid: demoProfile.puuid, platform: "pc", queueId: "competitive" }, controller.signal)
      .then(result => {
        if (controller.signal.aborted) return;
        setData(result.state === "ready" ? { status: "ready", result } : { status: "error" });
      })
      .catch(() => { if (!controller.signal.aborted) setData({ status: "error" }); });
    // 철회/페이지 이동 이후의 늦은 응답이 프로필을 다시 표시하지 못하게 한다.
    return () => controller.abort();
  }, [attempt]);

  if (data.status === "loading") return <p role="status">{t("합성 프로필을 불러오는 중입니다.", "Loading the synthetic profile.")}</p>;
  if (data.status === "error") return <div className={s.privateCard} role="status">
    <strong>{t("데모 프로필을 불러오지 못했습니다.", "The demo profile could not be loaded.")}</strong>
    <button className={s.secondary} onClick={() => setAttempt(value => value + 1)}>{t("다시 시도", "Try again")}</button>
  </div>;

  const { summary, matches } = data.result;
  return <div className={s.profile} aria-label={t("합성 프로필 요약", "Synthetic profile summary")}>
    <div className={s.profileIdentity}>
      <Image src={getAgentAssetPath(matches[0].agent.name?.toLowerCase() ?? "jett")} width={56} height={56} alt="" />
      <div><span className={s.publicBadge}>{t("공개 프로필 · 합성 예시", "PUBLIC PROFILE · SYNTHETIC")}</span><h3>{demoProfile.name}<small>#{demoProfile.tag}</small></h3></div>
    </div>
    <dl className={s.stats}>
      <div><dt>{t("표본 경기", "Sample matches")}</dt><dd>{summary.matches}</dd></div>
      <div><dt>{t("승리 / 패배", "Wins / losses")}</dt><dd>{summary.wins} / {summary.losses}</dd></div>
      <div><dt>K / D / A</dt><dd>{summary.kills} / {summary.deaths} / {summary.assists}</dd></div>
    </dl>
    <h4>{t("최근 경기 예시", "Sample recent matches")}</h4>
    <ul className={s.matches}>
      {matches.map(match => <li key={match.matchId}>
        <span><strong>{match.map.name ?? "—"}</strong><small>{match.agent.name ?? "—"}</small></span>
        <span className={match.result === "win" ? s.win : s.loss}>{match.result === "win" ? t("승리", "Win") : t("패배", "Loss")}</span>
        <strong>{match.teamScore} : {match.enemyScore}</strong>
      </li>)}
    </ul>
    <p className={s.sampleNote}>{t("일부 경기로 구성된 합성 표본이며, 전체 시즌 성적이나 실제 Riot 기록이 아닙니다.", "This synthetic sample covers a few matches, not a full season or actual Riot records.")}</p>
  </div>;
}
