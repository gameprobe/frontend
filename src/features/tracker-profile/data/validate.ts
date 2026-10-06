import type { RiotContent, RiotMatch, RiotMatchList } from './contracts/riot';

export interface DataIssue {
  path: string;
  code: string;
  message: string
}
export type Validation<T> =
  { ok: true; value: T }
  | { ok: false; issues: DataIssue[] };
type Check = (value: unknown, path: string, issues: DataIssue[]) => void;

const issue = (issues: DataIssue[], path: string, code: string, message: string) => {
  issues.push({ path, code, message });
};
const string: Check = (v, p, e) => {
  if (typeof v !== 'string')
    issue(e, p, 'type', '문자열이 필요합니다.');
};
const id: Check = (v, p, e) => {
  if (typeof v !== 'string' || !v.trim())
    issue(e, p, 'id', '비어 있지 않은 식별자가 필요합니다.');
};
const integer: Check = (v, p, e) => {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0)
    issue(e, p, 'number', '0 이상의 안전한 정수가 필요합니다.');
};
const boolean: Check = (v, p, e) => {
  if (typeof v !== 'boolean')
    issue(e, p, 'type', '불리언이 필요합니다.');
};
const array = (check: Check): Check => (v, p, e) => {
  if (!Array.isArray(v)) return issue(e, p, 'type', '배열이 필요합니다.');
  v.forEach((item, i) => check(item, `${p}[${i}]`, e));
};
const object = (shape: Record<string, Check>): Check => (v, p, e) => {
  if (!v || typeof v !== 'object' || Array.isArray(v))
    return issue(e, p, 'type', '객체가 필요합니다.');
  for (const [key, check] of Object.entries(shape))
    check((v as Record<string, unknown>)[key], `${p}.${key}`, e);
};

const kill = object({
  timeSinceGameStartMillis: integer,
  timeSinceRoundStartMillis: integer,
  killer: id,
  victim: id,
  assistants: array(id),
  finishingDamage: object({
    damageType: id,
    damageItem: string,
    isSecondaryFireMode: boolean
  })
});
const roundPlayer = object({
  puuid: id,
  kills: array(kill),
  score: integer,
  damage: array(object({
    receiver: id,
    damage: integer,
    headshots: integer,
    bodyshots: integer,
    legshots: integer
  })),
  economy: object({
    loadoutValue: integer,
    weapon: string,
    armor: string,
    remaining: integer,
    spent: integer
  }),
});
const match = object({
  matchInfo: object({
    matchId: id,
    mapId: id,
    gameStartMillis: integer,
    gameLengthMillis: integer,
    queueId: id,
    gameMode: id,
    seasonId: id,
    isCompleted: boolean,
    isRanked: boolean
  }),
  players: array(object({
    puuid: id,
    gameName: string,
    tagLine: string,
    teamId: id,
    characterId: id,
    competitiveTier: integer,
    accountLevel: integer,
    stats: object({
      score: integer,
      roundsPlayed: integer,
      kills: integer,
      deaths: integer,
      assists: integer,
      playtimeMillis: integer
    })
  })),
  teams: array(object({
    teamId: id,
    won: boolean,
    roundsPlayed: integer,
    roundsWon: integer,
    numPoints: integer
  })),
  roundResults: array(object({
    roundNum: integer,
    roundResult: string,
    roundResultCode: string,
    winningTeam: id,
    winningTeamRole: string,
    playerStats: array(roundPlayer)
  })),
  coaches: array(object({ puuid: id, teamId: id })),
});

function parse<T>(value: unknown, check: Check): Validation<T> {
  const issues: DataIssue[] = [];
  check(value, '$', issues);
  return issues.length ? { ok: false, issues } : { ok: true, value: value as T };
}
export const validateMatchList = (value: unknown): Validation<RiotMatchList> =>
  parse(value, object({
    puuid: id,
    history: array(object({
      matchId: id,
      gameStartTimeMillis: integer,
      queueId: id
    }))
  }));

export function validateContent(value: unknown): Validation<RiotContent> {
  const result = parse<RiotContent>(value, object({
    version: string,
    characters: array(object({ id, name: string })),
    maps: array(object({ id, name: string, assetPath: id })),
    equips: array(object({ id, name: string })),
    acts: array(object({ id, name: string, isActive: boolean }))
  }));
  if (!result.ok) return result;
  const issues: DataIssue[] = [];
  for (const key of ['characters', 'maps', 'equips', 'acts'] as const)
    unique(result.value[key].map((item) => item.id), key, issues);
  unique(result.value.maps.map((item) => item.assetPath), 'maps.assetPath', issues);
  return issues.length ? { ok: false, issues } : result;
}
function unique(ids: (string | number)[], path: string, issues: DataIssue[]) {
  if (new Set(ids).size !== ids.length)
    issue(issues, path, 'duplicate', '동일 식별자가 중복되었습니다.');
}

/** 사용 필드의 형식을 검사한다. 알 수 없는 추가 필드는 삭제하지 않으며, 없는 값은 0으로 채우지 않는다. */
export const validateMatchShape = (value: unknown): Validation<RiotMatch> => parse(value, match);

/**
 * F01처럼 전체 라운드가 있는 두 팀 경기의 일관성을 검사한다.
 * 부활·환경사 등 특수 이벤트 지원은 별도 사례가 필요하다. 이 검사 통과가 실 API 호환 인증은 아니다.
 */
export function validateCompleteMatch(value: unknown): Validation<RiotMatch> {
  const parsed = validateMatchShape(value);
  if (!parsed.ok) return parsed;
  const data = parsed.value;
  const issues: DataIssue[] = [];
  const fail = (path: string, message: string) => issue(issues, path, 'inconsistent', message);
  unique(data.players.map((p) => p.puuid), 'players', issues);
  unique(data.teams.map((t) => t.teamId), 'teams', issues);
  unique(data.roundResults.map((r) => r.roundNum), 'roundResults', issues);
  if (data.teams.length !== 2 || data.players.length !== 10 || !data.roundResults.length)
    fail('match', '이번 완전 표본은 두 팀·10명 참가자·전체 라운드가 필요합니다.');
  const players = new Map(data.players.map((p) => [p.puuid, p]));
  const teams = new Map(data.teams.map((t) => [t.teamId, t]));
  const totals = new Map(data.players.map((p) => [
    p.puuid,
    { kills: 0, deaths: 0, assists: 0, score: 0, roundsPlayed: 0 }
  ]));

  for (const p of data.players) {
    if (!teams.has(p.teamId))
      fail(`players.${p.puuid}.teamId`, '참가자의 팀이 없습니다.');
    if (p.stats.playtimeMillis > data.matchInfo.gameLengthMillis)
      fail(`players.${p.puuid}.stats.playtimeMillis`, '참여 시간이 경기 시간보다 깁니다.');
  }
  for (const team of data.teams) {
    if (data.players.filter((p) => p.teamId === team.teamId).length !== 5)
      fail(`teams.${team.teamId}`, '이번 완전 표본은 팀별 5명의 참가자가 필요합니다.');
    if (
      team.roundsPlayed !== data.roundResults.length ||
      team.roundsWon !== data.roundResults.filter((r) => r.winningTeam === team.teamId).length
    )
      fail(`teams.${team.teamId}`, '라운드 기록과 팀 합계가 다릅니다.');
    const opponent = data.teams.find((t) => t.teamId !== team.teamId);
    if (
      opponent &&
      data.matchInfo.isCompleted &&
      team.won !== (team.roundsWon > opponent.roundsWon)
    )
      fail(`teams.${team.teamId}.won`, '승패와 팀 점수가 다릅니다.');
  }
  for (const coach of data.coaches)
    if (!teams.has(coach.teamId))
      fail('coaches.teamId', '코치의 팀이 없습니다.');

  for (const [index, round] of Array.from(data.roundResults.entries())) {
    const path = `roundResults[${index}]`;
    if (round.roundNum !== index)
      fail(`${path}.roundNum`, '0부터 연속된 라운드가 필요합니다.');
    if (!teams.has(round.winningTeam))
      fail(`${path}.winningTeam`, '승리 팀이 없습니다.');
    unique(round.playerStats.map((p) => p.puuid), `${path}.playerStats`, issues);
    const participants = new Set(round.playerStats.map((p) => p.puuid));
    if (
      participants.size !== players.size ||
      data.players.some((p) => !participants.has(p.puuid))
    )
      fail(`${path}.playerStats`, '전체 참가자의 라운드 기록이 필요합니다. 누락을 0으로 해석하지 않습니다.');
    const deaths = new Set<string>();
    const events = round.playerStats
      .flatMap((p) => p.kills)
      .sort((a, b) => a.timeSinceRoundStartMillis - b.timeSinceRoundStartMillis);

    for (const rp of round.playerStats) {
      const player = players.get(rp.puuid);
      const total = totals.get(rp.puuid);
      if (!player || !total) {
        fail(path, '라운드 참가자가 roster에 없습니다.');
        continue;
      }
      total.score += rp.score;
      total.roundsPlayed += 1;
      for (const hit of rp.damage) {
        const receiver = players.get(hit.receiver);
        if (!receiver || !participants.has(hit.receiver) || receiver.teamId === player.teamId)
          fail(`${path}.damage`, '지원하는 피해 기록은 해당 라운드 적 참가자를 가리켜야 합니다.');
      }
      for (const event of rp.kills)
        if (event.killer !== rp.puuid)
          fail(`${path}.kills`, '킬이 다른 선수에게 중복/잘못 연결되었습니다.');
    }
    for (const event of events) {
      const killer = players.get(event.killer);
      const victim = players.get(event.victim);
      if (
        !killer ||
        !victim ||
        killer.teamId === victim.teamId ||
        !participants.has(event.killer) ||
        !participants.has(event.victim)
      ) {
        fail(`${path}.kills`, '적 처치 이벤트의 참가자 연결이 잘못되었습니다.');
        continue;
      }
      if (deaths.has(event.victim))
        fail(`${path}.kills`, '같은 라운드의 사망 중복 또는 미지원 부활 사례입니다.');
      // 투사체/능력은 사망 후 처치가 가능하므로 killer의 생존 여부를 여기서 단정하지 않는다.
      deaths.add(event.victim);
      if (
        event.timeSinceGameStartMillis > data.matchInfo.gameLengthMillis ||
        event.timeSinceRoundStartMillis > event.timeSinceGameStartMillis
      )
        fail(`${path}.kills.time`, '처치 시각이 경기 시간 범위를 벗어났습니다.');
      totals.get(event.killer)!.kills += 1;
      totals.get(event.victim)!.deaths += 1;
      unique(event.assistants, `${path}.assistants`, issues);
      for (const aid of event.assistants) {
        const assistant = players.get(aid);
        if (
          !assistant ||
          !participants.has(aid) ||
          aid === event.killer ||
          assistant.teamId !== killer.teamId
        )
          fail(`${path}.assistants`, '어시스트 참가자 연결이 잘못되었습니다.');
        else totals.get(aid)!.assists += 1;
      }
    }
  }
  for (const p of data.players)
    for (const key of ['kills', 'deaths', 'assists', 'score', 'roundsPlayed'] as const) {
      if (p.stats[key] !== totals.get(p.puuid)![key])
        fail(`players.${p.puuid}.stats.${key}`, '선수 합계와 라운드 원본이 다릅니다.');
    }
  return issues.length ? { ok: false, issues } : parsed;
}
