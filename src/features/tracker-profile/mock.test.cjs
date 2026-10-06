const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Run the pure TypeScript selectors with the project's existing compiler, without a test dependency.
const filename = path.join(__dirname, 'mock.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const fixtureModule = new Module(filename, module);
fixtureModule.filename = filename;
fixtureModule.paths = module.paths;
fixtureModule._compile(compiled, filename);
const { matches, filterMatches, summarize, agentStats, mapStats } = fixtureModule.exports;

const original = JSON.stringify(matches);
const current = filterMatches(matches, { platform: 'PC', mode: 'Competitive', act: 'V26: A5' });
assert.equal(current.length, 23, 'default season contains 23 competitive matches');
assert.equal(new Set(matches.map((match) => match.id)).size, matches.length, 'fixture IDs are unique');
assert.equal(summarize(current).wins, 16, 'default season has 16 wins');
assert.equal(summarize(current).losses, 7, 'default season has 7 losses');
assert.equal(summarize(current).kills, 365, 'default season kill total matches its match rows');
assert.equal(summarize(current).winRate, 69.6);

const compound = filterMatches(matches, {
  platform: 'PC', mode: 'Competitive', act: 'V26: A5', agent: 'Jett',
  map: 'Split', weapon: 'Vandal', result: 'win', date: 'month',
});
assert.deepEqual(compound.map((match) => match.id), ['mock-match-04', 'mock-match-08']);
assert.equal(filterMatches(matches, { platform: 'Console', mode: 'Premier' }).length, 0);
assert.equal(filterMatches(matches, { act: 'V26: A4' }).length, 3);
assert.equal(filterMatches(matches, { platform: 'Console' }).length, 2);
assert.equal(filterMatches(current, { date: 'week' }).length, 6, 'week includes newest date and preceding six days');
assert.equal(filterMatches(current, { date: 'month' }).length, 23);
assert.equal(filterMatches(matches, { act: 'All', agent: 'all', map: 'All', platform: 'all' }).length, matches.length);

for (const mode of ['Competitive', 'Premier', 'Unrated', 'Deathmatch', 'Swiftplay']) {
  assert.ok(filterMatches(matches, { mode }).length > 0, `${mode} has a usable fixture`);
}

const shuffled = [current[2], current[0], current[1]];
assert.deepEqual(filterMatches(shuffled).map((match) => match.id), current.slice(0, 3).map((match) => match.id));
assert.equal(shuffled[0].id, current[2].id, 'sorting does not mutate the caller array');
assert.equal(JSON.stringify(matches), original, 'filters leave shared fixtures intact');

const empty = summarize([]);
assert.ok(Object.values(empty).every((value) => value === 0), 'empty summaries contain only finite zero values');
assert.deepEqual(agentStats([]), []);
assert.deepEqual(mapStats([]), []);
assert.deepEqual(filterMatches([], { date: 'week' }), []);

const noDeaths = summarize([{ ...current[0], kills: 5, deaths: 0, assists: 2 }]);
assert.equal(noDeaths.kd, 5);
assert.equal(noDeaths.kad, 7);
assert.ok(Object.values(noDeaths).every(Number.isFinite), 'zero deaths cannot produce Infinity or NaN');

const weighted = summarize([
  { ...current[0], teamScore: 5, enemyScore: 0, adr: 100, acs: 200, hs: 20, kast: 60, dd: -10, score: 300, duration: 12 },
  { ...current[1], teamScore: 10, enemyScore: 5, adr: 200, acs: 300, hs: 40, kast: 80, dd: 10, score: 700, duration: 18 },
]);
assert.equal(weighted.adr, 175, 'damage is weighted by played rounds');
assert.equal(weighted.hs, 35);
assert.equal(weighted.kast, 75);
assert.equal(weighted.dd, 5);
assert.equal(weighted.score, 500, 'score is an average of match scores');
assert.equal(weighted.hours, 0.5);
assert.equal(summarize(filterMatches(matches, { mode: 'Deathmatch' })).rounds, 2, 'deathmatch scoreboard is not a round count');

const season = summarize(current);
for (const groups of [agentStats(current), mapStats(current)]) {
  for (const field of ['matches', 'wins', 'losses', 'kills', 'deaths', 'assists', 'rounds']) {
    assert.equal(groups.reduce((sum, row) => sum + row[field], 0), season[field], `${field} reconciles across groups`);
  }
}
assert.ok(agentStats(current).every((row) => ['Ascent', 'Haven', 'Split'].includes(row.bestMap)));
assert.ok(matches.every((row) => row.score >= 0 && row.score <= 1000 && row.kast >= 0 && row.kast <= 100));
console.log('PASS: deterministic fixtures, compound/date filters, ordering, empty states, weighted summaries and group reconciliation');
