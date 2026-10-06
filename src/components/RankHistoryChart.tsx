"use client";

import { useState } from "react";
import { buildRankHistoryChart, filterRankHistory } from "../lib/rank-history";
import type { MatchPeriodFilter, RankHistoryPoint } from "../types";

interface RankHistoryChartProps {
  points: RankHistoryPoint[];
}

const periodOptions: Array<{ label: string; value: MatchPeriodFilter }> = [
  { label: "전체", value: "all" },
  { label: "60일", value: "60d" },
  { label: "30일", value: "30d" },
  { label: "7일", value: "7d" },
  { label: "직접", value: "custom" },
];

export function RankHistoryChart({ points }: RankHistoryChartProps) {
  const [period, setPeriod] = useState<MatchPeriodFilter>("all");
  const filteredPoints = filterRankHistory(points, period);
  const chart = buildRankHistoryChart(filteredPoints);
  const latest = filteredPoints[filteredPoints.length - 1];

  return (
    <section className="rank-history-card" aria-labelledby="rank-history-heading">
      <div className="section-kicker">
        <p className="eyebrow">Rank history</p>
      </div>
      <div className="rank-history-head">
        <div>
          <h2 id="rank-history-heading">날짜별 티어 변화</h2>
        </div>
        <div className="rank-period-tabs" aria-label="그래프 조회 기간">
          {periodOptions.map((option) => (
            <button
              className={period === option.value ? "active" : ""}
              key={option.value}
              onClick={() => setPeriod(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <svg className="rank-chart" viewBox="0 0 100 100" role="img" aria-label="날짜별 누적 랭크 점수 변화 그래프" preserveAspectRatio="none">
        <line x1="4" x2="96" y1="88" y2="88" />
        <line x1="4" x2="4" y1="14" y2="88" />
        <path d={chart.path} />
        {chart.points.map((point) => (
          <circle cx={point.x} cy={point.y} key={`${point.date}-${point.rankScore}`} r="1.8" />
        ))}
      </svg>
      <div className="rank-axis-labels">
        <span>{chart.minRankScore}점</span>
        <span>{chart.maxRankScore}점</span>
      </div>
      <div className="rank-date-labels">
        {chart.points.map((point) => (
          <span key={point.date}>{point.label}</span>
        ))}
      </div>
      {latest ? (
        <p className="rank-current-label">
          최신 포인트: {latest.tier} · 누적 {latest.rankScore}점
        </p>
      ) : null}
    </section>
  );
}
