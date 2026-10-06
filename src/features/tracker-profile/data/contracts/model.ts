export type UnavailableReason = 'no_matches' | 'no_deaths' | 'no_hits' | 'no_rounds' | 'not_provided' | 'definition_pending';
export type Metric = { status: 'known'; value: number; numerator: number; denominator: number } | { status: 'unavailable'; reason: UnavailableReason };
export interface ContentLabel { id: string; name: string | null }

/** P06/P08·S03/S05/S06·M02/M03의 공통 계산 원본. 반올림 전 수치를 보존한다. */
export interface PlayerMatch {
  matchId: string;
  startedAtMillis: number;
  seasonId: string;
  queueId: string;
  viewerPuuid: string;
  teamId: string;
  agent: ContentLabel;
  map: ContentLabel;
  result: 'win' | 'loss';
  teamScore: number;
  enemyScore: number;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  playtimeMillis: number;
  damageDealt: number;
  damageReceived: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  weaponKills: { weapon: ContentLabel; kills: number }[];
  otherKills: number;
}

export interface Summary {
  matches: number;
  wins: number;
  losses: number;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  playtimeMillis: number;
  damageDealt: number;
  damageReceived: number;
  headshots: number;
  bodyshots: number;
  legshots: number;
  kd: Metric;
  winRate: Metric;
  acs: Metric;
  adr: Metric;
  damageDeltaPerRound: Metric;
  headshotRate: Metric;
  bodyshotRate: Metric;
  legshotRate: Metric;
  kast: Metric;
  currentRR: Metric;
  weaponHeadshotRate: Metric;
}
