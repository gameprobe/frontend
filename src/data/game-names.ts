import { CATALOG_AGENTS, CATALOG_MAPS, CATALOG_WEAPONS, type CatalogAbility } from "@/data/game-catalog";
import type { AgentRole } from "@/lib/assets";

/**
 * 요원·맵·무기 이름은 모두 여기서 가져온다(원본: Riot Public Content Catalog → data/game-catalog.ts).
 * Mock 파일에는 ID(jett, ascent, vandal …)와 수치만 둔다.
 */
const agents = new Map(CATALOG_AGENTS.map((agent) => [agent.key, agent]));
const maps = new Map(CATALOG_MAPS.map((map) => [map.key, map]));
const weapons = new Map(CATALOG_WEAPONS.map((weapon) => [weapon.key, weapon]));

function must<T>(value: T | undefined, kind: string, key: string): T {
  if (!value) throw new Error(`Unknown ${kind}: ${key}`);
  return value;
}

/** 요원 한글 이름 (예: kayo → 케이/오) */
export function agentName(agentId: string): string {
  return must(agents.get(agentId), "agent", agentId).ko;
}

export function agentRole(agentId: string): AgentRole {
  return must(agents.get(agentId), "agent", agentId).role;
}

/** 요원 스킬 4개 (Q·E·C·X 순서가 아니라 카탈로그 슬롯 순서: Ability1(Q)·Ability2(E)·Grenade(C)·Ultimate(X)) */
export function agentAbilities(agentId: string): CatalogAbility[] {
  return must(agents.get(agentId), "agent", agentId).abilities;
}

export function mapName(mapId: string): string {
  return must(maps.get(mapId), "map", mapId).ko;
}

export function mapEnglishName(mapId: string): string {
  return must(maps.get(mapId), "map", mapId).en;
}

export function weaponInfo(weaponId: string) {
  return must(weapons.get(weaponId), "weapon", weaponId);
}

export const ALL_AGENT_IDS = CATALOG_AGENTS.map((agent) => agent.key);
export const ALL_MAP_IDS = CATALOG_MAPS.map((map) => map.key);
