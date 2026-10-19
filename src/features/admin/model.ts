import { MINIMAP_SIZE, type RoutePoint } from "@/components/guide-map/geometry";
import type { MapGuide } from "@/components/guide-map/GuideMapViewer";
import { isSafeHttpUrl } from "@/lib/youtube";
import { EXAMPLE_VIDEO_URL, type LineupSide, type Point } from "@/mocks/lineups";
import type { SmokeVariant } from "@/mocks/smokes";

/**
 * 관리자 편집 화면의 공략 한 건. 실제 DB와 예시 저장소는 분리한다.
 * - 좌표는 공개 화면과 같은 512×512 미니맵 px이다. admin-lineup-api에서 백엔드의 0..1 좌표로 변환한다.
 * - 같은 destination.id를 쓰는 공략끼리 한 도착지 묶음이 된다. 출발·경로·영상은 공략마다 따로다.
 * 순수 함수는 legacy-next/src/features/admin/preview/model.ts에서 옮겼다.
 */
export const MAP_SIZE = MINIMAP_SIZE;
export const MAX_PATH_POINTS = 30;

export type GuideKind = "lineup" | "smoke";
export type GuideStatus = "active" | "inactive";
export type AbilitySlot = "Q" | "E" | "C" | "X";
export type LineupImageSlot = "position" | "aim";
export type LineupImage = { id: string; sizeBytes: number; contentType: string; url: string };
export type LineupImages = Record<LineupImageSlot, LineupImage | null>;
export type { RoutePoint };
export type PointMode = "target" | "start" | "path";
export type PointSelection = { kind: "target" | "start" } | { kind: "path"; index: number };

export type Destination = { id: string; name: string; point: Point | null };

export type GuideEntry = {
  id: string;
  kind: GuideKind;
  status: GuideStatus;
  mapId: string;
  agentId: string;
  side: LineupSide;
  abilitySlot: AbilitySlot;
  /** 스모크만 쓴다. 공개 스모크 가이드의 연막 유형 필터(공통 원형·하버 일자)와 같다 */
  shape: SmokeVariant;
  title: string;
  videoUrl: string;
  /** 이미지는 별도 업로드 API로 저장한다. 일반 라인업 요청에는 넣지 않는다. */
  images: LineupImages;
  notes: string;
  destination: Destination;
  start: Point | null;
  path: RoutePoint[];
};

export type DestinationGroup = { destination: Destination; mapId: string; entries: GuideEntry[] };

/** /admin 주소의 자료 종류 부분 */
export const KIND_PATH: Record<GuideKind, string> = { lineup: "lineups", smoke: "smokes" };
export const KIND_LABEL: Record<GuideKind, string> = { lineup: "라인업", smoke: "스모크" };
export const STATUS_LABEL: Record<GuideStatus, string> = { active: "활성", inactive: "비활성" };

const newId = () => crypto.randomUUID();
const copyDestination = (destination: Destination): Destination => ({
  ...destination,
  point: destination.point ? { ...destination.point } : null,
});

/** 새 공략에는 독립 도착점 ID를 준다. 좌표와 영상은 직접 입력해야 한다. */
export function createEmpty(kind: GuideKind, destinationId: string = newId()): GuideEntry {
  return {
    id: "",
    kind,
    status: "inactive",
    mapId: "ascent",
    agentId: kind === "lineup" ? "sova" : "omen",
    side: "attack",
    abilitySlot: "E",
    shape: "circle",
    title: "",
    videoUrl: "",
    images: { position: null, aim: null },
    notes: "",
    destination: { id: destinationId, name: "", point: null },
    start: null,
    path: [],
  };
}

/** 같은 도착점에 공략을 하나 더 만든다. 출발점·경로·영상은 공유하지 않는다. */
export function createAtDestination(source: GuideEntry): GuideEntry {
  return {
    ...createEmpty(source.kind, source.destination.id),
    mapId: source.mapId,
    agentId: source.agentId,
    side: source.side,
    abilitySlot: source.abilitySlot,
    shape: source.shape,
    destination: copyDestination(source.destination),
  };
}


/**
 * 화면 체험용 합성 예시. 좌표·경로는 실제 공략이 아니다.
 * 도착점 ID·좌표는 공개 예시(mocks)의 'A 로비 → A 사이트'·'A 메인 입구'와 같게 두어,
 * 활성 공략이 공개 화면에서 같은 도착지 묶음에 들어가게 한다 (TASK-FE-056).
 */
export function createExamples(): GuideEntry[] {
  const aSite: Destination = { id: "a-lobby-a-site", name: "A 사이트", point: { x: 162, y: 58 } };
  const sova: GuideEntry = {
    ...createEmpty("lineup", aSite.id),
    id: "example-lineup-01",
    status: "inactive",
    title: "예시 · 소바 중간 지점 공략",
    videoUrl: EXAMPLE_VIDEO_URL,
    notes: "관리자 화면 체험용 예시입니다. 좌표와 경로는 실제 공략이 아닙니다.",
    destination: aSite,
    start: { x: 400, y: 168 },
    path: [
      { x: 300, y: 128 },
      { x: 236, y: 40 },
    ],
  };
  const smokeCircle: Destination = { id: "a-main-entrance", name: "A 메인 입구", point: { x: 310, y: 130 } };
  const smokeWall: Destination = { id: "example-ascent-b-main", name: "예시 · B 메인 벽", point: { x: 110, y: 336 } };
  return [
    sova,
    {
      ...createAtDestination(sova),
      id: "example-lineup-02",
      status: "active",
      title: "예시 · 소바 직선 출발 공략",
      videoUrl: EXAMPLE_VIDEO_URL,
      notes: "같은 도착점을 다른 출발점에서 향하는 별도 공략입니다.",
      start: { x: 430, y: 196 },
    },
    {
      ...createAtDestination(sova),
      id: "example-lineup-03",
      title: "예시 · 소바 경유 공략",
      videoUrl: EXAMPLE_VIDEO_URL,
      notes: "공략마다 출발점·경로·영상을 따로 등록합니다.",
      start: { x: 330, y: 250 },
      path: [{ x: 240, y: 150 }],
    },
    {
      ...createEmpty("smoke", smokeCircle.id),
      id: "example-smoke-01",
      title: "예시 · 오멘 원형 스모크 공략",
      videoUrl: EXAMPLE_VIDEO_URL,
      notes: "출발·도착 위치와 영상 주소를 입력하는 흐름을 확인하세요.",
      destination: smokeCircle,
      start: { x: 500, y: 228 },
    },
    {
      ...createEmpty("smoke", smokeWall.id),
      id: "example-smoke-02",
      status: "inactive",
      agentId: "harbor",
      shape: "harbor-wall",
      title: "예시 · 하버 일자 스모크 공략",
      videoUrl: EXAMPLE_VIDEO_URL,
      notes: "하버 일자 연막 예시입니다. 실제 스킬 경로가 아닙니다.",
      destination: smokeWall,
      start: { x: 300, y: 420 },
    },
  ];
}

export function clampPoint(point: Point): Point {
  const clamp = (value: number) => Math.min(MAP_SIZE, Math.max(0, Math.round(value)));
  return { x: clamp(point.x), y: clamp(point.y) };
}

function isValidPoint(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y)
    && point.x >= 0 && point.x <= MAP_SIZE && point.y >= 0 && point.y <= MAP_SIZE;
}

/** 저장 전 필수 입력과 좌표를 검사한다. 키는 폼 칸 이름이다. */
export function validateEntry(entry: GuideEntry): Record<string, string> {
  const errors: Record<string, string> = {};
  const title = entry.title.trim();
  if (!title) errors.title = "공략 제목을 입력해 주세요.";
  else if (title.length > 120) errors.title = "제목은 120자 이내로 입력해 주세요.";
  if (!entry.videoUrl.trim()) errors.videoUrl = "영상 주소를 입력해 주세요.";
  else if (!isSafeHttpUrl(entry.videoUrl)) {
    errors.videoUrl = "인증정보가 없는 HTTP(S) 영상 주소를 입력해 주세요.";
  }
  if (!entry.destination.name.trim()) errors.destination = "도착점 이름을 입력해 주세요.";
  else if (entry.destination.name.trim().length > 120) errors.destination = "도착점 이름은 120자 이내로 입력해 주세요.";
  else if (!entry.destination.point) errors.destination = "지도에서 도착 위치를 지정해 주세요.";
  else if (!isValidPoint(entry.destination.point)) errors.destination = "도착 위치는 지도 안에 지정해 주세요.";
  if (!entry.start) errors.start = "지도에서 출발 위치를 지정해 주세요.";
  else if (!isValidPoint(entry.start)) errors.start = "출발 위치는 지도 안에 지정해 주세요.";
  if (entry.path.length > MAX_PATH_POINTS) errors.path = `중간 지점은 최대 ${MAX_PATH_POINTS}개입니다.`;
  else if (entry.path.some((point) => !isValidPoint(point))) errors.path = "경로의 모든 지점을 지도 안에 지정해 주세요.";
  return errors;
}

/** 묶음의 도착점을 옮기지 않고 이 공략만 새 도착점으로 떼어 낸다. */
export function detachDestination(entry: GuideEntry): GuideEntry {
  return { ...entry, destination: { id: newId(), name: "", point: null }, path: [] };
}

/** 맵이 바뀌면 이전 맵의 도착점·좌표가 남지 않게 비운다. */
export function changeMap(entry: GuideEntry, mapId: string): GuideEntry {
  return entry.mapId === mapId ? entry : { ...detachDestination({ ...entry, mapId }), start: null };
}

/** 편집기와 공개 지도는 같은 순서로 그린다: 출발 → 중간 지점 → 도착 */
export function routePoints(entry: Pick<GuideEntry, "start" | "path" | "destination">): Point[] {
  return [
    ...(entry.start ? [entry.start] : []),
    ...entry.path,
    ...(entry.destination.point ? [entry.destination.point] : []),
  ].map(({ x, y }) => ({ x, y }));
}

/** 지도 클릭·키보드 지정이 같이 쓰는 좌표 갱신 */
export function placePoint(entry: GuideEntry, mode: PointMode, point: Point): GuideEntry {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return entry;
  const next = clampPoint(point);
  switch (mode) {
    case "target":
      return { ...entry, destination: { ...entry.destination, point: next } };
    case "path":
      return entry.path.length >= MAX_PATH_POINTS ? entry : { ...entry, path: [...entry.path, next] };
    default:
      return { ...entry, start: next };
  }
}

/** 이미 찍은 점만 옮긴다. 새 점을 만들거나 순서를 바꾸지 않는다. */
export function movePoint(entry: GuideEntry, selection: PointSelection, point: Point, destinationLocked = false): GuideEntry {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return entry;
  const next = clampPoint(point);
  switch (selection.kind) {
    case "target":
      if (destinationLocked || !entry.destination.point) return entry;
      return { ...entry, destination: { ...entry.destination, point: next } };
    case "path":
      if (!entry.path[selection.index]) return entry;
      return { ...entry, path: entry.path.map((current, index) => (index === selection.index ? { ...current, ...next } : current)) };
    default:
      return entry.start ? { ...entry, start: next } : entry;
  }
}

/** 도착점 ID로 묶는다. 좌표·이름이 같아도 ID가 다르면 합치지 않는다. */
export function groupDestinations(entries: GuideEntry[], kind?: GuideKind, mapId?: string): DestinationGroup[] {
  const groups = new Map<string, DestinationGroup>();
  for (const entry of entries) {
    if ((kind && entry.kind !== kind) || (mapId && entry.mapId !== mapId)) continue;
    const key = JSON.stringify([entry.kind, entry.mapId, entry.destination.id]);
    const group = groups.get(key);
    if (group) group.entries.push(entry);
    else groups.set(key, { destination: copyDestination(entry.destination), mapId: entry.mapId, entries: [entry] });
  }
  return Array.from(groups.values());
}

const sharesDestination = (a: GuideEntry, b: GuideEntry) =>
  a.kind === b.kind && a.mapId === b.mapId && a.destination.id === b.destination.id;

/** 이 공략과 도착점을 함께 쓰는 다른 공략 수 */
export function sharedCount(entries: GuideEntry[], entry: GuideEntry): number {
  return entries.filter((other) => other.id !== entry.id && sharesDestination(other, entry)).length;
}

/**
 * 검증을 통과한 공략을 목록에 넣는다. id가 비어 있으면 새로 만든다.
 * 공유 도착점의 좌표·이름은 allowSharedMove일 때만 묶음 전체에 반영하고, 아니면 기존 묶음 값을 따른다.
 */
export function saveEntry(entries: GuideEntry[], saved: GuideEntry, allowSharedMove = false): { entries: GuideEntry[]; id: string } {
  const id = saved.id || newId();
  const others = entries.filter((entry) => entry.id !== id && sharesDestination(entry, saved));
  const destination = others.length > 0 && !allowSharedMove ? copyDestination(others[0].destination) : copyDestination(saved.destination);
  const nextSaved: GuideEntry = { ...saved, id, destination };
  let replaced = false;
  const updated = entries.map((entry) => {
    if (entry.id === id) {
      replaced = true;
      return nextSaved;
    }
    return sharesDestination(entry, saved) ? { ...entry, destination: copyDestination(destination) } : entry;
  });
  return { entries: replaced ? updated : [...updated, nextSaved], id };
}

/** 지도 보기(GuideMapViewer)에 넘길 모양. 도착·출발이 없으면 그릴 수 없어 null. */
export function toMapGuide(entry: GuideEntry): MapGuide | null {
  if (!entry.destination.point || !entry.start) return null;
  return {
    id: entry.id || "draft",
    kind: entry.kind,
    title: entry.title.trim() || "제목 없는 공략",
    agentId: entry.agentId,
    skillId: `${entry.agentId}-${entry.abilitySlot.toLowerCase()}`,
    destinationId: entry.destination.id,
    destinationName: entry.destination.name.trim() || "이름 없는 도착점",
    landing: entry.destination.point,
    start: entry.start,
    path: entry.path,
    videoUrl: entry.videoUrl,
  };
}
