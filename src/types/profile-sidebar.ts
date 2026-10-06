export interface ProfileRoleWinRate {
  role: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface ProfileAccuracyDistribution {
  head: number;
  body: number;
  legs: number;
}

export interface ProfileWeaponStat {
  weaponId: string;
  displayName: string;
  kills: number;
  headshotPercentage: number;
}

export interface ProfileMapWinRate {
  mapId: string;
  displayName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface ProfileActivitySlot {
  label: string;
  matchesPlayed: number;
}

export interface ProfileTeammateStat {
  riotId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface ProfileSidebarStats {
  puuid: string;
  sampleLabel: string;
  peakRank: string;
  roleWinRates: ProfileRoleWinRate[];
  accuracy: ProfileAccuracyDistribution;
  topWeapons: ProfileWeaponStat[];
  mapWinRates: ProfileMapWinRate[];
  activityByTimeSlot: ProfileActivitySlot[];
  frequentTeammates: ProfileTeammateStat[];
}
