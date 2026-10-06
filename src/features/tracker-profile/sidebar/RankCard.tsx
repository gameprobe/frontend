import type { ReactNode } from "react";
import { useLocale } from "../../stats-shell/locale";
import shared from "../ProfileShared.module.css";
import s from "./ProfileSidebar.module.css";

type RankCardProps = {
  rank: string;
  rr: number | null;
  regionRank: number | null;
  peakRank: string;
  peakRR: number | null;
  currentIcon: ReactNode;
  peakIcon: ReactNode;
};

/** S01: 사이드바의 현재/최고 랭크. 부모가 데이터 출처별 랭크 또는 미제공(null)을 전달하며 경기 필터와 독립적이다. */
export function RankCard({ rank, rr, regionRank, peakRank, peakRR, currentIcon, peakIcon }: RankCardProps) {
  const { t, copy } = useLocale();
  return (
    <section>
      <h2 className={`${shared.sectionHeading} ${s.sectionHeading}`}>
        CURRENT RATING <span title={t("예시 랭크이며 경기 필터와 관계없이 표시됩니다.", "Sample rank, independent of match filters.")}>ⓘ</span>
      </h2>
      <div className={`${shared.card} ${s.ratingCard}`}>
        <div className={s.currentRank}>
          {currentIcon}
          <div>
            <span>{rank}</span>
            <strong className={shared.yellow}>{rr ?? "—"} <small>RR</small></strong>
            <small>{regionRank == null ? copy.unavailable : `#${regionRank.toLocaleString("en-US")}`}</small>
          </div>
        </div>
        <div className={s.peakRank}>
          <span>Peak Rating</span>
          <div>
            {peakIcon}
            <p>
              <strong>{peakRank} <em>{peakRR ?? "—"}<small>RR</small></em></strong>
              <small>{peakRR == null ? copy.unavailable : t("V25: ACT I · 예시", "V25: ACT I · Sample")}</small>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
