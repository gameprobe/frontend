import type { ProfileSidebarStats } from "../types/profile-sidebar";

export const profileSidebarStats: ProfileSidebarStats[] = [
  {
    puuid: "demo-puuid-seoul-duelist-001",
    sampleLabel: "최근 20경기 Mock 기준",
    peakRank: "Diamond 2",
    roleWinRates: [
      { role: "Duelist", matchesPlayed: 8, wins: 5, losses: 3, winRate: 63 },
      { role: "Initiator", matchesPlayed: 5, wins: 2, losses: 3, winRate: 40 },
      { role: "Controller", matchesPlayed: 4, wins: 3, losses: 1, winRate: 75 },
      { role: "Sentinel", matchesPlayed: 3, wins: 2, losses: 1, winRate: 67 },
    ],
    accuracy: {
      head: 31,
      body: 62,
      legs: 7,
    },
    topWeapons: [
      { weaponId: "vandal", displayName: "Vandal", kills: 142, headshotPercentage: 32 },
      { weaponId: "phantom", displayName: "Phantom", kills: 96, headshotPercentage: 27 },
      { weaponId: "operator", displayName: "Operator", kills: 48, headshotPercentage: 24 },
    ],
    mapWinRates: [
      { mapId: "ascent", displayName: "Ascent", matchesPlayed: 8, wins: 5, losses: 3, winRate: 63 },
      { mapId: "haven", displayName: "Haven", matchesPlayed: 6, wins: 3, losses: 3, winRate: 50 },
      { mapId: "split", displayName: "Split", matchesPlayed: 6, wins: 4, losses: 2, winRate: 67 },
    ],
    activityByTimeSlot: [
      { label: "Evening", matchesPlayed: 8 },
      { label: "Night", matchesPlayed: 6 },
      { label: "Afternoon", matchesPlayed: 4 },
      { label: "Morning", matchesPlayed: 2 },
    ],
    frequentTeammates: [
      { riotId: "ClutchKayo#KR1", matchesPlayed: 6, wins: 4, losses: 2, winRate: 67 },
      { riotId: "SmokeMain#KR1", matchesPlayed: 5, wins: 3, losses: 2, winRate: 60 },
      { riotId: "AnchorKilljoy#KR1", matchesPlayed: 4, wins: 3, losses: 1, winRate: 75 },
      { riotId: "MarketSage#KR1", matchesPlayed: 3, wins: 1, losses: 2, winRate: 33 },
    ],
  },
];
