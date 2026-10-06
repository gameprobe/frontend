// Shared public, preview and administrator lineup models.
export type AbilitySlot = "C" | "Q" | "E" | "X";

export type LineupSide = "attack" | "defense";

export type LineupDifficulty = "easy" | "medium" | "hard";

export interface LineupAbility {
  abilityId: string;
  slot: AbilitySlot;
  displayName: string;
}

export interface LineupMedia {
  // External URLs are stored as data only. Render local assets for thumbnails.
  youtubeUrl?: string;
  thumbnailAssetId?: string;
  imageUrls?: string[];
}

export interface LineupAuthor {
  name: string;
  profileUrl?: string;
}

export interface Lineup {
  id: string;
  title: string;
  mapId: string;
  mapName: string;
  agentId: string;
  agentName: string;
  ability: LineupAbility;
  side: LineupSide;
  difficulty: LineupDifficulty;
  description: string;
  steps?: string[];
  media: LineupMedia;
  author: LineupAuthor;
  tags?: string[];
  createdAt: string;
  registration?: LineupRegistration | null;
  // 프론트 화면 흐름용 합성 예시 여부. 공개 API/관리자 저장 계약에는 포함하지 않는다.
  isExample?: boolean;
  mapPreview?: {
    // 같은 도착점의 공략을 묶는 프론트 표시용 식별자. 좌표만으로 추측하지 않는다.
    destinationId?: string;
    destinationName?: string;
    agentPosition?: LineupPoint;
    skillPosition?: LineupPoint;
    // Ordered intermediate points only; the start and destination are separate.
    pathPoints?: LineupPoint[];
  };
}

export interface LineupPoint {
  x: number;
  y: number;
}

export interface LineupSkillMarker {
  abilityId: string;
  position: LineupPoint;
  youtubeUrl?: string;
  order?: number;
}

export interface LineupAgentMarker {
  position: LineupPoint;
  label?: string;
}

export interface LineupRegistration {
  destination: {
    id: string;
    name: string;
    point: LineupPoint;
  };
  media: {
    type: "VIDEO" | "IMAGE";
    url: string;
  };
  site: "A" | "B" | "C" | "MID";
  abilitySlot: AbilitySlot;
}

export interface LineupDetailModel {
  id: string;
  title: string;
  description: string;
  mapId: string;
  mapName: string;
  side: LineupSide;
  agentId: string;
  agentName: string;
  difficulty: LineupDifficulty;
  skillMarkers: LineupSkillMarker[];
  agentMarkers: LineupAgentMarker[];
  pathPoints: LineupPoint[];
  registration?: LineupRegistration | null;
  youtubeUrl?: string;
  status?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
  isExample?: boolean;
}

export interface LineupAdminPayload {
  title: string;
  description: string;
  mapId: string;
  side: LineupSide;
  agentId: string;
  difficulty: LineupDifficulty;
  skillMarkers: LineupSkillMarker[];
  agentMarkers: LineupAgentMarker[];
  pathPoints: LineupPoint[];
  registration?: LineupRegistration | null;
  status: "draft" | "review" | "published" | "rejected";
}

export type AdminLineupStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "REJECTED";
