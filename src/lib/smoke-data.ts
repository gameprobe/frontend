import { LINEUP_MAP_OPTIONS } from "./asset-map";
import type { SmokeAgentStat, SmokeGuide, SmokeShape, SmokeSide, SmokeVariant } from "../types/smoke";

// Preview values are intentionally displayed as comparison data until patch-verified values are entered.
export const SMOKE_AGENT_STATS: SmokeAgentStat[] = [
  { id: "omen", name: "Omen", sizeLabel: "4.5m 반경", durationLabel: "15초", note: "공통 원형 연막" },
  { id: "brimstone", name: "Brimstone", sizeLabel: "5m 반경", durationLabel: "19초", note: "공통 원형 연막" },
  { id: "astra", name: "Astra", sizeLabel: "4.75m 반경", durationLabel: "14초", note: "공통 원형 연막" },
  { id: "clove", name: "Clove", sizeLabel: "4.75m 반경", durationLabel: "14초", note: "공통 원형 연막" },
  { id: "harbor", name: "Harbor", sizeLabel: "4m 반경 + 벽", durationLabel: "4.5초 / 벽 12초", note: "공통 원형 + 일자 연막" },
  { id: "miks", name: "Miks", sizeLabel: "4.5m 반경", durationLabel: "12초", note: "공통 원형 연막" },
];

const mapSeeds = LINEUP_MAP_OPTIONS.map((map, index) => ({
  ...map,
  attackSite: index % 3 === 0 ? "A" : index % 3 === 1 ? "B" : "C",
  defenseSite: index % 2 === 0 ? "A" : "B",
}));

const variantLabels: Record<SmokeVariant, string> = {
  "common-circle": "공통 원형 연막",
  "harbor-wall": "하버 일자 연막",
};

function createGuide(
  map: (typeof mapSeeds)[number],
  side: SmokeSide,
  variant: SmokeVariant,
  index: number,
): SmokeGuide {
  const isHarborWall = variant === "harbor-wall";
  const stat = isHarborWall
      ? SMOKE_AGENT_STATS.find((agent) => agent.id === "harbor")!
      : SMOKE_AGENT_STATS[0];
  const site = side === "attack" ? map.attackSite : map.defenseSite;
  const throwerPosition = side === "attack"
    ? { x: 0.17 + (index % 3) * 0.045, y: 0.73 - (index % 4) * 0.035 }
    : { x: 0.78 - (index % 3) * 0.045, y: 0.24 + (index % 4) * 0.035 };
  const targetPosition = isHarborWall
    ? side === "attack" ? { x: 0.55, y: 0.38 + (index % 3) * 0.06 } : { x: 0.38, y: 0.58 - (index % 3) * 0.05 }
    : side === "attack"
      ? { x: 0.62 + (index % 3) * 0.055, y: 0.31 + (index % 4) * 0.055 }
      : { x: 0.35 - (index % 3) * 0.04, y: 0.61 - (index % 4) * 0.05 };
  const wallEndPosition = isHarborWall
    ? { x: targetPosition.x + 0.2, y: targetPosition.y + (side === "attack" ? 0.04 : -0.04) }
    : undefined;

  return {
    id: `smoke-${map.id}-${variant}-${side}`,
    title: `${map.name} ${site} ${side === "attack" ? "진입" : "수비"} ${variantLabels[variant]}`,
    mapId: map.id,
    mapName: map.name,
    agentId: isHarborWall ? "harbor" : undefined,
    agentName: isHarborWall ? "Harbor" : "모든 요원 (Viper 제외)",
    abilitySlot: isHarborWall ? "E" : undefined,
    side,
    site,
    variant,
    shape: isHarborWall ? "wall" as SmokeShape : "circle" as SmokeShape,
    sizeLabel: stat.sizeLabel,
    durationLabel: isHarborWall ? "벽 12초" : "공통 원형 기준",
    description: isHarborWall
        ? `${site} 진입로를 가로질러 시야를 길게 차단하는 Harbor 일자 연막입니다.`
        : `${site} 진입 전에 Viper를 제외한 모든 요원이 공통으로 사용할 수 있는 원형 연막입니다.`,
    steps: [
      side === "attack" ? "공격 진영의 표시된 시작 위치에 정렬하세요." : "수비 진영의 표시된 시작 위치에서 대기하세요.",
      isHarborWall ? "목표 지점에서 벽이 가로막을 방향을 확인하세요." : "지도 위 원형 연막 도착 지점에 맞춰 조준하세요.",
      "연막이 완전히 형성된 뒤 팀의 다음 행동을 시작하세요.",
    ],
    throwerPosition,
    targetPosition,
    ...(wallEndPosition ? { wallEndPosition } : {}),
    pathPoints: [throwerPosition, { x: (throwerPosition.x + targetPosition.x) / 2, y: (throwerPosition.y + targetPosition.y) / 2 }, targetPosition],
    patchLabel: "Preview · 패치 검증 필요",
  };
}

const smokeVariants: SmokeVariant[] = ["common-circle", "harbor-wall"];

export const SMOKE_GUIDES: SmokeGuide[] = mapSeeds.flatMap((map, index) => smokeVariants.flatMap((variant, variantIndex) => [
  createGuide(map, "attack", variant, index * smokeVariants.length + variantIndex),
  createGuide(map, "defense", variant, index * smokeVariants.length + variantIndex + 1),
]));

export const SMOKE_TYPE_OPTIONS: Array<{ id: SmokeVariant; label: string }> = [
  { id: "common-circle", label: "모든 연막 (바이퍼 제외)" },
  { id: "harbor-wall", label: "하버 일자" },
];
