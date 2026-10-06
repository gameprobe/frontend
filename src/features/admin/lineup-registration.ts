import type {
  AbilitySlot,
  AdminLineupStatus,
  LineupAdminPayload,
  LineupDetailModel,
  LineupDifficulty
} from "../../types/lineup";
import { createEmpty, isSafeMediaUrl, type PreviewDraft } from "./preview/model";

export const STATUS_LABELS: Record<AdminLineupStatus, string> = { DRAFT: "초안", REVIEW: "검토 대기", PUBLISHED: "공개", REJECTED: "반려" };

export const DIFFICULTY_LABELS: Record<LineupDifficulty, string> = { easy: "쉬움", medium: "보통", hard: "어려움" };

/** 기존 API에서 사용하던 ID만 제안한다. 목록 밖 스킬은 운영자가 실제 ID를 입력한다. */

export const ABILITY_OPTIONS: Record<string, { id: string; slot: AbilitySlot; name: string }[]> = {
  sova: [
    { id: "sova-recon-bolt", slot: "E", name: "정찰 화살" },
    { id: "sova-shock-bolt", slot: "Q", name: "충격 화살" },
    { id: "sova-owl-drone", slot: "C", name: "올빼미 드론" },
    { id: "sova-hunter-fury", slot: "X", name: "사냥꾼의 분노" }
  ],
  jett: [
    { id: "jett-cloudburst", slot: "C", name: "연막 폭발" },
    { id: "jett-updraft", slot: "Q", name: "상승 기류" },
    { id: "jett-tailwind", slot: "E", name: "순풍" },
    { id: "jett-blade-storm", slot: "X", name: "칼날 폭풍" }
  ],
  omen: [
    { id: "omen-dark-cover", slot: "E", name: "어둠의 장막" },
    { id: "omen-shrouded-step", slot: "C", name: "어둠의 발자국" },
    { id: "omen-paranoia", slot: "Q", name: "피해망상" },
    { id: "omen-from-the-shadows", slot: "X", name: "그림자 습격" }
  ],
  cypher: [
    { id: "cypher-trapwire", slot: "C", name: "함정" },
    { id: "cypher-cyber-cage", slot: "Q", name: "사이버 감옥" },
    { id: "cypher-spycam", slot: "E", name: "감시 카메라" },
    { id: "cypher-neural-theft", slot: "X", name: "신경 절도" }
  ],
  killjoy: [
    { id: "killjoy-nanoswarm", slot: "C", name: "나노스웜" },
    { id: "killjoy-alarmbot", slot: "Q", name: "알람봇" },
    { id: "killjoy-turret", slot: "E", name: "포탑" },
    { id: "killjoy-lockdown", slot: "X", name: "봉쇄" }
  ],
  viper: [
    { id: "viper-snake-bite", slot: "C", name: "뱀 이빨" },
    { id: "viper-poison-cloud", slot: "Q", name: "독성 연기" },
    { id: "viper-toxic-screen", slot: "E", name: "독성 장막" },
    { id: "viper-vipers-pit", slot: "X", name: "독사의 구덩이" }
  ],
};

export interface RegistrationDraft extends PreviewDraft {
  difficulty: LineupDifficulty;
  abilityId: string;
  skillOrder?: number;
  skillVideoUrl?: string;
  agentLabel?: string;
}

export function createRegistrationDraft(destinationId?: string): RegistrationDraft {
  return { ...createEmpty("lineup", destinationId), difficulty: "medium", abilityId: "sova-recon-bolt" };
}

/** 다중 마커나 등록 정보 없는 자료는 개별 공략으로 임의 변환하지 않는다. */

export function isIndividualLineup(lineup: LineupDetailModel): boolean {
  return Boolean(lineup.registration) && lineup.agentMarkers.length === 1 && lineup.skillMarkers.length === 1
    && Object.hasOwn(STATUS_LABELS, lineup.status ?? "");
}

export function draftFromLineup(lineup: LineupDetailModel): RegistrationDraft | null {
  if (!isIndividualLineup(lineup) || !lineup.registration) return null;
  const registration = lineup.registration;
  return {
    ...createRegistrationDraft(registration.destination.id),
    id: lineup.id,
    title: lineup.title,
    notes: lineup.description,
    mapId: lineup.mapId,
    agentId: lineup.agentId,
    side: lineup.side,
    difficulty: lineup.difficulty,
    status: lineup.status!.toLowerCase() as RegistrationDraft["status"],
    abilityId: lineup.skillMarkers[0].abilityId,
    abilitySlot: registration.abilitySlot,
    skillOrder: lineup.skillMarkers[0].order,
    skillVideoUrl: lineup.skillMarkers[0].youtubeUrl,
    agentLabel: lineup.agentMarkers[0].label,
    destination: { ...registration.destination, point: { ...registration.destination.point } },
    start: { ...lineup.agentMarkers[0].position },
    path: lineup.pathPoints.map(({ x, y }) => ({ x, y })),
    site: registration.site === "MID" ? "Mid" : registration.site,
    mediaType: registration.media.type === "IMAGE" ? "image" : "video",
    mediaUrl: registration.media.url,
  };
}

export function createAtRegisteredDestination(source: RegistrationDraft): RegistrationDraft {
  return {
    ...createRegistrationDraft(source.destination.id),
    mapId: source.mapId,
    agentId: source.agentId,
    abilityId: source.abilityId,
    abilitySlot: source.abilitySlot,
    site: source.site,
    side: source.side,
    destination: { ...source.destination, point: source.destination.point && { ...source.destination.point } },
  };
}

export function validateRegistrationDraft(draft: RegistrationDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const validPoint = (point: { x: number; y: number } | null) => point && Number.isFinite(point.x) && Number.isFinite(point.y)
    && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
  if (!draft.title.trim() || draft.title.trim().length > 160) errors.title = "제목은 1~160자로 입력해 주세요.";
  if (!draft.notes.trim()) errors.notes = "공략 설명을 입력해 주세요.";
  if (!draft.mapId.trim() || !draft.agentId.trim()) errors.context = "맵과 요원을 선택해 주세요.";
  if (!draft.abilityId.trim()) errors.abilityId = "슬롯 문자 대신 실제 스킬 ID를 입력하거나 스킬을 선택해 주세요.";
  if (!isSafeMediaUrl(draft.mediaUrl) || draft.mediaUrl.trim().length > 2048) errors.mediaUrl = "자료 주소는 인증 정보 없는 HTTP(S) 주소로 2048자 이내여야 합니다.";
  if (!draft.destination.id.trim() || draft.destination.id.length > 128 || !draft.destination.name.trim() || draft.destination.name.trim().length > 120) errors.destination = "도착점 이름을 1~120자로 입력해 주세요.";
  else if (!validPoint(draft.destination.point)) errors.destination = "지도 안에 도착 위치를 지정해 주세요.";
  if (!validPoint(draft.start)) errors.start = "지도 안에 출발 위치를 지정해 주세요.";
  if (draft.path.length > 30 || draft.path.some(point => !validPoint(point))) errors.path = "중간 지점은 지도 안에 최대 30개까지 지정할 수 있습니다.";
  if (!Object.hasOwn(STATUS_LABELS, draft.status.toUpperCase())) errors.status = "공개 상태를 선택해 주세요.";
  return errors;
}

/** UI 전용 필드와 경로의 종류는 보내지 않고 출발·도착을 제외한 좌표만 보낸다. */

export function registrationPayload(draft: RegistrationDraft): LineupAdminPayload {
  const errors = validateRegistrationDraft(draft);
  if (Object.keys(errors).length) throw new Error(Object.values(errors).join(" "));
  const destinationPoint = { x: draft.destination.point!.x, y: draft.destination.point!.y };
  return {
    title: draft.title.trim(),
    description: draft.notes.trim(),
    mapId: draft.mapId,
    side: draft.side,
    agentId: draft.agentId,
    difficulty: draft.difficulty,
    status: draft.status,
    skillMarkers: [
      {
        abilityId: draft.abilityId.trim(),
        position: { ...destinationPoint },
        order: draft.skillOrder ?? 0,
        ...(draft.mediaType === "video" && draft.skillVideoUrl !== undefined ? { youtubeUrl: draft.mediaUrl.trim() } : {})
      }
    ],
    agentMarkers: [
      {
        position: { x: draft.start!.x, y: draft.start!.y },
        ...(draft.agentLabel !== undefined ? { label: draft.agentLabel } : {})
      }
    ],
    pathPoints: draft.path.map(({ x, y }) => ({ x, y })),
    registration: {
      destination: { id: draft.destination.id, name: draft.destination.name.trim(), point: destinationPoint },
      media: { type: draft.mediaType === "image" ? "IMAGE" : "VIDEO", url: draft.mediaUrl.trim() },
      site: draft.site === "Mid" ? "MID" : draft.site,
      abilitySlot: draft.abilitySlot,
    },
  };
}
