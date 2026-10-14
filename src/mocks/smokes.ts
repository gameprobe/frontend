import { agentName } from "@/data/game-names";
import { MINIMAP_POINTS } from "@/data/minimap-points";
import { siteLabel, type LineupSide, type LineupSite, type Point } from "@/mocks/lineups";

/**
 * 09 스모크 가이드 예시 데이터.
 * - 어센트 · 공격의 원형 연막 6개 위치는 Figma 09 섹션(182:4237)에 그려진 값이다. 던지는 위치는 첫 번째(185:4593)만 시안 값이다.
 * - 나머지 맵·진영과 하버 일자 연막은 미니맵의 걸을 수 있는 칸(data/minimap-points.ts) 위에 고정 시드로 만든 예시다.
 *   위치·크기·지속시간 모두 실제 게임에서 검증한 값이 아니다.
 */

export type SmokeVariant = "circle" | "harbor-wall";

export type SmokeGuide = {
  id: string;
  mapId: string;
  side: LineupSide;
  site: LineupSite;
  variant: SmokeVariant;
  agentId: string;
  title: string;
  /** 연막 도착 위치(마커 가운데). 512×512 미니맵 기준 */
  landing: Point;
  /** 하버 일자 연막의 벽 끝 */
  wallEnd?: Point;
  /** 던지는 위치(요원 초상 가운데) */
  throwFrom: Point;
  steps: { title: string; text: string; screenshot: string }[];
};

export const SMOKE_VARIANT_LABEL: Record<SmokeVariant, string> = { circle: "공통 원형", "harbor-wall": "하버 일자" };

/** 좌측 '요원별 연막 비교' 표 (Figma 182:4167). 예시 · 검증 전 값 */
export const SMOKE_AGENT_STATS = [
  { agentId: "omen", size: "4.5m", duration: "15초" },
  { agentId: "brimstone", size: "5m", duration: "19초" },
  { agentId: "astra", size: "4.75m", duration: "14초" },
  { agentId: "clove", size: "4.75m", duration: "14초" },
  { agentId: "harbor", size: "벽 + 4m", duration: "12초" },
].map((stat) => ({ ...stat, name: agentName(stat.agentId) }));

const CIRCLE_AGENTS = ["omen", "brimstone", "astra", "clove"];

function smokeSteps(spot: string, variant: SmokeVariant) {
  return [
    { title: "서는 위치", text: `${spot}이 보이는 벽 모서리에 붙어 서요.`, screenshot: "서는 위치 스크린샷" },
    { title: "조준", text: "건물 지붕 끝 모서리에 조준선을 맞춰요.", screenshot: "조준 스크린샷" },
    {
      title: "설치",
      text: variant === "circle" ? `스킬 맵을 열어 ${spot}에 연막을 찍어요.` : `${spot}을 가로지르도록 벽을 세워요.`,
      screenshot: "설치 스크린샷",
    },
  ];
}

const c = (x: number, y: number): Point => ({ x: x + 18, y: y + 18 });

/** 어센트 · 공격 원형 연막 (시안 마커 위치) */
const ASCENT_ATTACK: SmokeGuide[] = (
  [
    ["a-main-entrance", "A 메인 입구", "A", "omen", c(292, 112), { x: 500, y: 228 }],
    ["a-heaven", "A 천국", "A", "brimstone", c(176, 44), { x: 410, y: 150 }],
    ["mid-bottom", "미드 하단", "미드", "astra", c(268, 300), { x: 440, y: 300 }],
    ["market-door", "마켓 문", "미드", "omen", c(188, 226), { x: 400, y: 280 }],
    ["b-main", "B 메인", "B", "clove", c(92, 318), { x: 300, y: 420 }],
    ["b-site-entrance", "B 사이트 입구", "B", "brimstone", c(150, 356), { x: 330, y: 440 }],
  ] as const
).map(([id, spot, site, agentId, landing, throwFrom]) => ({
  id,
  mapId: "ascent",
  side: "attack" as const,
  site,
  variant: "circle" as const,
  agentId,
  title: `${spot} 원형 연막`,
  landing,
  throwFrom,
  steps:
    id === "a-main-entrance"
      ? [
          { title: "서는 위치", text: "A 로비 오른쪽 상자 옆에 붙어 서요.", screenshot: "서는 위치 스크린샷" },
          { title: "조준", text: "A 메인 지붕 끝 모서리에 조준선을 맞춰요.", screenshot: "조준 스크린샷" },
          { title: "설치", text: "스킬 맵을 열어 A 메인 입구에 연막을 찍어요.", screenshot: "설치 스크린샷" },
        ]
      : smokeSteps(spot, "circle"),
}));

/** 문자열로 시드를 만드는 작은 난수 생성기(mulberry32). mocks/lineups.ts와 같은 방식이다. */
function random(seedText: string) {
  let seed = 0;
  for (const char of seedText) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) | 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPOTS: Record<LineupSide, { site: string[]; mid: string[] }> = {
  attack: { site: ["{S} 입구", "{S} 메인", "{S} 안쪽", "{S} 뒤쪽", "{S} 엄폐물"], mid: ["미드 통로", "미드 하단", "미드 상단"] },
  defense: { site: ["{S} 메인", "{S} 로비 출구", "{S} 초크", "{S} 진입로"], mid: ["미드 입구", "미드 통로"] },
};

function generate(mapId: string, side: LineupSide, variant: SmokeVariant): SmokeGuide[] {
  const data = MINIMAP_POINTS[mapId];
  if (!data) return [];
  const rand = random(`smoke/${mapId}/${side}/${variant}`);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
  const points: Point[] = [];
  for (let i = 0; i < data.points.length; i += 2) points.push({ x: data.points[i], y: data.points[i + 1] });
  const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const near = (target: Point, min: number, max: number) => {
    const candidates = points.filter((point) => {
      const d = distance(point, target);
      return d >= min && d <= max;
    });
    return candidates.length ? pick(candidates) : points.reduce((best, point) => (distance(point, target) < distance(best, target) ? point : best));
  };
  const midPoints = points.filter((point) => data.sites.every((site) => distance(point, site) > 110));

  const count = variant === "circle" ? 4 + Math.floor(rand() * 3) : 2;
  const used = new Set<string>();
  return Array.from({ length: count }, (_, index) => {
    const toSite = data.sites.length > 0 && (midPoints.length === 0 || rand() < 0.7);
    const site = toSite ? pick(data.sites) : undefined;
    const landing = site ? near(site, 10, 60) : pick(midPoints);
    let spot = "";
    for (let tries = 0; tries < 6 && (!spot || used.has(spot)); tries += 1) {
      spot = site ? pick(SPOTS[side].site).replace("{S}", site.label) : pick(SPOTS[side].mid);
    }
    used.add(spot);
    const wall = variant === "harbor-wall";
    return {
      id: `${side}-${variant}-${index + 1}`,
      mapId,
      side,
      site: site ? site.label : "미드",
      variant,
      agentId: wall ? "harbor" : pick(CIRCLE_AGENTS),
      title: `${spot} ${wall ? "하버 일자" : "원형"} 연막`,
      landing,
      wallEnd: wall ? near(landing, 40, 70) : undefined,
      throwFrom: near(landing, 100, 180),
      steps: smokeSteps(spot, variant),
    };
  });
}

const cache = new Map<string, SmokeGuide[]>();

/** 맵 · 진영 · 연막 유형의 예시 연막 */
export function findSmokes(mapId: string, side: LineupSide, variant: SmokeVariant): SmokeGuide[] {
  const key = `${mapId}/${side}/${variant}`;
  let smokes = cache.get(key);
  if (!smokes) {
    smokes = mapId === "ascent" && side === "attack" && variant === "circle" ? ASCENT_ATTACK : generate(mapId, side, variant);
    cache.set(key, smokes);
  }
  return smokes;
}

/** 사이트 칩: 전체 · 맵의 사이트(A·B·C) · 미드. 시안(어센트)은 전체 · A · 미드 · B 순서다. */
export function smokeSiteOptions(mapId: string): { value: "all" | LineupSite; label: string }[] {
  const sites = (MINIMAP_POINTS[mapId]?.sites ?? []).map((site) => site.label).sort();
  const ordered: LineupSite[] = sites.length > 1 ? [sites[0], "미드", ...sites.slice(1)] : [...sites, "미드"];
  return [{ value: "all", label: "전체" }, ...ordered.map((site) => ({ value: site, label: site }))];
}

/** 목록 둘째 줄: '공통 원형 · A 사이트' / '하버 · 일자 연막' (Figma 182:4279 · 182:4303) */
export function smokeMeta(smoke: SmokeGuide): string {
  return smoke.variant === "circle" ? `공통 원형 · ${siteLabel(smoke.site)}` : `${agentName(smoke.agentId)} · 일자 연막`;
}
