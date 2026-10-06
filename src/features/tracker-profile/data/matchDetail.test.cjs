const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// 원본→상세 계약과 기존 상세 컴포넌트의 실제 SSR 출력을 함께 검증한다. CSS/이미지는 브라우저 QA 대상이다.
const cache = new Map();
function load(filename) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = new Module(filename, module);
  cache.set(filename, loaded);
  loaded.filename = filename;
  loaded.paths = module.paths;
  const nativeRequire = loaded.require.bind(loaded);
  loaded.require = name => {
    if (name === 'next/image') return function TestImage(props) { return React.createElement('img', { src: props.src, alt: props.alt }); };
    if (name.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), name);
      for (const suffix of ['.tsx', '.ts']) if (fs.existsSync(target + suffix)) return load(target + suffix);
    }
    return nativeRequire(name);
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
  return loaded.exports;
}
const { matches } = load(path.join(__dirname, 'fixtures/matches.ts'));
const { getSyntheticMatchDetail, mapSyntheticMatchDetail } = load(path.join(__dirname, 'matchDetail.ts'));
const detailFile = name => path.join(__dirname, '../match-history/detail', `${name}.tsx`);
const render = (name, props) => renderToStaticMarkup(React.createElement(load(detailFile(name))[name], props));
const viewerPuuid = 'demo-player-01';
let kills = 0, deaths = 0, assists = 0;

for (const raw of matches) {
  const data = getSyntheticMatchDetail(raw.matchInfo.matchId, viewerPuuid);
  assert.ok(data);
  assert.equal(data.source, 'riot-synthetic');
  assert.equal(data.detail.participants.length, 10);
  assert.equal(data.detail.rounds.length, raw.roundResults.length);
  assert.equal(data.detail.startedAt, new Date(raw.matchInfo.gameStartMillis).toISOString());
  assert.equal(data.detail.durationSeconds, raw.matchInfo.gameLengthMillis / 1000);
  kills += data.summary.stats.kills;
  deaths += data.summary.stats.deaths;
  assists += data.summary.stats.assists;
  for (const participant of data.detail.participants) {
    const rawPlayer = raw.players.find(player => player.puuid === participant.puuid);
    assert.deepEqual([participant.stats.kills, participant.stats.deaths, participant.stats.assists], [rawPlayer.stats.kills, rawPlayer.stats.deaths, rawPlayer.stats.assists]);
    assert.equal(participant.duels.length, 5);
    assert.equal(participant.duels.reduce((sum, duel) => sum + duel.kills, 0), participant.stats.kills);
    assert.equal(participant.duels.reduce((sum, duel) => sum + duel.deaths, 0), participant.stats.deaths);
    assert.equal(participant.weaponKills.reduce((sum, weapon) => sum + weapon.kills, 0), participant.stats.kills);
    for (const metric of ['kills', 'deaths', 'assists']) {
      assert.equal(Object.values(data.roundPlayers).reduce((sum, round) => sum + round[participant.puuid][metric], 0), participant.stats[metric]);
    }
    assert.equal(Object.values(data.opponentDamage[participant.puuid]).reduce((sum, opponent) => sum + opponent.dealt, 0), participant.stats.damageDealt);
    assert.equal(Object.values(data.opponentDamage[participant.puuid]).reduce((sum, opponent) => sum + opponent.received, 0), participant.stats.damageReceived);
  }
  for (const round of data.detail.rounds) {
    const rawRound = raw.roundResults[round.roundNumber - 1];
    assert.equal(round.killEvents.length, rawRound.playerStats.flatMap(player => player.kills).length);
    assert.ok(round.killEvents.every(event => event.killerPos === undefined && event.victimPoint === undefined && event.isHeadshot === undefined));
    const viewerTeam = raw.players.find(player => player.puuid === viewerPuuid).teamId;
    const allies = raw.players.filter(player => player.teamId === viewerTeam).map(player => player.puuid);
    assert.equal(round.economy.attackersLoadout, rawRound.playerStats.filter(player => allies.includes(player.puuid)).reduce((sum, player) => sum + player.economy.loadoutValue, 0));
    const winnerAttacks = rawRound.winningTeamRole === 'Attacker';
    assert.equal(data.roundPlayers[round.roundNumber][viewerPuuid].side, (rawRound.winningTeam === viewerTeam) === winnerAttacks ? 'Attack' : 'Defense');
  }
  const reversed = getSyntheticMatchDetail(raw.matchInfo.matchId, 'demo-player-06');
  assert.equal(reversed.summary.score.roundsWon, data.summary.score.roundsLost);
  assert.equal(reversed.summary.result, data.summary.result === 'win' ? 'loss' : 'win');
}
assert.deepEqual([kills, deaths, assists], [65, 56, 23]);
assert.equal(getSyntheticMatchDetail('not-a-match', viewerPuuid), null);
assert.equal(getSyntheticMatchDetail('demo-match-001', 'missing-player'), null);
const invalid = structuredClone(matches[0]);
invalid.roundResults[0].playerStats.pop();
assert.equal(mapSyntheticMatchDetail(invalid, viewerPuuid), null, 'invalid raw data never falls back to another fixture');

const noHits = structuredClone(matches[0]);
noHits.roundResults.forEach(round => round.playerStats.forEach(player => player.damage.forEach(hit => {
  hit.headshots = 0; hit.bodyshots = 0; hit.legshots = 0;
})));
const noHitsData = mapSyntheticMatchDetail(noHits, viewerPuuid);
assert.ok(noHitsData);
assert.equal(noHitsData.summary.stats.headshotPercentage, null, 'no-hit denominator remains missing, not HS 0%');

const data = getSyntheticMatchDetail('demo-match-001', viewerPuuid);
const props = {
  match: { id: 'demo-match-001', map: 'Ascent', mode: 'Competitive', date: '2026-09-20', time: '00:00', duration: 33, teamScore: 13, enemyScore: 9, score: null, kast: null, rr: null, dd: null, detailMetrics: [] },
  data, displayName: 'DemoPlayer01', displayTag: 'DEMO', onClose() {},
};
let html = render('TrackerMatchPanel', props);
assert.equal((html.match(/role="tab"/g) ?? []).length, 5);
assert.match(html, /DemoPlayer01/);
assert.match(html, /href="\/matches\/demo-match-001\?viewer=demo-player-01" target="_blank"/);
assert.doesNotMatch(html, /NaN|Infinity|null%/);
const row = [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].find(([row]) => row.includes('title="DemoPlayer01#DEMO"'))[0];
const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(([,value]) => value.replace(/<[^>]+>/g, ''));
assert.equal(cells[1], '—', 'PS stays unavailable');
assert.equal(cells[11], '—', 'KAST stays unavailable');
assert.deepEqual(cells.slice(3, 6), ['24', '15', '5']);
html = render('TrackerPerformance', props);
assert.match(html, /라운드별 실제 공수 역할/);
assert.match(html, /같은 원본의 상대별 피해 합계/);
assert.doesNotMatch(html, /개인 라운드 기록 미제공|진영별 기록 미제공/);
html = render('TrackerPerformance', { ...props, data: noHitsData });
assert.match(html, /<dt>HS%<\/dt><dd>—<\/dd>/);
const zeroDeaths = structuredClone(noHitsData);
zeroDeaths.detail.participants.find(player => player.puuid === viewerPuuid).stats.deaths = 0;
html = render('TrackerPerformance', { ...props, data: zeroDeaths });
assert.match(html, /<dt>K\/D<\/dt><dd>—<\/dd>/);
html = render('TrackerEconomy', props);
assert.match(html, /라운드별 팀 경제 기록/);
assert.doesNotMatch(html, /경제 기록 미제공/);
html = render('TrackerRounds', props);
assert.match(html, /Event Log/);
assert.match(html, /First Kill/);
assert.match(html, /선수 위치 미제공/);
assert.doesNotMatch(html, /이벤트 기록 미제공/);
html = render('TrackerDuels', props);
assert.match(html, /<strong>25<span>\/ 25<\/span><\/strong>/);
assert.equal((html.match(/aria-label="DemoPlayer\d+ 대 DemoPlayer\d+:/g) ?? []).length, 25);
for (const activeTab of ['scoreboard', 'rounds', 'performance', 'analysis']) {
  html = render('DetailedMatchPanel', { ...props, activeTab, onTabChange() {} });
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /NaN|Infinity|null%/);
}
console.log('PASS: 4 raw fixtures/detail totals, 10 participants, 25 duels, swapped teams, round roles/economy/events, missing metrics, modal 5 tabs, inline 4 tabs');
