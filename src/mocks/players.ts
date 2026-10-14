import { isSameRiotId, type RiotId } from "@/lib/riot-id";
import { LEADERBOARD } from "@/mocks/ranking";

/** 프로토타입 예시 플레이어. 값은 Figma 01 섹션에 그려진 그대로다. */
export type MockPlayer = RiotId & {
  /** 대표 요원 (초상 이미지) */
  agentId: string;
  tier: string;
  winRate?: number;
  rr?: number;
};

export const MOCK_PLAYERS: MockPlayer[] = [
  // 02 프로필 시안의 주인공. 검색 예시 문구(프로브#KR1)와도 같다.
  { gameName: "프로브", tagLine: "KR1", agentId: "jett", tier: "다이아몬드 2" },
  { gameName: "새벽두시", tagLine: "0201", agentId: "omen", tier: "불멸 1" },
  { gameName: "에임연습중", tagLine: "KR2", agentId: "reyna", tier: "플래티넘 3" },
  { gameName: "Moonlit", tagLine: "APAC", agentId: "kayo", tier: "레디언트", winRate: 65 },
  { gameName: "한방에보내기", tagLine: "7777", agentId: "chamber", tier: "초월자 2", winRate: 55 },
  { gameName: "숏피크90", tagLine: "KR2", agentId: "neon", tier: "레디언트", rr: 978 },
  { gameName: "새벽조준9", tagLine: "0420", agentId: "iso", tier: "레디언트", rr: 968 },
  { gameName: "하프바이", tagLine: "0420", agentId: "viper", tier: "레디언트", rr: 953 },
  { gameName: "하프바이94", tagLine: "APAC", agentId: "omen", tier: "레디언트", rr: 944 },
  { gameName: "Rift", tagLine: "3333", agentId: "omen", tier: "레디언트", rr: 935 },
];

/** 01·02 예시 플레이어를 먼저 찾고, 없으면 04 랭킹 선수에서 찾는다(랭킹 행 → 프로필). */
export function findMockPlayer(id: RiotId): MockPlayer | undefined {
  const player = MOCK_PLAYERS.find((candidate) => isSameRiotId(candidate, id));
  if (player) return player;
  const ranked = LEADERBOARD.find((entry) => isSameRiotId(entry, id));
  return ranked && {
    gameName: ranked.gameName,
    tagLine: ranked.tagLine,
    agentId: ranked.agentIds[0],
    tier: ranked.tier,
    rr: ranked.rr,
  };
}

export function getMockPlayer(gameName: string, tagLine: string): MockPlayer {
  const player = findMockPlayer({ gameName, tagLine });
  if (!player) throw new Error(`Unknown mock player: ${gameName}#${tagLine}`);
  return player;
}
