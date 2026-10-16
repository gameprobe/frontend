import { hasDemoSession } from "@/features/admin/admin-session";
import { useGuideEntries } from "@/features/admin/guide-store";
import type { GuideEntry } from "@/features/admin/model";
import { agentAbilities } from "@/data/game-names";
import type { Lineup, LineupSide } from "@/mocks/lineups";
import type { SmokeGuide, SmokeVariant } from "@/mocks/smokes";

/**
 * 관리자 예시에서 '활성'으로 저장한 공략을 공개 화면 모양으로 바꾼다 (TASK-FE-056).
 * 메모리 저장소라 같은 탭에서만 보이고 새로고침하면 사라진다.
 * 예시 입장(DEMO1234)을 한 탭에서만 합친다. 일반 방문자에게는 관리자 예시가 섞이지 않는다.
 */
type Placed = GuideEntry & { start: NonNullable<GuideEntry["start"]>; destination: GuideEntry["destination"] & { point: NonNullable<GuideEntry["destination"]["point"]> } };

const isPlaced = (entry: GuideEntry): entry is Placed => entry.status === "active" && Boolean(entry.start && entry.destination.point);

function usePublished(): Placed[] {
  const entries = useGuideEntries();
  return hasDemoSession() ? entries.filter(isPlaced) : [];
}

/** 관리자 설명은 상세 페이지의 설명 글로 쓴다 (TASK-FE-059) */
const notes = (entry: GuideEntry) => entry.notes.trim() || undefined;

function toLineup(entry: Placed): Lineup {
  const ability = agentAbilities(entry.agentId).find((item) => item.key === entry.abilitySlot);
  return {
    id: `admin-${entry.id}`,
    agentId: entry.agentId,
    skillId: ability?.id ?? `${entry.agentId}-${entry.abilitySlot.toLowerCase()}`,
    title: entry.title,
    side: entry.side,
    site: entry.site,
    charge: null,
    bounce: null,
    difficulty: "보통",
    votes: 0,
    addedAt: new Date().toISOString().slice(0, 10),
    landing: entry.destination.point,
    throwFrom: entry.start,
    videoLength: "",
    steps: [],
    description: notes(entry),
    destinationId: entry.destination.id,
    destinationName: entry.destination.name,
    path: entry.path,
    videoUrl: entry.videoUrl,
  };
}

function toSmoke(entry: Placed): SmokeGuide {
  return {
    id: `admin-${entry.id}`,
    mapId: entry.mapId,
    side: entry.side,
    site: entry.site,
    variant: entry.shape,
    agentId: entry.agentId,
    title: entry.title,
    landing: entry.destination.point,
    throwFrom: entry.start,
    steps: [],
    description: notes(entry),
    destinationId: entry.destination.id,
    destinationName: entry.destination.name,
    path: entry.path,
    videoUrl: entry.videoUrl,
  };
}

export function usePublishedLineups(mapId: string | undefined, agentId: string | undefined): Lineup[] {
  return usePublished()
    .filter((entry) => entry.kind === "lineup" && entry.mapId === mapId && entry.agentId === agentId)
    .map(toLineup);
}

export function usePublishedSmokes(mapId: string, side: LineupSide, variant: SmokeVariant): SmokeGuide[] {
  return usePublished()
    .filter((entry) => entry.kind === "smoke" && entry.mapId === mapId && entry.side === side && entry.shape === variant)
    .map(toSmoke);
}

/** 상세 페이지용: 한 맵의 활성 연막 전부(진영·유형 무관) (TASK-FE-059) */
export function usePublishedSmokesOnMap(mapId: string): SmokeGuide[] {
  return usePublished()
    .filter((entry) => entry.kind === "smoke" && entry.mapId === mapId)
    .map(toSmoke);
}
