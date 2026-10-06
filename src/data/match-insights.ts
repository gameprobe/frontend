import type { MatchInsight } from "../types/match-insight";

export const matchInsights: MatchInsight[] = [
  {
    matchId: "mock-match-ascent-001",
    kast: 78,
    damageDealt: 3784,
    damageReceived: 3110,
    roundsPlayed: 22,
    tierChange: {
      from: "Diamond 1",
      to: "Diamond 1",
      rrDelta: 18,
    },
    highlightTags: [
      {
        kind: "positive",
        label: "3K 2회",
        code: "MULTIKILL_3K",
        source: "mock",
        evidence: "MatchInsight Mock 이벤트 근거",
      },
    ],
  },
  {
    matchId: "mock-match-haven-002",
    kast: 64,
    damageDealt: 3036,
    damageReceived: 3197,
    roundsPlayed: 23,
    tierChange: {
      from: "Diamond 1",
      to: "Diamond 1",
      rrDelta: -16,
    },
    highlightTags: [],
  },
  {
    matchId: "mock-match-split-003",
    kast: 81,
    damageDealt: 3160,
    damageReceived: 2600,
    roundsPlayed: 20,
    tierChange: {
      from: "Platinum 3",
      to: "Diamond 1",
      rrDelta: 24,
    },
    highlightTags: [
      {
        kind: "positive",
        label: "1v1 클러치",
        code: "CLUTCH_1V1",
        source: "mock",
        evidence: "MatchInsight Mock 이벤트 근거",
      },
    ],
  },
];
