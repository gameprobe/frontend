export type MatchResult = string;

export type ValorantTeam = string;

export interface WeaponSummary {
  // Mock/aggregated field. Future Backend aggregation can map this slug to
  // VAL-CONTENT-V1 identifiers; VAL-MATCH-V1 does not provide this as a direct
  // match summary field.
  weaponId: string;
  displayName: string;
}

export interface CombatStats {
  kills: number;
  deaths: number;
  assists: number;
  averageCombatScore: number;
  firstKills?: number; // Mock/aggregated field
  firstDeaths?: number; // Mock/aggregated field
  multiKills?: number; // Mock/aggregated field
  damageDealt?: number; // Mock/aggregated field
  damageReceived?: number; // Mock/aggregated field
  // Mock/aggregated field. In production this should be derived from Riot Match
  // API raw damage events in Backend aggregation, not treated as a direct API value.
  adr: number;
  // Mock/aggregated field. In production this should be derived from Riot Match
  // API raw damage events in Backend aggregation, not treated as a direct API value.
  headshotPercentage: number;
}

export interface MatchSummary {
  matchId: string;
  map: string;
  mapId: string;
  mode: string;
  startedAt: string;
  result: MatchResult;
  agent: string;
  agentId: string;
  team: ValorantTeam;
  score: {
    roundsWon: number;
    roundsLost: number;
  };
  stats: CombatStats;
  // Mock/aggregated field. Represents the main weapon inferred from kill events;
  // future Backend aggregation should derive it from VAL-MATCH-V1 raw events.
  primaryWeapon: WeaponSummary;
}

// Mock/aggregated field. Production data should be derived from match kill events.
export interface WeaponKillBreakdown {
  weaponId: string;
  displayName: string;
  kills: number;
}

// Mock/aggregated field. Production data should be aggregated per opponent.
export interface DuelRecord {
  opponentPuuid: string;
  kills: number;
  deaths: number;
}

export interface MatchParticipant {
  puuid: string;
  riotId: {
    gameName: string;
    tagLine: string;
  };
  team: ValorantTeam;
  agent: string;
  agentId: string;
  stats: CombatStats;
  weaponKills?: WeaponKillBreakdown[]; // Mock/aggregated field
  duels?: DuelRecord[]; // Mock/aggregated field
}

// Mock/aggregated field. Coordinates are normalized to the 0-1 range.
export interface MapPoint {
  x: number;
  y: number;
}

// Mock/aggregated field. Production data should be derived from Riot match events.
export interface RoundKillEvent {
  killerPuuid: string;
  victimPuuid: string;
  weaponId: string;
  displayName?: string; // Mock/aggregated field
  timeSeconds: number;
  isFirstKill?: boolean; // Mock/aggregated field
  isHeadshot?: boolean; // Mock/aggregated field
  killerPos?: MapPoint; // Mock/aggregated field
  victimPoint?: MapPoint; // Mock/aggregated field
}

export interface MatchRound {
  roundNumber: number;
  winningTeam: ValorantTeam;
  endType: string;
  scoreAfterRound: {
    attackers: number;
    defenders: number;
  };
  killEvents?: RoundKillEvent[]; // Mock/aggregated field
  economy?: { // Mock/aggregated field
    attackersLoadout: number;
    defendersLoadout: number;
    attackersBank?: number; // Mock/aggregated field
    defendersBank?: number; // Mock/aggregated field
  };
}

export interface MatchDetail {
  matchId: string;
  map: string;
  mode: string;
  startedAt: string;
  durationSeconds: number;
  participants: MatchParticipant[];
  rounds: MatchRound[];
}
