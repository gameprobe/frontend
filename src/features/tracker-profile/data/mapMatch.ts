import type { PlayerMatch } from './contracts/model';
import { validateCompleteMatch, validateContent, validateMatchShape, type DataIssue } from './validate';

export type MappedMatch =
  | { status: 'ready'; value: PlayerMatch }
  | { status: 'unavailable'; reason: 'unsupported_mode' | 'incomplete_match' | 'draw' }
  | { status: 'invalid'; issues: DataIssue[] };

/**
 * M03 경기 행과 P06/P08 합계가 함께 사용할 한 선수의 원본 수치를 만든다.
 * 선택 선수는 PUUID, 맵은 assetPath로 연결한다. 알 수 없는 콘텐츠 이름은 null로 보존한다.
 */
export function mapMatch(raw: unknown, viewerPuuid: string, rawContent: unknown): MappedMatch {
  const shape = validateMatchShape(raw);
  if (!shape.ok) return { status: 'invalid', issues: shape.issues };
  const data = shape.value;
  if (data.matchInfo.queueId !== 'competitive' || !data.matchInfo.isRanked) return { status: 'unavailable', reason: 'unsupported_mode' };
  if (!data.matchInfo.isCompleted) return { status: 'unavailable', reason: 'incomplete_match' };
  const checked = validateCompleteMatch(data);
  if (!checked.ok) return { status: 'invalid', issues: checked.issues };
  const parsedContent = validateContent(rawContent);
  if (!parsedContent.ok) return { status: 'invalid', issues: parsedContent.issues };
  const content = parsedContent.value;
  const player = data.players.find((p) => p.puuid === viewerPuuid);
  if (!player) return { status: 'invalid', issues: [{ path: 'players', code: 'viewer_missing', message: '조회 선수가 이 경기 roster에 없습니다.' }] };
  const team = data.teams.find((t) => t.teamId === player.teamId)!;
  const enemy = data.teams.find((t) => t.teamId !== player.teamId)!;
  if (team.roundsWon === enemy.roundsWon) return { status: 'unavailable', reason: 'draw' };
  const enemyIds = new Set(data.players.filter((p) => p.teamId !== player.teamId).map((p) => p.puuid));
  const playerRounds = data.roundResults.flatMap((r) => r.playerStats.filter((p) => p.puuid === viewerPuuid));
  const dealt = playerRounds.flatMap((p) => p.damage).filter((hit) => enemyIds.has(hit.receiver));
  const received = data.roundResults.flatMap((r) => r.playerStats).filter((p) => enemyIds.has(p.puuid)).flatMap((p) => p.damage).filter((hit) => hit.receiver === viewerPuuid);
  const kills = playerRounds.flatMap((p) => p.kills);
  const weapons = new Map<string, number>();
  let otherKills = 0;
  for (const kill of kills) {
    // 공식 문서는 문자열 enum을 보장하지 않는다. 명시적으로 Weapon인 기록만 무기에 분류한다.
    if (kill.finishingDamage.damageType === 'Weapon' && kill.finishingDamage.damageItem) {
      const id = kill.finishingDamage.damageItem;
      weapons.set(id, (weapons.get(id) ?? 0) + 1);
    } else otherKills += 1;
  }
  const sumDamage = (hits: typeof dealt) => hits.reduce((sum, hit) => sum + hit.damage, 0);
  return { status: 'ready', value: {
    matchId: data.matchInfo.matchId, startedAtMillis: data.matchInfo.gameStartMillis,
    seasonId: data.matchInfo.seasonId, queueId: data.matchInfo.queueId, viewerPuuid, teamId: player.teamId,
    agent: { id: player.characterId, name: content.characters.find((a) => a.id === player.characterId)?.name ?? null },
    map: { id: data.matchInfo.mapId, name: content.maps.find((m) => m.assetPath === data.matchInfo.mapId)?.name ?? null },
    result: team.won ? 'win' : 'loss', teamScore: team.roundsWon, enemyScore: enemy.roundsWon,
    rounds: player.stats.roundsPlayed, kills: player.stats.kills, deaths: player.stats.deaths, assists: player.stats.assists,
    score: player.stats.score, playtimeMillis: player.stats.playtimeMillis,
    damageDealt: sumDamage(dealt), damageReceived: sumDamage(received),
    headshots: dealt.reduce((sum, hit) => sum + hit.headshots, 0),
    bodyshots: dealt.reduce((sum, hit) => sum + hit.bodyshots, 0),
    legshots: dealt.reduce((sum, hit) => sum + hit.legshots, 0),
    weaponKills: Array.from(weapons, ([id, count]) => ({ weapon: { id, name: content.equips.find((w) => w.id === id)?.name ?? null }, kills: count })),
    otherKills,
  } };
}
