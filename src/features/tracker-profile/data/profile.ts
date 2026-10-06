import type { PlayerMatch } from './contracts/model';
import { groupMatches, summarizeMatches } from './metrics';
import { mapMatch } from './mapMatch';
import { validateContent, validateMatchList, validateMatchShape, type DataIssue } from './validate';

export type DetailResult =
  | { matchId: string; status: 'ok'; data: unknown }
  | { matchId: string; status: 'error'; reason: string };

export interface ProfileQuery {
  puuid: string;
  platform: 'pc' | 'console';
  queueId: string;
  seasonId?: string;
}

// 키 순서만 다른 동일 JSON은 중복 응답이지 내용 충돌이 아니다.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const fields = Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`
    ));
    return `{${fields.join(',')}}`;
  }
  return JSON.stringify(value) ?? String(value);
}

/**
 * LIST와 상세를 연결하는 순수 경계. 네트워크·React·RSO에 의존하지 않는다.
 * P05 조건에 맞는 표본만 집계하며, 반환 목록이 전체 시즌을 의미한다고 가정하지 않는다.
 * 실제 공급자/조회 훅과 화면 연결은 다음 Task에서 이 결과를 사용한다.
 */
export function buildProfile(
  rawList: unknown,
  details: readonly DetailResult[],
  content: unknown,
  query: ProfileQuery,
) {
  const matches: PlayerMatch[] = [];
  const excluded: { matchId: string; reason: string; issues?: DataIssue[] }[] = [];
  const coverage = {
    returned: 0,
    unique: 0,
    duplicateEntries: 0,
    duplicateDetails: 0,
    received: 0,
    failed: 0,
    invalid: 0,
    included: 0,
    excluded,
    startedAtMillis: null as number | null,
    endedAtMillis: null as number | null,
    completeSeason: false as const,
  };
  const finish = (
    state: 'ready' | 'empty' | 'partial' | 'unavailable' | 'error',
    issues: DataIssue[] = [],
  ) => ({
    state,
    query: { ...query },
    matches,
    summary: summarizeMatches(matches),
    agents: groupMatches(matches, 'agent'),
    maps: groupMatches(matches, 'map'),
    coverage,
    issues,
  });

  if (query.platform !== 'pc' || query.queueId !== 'competitive') return finish('unavailable');
  const list = validateMatchList(rawList);
  if (!list.ok) return finish('error', list.issues);
  if (list.value.puuid !== query.puuid) {
    return finish('error', [{ path: 'puuid', code: 'identity', message: '요청 선수와 목록 소유자가 다릅니다.' }]);
  }
  const catalog = validateContent(content);
  if (!catalog.ok) return finish('error', catalog.issues);
  coverage.returned = list.value.history.length;

  const entries = new Map<string, typeof list.value.history[number]>();
  const conflicts = new Set<string>();
  const relevantIds = new Set(
    list.value.history.filter((entry) => entry.queueId === query.queueId).map((entry) => entry.matchId),
  );
  for (const entry of list.value.history) {
    const existing = entries.get(entry.matchId);
    if (existing) {
      if (canonical(entry) === canonical(existing)) coverage.duplicateEntries += 1;
      else conflicts.add(entry.matchId);
    } else entries.set(entry.matchId, entry);
  }
  coverage.unique = entries.size;

  const detailMap = new Map<string, DetailResult>();
  for (const detail of details) {
    if (!entries.has(detail.matchId)) continue;
    const existing = detailMap.get(detail.matchId);
    if (existing) {
      if (canonical(detail) === canonical(existing)) coverage.duplicateDetails += 1;
      else conflicts.add(detail.matchId);
    } else detailMap.set(detail.matchId, detail);
  }

  for (const entry of Array.from(entries.values())) {
    if (!relevantIds.has(entry.matchId)) {
      excluded.push({ matchId: entry.matchId, reason: 'queue_filter' });
      continue;
    }
    if (conflicts.has(entry.matchId)) {
      coverage.invalid += 1;
      excluded.push({ matchId: entry.matchId, reason: 'conflicting_identity' });
      continue;
    }
    const detail = detailMap.get(entry.matchId);
    if (!detail || detail.status === 'error') {
      coverage.failed += 1;
      excluded.push({ matchId: entry.matchId, reason: detail?.reason ?? 'detail_missing' });
      continue;
    }
    coverage.received += 1;
    const shape = validateMatchShape(detail.data);
    if (!shape.ok) {
      coverage.invalid += 1;
      excluded.push({ matchId: entry.matchId, reason: 'invalid_response', issues: shape.issues });
      continue;
    }
    const info = shape.value.matchInfo;
    if (
      info.matchId !== entry.matchId ||
      info.gameStartMillis !== entry.gameStartTimeMillis ||
      info.queueId !== entry.queueId
    ) {
      coverage.invalid += 1;
      excluded.push({ matchId: entry.matchId, reason: 'list_detail_mismatch' });
      continue;
    }
    if (query.seasonId && info.seasonId !== query.seasonId) {
      excluded.push({ matchId: entry.matchId, reason: 'season_filter' });
      continue;
    }
    const mapped = mapMatch(shape.value, query.puuid, catalog.value);
    if (mapped.status !== 'ready') {
      if (mapped.status === 'invalid') coverage.invalid += 1;
      excluded.push({
        matchId: entry.matchId,
        reason: mapped.status === 'invalid' ? 'invalid_response' : mapped.reason,
        ...(mapped.status === 'invalid' ? { issues: mapped.issues } : {}),
      });
      continue;
    }
    matches.push(mapped.value);
  }

  matches.sort((a, b) => b.startedAtMillis - a.startedAtMillis || a.matchId.localeCompare(b.matchId));
  coverage.included = matches.length;
  coverage.startedAtMillis = matches.at(-1)?.startedAtMillis ?? null;
  coverage.endedAtMillis = matches[0]?.startedAtMillis ?? null;
  const failures = coverage.failed + coverage.invalid;
  const unavailable = excluded.some((item) => !['queue_filter', 'season_filter'].includes(item.reason));
  if (matches.length) return finish(failures || unavailable ? 'partial' : 'ready');
  if (failures) return finish('error');
  return finish(unavailable ? 'unavailable' : 'empty');
}
