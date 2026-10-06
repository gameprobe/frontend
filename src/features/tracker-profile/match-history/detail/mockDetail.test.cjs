const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// 프로젝트의 기존 TypeScript만 사용해 공급자와 검증 경계를 실행한다.
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
  }).outputText;
  module._compile(compiled, filename);
};
let matches, getMockMatchDetail, validateMatchDetail;
try {
  ({ matches } = require(path.join(__dirname, '../../mock.ts')));
  ({ getMockMatchDetail } = require(path.join(__dirname, 'mockDetail.ts')));
  ({ validateMatchDetail } = require(path.join(__dirname, 'detailData.ts')));
} finally {
  if (previousLoader) require.extensions['.ts'] = previousLoader;
  else delete require.extensions['.ts'];
}

const viewer = Object.freeze({ puuid: 'ied-agent-allen', gameName: 'IED agent', tagLine: 'Allen' });
const original = JSON.stringify(matches);
const clone = value => JSON.parse(JSON.stringify(value));
const total = (rows, field) => rows.reduce((sum, row) => sum + row.stats[field], 0);
let provided = 0, missing = 0;

for (const row of matches) {
  const match = Object.freeze({ ...row });
  const data = getMockMatchDetail(match, viewer);
  assert.equal(validateMatchDetail(match, viewer, data), null, match.id);
  assert.deepEqual(getMockMatchDetail(match, viewer), data, 'same ID and input produce identical data');
  assert.equal(data.summary.matchId, match.id);
  assert.equal(data.summary.score.roundsWon, match.teamScore);
  assert.equal(data.summary.score.roundsLost, match.enemyScore);
  assert.deepEqual(data.summary.stats, {
    kills: match.kills, deaths: match.deaths, assists: match.assists,
    averageCombatScore: match.acs, adr: match.adr, headshotPercentage: match.hs,
  });
  assert.match(data.notice, /Mock/);
  assert.match(data.notice, /실제 기록이 아닙니다/);
  if (match.mode === 'Deathmatch') {
    missing += 1;
    assert.equal(data.detail, null);
    assert.equal(data.summary.team, '', 'unavailable detail does not invent a team');
    assert.match(data.reason, /데스매치/);
    continue;
  }
  provided += 1;
  assert.ok(data.detail, match.id);
  const detail = data.detail;
  assert.equal(detail.durationSeconds, match.duration * 60);
  assert.equal(detail.startedAt, `${match.date}T${match.time}:00.000Z`);
  assert.equal(detail.participants.length, 10);
  assert.equal(detail.rounds.length, match.teamScore + match.enemyScore);
  const selected = detail.participants.find(player => player.puuid === viewer.puuid);
  assert.deepEqual(selected.stats, data.summary.stats);
  assert.equal(selected.agent, match.agent);
  const allies = detail.participants.filter(player => player.team === selected.team);
  const opponents = detail.participants.filter(player => player.team !== selected.team);
  assert.equal(allies.length, 5);
  assert.equal(opponents.length, 5);
  assert.equal(total(allies, 'kills'), total(opponents, 'deaths'));
  assert.equal(total(opponents, 'kills'), total(allies, 'deaths'));
  assert.equal(selected.weaponKills.reduce((sum, weapon) => sum + weapon.kills, 0), match.kills);
  assert.equal(selected.duels.reduce((sum, duel) => sum + duel.kills, 0), match.kills);
  assert.equal(selected.duels.reduce((sum, duel) => sum + duel.deaths, 0), match.deaths);
  for (const player of detail.participants) {
    assert.ok(player.stats.deaths <= detail.rounds.length, 'generated deaths do not exceed played rounds');
    for (const field of ['firstKills', 'firstDeaths', 'multiKills', 'damageDealt', 'damageReceived']) {
      assert.equal(Object.hasOwn(player.stats, field), false, `${field} must remain unprovided`);
    }
  }
  for (const round of detail.rounds) {
    assert.equal(round.endType, '', 'an outcome is not a recorded ending cause');
    for (const field of ['killEvents', 'economy']) assert.equal(Object.hasOwn(round, field), false);
  }
  assert.deepEqual(detail.rounds.at(-1).scoreAfterRound, { attackers: match.teamScore, defenders: match.enemyScore });
  const otherViewer = { puuid: 'demo-puuid-seoul-duelist-001', gameName: 'SeoulDuelist', tagLine: 'KR1' };
  const other = getMockMatchDetail(match, otherViewer);
  assert.equal(validateMatchDetail(match, otherViewer, other), null);
  assert.deepEqual(other.detail.rounds, detail.rounds, 'viewer identity does not change outcomes');
  assert.deepEqual(other.detail.participants.map(player => player.stats), detail.participants.map(player => player.stats), 'viewer identity does not change statistics');
  assert.deepEqual(other.detail.participants[0].riotId, { gameName: 'SeoulDuelist', tagLine: 'KR1' });
}
assert.equal(provided, 34);
assert.equal(missing, 2);
assert.equal(JSON.stringify(matches), original, 'source fixtures are never mutated');

const match = matches.find(row => row.id === 'mock-match-01');
const baseline = getMockMatchDetail(match, viewer);
function reject(label, mutate) {
  const data = clone(baseline);
  mutate(data);
  assert.ok(validateMatchDetail(match, viewer, data), label);
}
reject('wrong detail ID', data => { data.detail.matchId = 'mock-match-02'; });
reject('wrong summary ID', data => { data.summary.matchId = 'mock-match-02'; });
reject('wrong date', data => { data.detail.startedAt = '2026-06-12T12:30:00.000Z'; });
reject('wrong duration', data => { data.detail.durationSeconds += 60; });
reject('wrong score', data => { data.summary.score.roundsWon += 1; });
reject('wrong viewer ID', data => { data.viewerPuuid = 'other'; });
reject('missing viewer', data => { data.detail.participants[0].puuid = 'other'; });
reject('wrong viewer name', data => { data.detail.participants[0].riotId.gameName = 'other'; });
reject('wrong viewer team', data => { data.detail.participants[0].team = 'defenders'; });
reject('wrong viewer agent asset', data => { data.detail.participants[0].agentId = 'jett'; });
reject('wrong viewer stats', data => { data.detail.participants[0].stats.kills += 1; });
reject('missing participant', data => { data.detail.participants.pop(); });
reject('missing participant stats', data => { delete data.detail.participants[0].stats; });
reject('duplicate participant ID', data => { data.detail.participants[1].puuid = viewer.puuid; });
reject('unbalanced team totals', data => { data.detail.participants[1].stats.kills += 1; });
reject('missing round', data => { data.detail.rounds.pop(); });
reject('wrong cumulative score', data => { data.detail.rounds[0].scoreAfterRound.attackers += 1; });
reject('wrong weapon sum', data => { data.detail.participants[0].weaponKills[0].kills += 1; });
reject('missing weapon entry', data => { data.detail.participants[0].weaponKills[0] = null; });
reject('wrong duel sum', data => { data.detail.participants[0].duels[0].kills += 1; });
reject('wrong duel opponent', data => { data.detail.participants[0].duels[0].opponentPuuid = viewer.puuid; });
reject('missing duel entry', data => { data.detail.participants[0].duels[0] = null; });
reject('missing summary', data => { delete data.summary; });
reject('missing sample notice', data => { delete data.notice; });
reject('unavailable without reason', data => { data.detail = null; data.summary.team = ''; });

const optionalMissing = clone(baseline);
delete optionalMissing.detail.participants[0].weaponKills;
delete optionalMissing.detail.participants[0].duels;
assert.equal(validateMatchDetail(match, viewer, optionalMissing), null, 'unprovided optional telemetry is allowed');
const unavailable = { ...baseline, summary: { ...baseline.summary, team: '' }, detail: null, reason: '아직 제공하지 않는 기록입니다.' };
assert.equal(validateMatchDetail(match, viewer, unavailable), null);

assert.equal(getMockMatchDetail({ ...match, id: 'unknown' }, viewer).detail, null);
assert.equal(getMockMatchDetail({ ...match, map: 'Ascent' }, viewer).detail, null, 'known ID cannot be reused for mismatched content');
assert.equal(getMockMatchDetail({ ...match, kills: NaN }, viewer).detail, null);
assert.equal(getMockMatchDetail({ ...match, deaths: undefined }, viewer).detail, null, 'missing values do not become zero');
assert.equal(getMockMatchDetail(match, { ...viewer, puuid: '' }).detail, null);
const collision = baseline.detail.participants[1].puuid;
assert.equal(getMockMatchDetail(match, { ...viewer, puuid: collision }).detail, null);

// 검증 경계 자체는 0데스를 허용한다. 원본 36개를 바꾸지 않고 테스트용 기록만 조정한다.
const zeroDeathsMatch = { ...match, deaths: 0 };
const zeroDeaths = clone(baseline);
zeroDeaths.summary.stats.deaths = 0;
zeroDeaths.detail.participants[0].stats.deaths = 0;
for (const duel of zeroDeaths.detail.participants[0].duels) {
  zeroDeaths.detail.participants.find(player => player.puuid === duel.opponentPuuid).stats.kills -= duel.deaths;
  duel.deaths = 0;
}
assert.equal(validateMatchDetail(zeroDeathsMatch, viewer, zeroDeaths), null);
assert.equal(getMockMatchDetail(zeroDeathsMatch, viewer).detail, null, 'changed source records are rejected rather than silently replacing the known match');
assert.equal(JSON.stringify(matches), original);
console.log(`PASS: ${provided} team details / ${missing} Deathmatch fallbacks; identity, summary, totals, rounds, optional telemetry, deterministic data, mismatch and zero-death guards`);
