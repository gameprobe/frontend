import Image from "next/image";
import { getTierAssetPath } from "../lib/asset-map";
import type { SeasonSummary } from "../types";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface SeasonSummaryCardProps {
  summary: SeasonSummary;
}

export function SeasonSummaryCard({ summary }: SeasonSummaryCardProps) {
  return (
    <section className="season-summary-card" aria-labelledby="season-summary-heading">
      <div className="section-kicker">
        <p className="eyebrow">Current season</p>
      </div>
      <div className="season-summary-head">
        <div className="season-tier">
          <Image
            alt={`${summary.tier} 티어 이미지`}
            height="64"
            src={getTierAssetPath(summary.tier)}
            width="64"
          />
          <div>
            <h2 id="season-summary-heading">이번 시즌 성적</h2>
            <strong>{summary.tier}</strong>
            <span>{summary.rr} RR · {summary.season}</span>
          </div>
        </div>
        <MatchScoreBadge
          label="GameProbe Preview Score"
          score={{ score: summary.previewScore, grade: summary.previewGrade }}
        />
      </div>
      <div className="season-metric-grid">
        <article>
          <span>시즌 승/패</span>
          <strong>{summary.wins}승 {summary.losses}패</strong>
        </article>
        <article>
          <span>승률</span>
          <strong>{summary.winRate}%</strong>
        </article>
        <article>
          <span>K/D</span>
          <strong>{summary.kd.toFixed(2)}</strong>
        </article>
        <article>
          <span>ACS</span>
          <strong>{summary.acs}</strong>
        </article>
        <article>
          <span>ADR</span>
          <strong>{summary.adr}</strong>
        </article>
        <article>
          <span>HS%</span>
          <strong>{summary.headshotPercentage}%</strong>
        </article>
        <article>
          <span>클러치 승률</span>
          <strong>{summary.clutchWinRate}%</strong>
        </article>
      </div>
      <p className="score-explainer">벤치마크 준비 중. 숫자 백분위는 생성하지 않습니다.</p>
    </section>
  );
}
