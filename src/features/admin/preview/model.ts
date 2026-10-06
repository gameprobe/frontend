export type PreviewKind = 'lineup' | 'smoke';
export type PreviewStatus = 'draft' | 'review' | 'published' | 'rejected';
export type Point = { x: number; y: number };
/** 스모크 예시에만 종류를 유지하며 라인업은 x/y만 사용한다. */
export type RoutePoint = Point & { kind?: 'waypoint' | 'bounce' };
export type PointMode = 'start' | 'target' | 'wallEnd' | 'path' | 'bounce';
export type PointSelection = { kind: 'start' | 'target' | 'wallEnd' } | { kind: 'path'; index: number };

/** 좌표가 같아도 다른 도착점일 수 있으므로 ID로 공략을 묶는다. */
export interface PreviewDestination {
  id: string;
  name: string;
  point: Point | null;
}

/** /admin/preview의 공략 한 건. 실제 공개 API나 DB 저장 형식이 아니다. */
export interface PreviewDraft {
  id: string;
  title: string;
  kind: PreviewKind;
  status: PreviewStatus;
  mapId: string;
  agentId: string;
  side: 'attack' | 'defense';
  site: 'A' | 'B' | 'C' | 'Mid';
  abilitySlot: 'C' | 'Q' | 'E' | 'X';
  mediaType: 'video' | 'image';
  mediaUrl: string;
  notes: string;
  shape: 'circle' | 'wall';
  destination: PreviewDestination;
  start: Point | null;
  path: RoutePoint[];
  wallEnd: Point | null;
}

export interface DestinationGroup {
  destination: PreviewDestination;
  mapId: string;
  entries: PreviewDraft[];
}

function copyDestination(destination: PreviewDestination): PreviewDestination {
  return { ...destination, point: destination.point ? { ...destination.point } : null };
}

/** 새 공략에는 독립 도착점 ID를 부여한다. 좌표와 자료는 직접 입력해야 한다. */
export function createEmpty(kind: PreviewKind, destinationId: string = crypto.randomUUID()): PreviewDraft {
  return {
    id: '', title: '', kind, status: 'draft', mapId: 'ascent',
    agentId: kind === 'lineup' ? 'sova' : 'omen', side: 'attack', site: 'A',
    abilitySlot: 'E', mediaType: 'video', mediaUrl: '', notes: '', shape: 'circle',
    destination: { id: destinationId, name: '', point: null }, start: null, path: [], wallEnd: null,
  };
}

/** 같은 도착점에서 공략을 추가한다. 출발점·경로·자료는 다른 공략과 공유하지 않는다. */
export function createAtDestination(source: PreviewDraft): PreviewDraft {
  return {
    ...createEmpty(source.kind, source.destination.id),
    mapId: source.mapId, agentId: source.agentId, side: source.side, site: source.site,
    abilitySlot: source.abilitySlot, shape: source.shape, destination: copyDestination(source.destination),
  };
}

/** 합성 예시이며 실제 공략·정확한 반사 위치·유효한 자료 주소를 의미하지 않는다. */
export function createExamples(): PreviewDraft[] {
  const destination: PreviewDestination = { id: 'destination-ascent-a-example', name: '예시 · A 지점', point: { x: 0.64, y: 0.32 } };
  const lineup: PreviewDraft = {
    ...createEmpty('lineup', destination.id), id: 'preview-lineup-01', title: '예시 · 소바 벽 튕김 공략',
    status: 'review', mediaUrl: 'https://example.com/lineup-bounce-video', destination,
    notes: '관리자 화면 체험용 예시입니다. 좌표와 경로는 실제 공략이 아닙니다.',
    start: { x: 0.34, y: 0.72 },
    path: [{ x: 0.43, y: 0.6 }, { x: 0.52, y: 0.43 }],
  };
  return [
    lineup,
    {
      ...createAtDestination(lineup), id: 'preview-lineup-02', title: '예시 · 소바 다른 출발 공략',
      mediaUrl: 'https://example.com/lineup-direct-video', start: { x: 0.28, y: 0.57 },
      notes: '같은 도착점을 다른 출발점에서 향하는 별도 공략입니다.',
    },
    {
      ...createAtDestination(lineup), id: 'preview-lineup-03', title: '예시 · 소바 경유 공략',
      mediaType: 'image', mediaUrl: 'https://example.com/lineup-waypoint-image', start: { x: 0.76, y: 0.67 },
      path: [{ x: 0.76, y: 0.45 }],
      notes: '공략마다 출발점·경로·자료를 따로 등록하는 예시입니다.',
    },
    {
      ...createEmpty('smoke', 'destination-ascent-smoke-example'), id: 'preview-smoke-01', title: '예시 · 오멘 원형 스모크 공략',
      mediaType: 'image', mediaUrl: 'https://example.com/smoke-image',
      notes: '이미지 주소와 출발·도착 위치를 입력하는 흐름을 확인하세요.',
      destination: { id: 'destination-ascent-smoke-example', name: '예시 · 연막 도착점', point: { x: 0.6, y: 0.36 } },
      start: { x: 0.38, y: 0.7 },
    },
    {
      ...createEmpty('smoke', 'destination-ascent-wall-example'), id: 'preview-smoke-02', title: '예시 · 하버 벽형 스모크 공략',
      agentId: 'harbor', site: 'B', shape: 'wall', status: 'review', mediaUrl: 'https://example.com/wall-video',
      notes: '벽형 자료의 출발·도착·벽 끝을 지정하는 예시입니다. 실제 스킬 경로가 아닙니다.',
      destination: { id: 'destination-ascent-wall-example', name: '예시 · 벽형 도착점', point: { x: 0.3, y: 0.38 } },
      start: { x: 0.31, y: 0.68 }, wallEnd: { x: 0.55, y: 0.29 },
    },
  ];
}

/** 링크 형식만 검사한다. URL의 실제 자료는 조회하지 않는다. */
export function isSafeMediaUrl(value: string): boolean {
  const trimmed = value.trim();
  const authority = trimmed.match(/^https?:\/\/([^/?#]+)/i)?.[1];
  if (!authority || authority.includes('@') || /[\s\u0000-\u001f\u007f\\]/.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    return (url.protocol === 'https:' || url.protocol === 'http:')
      && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isValidPoint(point: Point): boolean {
  return Number.isFinite(point.x) && Number.isFinite(point.y)
    && point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

/** 저장 전 공략 한 건의 필수 입력과 원본 지도 기준 0~1 좌표를 검증한다. */
export function validateDraft(draft: PreviewDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.title.trim()) errors.title = '공략 제목을 입력해 주세요.';
  else if (draft.title.trim().length > 120) errors.title = '제목은 120자 이내로 입력해 주세요.';
  if (!draft.mediaUrl.trim()) errors.mediaUrl = '영상 또는 이미지 주소를 입력해 주세요.';
  else if (!isSafeMediaUrl(draft.mediaUrl)) errors.mediaUrl = '인증 정보가 없는 올바른 http 또는 https 주소를 입력해 주세요.';
  if (!draft.destination.id.trim()) errors.destination = '새 도착점을 선택해 주세요.';
  else if (!draft.destination.name.trim()) errors.destination = '도착점 이름을 입력해 주세요.';
  else if (!draft.destination.point) errors.destination = '도착 위치를 지정해 주세요.';
  else if (!isValidPoint(draft.destination.point)) errors.destination = '도착 위치는 지도 안에 지정해 주세요.';
  if (!draft.start) errors.start = '출발 위치를 지정해 주세요.';
  else if (!isValidPoint(draft.start)) errors.start = '출발 위치는 지도 안에 지정해 주세요.';
  if (!draft.wallEnd && draft.kind === 'smoke' && draft.shape === 'wall') errors.wallEnd = '벽 끝 위치를 지정해 주세요.';
  else if (draft.wallEnd && !isValidPoint(draft.wallEnd)) errors.wallEnd = '벽 끝 위치는 지도 안에 지정해 주세요.';
  if (draft.path.length > 30) errors.path = '중간 지점은 최대 30개까지 지정할 수 있습니다.';
  else if (draft.path.some((point) => !isValidPoint(point))) errors.path = '경로의 모든 지점을 지도 안에 지정해 주세요.';
  else if (draft.kind === 'smoke' && draft.path.some((point) => point.kind !== undefined && point.kind !== 'waypoint' && point.kind !== 'bounce')) errors.path = '경로 지점은 경유점 또는 벽 반사점으로 지정해 주세요.';
  return errors;
}

/** 기존 묶음의 도착점을 몰래 옮기지 않고 이 공략만 새 도착점으로 분리한다. */
export function detachDestination(draft: PreviewDraft): PreviewDraft {
  return { ...draft, destination: { id: crypto.randomUUID(), name: '', point: null }, path: [], wallEnd: null };
}

export function resetPositions(draft: PreviewDraft): PreviewDraft {
  return { ...detachDestination(draft), start: null };
}

/** 지도가 실제로 달라질 때만 다른 맵에 이전 도착점과 좌표가 남지 않도록 초기화한다. */
export function changeMap(draft: PreviewDraft, mapId: string): PreviewDraft {
  return draft.mapId === mapId ? draft : resetPositions({ ...draft, mapId });
}

/** 편집과 미리보기는 동일하게 출발 → 경유·반사점 → 도착 순서로 그린다. */
export function getRoutePoints(draft: PreviewDraft): Point[] {
  return [
    ...(draft.start ? [draft.start] : []), ...draft.path,
    ...(draft.destination.point ? [draft.destination.point] : []),
  ].map(({ x, y }) => ({ x, y }));
}

/** 지도 클릭과 키보드 입력이 공유하는 좌표 갱신. 다른 공략 객체는 변경하지 않는다. */
export function placePoint(draft: PreviewDraft, mode: PointMode, point: Point): PreviewDraft {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return draft;
  const next = { x: Math.min(1, Math.max(0, point.x)), y: Math.min(1, Math.max(0, point.y)) };
  if (mode === 'target') return { ...draft, destination: { ...draft.destination, point: next } };
  if (mode === 'path' || mode === 'bounce') {
    return draft.path.length >= 30 ? draft : {
      ...draft, path: [...draft.path, draft.kind === 'lineup' ? next : { ...next, kind: mode === 'bounce' ? 'bounce' : 'waypoint' }],
    };
  }
  return { ...draft, [mode]: next };
}

/** 기존 마커 이동 전용. 새 점을 만들거나 경유·반사점 순서를 바꾸지 않는다. */
export function movePoint(draft: PreviewDraft, selection: PointSelection, point: Point, destinationLocked = false): PreviewDraft {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return draft;
  const next = { x: Math.min(1, Math.max(0, point.x)), y: Math.min(1, Math.max(0, point.y)) };
  switch (selection.kind) {
    case 'target':
      if (destinationLocked || !draft.destination.point || !isValidPoint(draft.destination.point)) return draft;
      return { ...draft, destination: { ...draft.destination, point: next } };
    case 'path': {
      const selected = draft.path[selection.index];
      if (!Number.isInteger(selection.index) || selection.index < 0 || !selected || !isValidPoint(selected)) return draft;
      return { ...draft, path: draft.path.map((current, index) => index === selection.index ? { ...current, ...next } : current) };
    }
    case 'start':
    case 'wallEnd': {
      const selected = draft[selection.kind];
      if (!selected || !isValidPoint(selected)) return draft;
      return { ...draft, [selection.kind]: next };
    }
    default:
      return draft;
  }
}

/** 목록의 도착점 선택용 묶음. 같은 좌표/이름이어도 ID가 다르면 합치지 않는다. */
export function groupDestinations(entries: PreviewDraft[], kind: PreviewKind, mapId?: string): DestinationGroup[] {
  const groups = new Map<string, DestinationGroup>();
  for (const entry of entries) {
    if (entry.kind !== kind || (mapId !== undefined && entry.mapId !== mapId)) continue;
    const key = JSON.stringify([kind, entry.mapId, entry.destination.id]);
    const group = groups.get(key);
    if (group) group.entries.push(entry);
    else groups.set(key, { destination: copyDestination(entry.destination), mapId: entry.mapId, entries: [entry] });
  }
  return Array.from(groups.values());
}

/** 검증 완료된 공략 저장. 공유 도착점 이동은 승인 시 좌표만 묶음 전체에 반영한다. */
export function savePreviewEntry(entries: PreviewDraft[], saved: PreviewDraft, allowSharedDestinationMove = false): PreviewDraft[] {
  const sharesDestination = (entry: PreviewDraft) => entry.kind === saved.kind
    && entry.mapId === saved.mapId && entry.destination.id === saved.destination.id;
  const group = entries.filter(sharesDestination);
  const registered = group.find((entry) => entry.id === saved.id) ?? group[0];
  const affectedCount = group.filter((entry) => entry.id !== saved.id).length + 1;
  const mayMove = !registered || affectedCount === 1 || allowSharedDestinationMove;
  const destination = copyDestination(registered ? registered.destination : saved.destination);
  if (mayMove) destination.point = saved.destination.point ? { ...saved.destination.point } : null;
  const nextSaved = { ...saved, destination };
  let replaced = false;
  const updated = entries.map((entry) => {
    if (entry.id === saved.id) {
      replaced = true;
      return nextSaved;
    }
    if (!mayMove || !sharesDestination(entry)) return entry;
    const current = entry.destination.point;
    if (current?.x === destination.point?.x && current?.y === destination.point?.y) return entry;
    return {
      ...entry,
      destination: { ...entry.destination, point: destination.point ? { ...destination.point } : null },
    };
  });
  return replaced ? updated : [...updated, nextSaved];
}
