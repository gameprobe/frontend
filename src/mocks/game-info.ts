import type { AgentRole } from "@/lib/assets";
import { META_AGENTS, META_MAPS, META_WEAPONS, type MetaAgent } from "@/mocks/meta";
import { mapEnglishName, weaponInfo } from "@/data/game-names";
import { agentSkills, topAttackLineups } from "@/mocks/lineups";

/** 06 게임 정보 예시 데이터. 값은 Figma 06 섹션(48:83)에 그려진 그대로이고, 없는 값은 주석에 적었다. */

const ROLE_ORDER: AgentRole[] = ["duelist", "initiator", "controller", "sentinel"];

/** 요원 카드 순서 (시안 19 요원 그리드) */
const AGENT_ORDER = [
  "jett", "reyna", "phoenix", "raze", "yoru", "neon",
  "iso", "sova", "breach", "skye", "kayo", "fade",
  "gekko", "brimstone", "viper", "omen", "astra", "harbor",
  "clove", "sage", "cypher", "killjoy", "chamber", "deadlock",
];

/** 한 줄 소개. 제트는 시안 문구, 나머지는 같은 말투로 쓴 예시다. */
const AGENT_DESCRIPTIONS: Record<string, string> = {
  jett: "교전을 먼저 열고 킬을 만들어 내는 진입 담당이에요.",
  reyna: "킬을 올릴수록 회복과 이동으로 더 강해지는 요원이에요.",
  phoenix: "섬광과 불길로 혼자서도 교전을 열 수 있어요.",
  raze: "폭발물로 좁은 구역을 정리하고 빠르게 진입해요.",
  yoru: "순간이동과 속임수로 상대의 시선을 흔들어요.",
  neon: "빠른 속도로 사이트에 먼저 들어가는 돌격형 요원이에요.",
  iso: "보호막으로 일대일 교전을 유리하게 만들어요.",
  sova: "정찰 화살과 드론으로 적 위치를 먼저 알려 줘요.",
  breach: "벽 너머로 섬광과 기절을 넣어 진입을 도와요.",
  skye: "섬광과 회복으로 팀의 진입과 유지력을 함께 챙겨요.",
  kayo: "스킬 억제로 상대의 능력 사용을 막는 척후대예요.",
  fade: "추적과 포박으로 숨어 있는 적을 찾아내요.",
  gekko: "회수할 수 있는 생물 스킬로 설치와 해체를 도와요.",
  brimstone: "정확한 연막과 지원 사격으로 사이트를 장악해요.",
  viper: "독성 장막으로 시야를 나눠 지역을 오래 지켜요.",
  omen: "어디서든 연막을 깔고 순간이동으로 측면을 노려요.",
  astra: "별을 배치해 맵 전체에 연막과 기절을 넣어요.",
  harbor: "물의 장벽으로 넓은 진입로를 한 번에 가려요.",
  clove: "쓰러진 뒤에도 연막을 깔 수 있는 공격형 전략가예요.",
  sage: "벽과 둔화로 진입을 늦추고 아군을 되살려요.",
  cypher: "함정과 카메라로 측면 정보를 지켜요.",
  killjoy: "포탑과 장치로 사이트를 자동으로 지켜요.",
  chamber: "정밀한 사격과 순간이동으로 위치를 지켜요.",
  deadlock: "중력그물과 장벽으로 진입로를 막아요.",
};

export type AgentInfo = MetaAgent & {
  description: string;
  /** 추천 맵 3개와 그 맵에서의 승률 */
  recommendedMaps: { mapId: string; winRate: number }[];
};

const AGENT_BY_ID = Object.fromEntries(META_AGENTS.map((agent) => [agent.agentId, agent]));

/**
 * 추천 맵: 제트는 시안 값(어센트 52.0, 로터스 52.3, 바인드 53.8).
 * 나머지는 메타 맵 통계의 '승률 높은 요원'에 든 맵을 먼저 고르고, 모자라면 맵 순서대로 채운 예시다.
 */
function recommendedMaps(agent: MetaAgent, index: number) {
  if (agent.agentId === "jett") {
    return [
      { mapId: "ascent", winRate: 52.0 },
      { mapId: "lotus", winRate: 52.3 },
      { mapId: "bind", winRate: 53.8 },
    ];
  }
  const strong = META_MAPS.filter((map) => map.topAgentIds.includes(agent.agentId)).map((map) => map.mapId);
  const rest = META_MAPS.map((map) => map.mapId).filter((mapId) => !strong.includes(mapId));
  const rotated = [...rest.slice(index % rest.length), ...rest.slice(0, index % rest.length)];
  return [...strong, ...rotated].slice(0, 3).map((mapId, order) => ({
    mapId,
    winRate: Number((agent.winRate + 1.6 - order * 0.5).toFixed(1)),
  }));
}

export const AGENT_INFOS: AgentInfo[] = AGENT_ORDER.map((agentId, index) => {
  const agent = AGENT_BY_ID[agentId];
  return { ...agent, description: AGENT_DESCRIPTIONS[agentId], recommendedMaps: recommendedMaps(agent, index) };
}).sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

export function findAgentInfo(agentId: string): AgentInfo | undefined {
  return AGENT_INFOS.find((agent) => agent.agentId === agentId);
}

export type MapInfo = {
  mapId: string;
  name: string;
  englishName: string;
  sites: number;
  attackWinRate: number;
  /** 이 맵에서 승률 높은 요원 */
  topAgents: { agentId: string; winRate: number }[];
};

/** 어센트 요원 승률은 시안(20b) 값이다. 다른 맵은 요원 메타 승률에 맵 순서별 보정을 더한 예시다. */
const ASCENT_TOP_RATES = [54.8, 51.2, 52.5, 53.4, 54.7];

export const MAP_INFOS: MapInfo[] = META_MAPS.map((map, mapIndex) => ({
  mapId: map.mapId,
  name: map.name,
  englishName: mapEnglishName(map.mapId),
  sites: map.mapId === "haven" || map.mapId === "lotus" ? 3 : 2,
  attackWinRate: map.attackWinRate,
  topAgents: map.topAgentIds.map((agentId, index) => ({
    agentId,
    winRate:
      mapIndex === 0
        ? ASCENT_TOP_RATES[index]
        : Number((AGENT_BY_ID[agentId].winRate + 1.2 + ((mapIndex + index) % 4) * 0.4).toFixed(1)),
  })),
}));

export function findMapInfo(mapId: string): MapInfo | undefined {
  return MAP_INFOS.find((map) => map.mapId === mapId);
}

export const WEAPON_CATEGORIES = ["권총", "기관단총", "산탄총", "소총", "저격총", "중화기"] as const;

export type WeaponInfo = {
  weaponId: string;
  name: string;
  category: (typeof WEAPON_CATEGORIES)[number];
  /** 0은 기본 지급 */
  price: number;
  fireRate: number;
  magazine: number;
  /** 가장 가까운 거리 구간의 피해량 */
  headDamage: number;
  bodyDamage: number;
};

/** 21 무기 정보 카드 순서 (시안 순서) */
const WEAPON_ORDER = [
  "classic", "shorty", "frenzy", "ghost", "sheriff", "stinger", "spectre", "bucky", "judge",
  "bulldog", "guardian", "phantom", "vandal", "marshal", "outlaw", "operator", "ares", "odin",
];

/**
 * 이름·분류·연사 속도·탄창·피해량은 Riot Public Content Catalog 값(가장 가까운 거리 구간)이다.
 * 가격은 카탈로그에 없어 05 무기 통계(시안) 값을 쓴다.
 */
export const WEAPON_INFOS: WeaponInfo[] = WEAPON_ORDER.map((weaponId) => {
  const catalog = weaponInfo(weaponId);
  const meta = META_WEAPONS.find((candidate) => candidate.weaponId === weaponId)!;
  return {
    weaponId,
    name: catalog.ko,
    category: catalog.category as WeaponInfo["category"],
    price: meta.price,
    fireRate: catalog.fireRate,
    magazine: catalog.magazine,
    headDamage: catalog.headDamage,
    bodyDamage: catalog.bodyDamage,
  };
});

export type Crosshair = {
  name: string;
  length: number;
  thickness: number;
  gap: number;
  /** 가운데 점 */
  dot: boolean;
  /** T자형(위쪽 선 없음) */
  tShape: boolean;
  code: string;
};

/** 22 조준점 (시안 값). 미리보기는 길이·두께·간격으로 그린다. */
export const CROSSHAIRS: Crosshair[] = [
  { name: "기본 십자", length: 6, thickness: 2, gap: 3, dot: false, tShape: false, code: "0;P;h;0;0t;2;0l;6;0o;3;0a;1;0f;0;1b;0;1b;0" },
  { name: "점 조준", length: 0, thickness: 3, gap: 0, dot: true, tShape: false, code: "0;P;h;0;d;1;0t;3;0l;0;0o;0;0a;1;0f;0;1b;0;1b;0" },
  { name: "짧은 십자", length: 4, thickness: 2, gap: 2, dot: false, tShape: false, code: "0;P;h;0;o;0;0t;2;0l;4;0o;2;0a;1;0f;0;1b;0;1b;0" },
  { name: "십자 + 점", length: 5, thickness: 2, gap: 4, dot: true, tShape: false, code: "0;P;h;0;d;1;0t;2;0l;5;0o;4;0a;1;0f;0;1b;0;1b;0" },
  { name: "굵은 십자", length: 7, thickness: 4, gap: 3, dot: false, tShape: false, code: "0;P;h;0;0t;4;0l;7;0o;3;0a;1;0f;0;1b;0;1b;0" },
  { name: "T자형", length: 6, thickness: 2, gap: 3, dot: false, tShape: true, code: "0;P;h;0;0t;2;0l;6;0o;3;0a;1;0f;0;1b;0;0v;0;1b;0" },
];

export type Lineup = {
  agentId: string;
  title: string;
  how: string;
  site: "A" | "B" | "C" | "미드";
  /** 미니맵 위 표시 위치 (왼쪽·위, %) */
  x: number;
  y: number;
};

/** 23 라인업 어센트(시안 값). 위치는 470px 미니맵 기준 좌표를 %로 바꾼 값이다. */
const ASCENT_GUIDE_LINEUPS: Lineup[] = [
  { agentId: "killjoy", title: "A 사이트 기본 설치 위치 정찰", how: "미드 계단에서 조준 후 사용", site: "A", x: 53.6, y: 72.6 },
  { agentId: "brimstone", title: "B 메인 진입 견제", how: "미드 계단에서 조준 후 사용", site: "B", x: 62.4, y: 60.4 },
  { agentId: "gekko", title: "A 사이트 리테이크 몰리", how: "미드 계단에서 조준 후 사용", site: "A", x: 69.4, y: 46.4 },
  { agentId: "sova", title: "B 사이트 포스트 플랜트", how: "미드 계단에서 조준 후 사용", site: "B", x: 20.4, y: 32.4 },
  { agentId: "viper", title: "미드 컨트롤 연막", how: "미드 계단에서 조준 후 사용", site: "미드", x: 28.4, y: 75.4 },
];

/**
 * 06 게임 정보 라인업 탭. 어센트는 시안 값, 다른 맵은 08 라인업 예시(mocks/lineups)의 공격 라인업 추천 수 상위 5개다.
 * 08의 착지 지점(512 기준 가운데)을 이 탭 마커(20×24) 왼쪽·위 %로 바꾼다.
 */
export function guideLineups(mapId: string): Lineup[] {
  if (mapId === "ascent") return ASCENT_GUIDE_LINEUPS;
  return topAttackLineups(mapId, 5).map((lineup) => ({
    agentId: lineup.agentId,
    title: lineup.title,
    how: `${agentSkills(lineup.agentId).find((skill) => skill.skillId === lineup.skillId)?.name ?? ""} · 추천 ${lineup.votes}`,
    site: lineup.site,
    x: Number((((lineup.landing.x - 10) / 512) * 100).toFixed(1)),
    y: Number((((lineup.landing.y - 12) / 512) * 100).toFixed(1)),
  }));
}

export type PatchChange = { agentId: string; kind: "상향" | "하향" | "조정"; text: string };
export type PatchNote = { version: string; title: string; date: string; changes: PatchChange[] };

/** 24 패치 노트. 11.08의 변경 내용은 시안 값, 11.07~11.05는 시안에 접힌 상태로만 있어 제목에 맞춘 예시다. */
export const PATCH_NOTES: PatchNote[] = [
  {
    version: "11.08",
    title: "감시자 밸런스 조정과 경쟁전 개선",
    date: "2026.09.30",
    changes: [
      { agentId: "chamber", kind: "상향", text: "헤드헌터 탄창 8 → 9발" },
      { agentId: "deadlock", kind: "상향", text: "중력그물 지속 시간 증가" },
      { agentId: "cypher", kind: "하향", text: "스파이캠 재사용 대기시간 증가" },
      { agentId: "jett", kind: "조정", text: "순풍 사용 후 무기 회복 시간 조정" },
    ],
  },
  {
    version: "11.07",
    title: "전략가 연막 지속 시간 통일",
    date: "2026.09.16",
    changes: [
      { agentId: "brimstone", kind: "조정", text: "공중 연막 지속 시간 19 → 18초" },
      { agentId: "omen", kind: "조정", text: "어둠의 장막 지속 시간 15 → 18초" },
      { agentId: "astra", kind: "조정", text: "성운 지속 시간 14 → 18초" },
    ],
  },
  {
    version: "11.06",
    title: "척후대 정보 능력 조정",
    date: "2026.09.02",
    changes: [
      { agentId: "sova", kind: "하향", text: "정찰용 화살 표시 시간 감소" },
      { agentId: "fade", kind: "상향", text: "추적귀 이동 속도 증가" },
    ],
  },
  {
    version: "11.05",
    title: "타격대 진입 능력 조정",
    date: "2026.08.19",
    changes: [
      { agentId: "raze", kind: "하향", text: "폭발 팩 피해량 감소" },
      { agentId: "neon", kind: "상향", text: "고속 기어 충전 속도 증가" },
    ],
  },
];
