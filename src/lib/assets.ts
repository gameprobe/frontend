import { CATALOG_ROLES } from "@/data/game-catalog";

/**
 * 게임 이미지 경로 (public/img, 모두 WebP). 출처와 변환 방법은 public/img/SOURCES.md.
 * 요원·맵·무기 ID는 카탈로그 영문 이름의 소문자(kayo, fracture 등)를 쓴다.
 */
export type AgentRole = "duelist" | "initiator" | "controller" | "sentinel";

/** 역할군 한글 이름 (Riot Public Content Catalog) */
export const ROLE_LABELS = Object.fromEntries(CATALOG_ROLES.map((role) => [role.key, role.ko])) as Record<AgentRole, string>;

/** 정사각 초상 (160×160) */
export function agentIconPath(agentId: string): string {
  return `/img/agents/${agentId}.webp`;
}

/** 전신 일러스트 (880×800) */
export function agentFullPath(agentId: string): string {
  return `/img/agents-full/${agentId}.webp`;
}

/** 맵 큰 이미지 (1920×1080) */
export function mapImagePath(mapId: string): string {
  return `/img/maps/${mapId}.webp`;
}

/** 가로형 맵 썸네일 (456×100) */
export function mapListPath(mapId: string): string {
  return `/img/maps-list/${mapId}.webp`;
}

/** 미니맵 (1024×1024) */
export function mapMiniPath(mapId: string): string {
  return `/img/maps-mini/${mapId}.webp`;
}

/** 스킬 아이콘 (128×128, 흰색). skillId = `{요원}-{q|e|c|x}` */
export function skillIconPath(skillId: string): string {
  return `/img/skills/${skillId}.webp`;
}

export function roleIconPath(role: AgentRole): string {
  return `/img/roles/${role}.webp`;
}

/** 무기 측면 이미지 (가로 512) */
export function weaponPath(weaponId: string): string {
  return `/img/weapons/${weaponId}.webp`;
}
