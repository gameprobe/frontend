const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { test } = require('node:test');

// 기존 TypeScript 의존성으로 이 폴더의 순수 모듈만 실행한다. 운영 번들/새 패키지는 건드리지 않는다.
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(__dirname + path.sep)) throw new Error('Test loader scope exceeded');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  module._compile(code, filename);
};
let fixtures, catalog, metadata, validation, mapping, metrics, profile;
try {
  fixtures = require('./fixtures/matches.ts');
  catalog = require('./fixtures/content.ts');
  metadata = require('./fixtures/manifest.ts');
  validation = require('./validate.ts');
  mapping = require('./mapMatch.ts');
  metrics = require('./metrics.ts');
  profile = require('./profile.ts');
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const { matches, matchList } = fixtures;
const { content, contentIds } = catalog;
const { manifest } = metadata;
const { validateMatchList, validateCompleteMatch, validateContent } = validation;
const { mapMatch } = mapping;
const { summarizeMatches, groupMatches, ratio } = metrics;
const { buildProfile } = profile;
const query = { puuid: manifest.viewerPuuid, platform: 'pc', queueId: 'competitive' };
const details = matches.map((data) => ({ matchId: data.matchInfo.matchId, status: 'ok', data }));
const clone = structuredClone;
const mapped = () => matches.map((m) => {
  const result = mapMatch(m, query.puuid, content);
  assert.equal(result.status, 'ready', JSON.stringify(result));
  return result.value;
});

// 표본을 동결해 집계·정렬이 원본을 변경하는 회귀를 검출한다.
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(freeze);
  }
  return value;
}
freeze(matches); freeze(matchList); freeze(content);

test('F01: four document-shaped fixtures validate and contain no app-only DTO fields', () => {
  assert.equal(matches.length, 4);
  assert.equal(validateMatchList(matchList).ok, true);
  assert.equal(validateContent(content).ok, true);
  assert.equal(manifest.kind, 'synthetic');
  for (const [i, match] of matches.entries()) {
    assert.deepEqual(validateCompleteMatch(match), { ok: true, value: match });
    assert.equal(match.players.length, 10);
    assert.equal(match.roundResults.length, [22, 22, 26, 19][i]);
    assert.deepEqual(matchList.history[i], { matchId: match.matchInfo.matchId, gameStartTimeMillis: match.matchInfo.gameStartMillis, queueId: 'competitive' });
    assert.ok(!('isMock' in match.matchInfo) && !('rrDelta' in match.players[0].stats));
  }
});

test('F01: per-round enemy events, elimination winners and totals independently reconcile', () => {
  for (const match of matches) {
    const roster = new Map(match.players.map((p) => [p.puuid, p]));
    const counts = new Map(match.players.map((p) => [p.puuid, { kills: 0, deaths: 0, assists: 0, score: 0 }]));
    for (const round of match.roundResults) {
      const alive = new Set(roster.keys());
      const events = round.playerStats.flatMap((p) => p.kills).sort((a, b) => a.timeSinceRoundStartMillis - b.timeSinceRoundStartMillis);
      for (const event of events) {
        assert.ok(alive.has(event.killer) && alive.has(event.victim));
        assert.notEqual(roster.get(event.killer).teamId, roster.get(event.victim).teamId);
        for (const aid of event.assistants) {
          assert.ok(alive.has(aid));
          assert.equal(roster.get(aid).teamId, roster.get(event.killer).teamId);
          counts.get(aid).assists++;
        }
        counts.get(event.killer).kills++;
        counts.get(event.victim).deaths++;
        alive.delete(event.victim);
      }
      assert.ok(alive.size > 0);
      assert.ok([...alive].every((id) => roster.get(id).teamId === round.winningTeam));
      for (const p of round.playerStats) counts.get(p.puuid).score += p.score;
    }
    for (const p of match.players) for (const key of ['kills', 'deaths', 'assists', 'score']) assert.equal(p.stats[key], counts.get(p.puuid)[key]);
    const kills = match.players.reduce((n, p) => n + p.stats.kills, 0);
    assert.equal(kills, match.players.reduce((n, p) => n + p.stats.deaths, 0));
    assert.equal(match.roundResults.flatMap((r) => r.playerStats).flatMap((p) => p.damage).reduce((n, d) => n + d.damage, 0), kills * 150);
  }
});

test('F01: match rows, agent/map groups and profile share the intended aggregate', () => {
  const rows = mapped();
  assert.deepEqual(rows.map((r) => [r.kills, r.deaths, r.assists]), [[24, 15, 5], [10, 16, 8], [18, 17, 6], [13, 8, 4]]);
  const s = summarizeMatches(rows);
  assert.deepEqual([s.kills, s.deaths, s.assists, s.wins, s.losses, s.rounds], [65, 56, 23, 3, 1, 89]);
  assert.equal(s.kd.value, 65 / 56);
  assert.notEqual(s.kd.value, rows.reduce((n, r) => n + r.kills / r.deaths, 0) / 4);
  assert.equal(s.winRate.value, 75);
  const jett = groupMatches(rows, 'agent').find((g) => g.content.name === 'Jett').summary;
  assert.deepEqual([jett.matches, jett.kills, jett.deaths, jett.assists], [2, 42, 32, 11]);
  for (const key of ['agent', 'map']) for (const field of ['matches', 'wins', 'losses', 'kills', 'deaths', 'assists', 'rounds', 'score', 'damageDealt', 'playtimeMillis']) {
    assert.equal(groupMatches(rows, key).reduce((n, group) => n + group.summary[field], 0), s[field]);
  }
  assert.equal(s.acs.value, s.score / 89);
  assert.equal(s.adr.value, s.damageDealt / 89);
  assert.equal(s.damageDeltaPerRound.value, (s.damageDealt - s.damageReceived) / 89);
  assert.ok(Math.abs(s.headshotRate.value + s.bodyshotRate.value + s.legshotRate.value - 100) < 1e-10);
  assert.equal(s.playtimeMillis, 89 * 90000);
});

test('F01: weapon kills use finishingDamage, preserve other kills and do not invent weapon HS', () => {
  let sawOther = false, sawEquipmentMismatch = false;
  for (const [index, row] of mapped().entries()) {
    const expected = {};
    for (const round of matches[index].roundResults) {
      const rp = round.playerStats.find((p) => p.puuid === row.viewerPuuid);
      for (const event of rp.kills) if (event.finishingDamage.damageType === 'Weapon') {
        const weapon = event.finishingDamage.damageItem;
        expected[weapon] = (expected[weapon] || 0) + 1;
        if (weapon !== rp.economy.weapon) sawEquipmentMismatch = true;
      }
    }
    assert.deepEqual(Object.fromEntries(row.weaponKills.map((w) => [w.weapon.id, w.kills])), expected);
    assert.equal(row.weaponKills.reduce((n, w) => n + w.kills, 0) + row.otherKills, row.kills);
    sawOther ||= row.otherKills > 0;
  }
  assert.ok(sawOther && sawEquipmentMismatch);
  const s = summarizeMatches(mapped());
  for (const key of ['kast', 'currentRR', 'weaponHeadshotRate']) assert.equal(s[key].status, 'unavailable');
});

test('F02/F03: empty and partial responses keep coverage and correct denominators', () => {
  const empty = buildProfile({ puuid: query.puuid, history: [] }, [], content, query);
  assert.equal(empty.state, 'empty');
  assert.equal(empty.summary.winRate.reason, 'no_matches');
  const partialDetails = details.map((d, i) => i === 1 ? { matchId: d.matchId, status: 'error', reason: 'http_429' } : d);
  const partial = buildProfile(matchList, partialDetails, content, query);
  assert.equal(partial.state, 'partial');
  assert.equal(partial.coverage.failed, 1);
  assert.equal(partial.coverage.included, 3);
  assert.equal(partial.summary.winRate.value, 100);
  assert.equal(partial.coverage.excluded[0].reason, 'http_429');
  assert.equal(partial.coverage.completeSeason, false);
  assert.equal(buildProfile(matchList, [], content, query).state, 'error');
});

test('F05: real zero differs from unknown, zero hits and zero deaths', () => {
  assert.equal(ratio(0, 10, 'no_hits', 100).value, 0);
  assert.equal(ratio(0, 0, 'no_hits').reason, 'no_hits');
  assert.equal(ratio(5, 0, 'no_deaths').reason, 'no_deaths');
  assert.throws(() => ratio(NaN, 1, 'no_hits'));
  assert.throws(() => ratio(1, -1, 'no_hits'));
  const row = mapped()[0];
  const zeroHead = summarizeMatches([{ ...row, headshots: 0, bodyshots: 5, legshots: 0 }]);
  assert.equal(zeroHead.headshotRate.value, 0);
  const zeroHits = summarizeMatches([{ ...row, headshots: 0, bodyshots: 0, legshots: 0, deaths: 0 }]);
  assert.equal(zeroHits.headshotRate.reason, 'no_hits');
  assert.equal(zeroHits.kd.reason, 'no_deaths');
  const zeroEconomy = clone(matches[0]);
  zeroEconomy.roundResults[0].playerStats[0].economy.remaining = 0;
  assert.equal(validateCompleteMatch(zeroEconomy).ok, true);
  delete zeroEconomy.roundResults[0].playerStats[0].economy.remaining;
  assert.equal(validateCompleteMatch(zeroEconomy).ok, false);
});

test('F06: unknown content preserves IDs and stats without Jett/Vandal fallback', () => {
  const raw = clone(matches[0]);
  raw.players[0].characterId = 'unrecognized-agent';
  raw.matchInfo.mapId = '/unknown-map';
  const firstWeapon = raw.roundResults.flatMap((r) => r.playerStats[0].kills).find((k) => k.finishingDamage.damageType === 'Weapon');
  firstWeapon.finishingDamage.damageItem = 'unrecognized-weapon';
  const result = mapMatch(raw, query.puuid, content);
  assert.equal(result.status, 'ready');
  assert.deepEqual(result.value.agent, { id: 'unrecognized-agent', name: null });
  assert.deepEqual(result.value.map, { id: '/unknown-map', name: null });
  assert.equal(result.value.weaponKills.find((w) => w.weapon.id === 'unrecognized-weapon').weapon.name, null);
  assert.equal(result.value.kills, 24);
  assert.equal(mapMatch(matches[0], query.puuid, content).value.map.name, 'Ascent');
  assert.notEqual(content.maps[0].id, matches[0].matchInfo.mapId);
});

test('F07: repeated entries deduplicate but identity/content conflicts never double-count', () => {
  const list = clone(matchList); list.history.push(clone(list.history[0]));
  const repeated = buildProfile(list, [...details, clone(details[0])], content, query);
  assert.equal(repeated.summary.matches, 4);
  assert.equal(repeated.coverage.duplicateEntries, 1);
  assert.equal(repeated.coverage.duplicateDetails, 1);
  list.history.at(-1).gameStartTimeMillis++;
  const conflictingList = buildProfile(list, details, content, query);
  assert.equal(conflictingList.coverage.invalid, 1);
  assert.equal(conflictingList.matches.length, 3);
  const changed = clone(details[0]); changed.data.players[0].gameName = 'Conflicting name';
  const conflictingDetail = buildProfile(matchList, [...details, changed], content, query);
  assert.equal(conflictingDetail.coverage.invalid, 1);
  assert.ok(!conflictingDetail.matches.some((m) => m.matchId === changed.matchId));
});

test('F07: list/detail identifiers, time and queue must agree', () => {
  for (const field of ['matchId', 'gameStartMillis', 'queueId']) {
    const changed = clone(details);
    changed[0].data.matchInfo[field] = field === 'gameStartMillis' ? 100 : 'mismatch';
    const p = buildProfile(matchList, changed, content, query);
    assert.equal(p.coverage.invalid, 1, field);
    assert.equal(p.coverage.excluded[0].reason, 'list_detail_mismatch');
  }
  assert.equal(buildProfile(matchList, details, content, { ...query, puuid: 'wrong-person' }).state, 'error');
});

test('F07: malformed/incomplete/unreconciled records fail instead of producing fake zeros', () => {
  const mutations = [
    (m) => { delete m.players[0].stats.kills; },
    (m) => { m.players[0].stats.kills = NaN; },
    (m) => { m.players[0].stats.kills = -1; },
    (m) => { m.players[0].stats.kills++; },
    (m) => { m.players.pop(); },
    (m) => { m.players.push(clone(m.players[0])); },
    (m) => { const extra = clone(m.players[0]); extra.puuid = 'fake-zero-player'; Object.keys(extra.stats).forEach((key) => { extra.stats[key] = 0; }); m.players.push(extra); },
    (m) => { const rp = m.roundResults[0].playerStats.find((p) => !p.kills.length && !p.damage.length && p.score === 0); assert.ok(rp); m.roundResults[0].playerStats = m.roundResults[0].playerStats.filter((p) => p !== rp); m.players.find((p) => p.puuid === rp.puuid).stats.roundsPlayed--; },
    (m) => { m.players[0].teamId = 'missing-team'; },
    (m) => { m.teams[0].roundsWon++; },
    (m) => { m.teams[0].won = !m.teams[0].won; },
    (m) => { m.roundResults.pop(); },
    (m) => { m.roundResults[0].playerStats.pop(); },
    (m) => { m.roundResults[0].playerStats[0].kills[0].victim = 'missing-player'; },
    (m) => { m.roundResults[0].playerStats[0].kills.push(clone(m.roundResults[0].playerStats[0].kills[0])); },
    (m) => { m.roundResults[0].playerStats[0].damage[0].receiver = m.players[0].puuid; },
    (m) => { delete m.roundResults[0].playerStats[0].damage; },
    (m) => { m.players[0].stats.playtimeMillis = Number.MAX_SAFE_INTEGER; },
  ];
  for (const mutate of mutations) {
    const raw = clone(matches[0]); mutate(raw);
    assert.equal(validateCompleteMatch(raw).ok, false, mutate.toString());
    assert.equal(mapMatch(raw, query.puuid, content).status, 'invalid');
  }
  for (const raw of [null, [], {}, { puuid: query.puuid }, { puuid: query.puuid, history: null }]) assert.equal(buildProfile(raw, [], content, query).state, 'error');
  const duplicateCatalog = clone(content); duplicateCatalog.characters.push(clone(duplicateCatalog.characters[0]));
  assert.equal(validateContent(duplicateCatalog).ok, false);
});

test('F08: incomplete, draw and unsupported scope are explicit exclusions', () => {
  assert.equal(buildProfile(matchList, details, content, { ...query, platform: 'console' }).state, 'unavailable');
  assert.equal(buildProfile(matchList, details, content, { ...query, queueId: 'deathmatch' }).state, 'unavailable');
  const incomplete = clone(matches[0]); incomplete.matchInfo.isCompleted = false;
  assert.equal(mapMatch(incomplete, query.puuid, content).reason, 'incomplete_match');
  const otherMode = clone(matches[0]); otherMode.matchInfo.queueId = 'deathmatch';
  assert.equal(mapMatch(otherMode, query.puuid, content).reason, 'unsupported_mode');
  // 승패 집계 경계 시험: 라운드/팀 결과를 함께 바꾸어 11:11을 승리로 처리하지 않는지 확인한다.
  const draw = clone(matches[0]);
  draw.roundResults.forEach((r, i) => { r.winningTeam = i < 11 ? 'Blue' : 'Red'; });
  draw.teams.forEach((t) => { t.won = false; t.roundsWon = 11; t.numPoints = 11; });
  assert.equal(mapMatch(draw, query.puuid, content).reason, 'draw');
  assert.equal(buildProfile(matchList, details, content, { ...query, seasonId: 'not-this-act' }).state, 'empty');
});

test('F10: every selected participant gets their own KDA, enemy damage and team result', () => {
  for (const match of matches) for (const player of match.players) {
    const result = mapMatch(match, player.puuid, content);
    assert.equal(result.status, 'ready');
    const row = result.value;
    assert.deepEqual([row.kills, row.deaths, row.assists], [player.stats.kills, player.stats.deaths, player.stats.assists]);
    assert.equal(row.result, match.teams.find((t) => t.teamId === player.teamId).won ? 'win' : 'loss');
    const received = match.roundResults.flatMap((r) => r.playerStats).flatMap((rp) => rp.damage).filter((d) => d.receiver === player.puuid).reduce((n, d) => n + d.damage, 0);
    assert.equal(row.damageReceived, received);
  }
  assert.equal(mapMatch(matches[0], 'absent-viewer', content).status, 'invalid');
  const blueRoles = matches[2].roundResults.filter((r) => r.winningTeam === 'Blue').map((r) => r.winningTeamRole);
  assert.ok(blueRoles.includes('Attacker') && blueRoles.includes('Defender'));
});

test('collection is deterministic, ordered and covers only returned records', () => {
  const before = JSON.stringify({ matches, matchList, content });
  const reversed = { ...matchList, history: [...matchList.history].reverse() };
  const first = buildProfile(reversed, [...details].reverse(), content, query);
  const second = buildProfile(matchList, details, content, query);
  assert.deepEqual(first, second);
  assert.equal(first.state, 'ready');
  assert.equal(first.coverage.unique, first.coverage.included + first.coverage.excluded.length);
  assert.equal(first.coverage.startedAtMillis, matches[3].matchInfo.gameStartMillis);
  assert.equal(first.coverage.endedAtMillis, matches[0].matchInfo.gameStartMillis);
  assert.equal(JSON.stringify({ matches, matchList, content }), before);
});

// 조회 범위 밖 중복 충돌과 단순 object key 순서는 현재 통계를 깨뜨리지 않는다.
test('off-query conflicts do not contaminate the selected queue; canonical duplicates are stable', () => {
  const first = { matchId: 'unrequested', queueId: 'deathmatch', gameStartTimeMillis: 1 };
  const second = { ...first, gameStartTimeMillis: 2 };
  const offQuery = { puuid: query.puuid, history: [first, second] };
  const empty = buildProfile(offQuery, [], content, query);
  assert.equal(empty.state, 'empty');
  assert.equal(empty.coverage.invalid, 0);
  const mixed = { ...offQuery, history: [first, { ...second, queueId: 'competitive' }] };
  assert.equal(buildProfile(mixed, [], content, query).state, 'error');
  const reordered = clone(details[0]);
  reordered.data.matchInfo = Object.fromEntries(Object.entries(reordered.data.matchInfo).reverse());
  const deduped = buildProfile(matchList, [...details, reordered], content, query);
  assert.equal(deduped.state, 'ready');
  assert.equal(deduped.coverage.duplicateDetails, 1);
});
