import type { MatchPeriodFilter, RankHistoryPoint } from "../types/profile-overview";

interface ChartPoint {
  date: string;
  label: string;
  rankScore: number;
  tier: string;
  x: number;
  y: number;
}

interface ChartModel {
  points: ChartPoint[];
  path: string;
  minRankScore: number;
  maxRankScore: number;
}

const PERIOD_DAYS: Partial<Record<MatchPeriodFilter, number>> = {
  "60d": 60,
  "30d": 30,
  "7d": 7,
};

export function filterRankHistory(
  points: RankHistoryPoint[],
  period: MatchPeriodFilter,
): RankHistoryPoint[] {
  const days = PERIOD_DAYS[period];

  if (!days || points.length === 0) {
    return points;
  }

  const latest = new Date(points[points.length - 1].date).getTime();
  const earliest = latest - days * 24 * 60 * 60 * 1000;

  return points.filter((point) => new Date(point.date).getTime() >= earliest);
}

export function buildRankHistoryChart(points: RankHistoryPoint[]): ChartModel {
  const rankScores = points.map((point) => point.rankScore);
  const minRankScore = Math.min(...rankScores);
  const maxRankScore = Math.max(...rankScores);
  const range = Math.max(1, maxRankScore - minRankScore);
  const chartPoints = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 88 - ((point.rankScore - minRankScore) / range) * 70;

    return {
      date: point.date,
      label: point.date.slice(5).replace("-", "."),
      rankScore: point.rankScore,
      tier: point.tier,
      x,
      y,
    };
  });
  const path = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  return {
    points: chartPoints,
    path,
    minRankScore,
    maxRankScore,
  };
}
