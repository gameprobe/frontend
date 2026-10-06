import type { Metric, PlayerMatch, Summary, UnavailableReason } from './contracts/model';

/** 0은 유효한 분자다. 분모0은 Infinity/0%로 꾸미지 않고 사유를 전달한다. 표시 반올림은 UI에서 한다. */
export function ratio(numerator: number, denominator: number, reason: UnavailableReason, scale = 1): Metric {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator < 0 || !Number.isFinite(scale)) throw new Error('Invalid metric operands');
  return denominator === 0 ? { status: 'unavailable', reason } : { status: 'known', value: numerator / denominator * scale, numerator, denominator };
}

/** P06·M02의 선택 범위 합계. ACS/ADR은 라운드, HS는 적중 수, K/D는 사망 수로 가중한다. */
export function summarizeMatches(matches: readonly PlayerMatch[]): Summary {
  const sum = (key: 'rounds' | 'kills' | 'deaths' | 'assists' | 'score' | 'playtimeMillis' | 'damageDealt' | 'damageReceived' | 'headshots' | 'bodyshots' | 'legshots') => matches.reduce((value, match) => value + match[key], 0);
  const totals = {
    matches: matches.length, wins: matches.filter((match) => match.result === 'win').length,
    losses: matches.filter((match) => match.result === 'loss').length,
    rounds: sum('rounds'), kills: sum('kills'), deaths: sum('deaths'), assists: sum('assists'),
    score: sum('score'), playtimeMillis: sum('playtimeMillis'), damageDealt: sum('damageDealt'), damageReceived: sum('damageReceived'),
    headshots: sum('headshots'), bodyshots: sum('bodyshots'), legshots: sum('legshots'),
  };
  const hitCount = totals.headshots + totals.bodyshots + totals.legshots;
  const absent = (reason: UnavailableReason): UnavailableReason => matches.length ? reason : 'no_matches';
  return {
    ...totals,
    kd: ratio(totals.kills, totals.deaths, absent('no_deaths')),
    winRate: ratio(totals.wins, totals.matches, 'no_matches', 100),
    acs: ratio(totals.score, totals.rounds, absent('no_rounds')),
    adr: ratio(totals.damageDealt, totals.rounds, absent('no_rounds')),
    damageDeltaPerRound: ratio(totals.damageDealt - totals.damageReceived, totals.rounds, absent('no_rounds')),
    headshotRate: ratio(totals.headshots, hitCount, absent('no_hits'), 100),
    bodyshotRate: ratio(totals.bodyshots, hitCount, absent('no_hits'), 100),
    legshotRate: ratio(totals.legshots, hitCount, absent('no_hits'), 100),
    kast: { status: 'unavailable', reason: 'definition_pending' },
    currentRR: { status: 'unavailable', reason: 'not_provided' },
    weaponHeadshotRate: { status: 'unavailable', reason: 'not_provided' },
  };
}

/** P08/S06는 표시 이름이 같더라도 원본 ID로 묶는다. 미상 콘텐츠도 합계에서 누락시키지 않는다. */
export function groupMatches(matches: readonly PlayerMatch[], key: 'agent' | 'map') {
  const groups = new Map<string, PlayerMatch[]>();
  for (const match of matches) groups.set(match[key].id, [...(groups.get(match[key].id) ?? []), match]);
  return Array.from(groups.values(), (items) => ({ content: items[0][key], summary: summarizeMatches(items) }));
}
