import type { MatchSummary } from "./match";

export interface RiotId {
  gameName: string;
  tagLine: string;
}

export interface AgentPlayRate {
  // Mock/aggregated field. Future Backend aggregation can map this slug to
  // VAL-CONTENT-V1 identifiers; VAL-MATCH-V1 does not provide this summary directly.
  agentId: string;
  displayName: string;
  matchesPlayed: number;
  winRate: number;
}

export interface PlayerStatsSummary {
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  averageCombatScore: number;
  // Mock/aggregated field. Future Backend aggregation should derive this from
  // match history; it is not a direct Riot Match API field.
  topAgents: AgentPlayRate[];
}

export interface Player {
  puuid: string;
  riotId: RiotId;
  currentRank: string;
  statsSummary: PlayerStatsSummary;
  recentMatches: MatchSummary[];
}
