import type { MatchDetail, MatchParticipant, MatchRound, MatchSummary } from '../../../types';
import type { RiotContent } from './contracts/riot';
import { content, contentIds } from './fixtures/content';
import { matches } from './fixtures/matches';
import { mapMatch } from './mapMatch';
import { validateCompleteMatch } from './validate';

/** 기존 상세 타입은 보존하고, 새 원본에서 적중 분모가 0인 HS만 null로 표현한다. */
export type SyntheticParticipant = Omit<MatchParticipant, 'stats'> & {
  stats: Omit<MatchParticipant['stats'], 'headshotPercentage'> & { headshotPercentage: number | null };
};
export interface SyntheticRoundPlayer {
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  loadout: number;
  bank: number;
  spent: number;
  side: 'Attack' | 'Defense' | null;
}
export interface SyntheticMatchDetailData {
  source: 'riot-synthetic';
  summary: Omit<MatchSummary, 'stats'> & { stats: SyntheticParticipant['stats'] };
  detail: Omit<MatchDetail, 'participants'> & { participants: SyntheticParticipant[] };
  viewerPuuid: string;
  notice: string;
  reason?: string;
  roundPlayers: Record<number, Record<string, SyntheticRoundPlayer>>;
  opponentDamage: Record<string, Record<string, { dealt: number; received: number }>>;
}

const agentAssets: Record<string, string> = Object.fromEntries(
  Object.entries(contentIds.agents).map(([name, id]) => [id, name]),
);
const weaponAssets: Record<string, string> = Object.fromEntries(
  Object.entries(contentIds.weapons).map(([name, id]) => [id, name]),
);
const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

/**
 * M04의 다섯 탭과 직접 링크에 같은 원본을 전달한다. 전체 라운드 검사 실패 시 다른 경기를 대입하지 않는다.
 * attackers/defenders는 기존 상세 모델의 Team A/B 슬롯일 뿐 실제 공수는 roundPlayers.side에 따로 둔다.
 * ACS/ADR은 참여 라운드, HS는 전체 적중 수가 분모이며 0적중 HS는 null이다.
 */
export function mapSyntheticMatchDetail(raw: unknown, viewerPuuid: string, catalog: RiotContent = content): SyntheticMatchDetailData | null {
  const checked = validateCompleteMatch(raw);
  if (!checked.ok) return null;
  const rawMatch = checked.value;
  const mapped = mapMatch(rawMatch, viewerPuuid, catalog);
  if (mapped.status !== 'ready') return null;
  const viewer = mapped.value;
  const teamSlot = (teamId: string) => teamId === viewer.teamId ? 'attackers' : 'defenders';
  const allEvents = rawMatch.roundResults.flatMap(round => round.playerStats.flatMap(player => player.kills));
  const roundPlayers: SyntheticMatchDetailData['roundPlayers'] = {};
  const opponentDamage: SyntheticMatchDetailData['opponentDamage'] = {};

  const participants: SyntheticParticipant[] = rawMatch.players.map(player => {
    const source = mapMatch(rawMatch, player.puuid, catalog);
    if (source.status !== 'ready') throw new Error('검사된 경기의 참가자 연결이 잘못되었습니다.');
    const stats = source.value;
    const hits = stats.headshots + stats.bodyshots + stats.legshots;
    const enemies = rawMatch.players.filter(opponent => opponent.teamId !== player.teamId);
    const playerEvents = allEvents.filter(event => event.killer === player.puuid);
    opponentDamage[player.puuid] = Object.fromEntries(enemies.map(opponent => [opponent.puuid, {
      dealt: sum(rawMatch.roundResults.flatMap(round => round.playerStats.filter(item => item.puuid === player.puuid).flatMap(item => item.damage).filter(hit => hit.receiver === opponent.puuid).map(hit => hit.damage))),
      received: sum(rawMatch.roundResults.flatMap(round => round.playerStats.filter(item => item.puuid === opponent.puuid).flatMap(item => item.damage).filter(hit => hit.receiver === player.puuid).map(hit => hit.damage))),
    }]));
    const firstEvents = rawMatch.roundResults.map(round => round.playerStats.flatMap(item => item.kills).sort((a, b) => a.timeSinceRoundStartMillis - b.timeSinceRoundStartMillis)[0]);
    return {
      puuid: player.puuid,
      riotId: { gameName: player.gameName, tagLine: player.tagLine },
      team: teamSlot(player.teamId),
      agent: stats.agent.name ?? '알 수 없는 요원',
      agentId: agentAssets[player.characterId] ?? 'unknown',
      stats: {
        kills: stats.kills, deaths: stats.deaths, assists: stats.assists,
        averageCombatScore: stats.score / stats.rounds,
        adr: stats.damageDealt / stats.rounds,
        headshotPercentage: hits ? stats.headshots / hits * 100 : null,
        damageDealt: stats.damageDealt, damageReceived: stats.damageReceived,
        firstKills: firstEvents.filter(event => event?.killer === player.puuid).length,
        firstDeaths: firstEvents.filter(event => event?.victim === player.puuid).length,
        multiKills: rawMatch.roundResults.filter(round => (round.playerStats.find(item => item.puuid === player.puuid)?.kills.length ?? 0) >= 2).length,
      },
      weaponKills: [
        ...stats.weaponKills.map(({ weapon, kills }) => ({ weaponId: weaponAssets[weapon.id] ?? weapon.id, displayName: weapon.name ?? '알 수 없는 무기', kills })),
        ...(stats.otherKills ? [{ weaponId: 'ability-other', displayName: '능력·기타', kills: stats.otherKills }] : []),
      ],
      duels: enemies.map(opponent => ({
        opponentPuuid: opponent.puuid,
        kills: playerEvents.filter(event => event.victim === opponent.puuid).length,
        deaths: allEvents.filter(event => event.killer === opponent.puuid && event.victim === player.puuid).length,
      })),
    };
  });

  let attackers = 0, defenders = 0;
  const rounds: MatchRound[] = rawMatch.roundResults.map(round => {
    const winningTeam = teamSlot(round.winningTeam);
    if (winningTeam === 'attackers') attackers += 1;
    else defenders += 1;
    const roundNumber = round.roundNum + 1;
    const events = round.playerStats.flatMap(player => player.kills).sort((a, b) => a.timeSinceRoundStartMillis - b.timeSinceRoundStartMillis);
    roundPlayers[roundNumber] = Object.fromEntries(round.playerStats.map(player => {
      const team = rawMatch.players.find(candidate => candidate.puuid === player.puuid)!.teamId;
      const winnerAttacks = round.winningTeamRole === 'Attacker';
      const knownSide = winnerAttacks || round.winningTeamRole === 'Defender';
      return [player.puuid, {
        score: player.score,
        kills: player.kills.length,
        deaths: events.filter(event => event.victim === player.puuid).length,
        assists: events.filter(event => event.assistants.includes(player.puuid)).length,
        loadout: player.economy.loadoutValue,
        bank: player.economy.remaining,
        spent: player.economy.spent,
        side: knownSide ? (team === round.winningTeam) === winnerAttacks ? 'Attack' : 'Defense' : null,
      }];
    }));
    const economySum = (team: string, field: 'loadoutValue' | 'remaining') => sum(round.playerStats.filter(player => teamSlot(rawMatch.players.find(item => item.puuid === player.puuid)!.teamId) === team).map(player => player.economy[field]));
    return {
      roundNumber, winningTeam,
      endType: round.roundResultCode === 'Elimination' || round.roundResult === 'Eliminated' ? 'Elimination' : round.roundResultCode,
      scoreAfterRound: { attackers, defenders },
      killEvents: events.map((event, index) => ({
        killerPuuid: event.killer, victimPuuid: event.victim,
        weaponId: event.finishingDamage.damageType === 'Weapon' ? weaponAssets[event.finishingDamage.damageItem] ?? event.finishingDamage.damageItem : 'ability-other',
        displayName: event.finishingDamage.damageType === 'Weapon' ? catalog.equips.find(item => item.id === event.finishingDamage.damageItem)?.name ?? '알 수 없는 무기' : '능력·기타',
        timeSeconds: event.timeSinceRoundStartMillis / 1000,
        isFirstKill: index === 0,
      })),
      economy: {
        attackersLoadout: economySum('attackers', 'loadoutValue'), defendersLoadout: economySum('defenders', 'loadoutValue'),
        attackersBank: economySum('attackers', 'remaining'), defendersBank: economySum('defenders', 'remaining'),
      },
    };
  });
  const selected = participants.find(player => player.puuid === viewerPuuid)!;
  const primary = viewer.weaponKills.slice().sort((a, b) => b.kills - a.kills || a.weapon.id.localeCompare(b.weapon.id))[0]?.weapon;
  const startedAt = new Date(rawMatch.matchInfo.gameStartMillis).toISOString();
  return {
    source: 'riot-synthetic', viewerPuuid, roundPlayers, opponentDamage,
    notice: '공식 API 사용 필드 형태의 합성 경기입니다. 실제 Riot 기록이 아니며 피해·경제·score는 단순화한 표본입니다. PS·KAST·현재 RR·무기별 HS·좌표·설치/해체는 미제공입니다.',
    summary: {
      matchId: viewer.matchId, map: viewer.map.name ?? '알 수 없는 맵', mapId: viewer.map.id,
      mode: 'Competitive', startedAt, result: viewer.result,
      agent: selected.agent, agentId: selected.agentId, team: 'attackers',
      score: { roundsWon: viewer.teamScore, roundsLost: viewer.enemyScore },
      stats: selected.stats,
      primaryWeapon: { weaponId: primary ? weaponAssets[primary.id] ?? primary.id : 'unknown', displayName: primary?.name ?? '무기 킬 없음' },
    },
    detail: { matchId: viewer.matchId, map: viewer.map.name ?? '알 수 없는 맵', mode: 'Competitive', startedAt, durationSeconds: rawMatch.matchInfo.gameLengthMillis / 1000, participants, rounds },
  };
}

/** 데모 ID에 실제로 연결된 원본만 선택한다. 알 수 없는 ID/선수는 null이며 legacy로 대체하지 않는다. */
export function getSyntheticMatchDetail(matchId: string, viewerPuuid: string): SyntheticMatchDetailData | null {
  const raw = matches.find(match => match.matchInfo.matchId === matchId);
  return raw ? mapSyntheticMatchDetail(raw, viewerPuuid) : null;
}
