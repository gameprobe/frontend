import type { RiotContent } from '../contracts/riot';

/** 공식 콘텐츠의 실 ID를 수집한 값이 아니라 fixture 안에서만 쓰는 합성 식별자다. */
export const contentIds = {
  agents: {
    jett: 'demo-agent-jett',
    omen: 'demo-agent-omen',
    sova: 'demo-agent-sova',
    sage: 'demo-agent-sage',
    raze: 'demo-agent-raze',
    brimstone: 'demo-agent-brimstone',
    cypher: 'demo-agent-cypher',
  },
  maps: {
    ascent: { id: 'demo-map-ascent', assetPath: '/Game/Maps/Demo/Ascent/Ascent' },
    haven: { id: 'demo-map-haven', assetPath: '/Game/Maps/Demo/Haven/Haven' },
    bind: { id: 'demo-map-bind', assetPath: '/Game/Maps/Demo/Bind/Bind' },
  },
  weapons: { vandal: 'demo-weapon-vandal', phantom: 'demo-weapon-phantom', ghost: 'demo-weapon-ghost' },
  armor: 'demo-armor-heavy',
  season: 'demo-act-2026-01',
  gameMode: '/Game/GameModes/Demo/Bomb/BombGameMode',
} as const;

/** 화면 이름은 예시다. maps.id와 상세의 mapId에 쓰이는 assetPath를 구분한다. */
export const content: RiotContent = {
  version: 'synthetic-content-v1',
  characters: [
    { id: contentIds.agents.jett, name: 'Jett' },
    { id: contentIds.agents.omen, name: 'Omen' },
    { id: contentIds.agents.sova, name: 'Sova' },
    { id: contentIds.agents.sage, name: 'Sage' },
    { id: contentIds.agents.raze, name: 'Raze' },
    { id: contentIds.agents.brimstone, name: 'Brimstone' },
    { id: contentIds.agents.cypher, name: 'Cypher' },
  ],
  maps: [
    { ...contentIds.maps.ascent, name: 'Ascent' },
    { ...contentIds.maps.haven, name: 'Haven' },
    { ...contentIds.maps.bind, name: 'Bind' },
  ],
  equips: [
    { id: contentIds.weapons.vandal, name: 'Vandal' },
    { id: contentIds.weapons.phantom, name: 'Phantom' },
    { id: contentIds.weapons.ghost, name: 'Ghost' },
    { id: contentIds.armor, name: 'Heavy Shields' },
  ],
  acts: [{ id: contentIds.season, name: 'Demo Act 2026', isActive: true }],
};
