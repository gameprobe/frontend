import type { MatchSummary } from "./match";

export type MatchHighlightSource = "derived" | "mock";
export type MatchHighlightKind = "positive" | "negative";

export interface MatchHighlightTag {
  kind: MatchHighlightKind;
  label: string;
  code: string;
  source: MatchHighlightSource;
  evidence: string;
}

export interface MatchTierChange {
  from?: string;
  to?: string;
  rrDelta?: number;
}

export interface MatchInsight {
  matchId: string;
  // Mock/aggregated KAST. Future Backend aggregation should derive this from
  // raw round participation events, not from VAL-MATCH-V1 summary fields.
  kast: number | null;
  // Mock/aggregated damage fields for DDΔ/R.
  damageDealt?: number;
  damageReceived?: number;
  roundsPlayed?: number;
  tierChange?: MatchTierChange;
  // Event-based tags are displayed only when explicitly present here.
  highlightTags: MatchHighlightTag[];
}

export interface DailyMatchGroup {
  dateKey: string;
  dateLabel: string;
  matches: MatchSummary[];
  count: number;
  wins: number;
  losses: number;
  avgKd: number | null;
  avgDdDeltaPerRound: number | null;
  avgHeadshotPercentage: number | null;
  avgAcs: number | null;
}
