import * as legacy from '../mock';
import type { Metric, PlayerMatch } from './contracts/model';
import { ratio, summarizeMatches } from './metrics';
import { agentRoles } from './fixtures/manifest';
import { demoSeason, type ProfileResult } from './provider';

/** 기존 표시 컴포넌트용 값. null은 미제공/분모 없음이며 실제 0과 구별한다. */
export type ViewMatch = Omit<legacy.Match, 'agent' | 'map' | 'weapon' | 'act' | 'adr' | 'acs' | 'hs' | 'kast' | 'dd' | 'score' | 'rr'> & {
  agent: string; map: string; weapon: string; act: string;
  adr: number | null; acs: number | null; hs: number | null; kast: number | null;
  dd: number | null; score: number | null; rr: number | null;
  agentId?: string;
  mapId?: string;
  weaponIds?: string[];
  weaponNames?: string[];
};
type NullableStat = 'kd' | 'winRate' | 'adr' | 'acs' | 'hs' | 'kast' | 'dd' | 'score' | 'kad' | 'kpr' | 'firstBloods' | 'flawless' | 'aces';
export type ViewSummary = Omit<legacy.Summary, NullableStat> & Record<NullableStat, number | null> & { body?: number | null; legs?: number | null };
export const metricValue = (metric: Metric) => metric.status === 'known' ? metric.value : null;

function summary(rows: readonly PlayerMatch[]): ViewSummary {
  const value = summarizeMatches(rows);
  return {
    matches: value.matches, wins: value.wins, losses: value.losses, kills: value.kills, deaths: value.deaths,
    assists: value.assists, rounds: value.rounds, hours: value.playtimeMillis / 3600000,
    kd: metricValue(value.kd), winRate: metricValue(value.winRate), adr: metricValue(value.adr), acs: metricValue(value.acs),
    hs: metricValue(value.headshotRate), body: metricValue(value.bodyshotRate), legs: metricValue(value.legshotRate),
    dd: metricValue(value.damageDeltaPerRound), kast: null, score: null,
    kad: metricValue(ratio(value.kills + value.assists, value.deaths, 'no_deaths')),
    kpr: metricValue(ratio(value.kills, value.rounds, 'no_rounds')),
    firstBloods: null, flawless: null, aces: null,
  };
}

/** M01 필터: 새 무기는 해당 무기로 처치가 있었던 경기. 기간은 최신 표본 날짜 기준. */
export function filterViewMatches(rows: readonly ViewMatch[], filters: legacy.MatchFilters = {}) {
  const latest = rows.reduce((date, row) => row.date > date ? row.date : date, '');
  const cutoff = latest && filters.date && filters.date !== 'all'
    ? new Date(Date.parse(`${latest}T00:00:00Z`) - (filters.date === 'week' ? 6 : 29) * 86400000).toISOString().slice(0, 10) : '';
  const choice = (value: string, selected?: string) => !selected || selected.toLowerCase() === 'all' || value === selected;
  return rows.filter(row => choice(row.platform, filters.platform) && choice(row.mode, filters.mode) && choice(row.act, filters.act)
    && choice(row.agentId ?? row.agent, filters.agent) && choice(row.mapId ?? row.map, filters.map)
    && (!filters.weapon || filters.weapon === 'all' || (row.weaponIds ?? row.weaponNames ?? [row.weapon]).includes(filters.weapon))
    && (!filters.result || filters.result === 'all' || (filters.result === 'win' ? row.teamScore > row.enemyScore : row.teamScore < row.enemyScore))
    && (!cutoff || row.date >= cutoff));
}

/** P06/P08/S03~S06/M02/M03 모두 같은 검증된 경기 집합으로 집계한다. legacy 표본은 그대로 보존한다. */
export function createProfileView(result?: ProfileResult | null, synthetic = false) {
  const source = result?.matches ?? [];
  const byId = new Map(source.map(row => [row.matchId, row]));
  const originals = (rows: readonly ViewMatch[]) => rows.flatMap(row => { const found = byId.get(row.id); return found ? [found] : []; });
  const legacyRows = (rows: readonly ViewMatch[]) => { const ids = new Set(rows.map(row => row.id)); return legacy.matches.filter(row => ids.has(row.id)); };
  const summarize = (rows: readonly ViewMatch[]): ViewSummary => synthetic ? summary(originals(rows)) : legacy.summarize(legacyRows(rows));
  const matches: ViewMatch[] = synthetic ? source.map(row => {
    const stats = summary([row]);
    const date = new Date(row.startedAtMillis).toISOString();
    const names = row.weaponKills.map(item => item.weapon.name ?? item.weapon.id);
    return {
      id: row.matchId, date: date.slice(0, 10), time: `${date.slice(11, 16)} UTC`, agent: row.agent.name ?? row.agent.id, map: row.map.name ?? row.map.id,
      agentId: row.agent.id, mapId: row.map.id,
      mode: 'Competitive', act: demoSeason.label, platform: 'PC', kills: row.kills, deaths: row.deaths, assists: row.assists,
      teamScore: row.teamScore, enemyScore: row.enemyScore, duration: row.playtimeMillis / 60000,
      adr: stats.adr, acs: stats.acs, hs: stats.hs, dd: stats.dd, kast: null, score: null, rr: null,
      weapon: names.join(', ') || '—', weaponNames: names, weaponIds: row.weaponKills.map(item => item.weapon.id),
    };
  }) : legacy.matches;
  // 표시명이 같거나 번역되어도 원본 식별자로 집계와 선택을 유지한다.
  const mapKey = (row: ViewMatch) => row.mapId ?? row.map;
  const agentKey = (row: ViewMatch) => row.agentId ?? row.agent;
  function mapStats(rows: readonly ViewMatch[]) {
    return Array.from(new Set(rows.map(mapKey)), id => {
      const group = rows.filter(row => mapKey(row) === id);
      return { id, map: group[0].map, ...summarize(group) };
    }).sort((a, b) => (b.winRate ?? -1) - (a.winRate ?? -1) || b.matches - a.matches || a.map.localeCompare(b.map) || a.id.localeCompare(b.id));
  }
  function agentStats(rows: readonly ViewMatch[]) {
    return Array.from(new Set(rows.map(agentKey)), id => {
      const group = rows.filter(row => agentKey(row) === id);
      const agent = group[0].agent;
      const rawRole = group[0].agentId ? agentRoles[id] : legacy.agentRoles[agent as legacy.Agent];
      const role = rawRole ? rawRole[0].toUpperCase() + rawRole.slice(1) : 'Unknown';
      return { id, agent, role, bestMap: mapStats(group)[0]?.map ?? '—', ...summarize(group) };
    }).sort((a, b) => b.matches - a.matches || a.agent.localeCompare(b.agent) || a.id.localeCompare(b.id));
  }
  function weaponStats(rows: readonly ViewMatch[]) {
    if (!synthetic) return ['Phantom', 'Vandal', 'Operator'].map(name => ({ id: name, name, ...summarize(rows.filter(row => row.weapon === name)) })).sort((a, b) => b.kills - a.kills);
    const weapons = new Map<string, { id: string; name: string; kills: number; matches: number; hs: null; kd: null }>();
    for (const row of originals(rows)) for (const item of row.weaponKills) {
      const entry = weapons.get(item.weapon.id) ?? { id: item.weapon.id, name: item.weapon.name ?? item.weapon.id, kills: 0, matches: 0, hs: null, kd: null };
      entry.kills += item.kills; entry.matches += 1; weapons.set(item.weapon.id, entry);
    }
    return Array.from(weapons.values()).sort((a, b) => b.kills - a.kills || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  }
  const sortOptions = (options: { label: string; value: string }[]) => options.sort((a, b) => a.label.localeCompare(b.label) || a.value.localeCompare(b.value));
  const options = {
    agents: sortOptions(agentStats(matches).map(row => ({ label: row.agent, value: row.id }))),
    maps: sortOptions(mapStats(matches).map(row => ({ label: row.map, value: row.id }))),
    weapons: sortOptions(weaponStats(matches).map(row => ({ label: row.name, value: row.id }))),
  };
  return { matches, summarize, mapStats, agentStats, weaponStats, options };
}
