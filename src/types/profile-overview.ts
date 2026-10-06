import type { GameProbeGrade } from "../lib/score-gameprobe";

export interface PlayerHeaderProfile {
  puuid: string;
  title: string;
  level: number;
  region: string;
  currentTier: string;
  currentTierId: string;
  avatarAgentId: string;
  badges: string[];
}

export type MatchQueueFilter = "all" | "competitive" | "unrated" | "swiftplay" | "spikerush" | "teamdeathmatch" | "deathmatch";
export type MatchPeriodFilter = "all" | "60d" | "30d" | "7d" | "custom";

export interface MatchFilterOption<TValue extends string> {
  label: string;
  value: TValue;
}

export interface MatchSeasonFilterOption {
  label: string;
  value: string;
}

export interface MatchFilterOptions {
  queueTypes: Array<MatchFilterOption<MatchQueueFilter>>;
  seasons: MatchSeasonFilterOption[];
  periods: Array<MatchFilterOption<MatchPeriodFilter>>;
}

export interface MatchFilterState {
  queueType: MatchQueueFilter;
  season: string;
  period: MatchPeriodFilter;
}

export interface CareerPeakRank {
  tier: string;
  tierImageId: string;
  rr: number;
  season: string;
  wins: number;
  losses: number;
  winRate: number;
}

export interface PreviousSeasonRank {
  season: string;
  tier: string;
  tierImageId: string;
  rr: number;
  wins: number;
  losses: number;
}

export interface SeasonSummary {
  // Mock/aggregated fields. These are not direct Riot API values.
  puuid: string;
  season: string;
  tier: string;
  tierImageId: string;
  rr: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  acs: number;
  adr: number;
  headshotPercentage: number;
  clutchWinRate: number;
  previewScore: number;
  previewGrade: GameProbeGrade;
}

export interface RankHistoryPoint {
  // Mock cumulative rank score history for the profile preview graph.
  // This is separate from the 0-100 RR shown inside the current tier card.
  date: string;
  rankScore: number;
  tier: string;
  tierImageId: string;
}

export interface RecentTwentySummary {
  // KAST, roundWinRate, and damage fields are mock/aggregated values.
  puuid: string;
  sampleLabel: string;
  previewScore: number;
  previewGrade: GameProbeGrade;
  wins: number;
  losses: number;
  winRate: number;
  roundsWon: number;
  roundsLost: number;
  roundWinRate: number;
  kast: number;
  acs: number;
  damageDealt: number;
  damageReceived: number;
  roundsPlayed: number;
}

export interface ProfileOverview {
  header: PlayerHeaderProfile;
  filterOptions: MatchFilterOptions;
  defaultFilter: MatchFilterState;
  careerPeakRank: CareerPeakRank;
  previousSeasonRanks: PreviousSeasonRank[];
  seasonSummary: SeasonSummary;
  rankHistory: RankHistoryPoint[];
  recentTwenty: RecentTwentySummary;
}
