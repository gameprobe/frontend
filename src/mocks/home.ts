import type { AgentRole } from "@/lib/assets";
import { getMockPlayer } from "@/mocks/players";
import { agentName, mapName } from "@/data/game-names";

/** 메인 홈(Figma 53:2) 예시 데이터. */

export type TopAgent = {
  agentId: string;
  name: string;
  role: AgentRole;
  tier: "S" | "A" | "B";
  winRate: number;
  pickRate: number;
};

export const TOP_AGENTS_ACT_LABEL = "V26 액트 5 · 전체 티어";

export const TOP_AGENTS: TopAgent[] = [
  { agentId: "omen", name: agentName("omen"), role: "controller", tier: "S", winRate: 53.6, pickRate: 20.5 },
  { agentId: "kayo", name: agentName("kayo"), role: "initiator", tier: "S", winRate: 53.5, pickRate: 21.9 },
  { agentId: "jett", name: agentName("jett"), role: "duelist", tier: "S", winRate: 53.2, pickRate: 23.4 },
  { agentId: "raze", name: agentName("raze"), role: "duelist", tier: "A", winRate: 52.7, pickRate: 16.4 },
  { agentId: "killjoy", name: agentName("killjoy"), role: "sentinel", tier: "A", winRate: 52.7, pickRate: 14.5 },
];

export type MapAttackWinRate = {
  mapId: string;
  name: string;
  winRate: number;
};

export const MAP_ATTACK_WIN_RATES: MapAttackWinRate[] = [
  { mapId: "fracture", name: mapName("fracture"), winRate: 53.0 },
  { mapId: "icebox", name: mapName("icebox"), winRate: 51.7 },
  { mapId: "ascent", name: mapName("ascent"), winRate: 50.0 },
  { mapId: "lotus", name: mapName("lotus"), winRate: 48.9 },
  { mapId: "haven", name: mapName("haven"), winRate: 48.2 },
];

export const LEADERBOARD_REGION_LABEL = "한국";

export const LEADERBOARD_TOP5 = [
  getMockPlayer("숏피크90", "KR2"),
  getMockPlayer("새벽조준9", "0420"),
  getMockPlayer("하프바이", "0420"),
  getMockPlayer("하프바이94", "APAC"),
  getMockPlayer("Rift", "3333"),
];

export const LATEST_PATCH = {
  date: "2026.09.30",
  title: "11.08 패치 — 감시자 밸런스 조정과 경쟁전 개선",
  agentIds: ["chamber", "deadlock", "cypher", "jett"],
};
