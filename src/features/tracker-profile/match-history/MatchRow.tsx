import { useLocale } from "../../stats-shell/locale";
import type { ReactNode } from "react";
import { branding } from "../../stats-shell/branding";
import { number, signed, percent } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./MatchHistory.module.css";
import { MatchDetail } from "./MatchDetail";
import { matchDetailPresentation } from "./detail/presentation";
import type { MatchDetailContext, MatchHistoryEntry } from "./types";

interface MatchRowProps {
  match: MatchHistoryEntry;
  expanded: boolean;
  detail: MatchDetailContext;
  chevronIcon: ReactNode;
}

// M03 경기 한 행과 M04 연결. 버튼은 부모 콜백을 호출하고 펼침 상태는 직접 보관하지 않는다.
export function MatchRow({ match, expanded, detail, chevronIcon }: MatchRowProps) {
  const { t } = useLocale();
  return <div id={`match-${match.id}`} className={s.matchItem}>
    <button
      className={`${s.matchRow} ${match.victory ? s.matchWin : s.matchLoss}`}
      onClick={match.onToggle}
      aria-expanded={expanded}
      aria-haspopup={matchDetailPresentation === "modal" ? "dialog" : undefined}
      aria-controls={`details-${match.id}`}
      aria-label={`${match.agent} ${match.map} ${match.victory ? "Victory" : "Defeat"} ${match.teamScore}-${match.enemyScore}, ${match.date} ${match.time}`}
    >
      <div className={s.matchAgent}>
        {match.portrait}
        <div><small>{match.time}{" // "}{match.mode}</small><strong>{match.map}</strong><span>{match.agent}</span></div>
      </div>
      {match.renderRank(s.matchRank)}
      <div className={s.matchScore}><small>Score</small><strong>{match.teamScore}<span> : </span><b>{match.enemyScore}</b></strong></div>
      <div className={s.matchProbe}><span>◈</span><div><small>{branding.scoreAbbreviation}</small><strong>{number(match.score, 0)}</strong></div></div>
      <div className={s.matchKd}><small>K/D</small><strong className={match.highlightKd ? shared.yellow : ""}>{number(match.kd)}</strong></div>
      <div className={s.matchKda}><small>K / D / A</small><strong>{match.kills} <span>/ {match.deaths} /</span> {match.assists}</strong></div>
      <div className={s.matchMetric}><small>DDΔ</small><strong>{signed(match.dd)}</strong></div>
      <div className={s.matchMetric}><small>HS%</small><strong>{percent(match.hs, 0)}</strong></div>
      <div className={s.matchMetric}><small>{t("성과점수", "ACS")}</small><strong>{number(match.acs, 0)}</strong></div>
      <span className={expanded ? s.rotated : ""}>{chevronIcon}</span>
    </button>
    {expanded && <MatchDetail match={match} {...detail} />}
  </div>;
}
