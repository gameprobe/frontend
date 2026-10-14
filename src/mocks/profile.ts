import type { AgentRole } from "@/lib/assets";
import type { RiotId } from "@/lib/riot-id";
import { agentName, mapName, weaponInfo } from "@/data/game-names";

/** 플레이어 프로필(Figma 02 섹션 53:421~54:2) 예시 데이터. 값은 시안에 그려진 그대로다. */

export type MatchResult = "win" | "loss";

export type ProfileMatch = {
  id: string;
  result: MatchResult;
  /** 날짜 묶음 제목 (예: '오늘 · 10월 8일') */
  day: string;
  /** 행에 표시하는 경과 시간 (예: '32분 전') */
  ago: string;
  agentId: string;
  agentName: string;
  mapName: string;
  queue: "경쟁전";
  durationMin: number;
  score: [number, number];
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  acs: number;
  headshot: number;
  rrChange: number;
  /** RR 변동 대신 표시하는 배지 (시안: 'MVP', '팀 MVP') */
  badge?: string;
};

export type AgentStat = {
  agentId: string;
  name: string;
  role: AgentRole;
  matches: number;
  winRate: number;
  kda: number;
  acs: number;
  headshot: number;
  adr: number;
  firstKills: number;
};

export type MapStat = {
  mapId: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  acs: number;
  firstKillRate: number;
  attackWinRate: number;
  defenseWinRate: number;
};

export type WeaponStat = {
  weaponId: string;
  name: string;
  category: string;
  kills: number;
  killShare: number;
  headshot: number;
  damagePerRound: number;
  /** 머리 · 몸통 · 다리 비율(%) */
  hits: [number, number, number];
};

export type PlayerProfile = RiotId & {
  agentId: string;
  level: number;
  tier: string;
  server: string;
  updatedAgo: string;
  rank: {
    act: string;
    tier: string;
    rr: number;
    peakTier: string;
    peakAct: string;
  };
  summary: {
    winRate: number;
    wins: number;
    losses: number;
    kd: number;
    kda: number;
    acs: number;
    adr: number;
    headshot: number;
    kast: number;
  };
  recent20: {
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
    rating: number;
    killParticipation: number;
    agents: { agentId: string; name: string; winRate: number; wins: number; losses: number; rating: number }[];
  };
  hitParts: { label: string; percent: number; count: number }[];
  roles: { role: AgentRole; share: number; winRate: number; rating: number }[];
  teammates: (RiotId & { agentId: string; matches: number; winRate: number })[];
  matches: ProfileMatch[];
  agents: AgentStat[];
  maps: MapStat[];
  weapons: WeaponStat[];
};

type MatchRow = [
  result: MatchResult,
  day: string,
  ago: string,
  agentId: string,
  mapName: string,
  durationMin: number,
  score: [number, number],
  kda: [number, number, number, number],
  acs: number,
  headshot: number,
  rrChange: number,
  badge?: string,
];

const TODAY = "오늘 · 10월 8일";
const YESTERDAY = "어제 · 10월 7일";

const MATCH_ROWS: MatchRow[] = [
  ["win", TODAY, "32분 전", "jett", mapName("sunset"), 35, [13, 4], [13, 12, 6, 1.58], 256, 27, 23],
  ["win", TODAY, "2시간 전", "astra", mapName("breeze"), 40, [13, 7], [16, 17, 7, 1.35], 266, 21, 24],
  ["win", TODAY, "5시간 전", "jett", mapName("sunset"), 32, [13, 3], [9, 14, 5, 1.0], 245, 29, 18],
  ["loss", YESTERDAY, "어제", "jett", mapName("sunset"), 36, [8, 13], [17, 13, 7, 1.85], 263, 22, -20],
  ["loss", YESTERDAY, "어제", "jett", mapName("icebox"), 30, [3, 13], [14, 14, 3, 1.21], 288, 16, -15, "팀 MVP"],
  ["loss", "2일 전 · 10월 6일", "2일 전", "skye", mapName("sunset"), 28, [5, 13], [12, 11, 7, 1.73], 256, 28, -13],
  ["loss", "2일 전 · 10월 6일", "2일 전", "jett", mapName("split"), 29, [8, 13], [16, 13, 7, 1.77], 261, 20, -12],
  ["win", "3일 전 · 10월 5일", "3일 전", "skye", mapName("bind"), 40, [13, 8], [19, 19, 9, 1.47], 269, 32, 14, "MVP"],
  ["loss", "3일 전 · 10월 5일", "3일 전", "skye", mapName("pearl"), 38, [4, 13], [15, 11, 4, 1.73], 271, 28, -15],
  ["win", "4일 전 · 10월 4일", "4일 전", "skye", mapName("sunset"), 34, [13, 4], [10, 13, 3, 1.0], 248, 25, 17],
  ["win", "5일 전 · 10월 3일", "5일 전", "astra", mapName("split"), 41, [13, 7], [22, 12, 5, 2.25], 317, 17, 16],
  ["loss", "5일 전 · 10월 3일", "5일 전", "astra", mapName("bind"), 32, [5, 13], [19, 12, 5, 2.0], 318, 21, -19],
  ["win", "6일 전 · 10월 2일", "6일 전", "astra", mapName("pearl"), 45, [13, 5], [10, 12, 5, 1.25], 229, 16, 17],
  ["win", "7일 전 · 10월 1일", "7일 전", "jett", mapName("pearl"), 29, [13, 3], [11, 14, 6, 1.21], 241, 33, 18],
  ["loss", "8일 전 · 9월 30일", "8일 전", "raze", mapName("sunset"), 33, [8, 13], [20, 17, 6, 1.53], 282, 24, -18],
  ["win", "9일 전 · 9월 29일", "9일 전", "raze", mapName("icebox"), 46, [13, 10], [22, 20, 9, 1.55], 313, 32, 17],
  ["win", "14일 전 · 9월 24일", "14일 전", "jett", mapName("split"), 37, [13, 5], [16, 10, 6, 2.2], 289, 20, 17],
  ["win", "15일 전 · 9월 23일", "15일 전", "jett", mapName("bind"), 39, [13, 4], [17, 13, 4, 1.62], 286, 26, 21],
  ["win", "16일 전 · 9월 22일", "16일 전", "raze", mapName("lotus"), 45, [13, 11], [27, 13, 4, 2.38], 335, 26, 17],
  ["win", "21일 전 · 9월 17일", "21일 전", "raze", mapName("lotus"), 43, [13, 3], [15, 12, 5, 1.67], 273, 21, 20],
];

const MATCHES: ProfileMatch[] = MATCH_ROWS.map(
  ([result, day, ago, agentId, mapName, durationMin, score, [kills, deaths, assists, kda], acs, headshot, rrChange, badge], index) => ({
    id: `demo-match-${String(index + 1).padStart(3, "0")}`,
    result,
    day,
    ago,
    agentId,
    agentName: agentName(agentId),
    mapName,
    queue: "경쟁전",
    durationMin,
    score,
    kills,
    deaths,
    assists,
    kda,
    acs,
    headshot,
    rrChange,
    badge,
  }),
);

export const PROBE_PROFILE: PlayerProfile = {
  gameName: "프로브",
  tagLine: "KR1",
  agentId: "jett",
  level: 212,
  tier: "다이아몬드 2",
  server: "한국 서버",
  updatedAgo: "3분 전",
  rank: { act: "V26 액트 5", tier: "다이아몬드 2", rr: 64, peakTier: "초월자 1", peakAct: "V26 액트 3" },
  summary: { winRate: 65, wins: 13, losses: 7, kd: 1.18, kda: 1.59, acs: 275, adr: 176, headshot: 24, kast: 67 },
  recent20: {
    avgKills: 13.4,
    avgDeaths: 10.8,
    avgAssists: 5.2,
    rating: 1.72,
    killParticipation: 48,
    agents: [
      { agentId: "jett", name: agentName("jett"), winRate: 64, wins: 7, losses: 4, rating: 1.62 },
      { agentId: "astra", name: agentName("astra"), winRate: 100, wins: 2, losses: 0, rating: 1.92 },
      { agentId: "skye", name: agentName("skye"), winRate: 43, wins: 3, losses: 4, rating: 1.31 },
    ],
  },
  hitParts: [
    { label: "머리", percent: 24.0, count: 3174 },
    { label: "몸통", percent: 66.6, count: 8807 },
    { label: "다리", percent: 9.4, count: 1243 },
  ],
  roles: [
    { role: "duelist", share: 55, winRate: 68, rating: 1.58 },
    { role: "controller", share: 25, winRate: 67, rating: 1.82 },
    { role: "sentinel", share: 12, winRate: 40, rating: 1.21 },
    { role: "initiator", share: 8, winRate: 50, rating: 1.08 },
  ],
  teammates: [
    { gameName: "달빛", tagLine: "KR2", agentId: "jett", matches: 6, winRate: 83 },
    { gameName: "레몬", tagLine: "0001", agentId: "astra", matches: 4, winRate: 100 },
    { gameName: "야간조", tagLine: "KR1", agentId: "skye", matches: 3, winRate: 67 },
    { gameName: "라디", tagLine: "7777", agentId: "jett", matches: 2, winRate: 50 },
  ],
  matches: MATCHES,
  agents: [
    { agentId: "jett", name: agentName("jett"), role: "duelist", matches: 8, winRate: 63, kda: 1.52, acs: 266, headshot: 24, adr: 168, firstKills: 24 },
    { agentId: "astra", name: agentName("astra"), role: "controller", matches: 4, winRate: 75, kda: 1.68, acs: 283, headshot: 19, adr: 181, firstKills: 9 },
    { agentId: "skye", name: agentName("skye"), role: "initiator", matches: 4, winRate: 50, kda: 1.46, acs: 261, headshot: 28, adr: 149, firstKills: 6 },
    { agentId: "raze", name: agentName("raze"), role: "duelist", matches: 4, winRate: 75, kda: 1.74, acs: 301, headshot: 26, adr: 157, firstKills: 11 },
  ],
  maps: [
    { mapId: "sunset", name: mapName("sunset"), matches: 6, wins: 2, losses: 4, winRate: 33, kd: 1.21, acs: 248, firstKillRate: 22, attackWinRate: 36, defenseWinRate: 49 },
    { mapId: "split", name: mapName("split"), matches: 3, wins: 2, losses: 1, winRate: 67, kd: 1.34, acs: 262, firstKillRate: 27, attackWinRate: 66, defenseWinRate: 43 },
    { mapId: "bind", name: mapName("bind"), matches: 3, wins: 2, losses: 1, winRate: 67, kd: 1.18, acs: 241, firstKillRate: 19, attackWinRate: 48, defenseWinRate: 42 },
    { mapId: "pearl", name: mapName("pearl"), matches: 3, wins: 2, losses: 1, winRate: 67, kd: 1.42, acs: 271, firstKillRate: 31, attackWinRate: 65, defenseWinRate: 66 },
    { mapId: "icebox", name: mapName("icebox"), matches: 2, wins: 1, losses: 1, winRate: 50, kd: 1.09, acs: 233, firstKillRate: 18, attackWinRate: 51, defenseWinRate: 47 },
    { mapId: "lotus", name: mapName("lotus"), matches: 2, wins: 2, losses: 0, winRate: 100, kd: 1.65, acs: 289, firstKillRate: 35, attackWinRate: 58, defenseWinRate: 39 },
    { mapId: "breeze", name: mapName("breeze"), matches: 1, wins: 1, losses: 0, winRate: 100, kd: 1.51, acs: 276, firstKillRate: 29, attackWinRate: 68, defenseWinRate: 61 },
  ],
  weapons: [
    { weaponId: "vandal", name: weaponInfo("vandal").ko, category: weaponInfo("vandal").category, kills: 134, killShare: 42, headshot: 25, damagePerRound: 64, hits: [25, 64, 11] },
    { weaponId: "phantom", name: weaponInfo("phantom").ko, category: weaponInfo("phantom").category, kills: 75, killShare: 23, headshot: 30, damagePerRound: 46, hits: [30, 61, 9] },
    { weaponId: "operator", name: weaponInfo("operator").ko, category: weaponInfo("operator").category, kills: 36, killShare: 11, headshot: 8, damagePerRound: 58, hits: [8, 78, 14] },
    { weaponId: "sheriff", name: weaponInfo("sheriff").ko, category: weaponInfo("sheriff").category, kills: 25, killShare: 8, headshot: 26, damagePerRound: 60, hits: [26, 66, 8] },
    { weaponId: "spectre", name: weaponInfo("spectre").ko, category: weaponInfo("spectre").category, kills: 18, killShare: 6, headshot: 19, damagePerRound: 39, hits: [19, 69, 12] },
    { weaponId: "marshal", name: weaponInfo("marshal").ko, category: weaponInfo("marshal").category, kills: 14, killShare: 4, headshot: 11, damagePerRound: 59, hits: [11, 79, 10] },
    { weaponId: "ghost", name: weaponInfo("ghost").ko, category: weaponInfo("ghost").category, kills: 10, killShare: 3, headshot: 19, damagePerRound: 80, hits: [19, 68, 13] },
    { weaponId: "classic", name: weaponInfo("classic").ko, category: weaponInfo("classic").category, kills: 8, killShare: 3, headshot: 18, damagePerRound: 34, hits: [18, 73, 9] },
  ],
};

/**
 * 프로필 데이터 조회. 시안에는 프로브#KR1 한 명만 있어서, 다른 예시 플레이어는
 * 이름·대표 요원·티어만 바꾸고 같은 통계를 보여준다(백엔드 연결 전 임시).
 */
export function getMockProfile(identity: RiotId & { agentId: string; tier: string }): PlayerProfile {
  if (identity.gameName === PROBE_PROFILE.gameName && identity.tagLine === PROBE_PROFILE.tagLine) {
    return PROBE_PROFILE;
  }
  return {
    ...PROBE_PROFILE,
    gameName: identity.gameName,
    tagLine: identity.tagLine,
    agentId: identity.agentId,
    tier: identity.tier,
    rank: { ...PROBE_PROFILE.rank, tier: identity.tier },
  };
}
