import { ddDeltaTone, getDdDeltaPerRound } from "../lib/recent-twenty";
import type { RecentTwentySummary } from "../types";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface RecentTwentySummaryCardProps {
  summary: RecentTwentySummary;
}

function formatDdDelta(value: number | null): string {
  if (value === null) {
    return "—";
  }

  const rounded = Math.round(value);

  if (rounded > 0) {
    return `+${rounded}`;
  }

  return String(rounded);
}

export function RecentTwentySummaryCard({ summary }: RecentTwentySummaryCardProps) {
  const ddDeltaPerRound = getDdDeltaPerRound(summary);
  const tone = ddDeltaTone(ddDeltaPerRound);

  return (
    <section className="recent-twenty-card" aria-labelledby="recent-twenty-heading">
      <div className="section-kicker">
        <p className="eyebrow">Recent 20</p>
      </div>
      <div className="recent-twenty-head">
        <div>
          <h2 id="recent-twenty-heading">최근 20판 성적</h2>
          <p>최근 20경기 기준 통계 데이터입니다.</p>
        </div>
        <MatchScoreBadge
          label="GameProbe Preview Score"
          score={{ score: summary.previewScore, grade: summary.previewGrade }}
        />
      </div>
      <div className="season-metric-grid">
        <article>
          <span>승률</span>
          <strong>{summary.winRate}%</strong>
          <em>{summary.wins}승 {summary.losses}패</em>
        </article>
        <article>
          <span>라운드 승률</span>
          <strong>{summary.roundWinRate}%</strong>
          <em>{summary.roundsWon}-{summary.roundsLost}</em>
        </article>
        <article>
          <span>KAST</span>
          <strong>{summary.kast}%</strong>
          <em>20경기 평균</em>
        </article>
        <article>
          <span>ACS</span>
          <strong>{summary.acs}</strong>
        </article>
        <article title="라운드당 피해량 차이 — (가한 피해량 - 받은 피해량) ÷ 플레이 라운드">
          <span>DDΔ/R</span>
          <strong className={`dd-delta dd-delta-${tone}`}>{formatDdDelta(ddDeltaPerRound)}</strong>
          <em>라운드당 피해량 차이</em>
        </article>
      </div>
    </section>
  );
}
