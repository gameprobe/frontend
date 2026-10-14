import { agentAbilities, agentName, mapName } from "@/data/game-names";
import { MINIMAP_POINTS } from "@/data/minimap-points";
import type { RoutePoint } from "@/components/guide-map/geometry";
import type { AgentRole } from "@/lib/assets";

/**
 * 08 라인업 예시 데이터.
 * - 어센트 · 소바 · 공격 8개는 Figma 08 섹션(72:2)에 그려진 값이다.
 * - 나머지(10개 맵 × 24명 × 공격·수비)는 미니맵의 걸을 수 있는 칸(data/minimap-points.ts) 위에 고정 시드로 만든 예시다.
 *   실제 게임에서 쓸 수 있는 위치가 아니다.
 * 이름(요원·맵·스킬)은 data/game-names(Riot Public Content Catalog)에서 가져온다.
 */

/** 맵 선택 카드 순서 (시안 08) */
const MAP_ORDER = ["ascent", "bind", "breeze", "fracture", "haven", "icebox", "lotus", "pearl", "split", "sunset"];

/** 요원 선택 화면의 역할군별 순서 (시안 09) */
const AGENT_ORDER: Record<AgentRole, string[]> = {
  duelist: ["jett", "phoenix", "raze", "reyna", "yoru", "neon", "iso"],
  initiator: ["sova", "breach", "skye", "kayo", "fade", "gekko"],
  controller: ["brimstone", "viper", "omen", "astra", "harbor", "clove"],
  sentinel: ["killjoy", "cypher", "sage", "chamber", "deadlock"],
};

export const LINEUP_ROLES: AgentRole[] = ["duelist", "initiator", "controller", "sentinel"];

export type Skill = { skillId: string; name: string; key: "Q" | "E" | "C" | "X" };

/** 요원 스킬 4개 (카탈로그 한글 이름, 아이콘 ID = `{요원}-{q|e|c|x}`) */
export function agentSkills(agentId: string): Skill[] {
  return agentAbilities(agentId).map((ability) => ({ skillId: ability.id, name: ability.ko, key: ability.key }));
}

export type LineupSite = "A" | "B" | "C" | "미드";
export type LineupSide = "attack" | "defense";

/** 좌표는 512×512 미니맵 기준 px이다. */
export type Point = { x: number; y: number };

export type Lineup = {
  id: string;
  agentId: string;
  skillId: string;
  title: string;
  side: LineupSide;
  site: LineupSite;
  /** 충전·바운스는 소바 화살처럼 쏘는 스킬에만 있다. */
  charge: number | null;
  bounce: number | null;
  difficulty: "쉬움" | "보통" | "어려움";
  votes: number;
  /** 최신순 정렬용 등록일 */
  addedAt: string;
  /** 착지 지점(마커 가운데) */
  landing: Point;
  /** 던지는 위치(요원 초상 가운데) */
  throwFrom: Point;
  videoLength: string;
  steps: { title: string; text: string; screenshot?: string }[];
  /** 같은 값을 쓰는 라인업끼리 한 도착지로 묶는다. 없으면 라인업 하나가 한 도착지다 (TASK-FE-056) */
  destinationId?: string;
  destinationName?: string;
  /** 던지는 위치 → 착지 사이의 중간 지점. 없으면 직선 */
  path?: RoutePoint[];
  /** 유튜브 영상 주소. 없으면 영상 자리만 보여준다 */
  videoUrl?: string;
};

/** 예시 영상(사용자 지정 2026-10-12, YouTube Shorts). 모든 예시 공략이 같은 영상을 쓴다. */
export const EXAMPLE_VIDEO_URL = "https://www.youtube.com/shorts/qHhYLiFSs8k";

/** 같은 도착지를 쓰는 라인업 묶음 키 */
export const destinationKey = (guide: { id: string; destinationId?: string }) => guide.destinationId ?? guide.id;

export function siteLabel(site: LineupSite): string {
  return site === "미드" ? "미드" : `${site} 사이트`;
}

const center = (x: number, y: number, size = 36): Point => ({ x: x + size / 2, y: y + size / 2 });

function boltSteps(lineup: Pick<Lineup, "charge" | "bounce" | "site">) {
  return [
    { title: "서는 위치", text: `공격 진영에서 ${siteLabel(lineup.site)} 쪽 벽 모서리에 몸을 붙여요.`, screenshot: "서는 위치 스크린샷" },
    { title: "조준", text: "건물 지붕 끝을 기준으로 조준선을 맞춰요.", screenshot: "조준 위치 스크린샷" },
    { title: "발사", text: `충전 ${lineup.charge}칸, 바운스 ${lineup.bounce}회로 제자리에서 발사해요.` },
  ];
}

/** 어센트 · 소바 · 공격 (시안 값). 2~8번의 던지는 위치·단계 설명·등록일은 시안에 없어 채운 예시다. */
const ASCENT_SOVA_ATTACK: Lineup[] = (
  [
    ["a-lobby-a-site", "sova-e", "A 로비 → A 사이트 정찰", "A", 2, 1, "쉬움", 128, "2026-09-28", center(140, 36, 44), center(378, 146, 44), "0:12"],
    ["a-lobby-a-main", "sova-e", "A 로비 → A 메인 정찰", "A", 1, 0, "쉬움", 96, "2026-09-21", center(300, 122), { x: 430, y: 196 }, "0:09"],
    ["mid-market", "sova-e", "미드 정찰 (마켓 방향)", "미드", 2, 1, "보통", 74, "2026-10-02", center(234, 230), { x: 440, y: 300 }, "0:14"],
    ["b-main-b-site", "sova-e", "B 메인 → B 사이트 정찰", "B", 1, 1, "쉬움", 112, "2026-09-15", center(128, 386), { x: 330, y: 446 }, "0:11"],
    ["a-site-default-plant", "sova-q", "A 사이트 기본 설치 지점", "A", 2, 2, "보통", 88, "2026-10-05", center(132, 80), { x: 404, y: 156 }, "0:13"],
    ["b-default-plant", "sova-q", "B 기본 설치 지점", "B", 2, 1, "어려움", 61, "2026-09-30", center(100, 362), { x: 320, y: 436 }, "0:15"],
    ["b-main-entrance", "sova-q", "B 메인 입구 클리어", "B", 1, 1, "쉬움", 45, "2026-10-07", center(86, 304), { x: 300, y: 404 }, "0:10"],
    ["market-door", "sova-q", "마켓 문 클리어", "미드", 2, 0, "보통", 39, "2026-10-08", center(186, 234), { x: 420, y: 290 }, "0:08"],
  ] as const
).map(([id, skillId, title, site, charge, bounce, difficulty, votes, addedAt, landing, throwFrom, videoLength], index) => {
  const lineup = {
    id, agentId: "sova", skillId, title, side: "attack" as const, site, charge, bounce, difficulty, votes, addedAt, landing, throwFrom, videoLength,
  };
  return {
    ...lineup,
    steps:
      index === 0
        ? [
            { title: "서는 위치", text: "A 로비 오른쪽 상자 모서리에 몸을 붙여요.", screenshot: "서는 위치 스크린샷" },
            { title: "조준", text: "A 메인 지붕 끝 안테나 바로 위에 조준선을 맞춰요.", screenshot: "조준 위치 스크린샷" },
            { title: "발사", text: "충전 2칸, 바운스 1회로 제자리에서 발사해요." },
          ]
        : boltSteps(lineup),
    videoUrl: EXAMPLE_VIDEO_URL,
    // 첫 번째 착지 지점은 아래 두 라인업과 함께 쓰는 도착지다
    ...(index === 0 && {
      destinationId: "a-lobby-a-site",
      destinationName: "A 사이트",
    }),
  };
});

/**
 * 'A 로비 → A 사이트' 착지 지점을 다른 출발지에서 쓰는 예시 2개 (TASK-FE-056, 시안에 없는 값).
 * 같은 도착지에 마우스를 올리면 출발지 3곳이 함께 보인다.
 */
const ASCENT_SOVA_SHARED: Lineup[] = (
  [
    ["a-site-from-mid", "미드 → A 사이트 정찰", 2, 0, "보통", 52, "2026-09-12", { x: 330, y: 250 }, [{ x: 240, y: 150 }], "0:12"],
    ["a-site-from-tree", "A 트리 → A 사이트 정찰", 1, 1, "어려움", 33, "2026-09-18", { x: 360, y: 92 }, [{ x: 236, y: 40 }], "0:10"],
  ] as const
).map(([id, title, charge, bounce, difficulty, votes, addedAt, throwFrom, path, videoLength]) => {
  const lineup = {
    id, agentId: "sova", skillId: "sova-e", title, side: "attack" as const, site: "A" as const, charge, bounce, difficulty, votes, addedAt,
    landing: ASCENT_SOVA_ATTACK[0].landing, throwFrom, videoLength,
  };
  return {
    ...lineup,
    steps: boltSteps(lineup),
    destinationId: "a-lobby-a-site",
    destinationName: "A 사이트",
    path: [...path],
    videoUrl: EXAMPLE_VIDEO_URL,
  };
});

/** 문자열로 시드를 만드는 작은 난수 생성기(mulberry32). 같은 맵·요원·진영이면 늘 같은 결과다. */
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

const PHRASES: Record<LineupSide, { site: string[]; mid: string[] }> = {
  attack: {
    site: ["{S} 진입", "{S} 설치 엄호", "{S} 포스트 플랜트", "{S} 메인 정리", "{S} 구석 확인"],
    mid: ["미드 장악", "미드 정찰", "미드 통로 차단"],
  },
  defense: {
    site: ["{S} 리테이크", "{S} 진입 지연", "{S} 메인 견제", "{S} 사이트 수비", "{S} 해체 저지"],
    mid: ["미드 견제", "미드 정보 확인", "미드 밀고 들어오기 차단"],
  },
};
const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
const BOLT_SKILLS = new Set(["sova-q", "sova-e"]);

function generate(mapId: string, agentId: string, side: LineupSide): Lineup[] {
  const data = MINIMAP_POINTS[mapId];
  if (!data) return [];
  const rand = random(`${mapId}/${agentId}/${side}`);
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

  const skills = agentSkills(agentId);
  // 궁극기(X)는 덜 나오게 한다.
  const weighted = skills.flatMap((skill) => (skill.key === "X" ? [skill] : [skill, skill, skill]));
  const count = 3 + Math.floor(rand() * 4);
  const used = new Set<string>();

  return Array.from({ length: count }, (_, index) => {
    const skill = pick(weighted);
    const toSite = data.sites.length > 0 && (midPoints.length === 0 || rand() < 0.75);
    const site = toSite ? pick(data.sites) : undefined;
    const landing = site ? near(site, 0, 45) : pick(midPoints);
    const throwFrom = near(landing, 80, 160);
    let phrase = "";
    for (let tries = 0; tries < 6 && (!phrase || used.has(phrase)); tries += 1) {
      phrase = site ? pick(PHRASES[side].site).replace("{S}", siteLabel(site.label)) : pick(PHRASES[side].mid);
    }
    used.add(phrase);
    const bolt = BOLT_SKILLS.has(skill.skillId);
    const charge = bolt ? Math.floor(rand() * 4) : null;
    const bounce = bolt ? Math.floor(rand() * 3) : null;
    const day = 1 + Math.floor(rand() * 49);
    const date = new Date(Date.UTC(2026, 7, 20 + day));
    const lineupSite: LineupSite = site ? site.label : "미드";
    const sideText = side === "attack" ? "공격" : "수비";
    return {
      id: `${agentId}-${side}-${index + 1}`,
      agentId,
      skillId: skill.skillId,
      title: `${phrase} ${skill.name}`,
      side,
      site: lineupSite,
      charge,
      bounce,
      difficulty: pick(DIFFICULTIES),
      votes: 5 + Math.floor(rand() * 136),
      addedAt: date.toISOString().slice(0, 10),
      landing,
      throwFrom,
      videoLength: `0:${String(6 + Math.floor(rand() * 10)).padStart(2, "0")}`,
      steps: [
        { title: "서는 위치", text: `${sideText} 진영 쪽에서 ${siteLabel(lineupSite)}이 보이는 모서리에 서요.`, screenshot: "서는 위치 스크린샷" },
        { title: "조준", text: "건물 모서리 끝을 기준으로 조준선을 맞춰요.", screenshot: "조준 위치 스크린샷" },
        {
          title: "사용",
          text: bolt
            ? `충전 ${charge}칸, 바운스 ${bounce}회로 제자리에서 발사해요.`
            : `${skill.key} 키로 ${skill.name} 스킬을 사용해요.`,
        },
      ],
    };
  });
}

const cache = new Map<string, Lineup[]>();

/** 맵 · 요원의 공격·수비 라인업 전부 */
export function findLineups(mapId: string, agentId: string): Lineup[] {
  const key = `${mapId}/${agentId}`;
  let lineups = cache.get(key);
  if (!lineups) {
    const attack = mapId === "ascent" && agentId === "sova" ? [...ASCENT_SOVA_ATTACK, ...ASCENT_SOVA_SHARED] : generate(mapId, agentId, "attack");
    lineups = [...attack, ...generate(mapId, agentId, "defense")];
    cache.set(key, lineups);
  }
  return lineups;
}

export type LineupAgent = { agentId: string; name: string; role: AgentRole; count: number };

/** 요원 선택 화면: 역할군 순서대로, 라인업 수는 실제 예시 개수 */
export function lineupAgents(mapId: string): LineupAgent[] {
  return LINEUP_ROLES.flatMap((role) =>
    AGENT_ORDER[role].map((agentId) => ({
      agentId,
      name: agentName(agentId),
      role,
      count: findLineups(mapId, agentId).length,
    })),
  );
}

export type LineupMap = { mapId: string; name: string; total: number; attack: number; defense: number };

function summarize(mapId: string): LineupMap {
  const all = LINEUP_ROLES.flatMap((role) => AGENT_ORDER[role]).flatMap((agentId) => findLineups(mapId, agentId));
  const attack = all.filter((lineup) => lineup.side === "attack").length;
  return { mapId, name: mapName(mapId), total: all.length, attack, defense: all.length - attack };
}

export const LINEUP_MAPS: LineupMap[] = MAP_ORDER.map(summarize);

export function findLineupMap(mapId: string | undefined): LineupMap | undefined {
  return LINEUP_MAPS.find((map) => map.mapId === mapId);
}

/** 맵의 공격 라인업을 추천 수 순으로 (06 게임 정보 라인업 탭) */
export function topAttackLineups(mapId: string, limit: number): Lineup[] {
  return LINEUP_ROLES.flatMap((role) => AGENT_ORDER[role])
    .flatMap((agentId) => findLineups(mapId, agentId))
    .filter((lineup) => lineup.side === "attack")
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);
}

/** 미니맵 위 라벨 (512 기준). 어센트는 시안(74:175) 값, 다른 맵은 사이트 글자만 */
export function minimapLabels(mapId: string) {
  if (mapId === "ascent") {
    return {
      sites: [
        { text: "A", x: 150, y: 62 },
        { text: "B", x: 128, y: 392 },
      ],
      areas: [
        { text: "공격 진영", x: 402, y: 250 },
        { text: "수비 진영", x: 24, y: 260 },
        { text: "미드", x: 230, y: 274 },
      ],
    };
  }
  const sites = (MINIMAP_POINTS[mapId]?.sites ?? []).map((site) => ({ text: site.label, x: site.x - 6, y: site.y - 14 }));
  return { sites, areas: [] as { text: string; x: number; y: number }[] };
}
