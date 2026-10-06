export type SmokeSide = "attack" | "defense";
export type SmokeShape = "circle" | "wall";
export type SmokeVariant = "common-circle" | "harbor-wall";

export interface SmokePoint {
  x: number;
  y: number;
}

export interface SmokeGuide {
  id: string;
  title: string;
  mapId: string;
  mapName: string;
  agentId?: string;
  agentName: string;
  side: SmokeSide;
  site: string;
  variant: SmokeVariant;
  shape: SmokeShape;
  abilitySlot?: "Q" | "E";
  sizeLabel: string;
  durationLabel: string;
  description: string;
  steps: string[];
  throwerPosition: SmokePoint;
  targetPosition: SmokePoint;
  wallEndPosition?: SmokePoint;
  pathPoints: SmokePoint[];
  patchLabel: string;
}

export interface SmokeAgentStat {
  id: string;
  name: string;
  sizeLabel: string;
  durationLabel: string;
  note: string;
}
