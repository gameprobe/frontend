import type { CSSProperties, ReactNode } from "react";
import { number } from "../format";
import { useLocale } from "../../stats-shell/locale";
import shared from "../ProfileShared.module.css";
import s from "./SeasonOverview.module.css";

export type PrimaryStat = readonly [label: string, value: string, hint: string];
export type SecondaryStat = readonly [label: string, value: string | number];

type SeasonOverviewProps = {
  act: string;
  mode: string;
  tab: "Overview" | "Performance";
  hours: number;
  matches: number;
  rank: string;
  rr: number | null;
  regionRank: number | null;
  level: number | null;
  wins: number;
  losses: number;
  winRate: number | null;
  synthetic?: boolean;
  primary: readonly PrimaryStat[];
  secondary: readonly SecondaryStat[];
  // 이미지 선택과 그래프 산식은 기존 부모 helper가 맡고, 이 컴포넌트는 배치만 맡는다.
  rankIcon: ReactNode;
  rankGraph: ReactNode;
  showMore: boolean;
  onToggleMore: () => void;
};

/** P06: Overview·Performance의 시즌 요약. 경기 목록 필터와 독립적인 시즌 값을 표시한다. */
export function SeasonOverview({
  act, mode, tab, hours, matches, rank, rr, regionRank, level, wins, losses,
  winRate, primary, secondary, rankIcon, rankGraph, showMore, onToggleMore, synthetic = false,
}: SeasonOverviewProps) {
  const { t, copy } = useLocale();
  return <>
    <div className={shared.sectionHeading}>
      <h2>{act.toUpperCase()} {mode.toUpperCase()} {tab.toUpperCase()}</h2>
      <small>{number(hours, synthetic ? 1 : 0)}h Playtime // {matches} Matches</small>
      <button onClick={onToggleMore}>{showMore ? "Show Less" : "Show More"}</button>
    </div>
    <section className={`${shared.card} ${s.overview}`} aria-label="Season overview">
      <div className={s.rankOverview}>
        {rankIcon}
        <div>
          <span>{rank}</span>
          <strong>{rr ?? "—"}<small> RR</small></strong>
          <small>{regionRank == null ? copy.unavailable : `#${regionRank.toLocaleString("en-US")}`}</small>
        </div>
        <div className={s.level}><span>Level</span><strong>{level ?? "—"}</strong></div>
        <div className={s.winDonut} style={{ "--win": `${winRate ?? 0}%`, ...(winRate == null ? { background: "#293c49" } : {}) } as CSSProperties}>
          <span>{wins} W<br />{losses} L</span>
        </div>
        <div className={s.rankGraph}>{!synthetic && <span>IMMORTAL</span>}{rankGraph}</div>
      </div>
      <div className={s.primaryStats}>
        {primary.map(([label, value, hint]) => <div key={label}>
          <span>{label}</span><strong>{value}</strong><small>{hint}</small><i aria-hidden="true">•••</i>
        </div>)}
      </div>
      <div className={s.secondaryStats}>
        {secondary.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      {showMore && <p className={s.statsNote}>{synthetic ? t("조회된 예시 경기만 포함하며 전체 시즌 기록이 아닙니다. —는 미제공 값이며 0이 아닙니다. KAST·하이라이트 지표, 현재 랭크·RR·랭크 변화 기록은 제공되지 않습니다.", "Only the fetched sample matches are included, not a complete season. — means unavailable, not zero. KAST, highlight metrics, current rank, RR and rank history are not provided.") : t("선택한 플랫폼·게임 모드·Act의 예시 통계입니다. 랭크와 프로필 레벨도 예시 값입니다.", "Sample statistics for the selected platform, playlist and act. Ranks and profile level are illustrative.")}</p>}
    </section>
  </>;
}
