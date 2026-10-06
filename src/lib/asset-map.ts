type AssetKind = "agent" | "map" | "weapon" | "tier";

export const LINEUP_MAP_OPTIONS = [
  { id: "ascent", name: "Ascent" },
  { id: "split", name: "Split" },
  { id: "fracture", name: "Fracture" },
  { id: "bind", name: "Bind" },
  { id: "breeze", name: "Breeze" },
  { id: "abyss", name: "Abyss" },
  { id: "lotus", name: "Lotus" },
  { id: "sunset", name: "Sunset" },
  { id: "pearl", name: "Pearl" },
  { id: "icebox", name: "Icebox" },
  { id: "corrode", name: "Corrode" },
  { id: "haven", name: "Haven" },
] as const;

export const LINEUP_AGENT_OPTIONS = [
  { id: "astra", name: "Astra" },
  { id: "breach", name: "Breach" },
  { id: "brimstone", name: "Brimstone" },
  { id: "chamber", name: "Chamber" },
  { id: "clove", name: "Clove" },
  { id: "cypher", name: "Cypher" },
  { id: "deadlock", name: "Deadlock" },
  { id: "fade", name: "Fade" },
  { id: "gekko", name: "Gekko" },
  { id: "harbor", name: "Harbor" },
  { id: "iso", name: "Iso" },
  { id: "jett", name: "Jett" },
  { id: "kay-o", name: "KAY/O" },
  { id: "killjoy", name: "Killjoy" },
  { id: "miks", name: "Miks" },
  { id: "neon", name: "Neon" },
  { id: "omen", name: "Omen" },
  { id: "phoenix", name: "Phoenix" },
  { id: "raze", name: "Raze" },
  { id: "reyna", name: "Reyna" },
  { id: "sage", name: "Sage" },
  { id: "skye", name: "Skye" },
  { id: "sova", name: "Sova" },
  { id: "tejo", name: "Tejo" },
  { id: "veto", name: "Veto" },
  { id: "viper", name: "Viper" },
  { id: "vyse", name: "Vyse" },
  { id: "waylay", name: "Waylay" },
  { id: "yoru", name: "Yoru" },
] as const;

const agentAssetPaths: Record<string, string> = {
  jett: "/assets/agents/jett.png",
  sova: "/assets/agents/sova.png",
  omen: "/assets/agents/omen.png",
};

const mapAssetPaths: Record<string, string> = {
  ascent: "/assets/maps/ascent.png",
  split: "/assets/maps/split.png",
  fracture: "/assets/maps/fracture.png",
  bind: "/assets/maps/bind.png",
  breeze: "/assets/maps/breeze.png",
  district: "/assets/maps/district.png",
  kasbah: "/assets/maps/kasbah.png",
  drift: "/assets/maps/drift.png",
  glitch: "/assets/maps/glitch.png",
  piazza: "/assets/maps/piazza.png",
  abyss: "/assets/maps/abyss.png",
  lotus: "/assets/maps/lotus.png",
  sunset: "/assets/maps/sunset.png",
  pearl: "/assets/maps/pearl.png",
  icebox: "/assets/maps/icebox.png",
  corrode: "/assets/maps/corrode.png",
  haven: "/assets/maps/haven.png",
};

const weaponAssetPaths: Record<string, string> = {
  vandal: "/assets/weapons/vandal.png",
  phantom: "/assets/weapons/phantom.png",
  operator: "/assets/weapons/operator.png",
};

const tierAssetPaths: Record<string, string> = {
  // Competitive rank status only; do not use this for the Unrated queue label.
  unranked: "/assets/tiers/unranked.png",
  unrated: "/assets/tiers/unranked.png",
  placement: "/assets/tiers/unranked.png",
  iron: "/assets/tiers/iron-1.png",
  "iron 1": "/assets/tiers/iron-1.png",
  "iron 2": "/assets/tiers/iron-2.png",
  "iron 3": "/assets/tiers/iron-3.png",
  bronze: "/assets/tiers/bronze-1.png",
  "bronze 1": "/assets/tiers/bronze-1.png",
  "bronze 2": "/assets/tiers/bronze-2.png",
  "bronze 3": "/assets/tiers/bronze-3.png",
  silver: "/assets/tiers/silver-1.png",
  "silver 1": "/assets/tiers/silver-1.png",
  "silver 2": "/assets/tiers/silver-2.png",
  "silver 3": "/assets/tiers/silver-3.png",
  gold: "/assets/tiers/gold-1.png",
  "gold 1": "/assets/tiers/gold-1.png",
  "gold 2": "/assets/tiers/gold-2.png",
  "gold 3": "/assets/tiers/gold-3.png",
  platinum: "/assets/tiers/platinum-1.png",
  "platinum 1": "/assets/tiers/platinum-1.png",
  "platinum 2": "/assets/tiers/platinum-2.png",
  "platinum 3": "/assets/tiers/platinum-3.png",
  diamond: "/assets/tiers/diamond-1.png",
  "diamond 1": "/assets/tiers/diamond-1.png",
  "diamond 2": "/assets/tiers/diamond-2.png",
  "diamond 3": "/assets/tiers/diamond-3.png",
  ascendant: "/assets/tiers/ascendant-1.png",
  "ascendant 1": "/assets/tiers/ascendant-1.png",
  "ascendant 2": "/assets/tiers/ascendant-2.png",
  "ascendant 3": "/assets/tiers/ascendant-3.png",
  immortal: "/assets/tiers/immortal-1.png",
  "immortal 1": "/assets/tiers/immortal-1.png",
  "immortal 2": "/assets/tiers/immortal-2.png",
  "immortal 3": "/assets/tiers/immortal-3.png",
  radiant: "/assets/tiers/radiant.png",
};

const localizedTierNames: Record<string, string> = {
  "아이언": "iron",
  "브론즈": "bronze",
  "실버": "silver",
  "골드": "gold",
  "플래티넘": "platinum",
  "다이아몬드": "diamond",
  "초월자": "ascendant",
  "불멸": "immortal",
  "레디언트": "radiant",
  "랭크": "unranked",
  "언랭크": "unranked",
};

function fallbackPath(kind: AssetKind): string {
  return `/assets/${kind}s/placeholder.svg`;
}

function normalizeTierId(tierId: string): string {
  const normalized = tierId.trim().toLowerCase().replace(/\s+/g, " ");

  if (normalized === "랭크 없음" || normalized === "배치 전") {
    return "unranked";
  }

  const localizedMatch = normalized.match(/^(\S+)(?:\s+([1-3]))?$/);

  if (localizedMatch) {
    const [, localizedName, division] = localizedMatch;
    const englishName = localizedTierNames[localizedName];

    if (englishName) {
      return division ? `${englishName} ${division}` : englishName;
    }
  }

  return normalized;
}

const agentFullAssetPaths: Record<string, string> = {
  jett: "/assets/agents/jett_full.png",
  sova: "/assets/agents/sova_full.png",
  omen: "/assets/agents/omen_full.png",
};

const mapListViewAssetPaths: Record<string, string> = {
  ascent: "/assets/maps/ascent_listview.png",
  haven: "/assets/maps/haven_listview.png",
  split: "/assets/maps/split_listview.png",
};

const mapSplashAssetPaths: Record<string, string> = {
  ascent: "/assets/maps/ascent_splash.png",
  split: "/assets/maps/split_splash.png",
  fracture: "/assets/maps/fracture_splash.png",
  bind: "/assets/maps/bind_splash.png",
  breeze: "/assets/maps/breeze_splash.png",
  abyss: "/assets/maps/abyss_splash.png",
  lotus: "/assets/maps/lotus_splash.png",
  sunset: "/assets/maps/sunset_splash.png",
  pearl: "/assets/maps/pearl_splash.png",
  icebox: "/assets/maps/icebox_splash.png",
  corrode: "/assets/maps/corrode_splash.png",
  haven: "/assets/maps/haven_splash.png",
};

export function getAgentAssetPath(agentId: string): string {
  return agentAssetPaths[agentId] ?? `/assets/agents/${agentId}.png`;
}

export function getAbilityAssetPath(agentId: string, slot: "C" | "Q" | "E" | "X"): string {
  return `/assets/abilities/${agentId}-${slot.toLowerCase()}.png`;
}

export function getAgentFullAssetPath(agentId: string): string {
  return agentFullAssetPaths[agentId] ?? fallbackPath("agent");
}

export function getMapAssetPath(mapId: string): string {
  return mapAssetPaths[mapId] ?? fallbackPath("map");
}

export function getMapListViewAssetPath(mapId: string): string {
  return mapListViewAssetPaths[mapId] ?? fallbackPath("map");
}

export function getMapSplashAssetPath(mapId: string): string {
  return mapSplashAssetPaths[mapId] ?? fallbackPath("map");
}

export function getWeaponAssetPath(weaponId: string): string {
  return weaponAssetPaths[weaponId] ?? fallbackPath("weapon");
}

export function getTierAssetPath(tierId: string): string {
  return tierAssetPaths[normalizeTierId(tierId)] ?? fallbackPath("tier");
}
