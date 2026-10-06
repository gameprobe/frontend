/** Profile-only fixtures. Replace this boundary with an API adapter when data is available. */
export type Agent = 'Jett' | 'Omen' | 'Sova';
export type Mode = 'Competitive' | 'Premier' | 'Unrated' | 'Deathmatch' | 'Swiftplay';
export type MapName = 'Ascent' | 'Haven' | 'Split';
export type Weapon = 'Phantom' | 'Vandal' | 'Operator';

export interface Match {
  id: string;
  date: string;
  time: string;
  agent: Agent;
  map: MapName;
  mode: Mode;
  act: 'V26: A5' | 'V26: A4';
  platform: 'PC' | 'Console';
  kills: number;
  deaths: number;
  assists: number;
  teamScore: number;
  enemyScore: number;
  adr: number;
  acs: number;
  hs: number;
  kast: number;
  dd: number;
  score: number;
  /** Duration in minutes; percentages use the 0–100 range. */
  duration: number;
  rr: number;
  weapon: Weapon;
}

export const profile = {
  name: 'IED agent',
  tag: 'Allen',
  level: 161,
  rank: 'Immortal 1',
  rr: 43,
  peakRank: 'Immortal 3',
  peakRR: 263,
  regionRank: 14290,
  views: 1281,
} as const;


type Seed = [
  date: string, time: string, agent: Agent, map: MapName,
  teamScore: number, enemyScore: number, kills: number, deaths: number,
  assists: number, adr: number, acs: number, hs: number, dd: number,
  score: number,
];

const competitiveSeeds: Seed[] = [
  ['2026-09-09', '21:48', 'Sova', 'Haven', 13, 8, 17, 13, 5, 156, 240, 32, 43, 726],
  ['2026-09-04', '23:46', 'Jett', 'Ascent', 13, 2, 10, 12, 4, 121, 197, 29, -25, 547],
  ['2026-09-04', '22:55', 'Jett', 'Split', 11, 13, 20, 18, 5, 164, 256, 29, 21, 549],
  ['2026-09-04', '22:01', 'Jett', 'Split', 14, 12, 22, 20, 6, 175, 269, 13, 38, 669],
  ['2026-09-04', '21:08', 'Omen', 'Haven', 13, 8, 10, 14, 5, 118, 153, 22, -7, 389],
  ['2026-09-04', '20:14', 'Omen', 'Haven', 9, 13, 14, 15, 1, 127, 187, 24, -9, 397],
  ['2026-09-01', '21:09', 'Jett', 'Ascent', 7, 13, 11, 15, 4, 114, 162, 34, -27, 223],
  ['2026-08-31', '23:36', 'Jett', 'Split', 13, 6, 27, 11, 2, 254, 379, 35, 135, 993],
  ['2026-08-30', '23:42', 'Omen', 'Ascent', 13, 7, 18, 12, 9, 158, 243, 26, 39, 803],
  ['2026-08-30', '22:53', 'Sova', 'Haven', 13, 9, 17, 15, 8, 141, 218, 27, 17, 731],
  ['2026-08-30', '22:04', 'Omen', 'Split', 10, 13, 16, 18, 7, 139, 216, 24, -13, 382],
  ['2026-08-30', '21:15', 'Jett', 'Ascent', 13, 10, 19, 17, 4, 151, 237, 30, 19, 746],
  ['2026-08-29', '22:44', 'Omen', 'Haven', 13, 11, 15, 19, 8, 128, 193, 21, -11, 493],
  ['2026-08-29', '21:57', 'Sova', 'Ascent', 13, 5, 17, 9, 6, 174, 256, 28, 61, 861],
  ['2026-08-29', '21:06', 'Jett', 'Split', 8, 13, 12, 17, 5, 125, 178, 29, -34, 281],
  ['2026-08-28', '23:40', 'Omen', 'Haven', 13, 9, 14, 16, 10, 134, 206, 19, -9, 566],
  ['2026-08-28', '22:46', 'Jett', 'Ascent', 13, 11, 19, 18, 5, 149, 235, 31, 12, 635],
  ['2026-08-28', '21:52', 'Omen', 'Split', 6, 13, 10, 17, 6, 112, 167, 20, -46, 194],
  ['2026-08-27', '23:01', 'Omen', 'Haven', 13, 10, 14, 17, 9, 131, 197, 23, -5, 514],
  ['2026-08-27', '22:08', 'Sova', 'Ascent', 13, 11, 17, 19, 6, 133, 204, 28, -7, 597],
  ['2026-08-26', '22:17', 'Jett', 'Split', 11, 13, 13, 19, 4, 118, 183, 22, -33, 272],
  ['2026-08-25', '21:46', 'Omen', 'Haven', 13, 8, 16, 17, 9, 137, 212, 25, -2, 616],
  ['2026-08-24', '22:03', 'Sova', 'Ascent', 13, 10, 17, 18, 11, 135, 204, 24, -4, 624],
];

function fixture(seed: Seed, index: number, options: Partial<Match> = {}): Match {
  const [date, time, agent, map, teamScore, enemyScore, kills, deaths,
    assists, adr, acs, hs, dd, score] = seed;
  const win = teamScore > enemyScore;
  return {
    id: `mock-match-${String(index + 1).padStart(2, '0')}`,
    date, time, agent, map, teamScore, enemyScore, kills, deaths, assists,
    adr, acs, hs, dd, score,
    mode: 'Competitive', act: 'V26: A5', platform: 'PC',
    kast: Math.min(94, Math.max(48, 64 + (win ? 7 : -4) + assists / 2)),
    duration: Math.round((teamScore + enemyScore) * 1.48 + 3),
    rr: win ? 12 + index % 12 : -(13 + index % 8),
    weapon: agent === 'Omen' ? 'Phantom' : index % 5 === 0 ? 'Operator' : 'Vandal',
    ...options,
  };
}

/** Alternate modes/platforms deliberately have their own fixtures, including empty combinations. */
export const matches: Match[] = [
  ...competitiveSeeds.map((seed, index) => fixture(seed, index)),
  fixture(['2026-09-08', '20:32', 'Omen', 'Split', 13, 7, 21, 12, 8, 167, 262, 29, 42, 818], 23, { mode: 'Premier', rr: 0 }),
  fixture(['2026-09-06', '21:14', 'Sova', 'Ascent', 10, 13, 14, 18, 9, 134, 193, 24, -19, 377], 24, { mode: 'Premier', rr: 0 }),
  fixture(['2026-09-08', '18:44', 'Jett', 'Haven', 13, 9, 24, 16, 3, 178, 273, 32, 48, 869], 25, { mode: 'Unrated', rr: 0 }),
  fixture(['2026-09-03', '19:50', 'Omen', 'Ascent', 8, 13, 12, 17, 6, 119, 181, 21, -37, 254], 26, { mode: 'Unrated', rr: 0 }),
  fixture(['2026-09-07', '19:21', 'Jett', 'Split', 40, 37, 40, 25, 1, 165, 275, 38, 41, 794], 27, { mode: 'Deathmatch', duration: 8, rr: 0 }),
  fixture(['2026-09-05', '18:26', 'Sova', 'Haven', 31, 40, 31, 29, 0, 139, 226, 28, -9, 433], 28, { mode: 'Deathmatch', duration: 9, rr: 0 }),
  fixture(['2026-09-08', '18:02', 'Omen', 'Haven', 5, 3, 8, 5, 3, 160, 245, 27, 35, 761], 29, { mode: 'Swiftplay', duration: 13, rr: 0 }),
  fixture(['2026-09-02', '20:18', 'Jett', 'Split', 3, 5, 5, 6, 1, 124, 186, 22, -27, 313], 30, { mode: 'Swiftplay', duration: 12, rr: 0 }),
  fixture(['2026-09-07', '22:30', 'Sova', 'Ascent', 13, 9, 20, 15, 8, 161, 245, 23, 32, 776], 31, { platform: 'Console' }),
  fixture(['2026-09-05', '21:41', 'Jett', 'Haven', 11, 13, 16, 19, 5, 143, 218, 21, -16, 416], 32, { platform: 'Console' }),
  fixture(['2026-07-30', '22:16', 'Omen', 'Split', 13, 8, 20, 12, 11, 179, 266, 29, 64, 917], 33, { act: 'V26: A4' }),
  fixture(['2026-07-28', '21:04', 'Jett', 'Haven', 13, 11, 24, 17, 6, 182, 288, 33, 49, 837], 34, { act: 'V26: A4' }),
  fixture(['2026-07-25', '20:51', 'Sova', 'Ascent', 9, 13, 13, 18, 7, 125, 184, 25, -31, 292], 35, { act: 'V26: A4' }),
].sort(compareNewest);

export interface MatchFilters {
  platform?: string;
  mode?: string;
  act?: string;
  agent?: string;
  map?: string;
  result?: 'all' | 'win' | 'loss';
  weapon?: string;
  date?: 'all' | 'week' | 'month';
}

function compareNewest(a: Match, b: Match) {
  return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`) || a.id.localeCompare(b.id);
}

function matchesChoice(value: string, choice?: string) {
  return !choice || choice.toLowerCase() === 'all' || value === choice;
}

/** Date windows are relative to the newest supplied fixture, keeping this preview reproducible. */
export function filterMatches(rows: readonly Match[], filters: MatchFilters = {}): Match[] {
  const latestDate = rows.reduce((latest, row) => row.date > latest ? row.date : latest, '');
  let earliestDate = '';
  if (latestDate && filters.date && filters.date !== 'all') {
    const start = new Date(`${latestDate}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() - (filters.date === 'week' ? 6 : 29));
    earliestDate = start.toISOString().slice(0, 10);
  }
  return rows.filter((row) => (
    matchesChoice(row.platform, filters.platform)
    && matchesChoice(row.mode, filters.mode)
    && matchesChoice(row.act, filters.act)
    && matchesChoice(row.agent, filters.agent)
    && matchesChoice(row.map, filters.map)
    && matchesChoice(row.weapon, filters.weapon)
    && (!filters.result || filters.result === 'all'
      || (filters.result === 'win' ? row.teamScore > row.enemyScore : row.teamScore < row.enemyScore))
    && (!earliestDate || row.date >= earliestDate)
  )).sort(compareNewest);
}

export interface Summary {
  matches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  winRate: number;
  adr: number;
  acs: number;
  hs: number;
  kast: number;
  dd: number;
  score: number;
  rounds: number;
  hours: number;
  kad: number;
  kpr: number;
  firstBloods: number;
  flawless: number;
  aces: number;
}

const rounded = (value: number, precision = 1) => Number(value.toFixed(precision));

export function summarize(rows: readonly Match[]): Summary {
  const total = (read: (row: Match) => number) => rows.reduce((sum, row) => sum + read(row), 0);
  // Deathmatch has one continuous round, so its scoreboard is not counted as 77 rounds.
  const roundCount = (row: Match) => row.mode === 'Deathmatch' ? 1 : row.teamScore + row.enemyScore;
  const rounds = total(roundCount);
  const kills = total((row) => row.kills);
  const deaths = total((row) => row.deaths);
  const assists = total((row) => row.assists);
  const wins = rows.filter((row) => row.teamScore > row.enemyScore).length;
  const losses = rows.filter((row) => row.teamScore < row.enemyScore).length;
  const weighted = (read: (row: Match) => number) => rounds
    ? rounded(total((row) => read(row) * roundCount(row)) / rounds) : 0;
  return {
    matches: rows.length, wins, losses, kills, deaths, assists, rounds,
    kd: rounded(deaths ? kills / deaths : kills, 2),
    kad: rounded(deaths ? (kills + assists) / deaths : kills + assists, 2),
    kpr: rounded(rounds ? kills / rounds : 0, 2),
    winRate: rounded(rows.length ? wins / rows.length * 100 : 0),
    adr: weighted((row) => row.adr), acs: weighted((row) => row.acs),
    hs: weighted((row) => row.hs), kast: weighted((row) => row.kast),
    dd: weighted((row) => row.dd),
    score: Math.round(rows.length ? total((row) => row.score) / rows.length : 0),
    hours: rounded(total((row) => row.duration) / 60),
    // Supplemental highlight totals are deterministic simulated events, not API-derived facts.
    firstBloods: total((row) => row.mode === 'Deathmatch' ? 0 : Math.floor(row.kills / 6)),
    flawless: total((row) => row.mode === 'Deathmatch' ? 0 : Math.floor(row.teamScore / 10)),
    aces: total((row) => row.mode === 'Deathmatch' ? 0 : row.kills >= 24 ? 1 : 0),
  };
}

export const agentRoles: Record<Agent, string> = {
  Jett: 'Duelist', Omen: 'Controller', Sova: 'Initiator',
};

export function mapStats(rows: readonly Match[]): (Summary & { map: MapName })[] {
  return (['Ascent', 'Haven', 'Split'] as MapName[])
    .map((map) => ({ map, ...summarize(rows.filter((row) => row.map === map)) }))
    .filter((row) => row.matches > 0)
    .sort((a, b) => b.winRate - a.winRate || b.matches - a.matches || a.map.localeCompare(b.map));
}

export function agentStats(rows: readonly Match[]): (Summary & { agent: Agent; role: string; bestMap: MapName })[] {
  return (['Jett', 'Omen', 'Sova'] as Agent[])
    .filter((agent) => rows.some((row) => row.agent === agent))
    .map((agent) => {
      const agentRows = rows.filter((row) => row.agent === agent);
      return { agent, role: agentRoles[agent], ...summarize(agentRows), bestMap: mapStats(agentRows)[0].map };
    })
    .sort((a, b) => b.matches - a.matches || a.agent.localeCompare(b.agent));
}
