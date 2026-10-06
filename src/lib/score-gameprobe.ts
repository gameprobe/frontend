import type { MatchResult, MatchSummary } from "../types";

export type GameProbeGrade = "S" | "A" | "B" | "C" | "D" | "E";

export const GRADE_THRESHOLDS = [
  { grade: "S", minScore: 850 },
  { grade: "A", minScore: 750 },
  { grade: "B", minScore: 600 },
  { grade: "C", minScore: 450 },
  { grade: "D", minScore: 300 },
  { grade: "E", minScore: 0 },
] as const satisfies ReadonlyArray<{ grade: GameProbeGrade; minScore: number }>;

const SCORE_WEIGHTS = {
  averageCombatScore: 30,
  kd: 25,
  adr: 15,
  result: 10,
  headshotPercentage: 10,
  assists: 5,
  survival: 5,
} as const;

export interface MatchScoreInput {
  averageCombatScore?: number | null;
  kills?: number | null;
  deaths?: number | null;
  assists?: number | null;
  adr?: number | null;
  result?: MatchResult | null;
  headshotPercentage?: number | null;
  totalRounds?: number | null;
}

export interface GameProbeScore {
  score: number;
  grade: GameProbeGrade;
}

export interface GameProbeProfileScore extends GameProbeScore {
  usedCount: number;
}

function hasNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function normalizeResult(result: MatchResult): number | null {
  if (result === "win") {
    return 1;
  }

  if (result === "draw") {
    return 0.5;
  }

  if (result === "loss") {
    return 0;
  }

  return null;
}

function gradeForScore(score: number): GameProbeGrade {
  return GRADE_THRESHOLDS.find((threshold) => score >= threshold.minScore)?.grade ?? "E";
}

function weightedComponent(
  components: Array<{ normalized: number | null; weight: number }>,
): GameProbeScore | null {
  const validComponents = components.filter((component) => component.normalized !== null);
  const weightSum = validComponents.reduce((sum, component) => sum + component.weight, 0);

  if (weightSum === 0) {
    return null;
  }

  // Missing inputs are excluded instead of being counted as zero. The remaining
  // component weights are redistributed through the weighted-average denominator.
  const normalizedScore = validComponents.reduce((sum, component) => (
    sum + clamp01(component.normalized ?? 0) * component.weight
  ), 0) / weightSum;
  const score = Math.round(clamp(normalizedScore * 1000, 0, 1000));

  return {
    score,
    grade: gradeForScore(score),
  };
}

export function computeMatchScore(input: MatchScoreInput): GameProbeScore | null {
  const kd = hasNumber(input.kills) && hasNumber(input.deaths)
    ? input.deaths === 0
      ? input.kills
      : input.kills / input.deaths
    : null;
  const result = input.result ? normalizeResult(input.result) : null;
  const survival = hasNumber(input.deaths) && hasNumber(input.totalRounds) && input.totalRounds > 0
    ? 1 - input.deaths / input.totalRounds
    : null;

  return weightedComponent([
    {
      normalized: hasNumber(input.averageCombatScore)
        ? clamp01(input.averageCombatScore / 350)
        : null,
      weight: SCORE_WEIGHTS.averageCombatScore,
    },
    {
      normalized: kd !== null ? clamp01(kd / 2) : null,
      weight: SCORE_WEIGHTS.kd,
    },
    {
      normalized: hasNumber(input.adr) ? clamp01(input.adr / 200) : null,
      weight: SCORE_WEIGHTS.adr,
    },
    {
      normalized: result,
      weight: SCORE_WEIGHTS.result,
    },
    {
      normalized: hasNumber(input.headshotPercentage)
        ? clamp01(input.headshotPercentage / 50)
        : null,
      weight: SCORE_WEIGHTS.headshotPercentage,
    },
    {
      normalized: hasNumber(input.assists) ? clamp01(input.assists / 12) : null,
      weight: SCORE_WEIGHTS.assists,
    },
    {
      normalized: survival !== null ? clamp01(survival) : null,
      weight: SCORE_WEIGHTS.survival,
    },
  ]);
}

export function matchSummaryToScoreInput(match: MatchSummary): MatchScoreInput {
  return {
    averageCombatScore: match.stats.averageCombatScore,
    kills: match.stats.kills,
    deaths: match.stats.deaths,
    assists: match.stats.assists,
    adr: match.stats.adr,
    result: match.result,
    headshotPercentage: match.stats.headshotPercentage,
    totalRounds: match.score.roundsWon + match.score.roundsLost,
  };
}

export function computeMatchSummaryScore(match: MatchSummary): GameProbeScore | null {
  return computeMatchScore(matchSummaryToScoreInput(match));
}

export function computeProfileScore(matches: MatchSummary[]): GameProbeProfileScore | null {
  const matchScores = matches
    .map((match) => computeMatchSummaryScore(match))
    .filter((score): score is GameProbeScore => score !== null);

  if (matchScores.length === 0) {
    return null;
  }

  const score = Math.round(
    matchScores.reduce((sum, matchScore) => sum + matchScore.score, 0) / matchScores.length,
  );

  return {
    score,
    grade: gradeForScore(score),
    usedCount: matchScores.length,
  };
}

export function getGameProbeGrade(score: number): GameProbeGrade {
  return gradeForScore(clamp(Math.round(score), 0, 1000));
}
