import type { RiotId } from "@/lib/riot-id";

/** 04 랭킹 예시 데이터. 한국 · V26 액트 5만 있다. 값은 Figma 04 섹션(48:81)에 그려진 그대로다. */

export const RANKING_REGIONS = [
  { value: "kr", label: "한국" },
  { value: "ap", label: "아시아 태평양" },
  { value: "na", label: "북미" },
  { value: "eu", label: "유럽" },
] as const;

export const RANKING_ACTS = [
  { value: "v26a5", label: "V26 액트 5" },
  { value: "v26a4", label: "V26 액트 4" },
  { value: "v26a3", label: "V26 액트 3" },
] as const;

export type RankingRegion = (typeof RANKING_REGIONS)[number]["value"];
export type RankingAct = (typeof RANKING_ACTS)[number]["value"];

export type LeaderboardEntry = RiotId & {
  rank: number;
  tier: string;
  rr: number;
  wins: number;
  winRate: number;
  /** 주 요원 3명. 첫 번째가 대표 초상이다. */
  agentIds: string[];
};

// 1~3위의 승리·승률·주 요원 2~3번째는 시안(카드)에 없어서 채운 예시 값이다.
const LEADERBOARD_ROWS: Omit<LeaderboardEntry, "rank">[] = [
  { gameName: "숏피크90", tagLine: "KR2", tier: "레디언트", rr: 978, wins: 262, winRate: 68.1, agentIds: ["neon", "jett", "raze"] },
  { gameName: "새벽조준9", tagLine: "0420", tier: "레디언트", rr: 968, wins: 255, winRate: 67.4, agentIds: ["iso", "reyna", "jett"] },
  { gameName: "하프바이", tagLine: "0420", tier: "레디언트", rr: 953, wins: 251, winRate: 66.2, agentIds: ["viper", "omen", "astra"] },
  { gameName: "하프바이94", tagLine: "APAC", tier: "레디언트", rr: 944, wins: 248, winRate: 66.8, agentIds: ["omen", "killjoy", "astra"] },
  { gameName: "Rift", tagLine: "3333", tier: "레디언트", rr: 935, wins: 248, winRate: 67.1, agentIds: ["omen", "chamber", "gekko"] },
  { gameName: "스모크장인", tagLine: "KR2", tier: "레디언트", rr: 924, wins: 241, winRate: 66.9, agentIds: ["omen", "skye", "sage"] },
  { gameName: "클러치머신", tagLine: "3333", tier: "레디언트", rr: 913, wins: 238, winRate: 64.3, agentIds: ["yoru", "fade", "killjoy"] },
  { gameName: "한입에헤드", tagLine: "KR1", tier: "레디언트", rr: 898, wins: 241, winRate: 64.0, agentIds: ["fade", "jett", "clove"] },
  { gameName: "Zephyr", tagLine: "7171", tier: "레디언트", rr: 888, wins: 233, winRate: 64.9, agentIds: ["skye", "yoru", "deadlock"] },
  { gameName: "사이트앵커", tagLine: "APAC", tier: "레디언트", rr: 880, wins: 233, winRate: 65.4, agentIds: ["astra", "raze", "jett"] },
  { gameName: "플래시뱅", tagLine: "KR1", tier: "레디언트", rr: 869, wins: 232, winRate: 65.8, agentIds: ["gekko", "brimstone", "phoenix"] },
  { gameName: "타이밍맨", tagLine: "7171", tier: "레디언트", rr: 856, wins: 233, winRate: 65.4, agentIds: ["phoenix", "reyna", "yoru"] },
  { gameName: "에코라운드25", tagLine: "7171", tier: "레디언트", rr: 845, wins: 235, winRate: 65.7, agentIds: ["chamber", "astra", "deadlock"] },
  { gameName: "소나기", tagLine: "1004", tier: "레디언트", rr: 835, wins: 218, winRate: 64.9, agentIds: ["chamber", "viper", "phoenix"] },
  { gameName: "하프바이33", tagLine: "3333", tier: "레디언트", rr: 821, wins: 226, winRate: 65.3, agentIds: ["sage", "astra", "sova"] },
  { gameName: "달빛", tagLine: "1004", tier: "레디언트", rr: 813, wins: 218, winRate: 64.5, agentIds: ["phoenix", "cypher", "iso"] },
  { gameName: "Sable", tagLine: "0420", tier: "레디언트", rr: 801, wins: 218, winRate: 65.2, agentIds: ["astra", "gekko", "neon"] },
  { gameName: "리테이크", tagLine: "KR2", tier: "레디언트", rr: 787, wins: 225, winRate: 64.8, agentIds: ["breach", "yoru", "neon"] },
  { gameName: "칼바람", tagLine: "KR1", tier: "레디언트", rr: 778, wins: 211, winRate: 64.2, agentIds: ["viper", "iso", "sova"] },
  { gameName: "별빛사수", tagLine: "1004", tier: "레디언트", rr: 768, wins: 217, winRate: 63.9, agentIds: ["phoenix", "breach", "reyna"] },
  { gameName: "Lumen", tagLine: "7171", tier: "레디언트", rr: 758, wins: 212, winRate: 62.3, agentIds: ["chamber", "kayo", "yoru"] },
  { gameName: "빛의속도", tagLine: "3333", tier: "레디언트", rr: 747, wins: 218, winRate: 63.5, agentIds: ["chamber", "reyna", "killjoy"] },
  { gameName: "고요한밤", tagLine: "3333", tier: "레디언트", rr: 737, wins: 207, winRate: 63.9, agentIds: ["neon", "cypher", "jett"] },
  { gameName: "달빛74", tagLine: "KR1", tier: "레디언트", rr: 722, wins: 202, winRate: 61.8, agentIds: ["fade", "sova", "jett"] },
  { gameName: "에코라운드", tagLine: "KR2", tier: "레디언트", rr: 713, wins: 192, winRate: 64.0, agentIds: ["breach", "chamber", "reyna"] },
  { gameName: "풀바이", tagLine: "7171", tier: "레디언트", rr: 704, wins: 191, winRate: 63.3, agentIds: ["raze", "sage", "sova"] },
  { gameName: "Vanta67", tagLine: "3333", tier: "레디언트", rr: 690, wins: 200, winRate: 63.5, agentIds: ["gekko", "sova", "jett"] },
  { gameName: "Echo23", tagLine: "KR1", tier: "레디언트", rr: 682, wins: 202, winRate: 63.9, agentIds: ["kayo", "astra", "cypher"] },
  { gameName: "소나기52", tagLine: "KR1", tier: "레디언트", rr: 668, wins: 196, winRate: 63.2, agentIds: ["brimstone", "jett", "yoru"] },
  { gameName: "Echo", tagLine: "7171", tier: "레디언트", rr: 656, wins: 183, winRate: 62.5, agentIds: ["phoenix", "yoru", "omen"] },
  { gameName: "롱앵글", tagLine: "0420", tier: "불멸 3", rr: 649, wins: 192, winRate: 60.5, agentIds: ["harbor", "jett", "cypher"] },
  { gameName: "Kite1", tagLine: "APAC", tier: "불멸 3", rr: 633, wins: 198, winRate: 61.2, agentIds: ["neon", "deadlock", "skye"] },
  { gameName: "별빛사수39", tagLine: "KR2", tier: "불멸 3", rr: 625, wins: 180, winRate: 62.2, agentIds: ["phoenix", "iso", "fade"] },
  { gameName: "원탭요정", tagLine: "1004", tier: "불멸 3", rr: 612, wins: 180, winRate: 61.0, agentIds: ["skye", "iso", "reyna"] },
  { gameName: "아이스맨72", tagLine: "KOR", tier: "불멸 3", rr: 602, wins: 181, winRate: 61.2, agentIds: ["reyna", "viper", "cypher"] },
  { gameName: "별빛사수70", tagLine: "KR1", tier: "불멸 3", rr: 591, wins: 172, winRate: 61.9, agentIds: ["omen", "iso", "raze"] },
  { gameName: "새벽조준", tagLine: "KR2", tier: "불멸 3", rr: 579, wins: 169, winRate: 60.0, agentIds: ["breach", "jett", "chamber"] },
  { gameName: "침착한오멘", tagLine: "KR2", tier: "불멸 3", rr: 570, wins: 180, winRate: 62.1, agentIds: ["cypher", "brimstone", "clove"] },
  { gameName: "무빙황제", tagLine: "0420", tier: "불멸 3", rr: 559, wins: 174, winRate: 59.7, agentIds: ["kayo", "neon", "omen"] },
  { gameName: "Nova", tagLine: "KR2", tier: "불멸 3", rr: 545, wins: 170, winRate: 61.0, agentIds: ["harbor", "skye", "sage"] },
  { gameName: "Kite", tagLine: "KR2", tier: "불멸 3", rr: 534, wins: 175, winRate: 59.4, agentIds: ["kayo", "cypher", "harbor"] },
  { gameName: "숏피크", tagLine: "KR1", tier: "불멸 3", rr: 528, wins: 170, winRate: 59.6, agentIds: ["phoenix", "fade", "cypher"] },
  { gameName: "라운드킬러", tagLine: "7171", tier: "불멸 3", rr: 516, wins: 174, winRate: 59.3, agentIds: ["phoenix", "fade", "brimstone"] },
  { gameName: "Vanta", tagLine: "KOR", tier: "불멸 3", rr: 506, wins: 158, winRate: 59.1, agentIds: ["jett", "kayo", "sage"] },
  { gameName: "점프피크44", tagLine: "KOR", tier: "불멸 3", rr: 493, wins: 153, winRate: 60.5, agentIds: ["brimstone", "harbor", "omen"] },
  { gameName: "레몬에이드", tagLine: "1004", tier: "불멸 3", rr: 483, wins: 164, winRate: 61.1, agentIds: ["killjoy", "viper", "harbor"] },
  { gameName: "리테이크75", tagLine: "1004", tier: "불멸 3", rr: 474, wins: 155, winRate: 58.6, agentIds: ["breach", "neon", "chamber"] },
  { gameName: "무빙황제83", tagLine: "1004", tier: "불멸 3", rr: 463, wins: 158, winRate: 59.2, agentIds: ["breach", "harbor", "chamber"] },
  { gameName: "새벽조준15", tagLine: "KR1", tier: "불멸 3", rr: 448, wins: 160, winRate: 58.9, agentIds: ["deadlock", "cypher", "sova"] },
  { gameName: "롱앵글42", tagLine: "KOR", tier: "불멸 3", rr: 438, wins: 152, winRate: 59.3, agentIds: ["deadlock", "reyna", "sova"] },
];

export const LEADERBOARD: LeaderboardEntry[] = LEADERBOARD_ROWS.map((row, index) => ({ ...row, rank: index + 1 }));

export const ACHIEVEMENT_TYPES = [
  { value: "ace", label: "최다 에이스" },
  { value: "headshot", label: "최고 헤드샷률" },
  { value: "clutch", label: "최다 클러치" },
  { value: "mvp", label: "최다 MVP" },
] as const;

export type AchievementType = (typeof ACHIEVEMENT_TYPES)[number]["value"];

export type AchievementEntry = RiotId & {
  rank: number;
  agentId: string;
  tier: string;
  games: number;
  /** 화면에 그대로 쓰는 값 (예: 18회, 31.4%) */
  value: string;
};

// 최다 에이스는 시안(56:2) 값이다.
const ACE_ROWS = [
  { gameName: "무빙황제", tagLine: "0420", agentId: "kayo", tier: "불멸 3", games: 257, value: 18 },
  { gameName: "롱앵글42", tagLine: "KOR", agentId: "deadlock", tier: "불멸 3", games: 330, value: 17 },
  { gameName: "하프바이94", tagLine: "APAC", agentId: "omen", tier: "레디언트", games: 372, value: 16 },
  { gameName: "Kite", tagLine: "KR2", agentId: "kayo", tier: "불멸 3", games: 281, value: 16 },
  { gameName: "Zephyr", tagLine: "7171", agentId: "skye", tier: "레디언트", games: 302, value: 15 },
  { gameName: "소나기52", tagLine: "KR1", agentId: "brimstone", tier: "레디언트", games: 281, value: 15 },
  { gameName: "새벽조준9", tagLine: "0420", agentId: "iso", tier: "레디언트", games: 355, value: 14 },
  { gameName: "하프바이", tagLine: "0420", agentId: "viper", tier: "레디언트", games: 248, value: 13 },
  { gameName: "롱앵글", tagLine: "0420", agentId: "harbor", tier: "불멸 3", games: 195, value: 13 },
  { gameName: "새벽조준15", tagLine: "KR1", agentId: "deadlock", tier: "불멸 3", games: 361, value: 12 },
  { gameName: "Echo", tagLine: "7171", agentId: "phoenix", tier: "레디언트", games: 362, value: 11 },
  { gameName: "별빛사수39", tagLine: "KR2", agentId: "phoenix", tier: "불멸 3", games: 325, value: 11 },
  { gameName: "에코라운드25", tagLine: "7171", agentId: "chamber", tier: "레디언트", games: 218, value: 11 },
  { gameName: "스모크장인", tagLine: "KR2", agentId: "omen", tier: "레디언트", games: 268, value: 9 },
  { gameName: "Vanta", tagLine: "KOR", agentId: "jett", tier: "불멸 3", games: 232, value: 9 },
  { gameName: "달빛", tagLine: "1004", agentId: "phoenix", tier: "레디언트", games: 273, value: 8 },
  { gameName: "소나기", tagLine: "1004", agentId: "chamber", tier: "레디언트", games: 258, value: 8 },
  { gameName: "타이밍맨", tagLine: "7171", agentId: "phoenix", tier: "레디언트", games: 295, value: 7 },
  { gameName: "침착한오멘", tagLine: "KR2", agentId: "cypher", tier: "불멸 3", games: 379, value: 7 },
  { gameName: "레몬에이드", tagLine: "1004", agentId: "killjoy", tier: "불멸 3", games: 223, value: 6 },];

/**
 * 나머지 업적은 시안이 없어 리더보드 선수로 만든 예시 값이다.
 * picks는 리더보드 순위, 경기 수는 승리 ÷ 승률로 계산한다.
 */
function fromLeaderboard(picks: number[], value: (index: number) => string): AchievementEntry[] {
  return picks.map((rank, index) => {
    const player = LEADERBOARD[rank - 1];
    return {
      rank: index + 1,
      gameName: player.gameName,
      tagLine: player.tagLine,
      agentId: player.agentIds[0],
      tier: player.tier,
      games: Math.round(player.wins / (player.winRate / 100)),
      value: value(index),
    };
  });
}

const PICKS_HEADSHOT = [8, 2, 20, 5, 33, 11, 1, 27, 14, 40, 6, 23, 31, 17, 9, 45, 3, 29, 12, 37];
const PICKS_CLUTCH = [3, 15, 7, 26, 1, 19, 38, 10, 4, 22, 30, 13, 42, 6, 18, 35, 24, 2, 47, 11];
const PICKS_MVP = [1, 4, 2, 9, 6, 12, 3, 16, 21, 5, 8, 28, 14, 7, 25, 34, 10, 19, 43, 13];

export const ACHIEVEMENT_RANKINGS: Record<AchievementType, AchievementEntry[]> = {
  ace: ACE_ROWS.map(({ value, ...row }, index) => ({ ...row, rank: index + 1, value: `${value}회` })),
  headshot: fromLeaderboard(PICKS_HEADSHOT, (index) => `${(34.8 - index * 0.45).toFixed(1)}%`),
  clutch: fromLeaderboard(PICKS_CLUTCH, (index) => `${46 - index * 2 + (index % 3 === 0 ? 1 : 0)}회`),
  mvp: fromLeaderboard(PICKS_MVP, (index) => `${71 - index * 3 + (index % 2)}회`),
};

export function hasRankingData(region: RankingRegion, act: RankingAct): boolean {
  return region === "kr" && act === "v26a5";
}
