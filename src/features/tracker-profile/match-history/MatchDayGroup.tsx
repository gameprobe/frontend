import { useLocale } from "../../stats-shell/locale";
import type { ReactNode } from "react";
import { number, signed } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./MatchHistory.module.css";
import { MatchRow } from "./MatchRow";
import type { MatchDay, MatchDetailContext } from "./types";

interface MatchDayGroupProps {
  group: MatchDay;
  expandedId: string | null;
  detail: MatchDetailContext;
  chevronIcon: ReactNode;
}

// M03: 날짜별 요약과 경기 행. 부모에서 묶은 순서·일별 집계를 그대로 표시한다.
export function MatchDayGroup({ group, expandedId, detail, chevronIcon }: MatchDayGroupProps) {
  const { t } = useLocale();
  const daily = group.summary;
  return <div className={`${shared.card} ${s.matchGroup}`}>
    <div className={s.dateHeader}>
      <div><strong>{group.dateLabel}</strong><span>{group.rows.length}</span></div>
      <strong><em>{daily.wins} W</em>{" // "}<b>{daily.losses} L</b></strong>
      <span>K/D <b>{number(daily.kd, 2)}</b></span>
      <span>DDΔ <b>{signed(daily.dd)}</b></span>
      <span>HS% <b>{number(daily.hs, 0)}</b></span>
      <span>{t("성과점수", "ACS")} <b>{number(daily.acs, 0)}</b></span>
    </div>
    {group.rows.map(match => <MatchRow key={match.id} match={match} expanded={expandedId === match.id} detail={detail} chevronIcon={chevronIcon} />)}
  </div>;
}
