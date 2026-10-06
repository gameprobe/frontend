import type { RiotKill, RiotMatch, RiotMatchList, RiotPlayer, RiotRound, RiotRoundPlayer } from '../contracts/riot';
import { contentIds } from './content';

const VIEWER_PUUID = 'demo-player-01';
const ROUND_MILLIS = 90_000;
const weapons = [contentIds.weapons.vandal, contentIds.weapons.phantom, contentIds.weapons.ghost];

interface MatchPlan {
  ordinal: number;
  agentId: string;
  mapPath: string;
  viewerTeam: 'Blue' | 'Red';
  viewerRoundsWon: number;
  enemyRoundsWon: number;
  kills: number;
  deaths: number;
  assists: number;
  startedAtMillis: number;
}

const plans: MatchPlan[] = [
  { ordinal: 1, agentId: contentIds.agents.jett, mapPath: contentIds.maps.ascent.assetPath, viewerTeam: 'Blue', viewerRoundsWon: 13, enemyRoundsWon: 9, kills: 24, deaths: 15, assists: 5, startedAtMillis: 1789862400000 },
  { ordinal: 2, agentId: contentIds.agents.omen, mapPath: contentIds.maps.haven.assetPath, viewerTeam: 'Red', viewerRoundsWon: 9, enemyRoundsWon: 13, kills: 10, deaths: 16, assists: 8, startedAtMillis: 1789776000000 },
  { ordinal: 3, agentId: contentIds.agents.jett, mapPath: contentIds.maps.ascent.assetPath, viewerTeam: 'Blue', viewerRoundsWon: 14, enemyRoundsWon: 12, kills: 18, deaths: 17, assists: 6, startedAtMillis: 1789689600000 },
  { ordinal: 4, agentId: contentIds.agents.sova, mapPath: contentIds.maps.bind.assetPath, viewerTeam: 'Red', viewerRoundsWon: 13, enemyRoundsWon: 6, kills: 13, deaths: 8, assists: 4, startedAtMillis: 1789603200000 },
];

/** 정규전은 한 팀의 13번째 승리가 마지막에 오고, 연장은 12:12 이후 두 라운드다. */
function viewerWinsByRound(plan: MatchPlan): boolean[] {
  if (plan.viewerRoundsWon === 14 && plan.enemyRoundsWon === 12) {
    return [...Array.from({ length: 24 }, (_, index) => index % 2 === 0), true, true];
  }
  const viewerWinsMatch = plan.viewerRoundsWon > plan.enemyRoundsWon;
  let viewerWinsLeft = plan.viewerRoundsWon - Number(viewerWinsMatch);
  let enemyWinsLeft = plan.enemyRoundsWon - Number(!viewerWinsMatch);
  const result: boolean[] = [];
  while (viewerWinsLeft + enemyWinsLeft > 0) {
    const viewerWins = viewerWinsLeft > 0 && (enemyWinsLeft === 0 || result.length % 2 === 0);
    result.push(viewerWins);
    if (viewerWins) viewerWinsLeft -= 1;
    else enemyWinsLeft -= 1;
  }
  return [...result, viewerWinsMatch];
}

function createPlayers(plan: MatchPlan): RiotPlayer[] {
  const enemyTeam = plan.viewerTeam === 'Blue' ? 'Red' : 'Blue';
  const allyAgents = Object.values(contentIds.agents).filter((agent) => agent !== plan.agentId).slice(0, 4);
  const enemyAgents = [contentIds.agents.raze, contentIds.agents.brimstone, contentIds.agents.sova, contentIds.agents.sage, contentIds.agents.cypher];
  return Array.from({ length: 10 }, (_, index) => ({
    puuid: `demo-player-${String(index + 1).padStart(2, '0')}`,
    gameName: `DemoPlayer${String(index + 1).padStart(2, '0')}`,
    tagLine: 'DEMO',
    teamId: index < 5 ? plan.viewerTeam : enemyTeam,
    characterId: index === 0 ? plan.agentId : index < 5 ? allyAgents[index - 1] : enemyAgents[index - 5],
    competitiveTier: 15 + index % 3,
    accountLevel: 40 + index * 7,
    stats: { score: 0, roundsPlayed: 0, kills: 0, deaths: 0, assists: 0, playtimeMillis: 0 },
  }));
}

/** 공식 playerStats 배열만으로 스코어보드·피해·명중 집계를 재현할 수 있게 기록한다. */
function createRound(plan: MatchPlan, players: RiotPlayer[], roundNum: number, viewerWins: boolean, viewerDies: boolean): RiotRound {
  const allyIds = players.slice(0, 5).map((player) => player.puuid);
  const enemyIds = players.slice(5).map((player) => player.puuid);
  const alive = new Set(players.map((player) => player.puuid));
  const roundsPlayed = plan.viewerRoundsWon + plan.enemyRoundsWon;
  const roundKills = Math.floor(plan.kills / roundsPlayed) + Number(roundNum < plan.kills % roundsPlayed);
  const needsViewerAssist = roundNum < plan.assists;
  const stats: RiotRoundPlayer[] = players.map((player, index) => {
    const weaponIndex = (roundNum + index) % weapons.length;
    const loadoutValue = weaponIndex === 2 ? 500 : 3_900;
    return {
      puuid: player.puuid,
      kills: [],
      damage: [],
      score: 0,
      economy: { loadoutValue, weapon: weapons[weaponIndex], armor: weaponIndex === 2 ? '' : contentIds.armor, remaining: 300 + index * 100, spent: loadoutValue },
    };
  });
  const byPuuid = new Map(stats.map((stat) => [stat.puuid, stat]));
  let eventCount = 0;

  const addDamage = (attacker: string, receiver: string, damage: number, kind: string) => {
    const shooterIndex = players.findIndex((player) => player.puuid === attacker);
    const pattern = (roundNum + shooterIndex + eventCount) % 3;
    byPuuid.get(attacker)!.damage.push({
      receiver,
      damage,
      headshots: kind === 'Weapon' && pattern === 0 ? 1 : 0,
      bodyshots: kind === 'Weapon' && pattern !== 0 ? 2 : 0,
      legshots: kind === 'Weapon' && pattern === 2 ? 1 : 0,
    });
  };

  const kill = (killer: string, victim: string, viewerAssists = false) => {
    const killerTeam = allyIds.includes(killer) ? allyIds : enemyIds;
    const helper = killerTeam.find((id) => id !== killer && id !== VIEWER_PUUID && alive.has(id));
    const assistants = viewerAssists ? [VIEWER_PUUID] : helper ? [helper] : [];
    if (!alive.has(killer) || !alive.has(victim) || killerTeam.includes(victim) || assistants.some((id) => !alive.has(id) || id === killer)) {
      throw new Error(`잘못된 합성 이벤트: 경기 ${plan.ordinal}, 라운드 ${roundNum}`);
    }
    const damageType = (roundNum + eventCount + plan.ordinal) % 11 === 0 ? 'Ability' : 'Weapon';
    // 장비 관측값과 마무리 무기는 의도적으로 독립시켜 economy.weapon 오용을 잡는다.
    const damageItem = damageType === 'Weapon' ? weapons[(roundNum + eventCount + 1) % weapons.length] : 'demo-ability-finisher';
    const timeSinceRoundStartMillis = 15_000 + eventCount * 3_000;
    const event: RiotKill = {
      timeSinceGameStartMillis: roundNum * ROUND_MILLIS + timeSinceRoundStartMillis,
      timeSinceRoundStartMillis,
      killer,
      victim,
      assistants,
      finishingDamage: { damageType, damageItem, isSecondaryFireMode: false },
    };
    byPuuid.get(killer)!.kills.push(event);
    assistants.forEach((assistant) => addDamage(assistant, victim, 30, 'Weapon'));
    addDamage(killer, victim, 150 - assistants.length * 30, damageType);
    alive.delete(victim);
    eventCount += 1;
  };

  // 조회 선수의 목표 K/A를 생존 중 먼저 만들고, 승패에 따라 남은 전멸 기록을 완성한다.
  for (let index = 0; index < roundKills; index += 1) kill(VIEWER_PUUID, enemyIds[index]);
  if (needsViewerAssist) kill(allyIds[1], enemyIds[roundKills], true);
  if (viewerDies) kill(enemyIds.find((id) => alive.has(id))!, VIEWER_PUUID);
  const losingPlayers = viewerWins ? enemyIds : allyIds;
  const winners = viewerWins ? allyIds : enemyIds;
  for (const victim of losingPlayers) {
    if (!alive.has(victim)) continue;
    const killers = winners.filter((id) => alive.has(id) && id !== VIEWER_PUUID);
    kill(killers[(roundNum + eventCount) % killers.length], victim);
  }

  const events = stats.flatMap((stat) => stat.kills);
  stats.forEach((stat) => {
    const assists = events.filter((event) => event.assistants.includes(stat.puuid)).length;
    stat.score = stat.damage.reduce((sum, damage) => sum + damage.damage, 0) + stat.kills.length * 100 + assists * 25;
  });
  const winningTeam = viewerWins ? plan.viewerTeam : plan.viewerTeam === 'Blue' ? 'Red' : 'Blue';
  const attackingTeam = roundNum < 12 ? 'Blue' : roundNum < 24 ? 'Red' : (roundNum - 24) % 2 === 0 ? 'Blue' : 'Red';
  return { roundNum, roundResult: 'Eliminated', roundResultCode: 'Elimination', winningTeam, winningTeamRole: winningTeam === attackingTeam ? 'Attacker' : 'Defender', playerStats: stats };
}

function createMatch(plan: MatchPlan): RiotMatch {
  const players = createPlayers(plan);
  const outcomes = viewerWinsByRound(plan);
  let extraWinningDeaths = plan.deaths - plan.enemyRoundsWon;
  const roundResults = outcomes.map((viewerWins, roundNum) => {
    const viewerDies = !viewerWins || extraWinningDeaths > 0;
    if (viewerWins && viewerDies) extraWinningDeaths -= 1;
    return createRound(plan, players, roundNum, viewerWins, viewerDies);
  });
  const events = roundResults.flatMap((round) => round.playerStats.flatMap((stat) => stat.kills));
  players.forEach((player) => {
    const perRound = roundResults.map((round) => round.playerStats.find((stat) => stat.puuid === player.puuid)!);
    player.stats = {
      score: perRound.reduce((sum, stat) => sum + stat.score, 0),
      roundsPlayed: roundResults.length,
      kills: events.filter((event) => event.killer === player.puuid).length,
      deaths: events.filter((event) => event.victim === player.puuid).length,
      assists: events.filter((event) => event.assistants.includes(player.puuid)).length,
      playtimeMillis: roundResults.length * ROUND_MILLIS,
    };
  });
  const enemyTeam = plan.viewerTeam === 'Blue' ? 'Red' : 'Blue';
  return {
    matchInfo: {
      matchId: `demo-match-${String(plan.ordinal).padStart(3, '0')}`,
      mapId: plan.mapPath,
      gameStartMillis: plan.startedAtMillis,
      gameLengthMillis: roundResults.length * ROUND_MILLIS,
      queueId: 'competitive',
      gameMode: contentIds.gameMode,
      seasonId: contentIds.season,
      isCompleted: true,
      isRanked: true,
    },
    players,
    teams: [plan.viewerTeam, enemyTeam].map((teamId) => {
      const roundsWon = roundResults.filter((round) => round.winningTeam === teamId).length;
      return { teamId, won: roundsWon > roundResults.length / 2, roundsPlayed: roundResults.length, roundsWon, numPoints: roundsWon };
    }),
    roundResults,
    coaches: [],
  };
}

export const matches: RiotMatch[] = plans.map(createMatch);

/** 상세와 목록은 같은 원본 ID·시각·queue를 사용해 별개의 요약 표본이 생기지 않게 한다. */
export const matchList: RiotMatchList = {
  puuid: VIEWER_PUUID,
  history: matches.map(({ matchInfo }) => ({ matchId: matchInfo.matchId, gameStartTimeMillis: matchInfo.gameStartMillis, queueId: matchInfo.queueId })),
};
