import { signed } from "../../format";
import type { MatchHistoryEntry } from "../types";
import s from "./MatchDetailTheme.module.css";

interface MatchPersonalSummaryProps {
  match: MatchHistoryEntry;
  displayName: string;
  displayTag: string;
  showMetrics?: boolean;
}

// M04: 목록이 이미 가진 개인 기록만 표시한다. 팀 상세가 없어도 이 요약은 유지한다.
export function MatchPersonalSummary({ match, displayName, displayTag, showMetrics = false }: MatchPersonalSummaryProps) {
  return <div className={s.personal}>
    <div className={s.personalHeading}>
      {match.portrait}
      <div>
        <h4>{displayName}<span>#{displayTag}</span></h4>
        <p>{match.agent} · {match.weapon} · {match.act}</p>
        <strong>{match.kills} / {match.deaths} / {match.assists} <small>K / D / A</small></strong>
      </div>
      {match.mode === "Competitive" && <span className={s.ratingChange}>{match.rr === null ? "RR 미제공" : `${signed(match.rr)} RR`}</span>}
    </div>
    {showMetrics && <dl className={s.personalMetrics}>
      {match.detailMetrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>}
  </div>;
}
