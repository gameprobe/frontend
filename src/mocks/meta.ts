import type { AgentRole } from "@/lib/assets";
import { agentName, mapName, weaponInfo } from "@/data/game-names";

/** 05 메타 통계 예시 데이터. V26 액트 5 · 다이아몬드 이상만 있다. 값은 Figma 05 섹션(48:82)에 그려진 그대로다. */

export const META_ACTS = [
  { value: "v26a5", label: "V26 액트 5" },
  { value: "v26a4", label: "V26 액트 4" },
  { value: "v26a3", label: "V26 액트 3" },
] as const;

export const META_TIERS = [
  { value: "diamond", label: "다이아몬드 이상" },
  { value: "ascendant", label: "초월자 이상" },
  { value: "immortal", label: "불멸 이상" },
  { value: "all", label: "전체 티어" },
] as const;

export type MetaAct = (typeof META_ACTS)[number]["value"];
export type MetaTier = (typeof META_TIERS)[number]["value"];

export function hasMetaData(act: MetaAct, tier: MetaTier): boolean {
  return act === "v26a5" && tier === "diamond";
}

export type AgentTier = "S" | "A" | "B" | "C";

export const AGENT_TIER_LABELS: Record<AgentTier, string> = {
  S: "최상위",
  A: "강력",
  B: "준수",
  C: "상황용",
};

export type MetaAgent = {
  agentId: string;
  name: string;
  role: AgentRole;
  tier: AgentTier;
  winRate: number;
  pickRate: number;
  kda: number;
  acs: number;
};

/** 15 요원 티어리스트 · 요원별 상세 지표 (승률순) */
export const META_AGENTS: MetaAgent[] = [
  { agentId: "omen", name: agentName("omen"), role: "controller", tier: "S", winRate: 53.6, pickRate: 20.5, kda: 1.37, acs: 218 },
  { agentId: "kayo", name: agentName("kayo"), role: "initiator", tier: "S", winRate: 53.5, pickRate: 21.9, kda: 1.23, acs: 224 },
  { agentId: "jett", name: agentName("jett"), role: "duelist", tier: "S", winRate: 53.2, pickRate: 23.4, kda: 1.22, acs: 196 },
  { agentId: "raze", name: agentName("raze"), role: "duelist", tier: "A", winRate: 52.7, pickRate: 16.4, kda: 1.04, acs: 235 },
  { agentId: "killjoy", name: agentName("killjoy"), role: "sentinel", tier: "A", winRate: 52.7, pickRate: 14.5, kda: 1.09, acs: 184 },
  { agentId: "reyna", name: agentName("reyna"), role: "duelist", tier: "A", winRate: 52.6, pickRate: 14.6, kda: 1.08, acs: 213 },
  { agentId: "viper", name: agentName("viper"), role: "controller", tier: "A", winRate: 52.2, pickRate: 15.1, kda: 1.19, acs: 189 },
  { agentId: "sova", name: agentName("sova"), role: "initiator", tier: "A", winRate: 51.5, pickRate: 13.5, kda: 1.22, acs: 208 },
  { agentId: "cypher", name: agentName("cypher"), role: "sentinel", tier: "A", winRate: 51.3, pickRate: 11.7, kda: 1.26, acs: 214 },
  { agentId: "fade", name: agentName("fade"), role: "initiator", tier: "A", winRate: 51.2, pickRate: 13.9, kda: 1.37, acs: 196 },
  { agentId: "clove", name: agentName("clove"), role: "controller", tier: "A", winRate: 51.1, pickRate: 14.2, kda: 1.07, acs: 216 },
  { agentId: "breach", name: agentName("breach"), role: "initiator", tier: "B", winRate: 51.0, pickRate: 7.0, kda: 1.05, acs: 245 },
  { agentId: "yoru", name: agentName("yoru"), role: "duelist", tier: "B", winRate: 50.6, pickRate: 9.5, kda: 1.15, acs: 220 },
  { agentId: "iso", name: agentName("iso"), role: "duelist", tier: "B", winRate: 50.2, pickRate: 11.1, kda: 1.25, acs: 223 },
  { agentId: "gekko", name: agentName("gekko"), role: "initiator", tier: "B", winRate: 49.9, pickRate: 9.0, kda: 1.15, acs: 197 },
  { agentId: "skye", name: agentName("skye"), role: "initiator", tier: "B", winRate: 49.8, pickRate: 9.3, kda: 1.11, acs: 239 },
  { agentId: "astra", name: agentName("astra"), role: "controller", tier: "B", winRate: 49.8, pickRate: 8.4, kda: 1.01, acs: 186 },
  { agentId: "sage", name: agentName("sage"), role: "sentinel", tier: "B", winRate: 49.7, pickRate: 6.4, kda: 1.12, acs: 200 },
  { agentId: "chamber", name: agentName("chamber"), role: "sentinel", tier: "B", winRate: 49.6, pickRate: 10.3, kda: 1.05, acs: 181 },
  { agentId: "neon", name: agentName("neon"), role: "duelist", tier: "B", winRate: 49.5, pickRate: 7.8, kda: 1.34, acs: 248 },
  { agentId: "brimstone", name: agentName("brimstone"), role: "controller", tier: "C", winRate: 49.0, pickRate: 6.9, kda: 1.38, acs: 236 },
  { agentId: "phoenix", name: agentName("phoenix"), role: "duelist", tier: "C", winRate: 48.8, pickRate: 5.9, kda: 1.1, acs: 242 },
  { agentId: "harbor", name: agentName("harbor"), role: "controller", tier: "C", winRate: 48.4, pickRate: 8.4, kda: 1.27, acs: 188 },
  { agentId: "deadlock", name: agentName("deadlock"), role: "sentinel", tier: "C", winRate: 47.7, pickRate: 4.0, kda: 1.36, acs: 230 },
];

/** 요원 한글 이름. 이전 이름을 쓰는 곳을 위해 남겨 둔 별칭이다(원본은 data/game-names의 agentName). */
export const metaAgentName = agentName;

export type MetaMap = {
  mapId: string;
  name: string;
  playShare: number;
  attackWinRate: number;
  /** 승률 높은 요원 5명 */
  topAgentIds: string[];
};

/** 17 맵별 승률. 수비 승률은 100 - 공격 승률. */
export const META_MAPS: MetaMap[] = [
  { mapId: "ascent", name: mapName("ascent"), playShare: 10.9, attackWinRate: 50.0, topAgentIds: ["viper", "brimstone", "sova", "yoru", "killjoy"] },
  { mapId: "bind", name: mapName("bind"), playShare: 12.6, attackWinRate: 45.8, topAgentIds: ["phoenix", "cypher", "omen", "harbor", "deadlock"] },
  { mapId: "haven", name: mapName("haven"), playShare: 12.7, attackWinRate: 48.2, topAgentIds: ["skye", "killjoy", "phoenix", "astra", "raze"] },
  { mapId: "split", name: mapName("split"), playShare: 9.8, attackWinRate: 46.6, topAgentIds: ["yoru", "skye", "phoenix", "clove", "jett"] },
  { mapId: "icebox", name: mapName("icebox"), playShare: 9.5, attackWinRate: 51.7, topAgentIds: ["cypher", "sova", "jett", "sage", "chamber"] },
  { mapId: "breeze", name: mapName("breeze"), playShare: 8.0, attackWinRate: 45.3, topAgentIds: ["jett", "raze", "kayo", "astra", "phoenix"] },
  { mapId: "fracture", name: mapName("fracture"), playShare: 12.6, attackWinRate: 53.0, topAgentIds: ["deadlock", "sage", "viper", "skye", "killjoy"] },
  { mapId: "pearl", name: mapName("pearl"), playShare: 12.1, attackWinRate: 45.1, topAgentIds: ["jett", "clove", "gekko", "sage", "sova"] },
  { mapId: "lotus", name: mapName("lotus"), playShare: 7.7, attackWinRate: 48.9, topAgentIds: ["fade", "jett", "sage", "omen", "yoru"] },
  { mapId: "sunset", name: mapName("sunset"), playShare: 9.4, attackWinRate: 46.7, topAgentIds: ["neon", "breach", "skye", "yoru", "viper"] },
];

export type TeamComp = {
  agentIds: string[];
  winRate: number;
  pickRate: number;
  games: number;
};

/** 16 팀 조합 · 어센트 (시안 값) */
const ASCENT_COMPS: TeamComp[] = [
  { agentIds: ["astra", "skye", "kayo", "killjoy", "neon"], winRate: 57.8, pickRate: 14.2, games: 4364 },
  { agentIds: ["brimstone", "sova", "sage", "iso", "jett"], winRate: 55.9, pickRate: 13.1, games: 3760 },
  { agentIds: ["clove", "breach", "sova", "killjoy", "jett"], winRate: 54.3, pickRate: 10.8, games: 3214 },
  { agentIds: ["viper", "skye", "chamber", "neon", "reyna"], winRate: 53.6, pickRate: 9.0, games: 2659 },
  { agentIds: ["viper", "gekko", "kayo", "sage", "jett"], winRate: 51.9, pickRate: 7.1, games: 2228 },
  { agentIds: ["astra", "skye", "chamber", "phoenix", "raze"], winRate: 50.8, pickRate: 5.5, games: 1744 },
];

/**
 * 다른 맵은 시안이 없어 어센트 조합을 맵 순서만큼 돌리고 수치를 조금씩 낮춘 예시 값이다.
 * 각 맵의 '승률 높은 요원' 첫 번째를 1위 조합의 첫 자리에 넣어 맵마다 다르게 보이게 한다.
 */
function exampleComps(mapIndex: number, leadAgentId: string): TeamComp[] {
  const rotated = [...ASCENT_COMPS.slice(mapIndex % 6), ...ASCENT_COMPS.slice(0, mapIndex % 6)];
  return rotated.map((comp, index) => {
    const agentIds =
      index === 0 && !comp.agentIds.includes(leadAgentId) ? [leadAgentId, ...comp.agentIds.slice(1)] : comp.agentIds;
    return {
      agentIds,
      winRate: Number((57.4 - index * 1.3 - (mapIndex % 3) * 0.4).toFixed(1)),
      pickRate: Number((13.8 - index * 1.6 - (mapIndex % 2) * 0.5).toFixed(1)),
      games: Math.round((4100 - index * 480 - mapIndex * 90) / 10) * 10,
    };
  });
}

export const TEAM_COMPS: Record<string, TeamComp[]> = Object.fromEntries(
  META_MAPS.map((map, index) => [map.mapId, index === 0 ? ASCENT_COMPS : exampleComps(index, map.topAgentIds[0])]),
);

export type MetaWeapon = {
  weaponId: string;
  name: string;
  category: string;
  /** 0은 기본 지급 */
  price: number;
  buyRate: number;
  killShare: number;
  headshot: number;
};

/** 18 무기 통계 (구매율순). 쇼티는 시안의 '권총'을 실제 분류인 '산탄총'으로 고쳤다. */
export const META_WEAPONS: MetaWeapon[] = [
  { weaponId: "vandal", name: weaponInfo("vandal").ko, category: weaponInfo("vandal").category, price: 2900, buyRate: 34.1, killShare: 30.6, headshot: 26.4 },
  { weaponId: "phantom", name: weaponInfo("phantom").ko, category: weaponInfo("phantom").category, price: 2900, buyRate: 27.6, killShare: 25.3, headshot: 29.5 },
  { weaponId: "operator", name: weaponInfo("operator").ko, category: weaponInfo("operator").category, price: 4700, buyRate: 8.4, killShare: 7.6, headshot: 9.6 },
  { weaponId: "spectre", name: weaponInfo("spectre").ko, category: weaponInfo("spectre").category, price: 1600, buyRate: 7.0, killShare: 6.0, headshot: 29.8 },
  { weaponId: "ghost", name: weaponInfo("ghost").ko, category: weaponInfo("ghost").category, price: 500, buyRate: 6.0, killShare: 5.1, headshot: 28.1 },
  { weaponId: "sheriff", name: weaponInfo("sheriff").ko, category: weaponInfo("sheriff").category, price: 800, buyRate: 6.0, killShare: 5.8, headshot: 28.1 },
  { weaponId: "classic", name: weaponInfo("classic").ko, category: weaponInfo("classic").category, price: 0, buyRate: 4.8, killShare: 4.0, headshot: 25.6 },
  { weaponId: "marshal", name: weaponInfo("marshal").ko, category: weaponInfo("marshal").category, price: 950, buyRate: 3.2, killShare: 2.7, headshot: 11.4 },
  { weaponId: "stinger", name: weaponInfo("stinger").ko, category: weaponInfo("stinger").category, price: 1100, buyRate: 3.0, killShare: 3.2, headshot: 21.2 },
  { weaponId: "judge", name: weaponInfo("judge").ko, category: weaponInfo("judge").category, price: 1850, buyRate: 2.9, killShare: 2.6, headshot: 4.8 },
  { weaponId: "odin", name: weaponInfo("odin").ko, category: weaponInfo("odin").category, price: 3200, buyRate: 2.9, killShare: 2.8, headshot: 18.1 },
  { weaponId: "frenzy", name: weaponInfo("frenzy").ko, category: weaponInfo("frenzy").category, price: 450, buyRate: 2.5, killShare: 2.3, headshot: 20.1 },
  { weaponId: "guardian", name: weaponInfo("guardian").ko, category: weaponInfo("guardian").category, price: 2250, buyRate: 2.2, killShare: 1.5, headshot: 28.7 },
  { weaponId: "shorty", name: weaponInfo("shorty").ko, category: weaponInfo("shorty").category, price: 300, buyRate: 1.6, killShare: 2.2, headshot: 29.7 },
  { weaponId: "bucky", name: weaponInfo("bucky").ko, category: weaponInfo("bucky").category, price: 850, buyRate: 1.5, killShare: 0.7, headshot: 7.5 },
  { weaponId: "bulldog", name: weaponInfo("bulldog").ko, category: weaponInfo("bulldog").category, price: 2050, buyRate: 1.5, killShare: 1.2, headshot: 26.6 },
  { weaponId: "ares", name: weaponInfo("ares").ko, category: weaponInfo("ares").category, price: 1600, buyRate: 1.5, killShare: 1.2, headshot: 18.5 },
  { weaponId: "outlaw", name: weaponInfo("outlaw").ko, category: weaponInfo("outlaw").category, price: 2400, buyRate: 0.8, killShare: 1.2, headshot: 11.2 },
];
