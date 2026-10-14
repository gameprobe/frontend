import type { RiotId } from "@/lib/riot-id";
import { agentName, mapName } from "@/data/game-names";

/** 매치 상세(Figma 03 섹션 54:182~54:928) 예시 데이터. 프로필 첫 경기(선셋 13:4)의 상세다. */

export type TeamSide = "ours" | "theirs";

/** 라운드 종료 방식: K 전원 처치, B 스파이크 폭파, D 스파이크 해체, T 시간 종료 */
export type RoundEnd = "K" | "B" | "D" | "T";

export type MatchPlayer = RiotId & {
  side: TeamSide;
  agentId: string;
  agentName: string;
  tier: string;
  badge?: "팀 MVP" | "MVP";
  isMe?: boolean;
  acs: number;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  headshot: number;
  firstKills: number;
  firstDeaths: number;
  multiKills: number;
  clutches: number;
  avgLoadout: number;
  avgSpend: number;
};

export type MatchRound = {
  number: number;
  winner: TeamSide;
  end: RoundEnd;
  /** 우리 팀 기준 공격/수비 */
  ourSide: "공격" | "수비";
  oursLoadout: number;
  theirsLoadout: number;
  firstKill: string;
};

export type MatchDetail = {
  id: string;
  /** 이 경기를 기록한 플레이어 (뒤로 가기 링크) */
  owner: RiotId;
  mapId: string;
  mapName: string;
  queue: string;
  ago: string;
  durationMin: number;
  result: "win" | "loss";
  score: [number, number];
  rrChange: number;
  averageTier: { ours: string; theirs: string };
  players: MatchPlayer[];
  rounds: MatchRound[];
};

type PlayerRow = [
  side: TeamSide,
  gameName: string,
  tagLine: string,
  agentId: string,
  agentName: string,
  tier: string,
  stats: [acs: number, kills: number, deaths: number, assists: number, adr: number, headshot: number, firstKills: number],
  economy: [avgLoadout: number, avgSpend: number, firstDeaths: number, multiKills: number, clutches: number],
  extra?: { badge?: MatchPlayer["badge"]; isMe?: boolean },
];

const PLAYER_ROWS: PlayerRow[] = [
  ["ours", "후방주의", "1004", "fade", agentName("fade"), "초월자 2", [271, 16, 12, 4, 173, 17, 2], [4034, 3305, 1, 0, 1], { badge: "팀 MVP" }],
  ["ours", "숏피크", "KR2", "killjoy", agentName("killjoy"), "플래티넘 1", [260, 14, 13, 4, 166, 20, 5], [4181, 3183, 3, 3, 0]],
  ["ours", "프로브", "KR1", "jett", agentName("jett"), "다이아몬드 2", [256, 13, 12, 6, 164, 27, 2], [4374, 3229, 5, 4, 1], { isMe: true }],
  ["ours", "레몬에이드", "3333", "deadlock", agentName("deadlock"), "초월자 1", [239, 10, 12, 8, 153, 29, 5], [4095, 3637, 4, 4, 1]],
  ["ours", "클러치머신", "KR1", "sova", agentName("sova"), "플래티넘 3", [207, 7, 11, 5, 132, 34, 5], [3431, 3200, 5, 2, 1]],
  ["theirs", "플래시뱅", "KR1", "clove", agentName("clove"), "다이아몬드 2", [283, 18, 14, 2, 181, 27, 3], [4500, 2934, 1, 0, 1], { badge: "MVP" }],
  ["theirs", "하프바이", "KR2", "omen", agentName("omen"), "골드 2", [245, 14, 10, 6, 157, 14, 1], [3519, 3269, 5, 1, 2]],
  ["theirs", "플래시뱅", "APAC", "kayo", agentName("kayo"), "다이아몬드 2", [234, 11, 11, 3, 150, 32, 0], [4043, 3391, 4, 0, 0]],
  ["theirs", "한입에헤드", "0420", "iso", agentName("iso"), "초월자 2", [210, 9, 15, 5, 134, 20, 0], [3689, 3420, 3, 4, 1]],
  ["theirs", "레몬에이드", "0420", "gekko", agentName("gekko"), "다이아몬드 1", [201, 8, 12, 6, 129, 16, 3], [4238, 3646, 3, 2, 1]],
];

const PLAYERS: MatchPlayer[] = PLAYER_ROWS.map(
  ([side, gameName, tagLine, agentId, agentName, tier, stats, economy, extra]) => {
    const [acs, kills, deaths, assists, adr, headshot, firstKills] = stats;
    const [avgLoadout, avgSpend, firstDeaths, multiKills, clutches] = economy;
    return {
      side,
      gameName,
      tagLine,
      agentId,
      agentName,
      tier,
      ...extra,
      acs,
      kills,
      deaths,
      assists,
      adr,
      headshot,
      firstKills,
      firstDeaths,
      multiKills,
      clutches,
      avgLoadout,
      avgSpend,
    };
  },
);

/**
 * 라운드: [승리 팀, 종료 방식, 우리 팀 장비 막대 높이(px), 상대 팀 막대 높이(px)].
 * 막대 높이는 시안 그래프(200px) 값이고, 1px ≈ 122크레딧으로 환산한다(1라운드 3,636 기준).
 */
const ROUND_ROWS: [TeamSide, RoundEnd, number, number][] = [
  ["ours", "B", 29.8, 29.8],
  ["ours", "B", 165.2, 185.1],
  ["ours", "B", 169.1, 73.6],
  ["ours", "B", 147.3, 43.8],
  ["theirs", "K", 175.1, 179.1],
  ["ours", "K", 183.1, 139.3],
  ["ours", "K", 149.3, 47.8],
  ["ours", "K", 183.1, 141.3],
  ["theirs", "K", 173.1, 55.7],
  ["ours", "B", 175.1, 139.3],
  ["ours", "K", 137.3, 35.8],
  ["theirs", "K", 155.2, 41.8],
  ["ours", "D", 27.9, 29.8],
  ["theirs", "K", 155.2, 137.3],
  ["ours", "K", 149.3, 145.3],
  ["ours", "D", 169.1, 175.1],
  ["ours", "D", 165.2, 179.1],
];

const CREDITS_PER_PX = 122;
const toCredits = (px: number) => Math.round((px * CREDITS_PER_PX) / 10) * 10;

/** 첫 킬은 시안에 1라운드(한입에헤드)만 있어, 나머지는 라운드 승리 팀 선수를 순서대로 배정한 예시다. */
function firstKillFor(round: number, winner: TeamSide): string {
  if (round === 1) return "한입에헤드";
  const team = PLAYERS.filter((player) => player.side === winner);
  return team[(round * 2) % team.length].gameName;
}

const ROUNDS: MatchRound[] = ROUND_ROWS.map(([winner, end, oursPx, theirsPx], index) => {
  const number = index + 1;
  return {
    number,
    winner,
    end,
    ourSide: number <= 12 ? "공격" : "수비",
    // 1라운드 장비 가치는 시안의 라운드 상세 값
    oursLoadout: number === 1 ? 3636 : toCredits(oursPx),
    theirsLoadout: number === 1 ? 3867 : toCredits(theirsPx),
    firstKill: firstKillFor(number, winner),
  };
});

export const DEMO_MATCH: MatchDetail = {
  id: "demo-match-001",
  owner: { gameName: "프로브", tagLine: "KR1" },
  mapId: "sunset",
  mapName: mapName("sunset"),
  queue: "경쟁전",
  ago: "32분 전",
  durationMin: 35,
  result: "win",
  score: [13, 4],
  rrChange: 23,
  averageTier: { ours: "다이아몬드 2", theirs: "다이아몬드 2" },
  players: PLAYERS,
  rounds: ROUNDS,
};

export const ROUND_END_LABELS: Record<RoundEnd, string> = {
  K: "처치",
  B: "스파이크 폭파",
  D: "해체",
  T: "시간 종료",
};

/** 라운드 상세 제목용 종료 방식 */
export const ROUND_END_TITLES: Record<RoundEnd, string> = {
  K: "전원 처치",
  B: "스파이크 폭파",
  D: "스파이크 해체",
  T: "시간 종료",
};

/** 우리 팀 장비 가치로 라운드 유형을 나눈다. 1·13라운드는 권총전. */
export function roundType(round: MatchRound): string {
  if (round.number === 1 || round.number === 13) return "권총전";
  if (round.oursLoadout < 9000) return "에코";
  if (round.oursLoadout < 16000) return "포스 바이";
  return "풀 바이";
}

export function getMatchDetail(matchId: string): MatchDetail | undefined {
  return matchId === DEMO_MATCH.id ? DEMO_MATCH : undefined;
}
