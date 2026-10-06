const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (!filename.startsWith(path.resolve(__dirname, '..') + path.sep)) throw new Error('Loader scope exceeded');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
};
let provider, view, legacy, format, profile, fixtures, catalog;
try {
  provider = require('./provider.ts'); view = require('./viewModel.ts'); legacy = require('../mock.ts'); format = require('../format.ts');
  profile = require('./profile.ts'); fixtures = require('./fixtures/matches.ts'); catalog = require('./fixtures/content.ts');
}
finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
const query = { puuid: provider.demoProfile.puuid, platform: 'pc', queueId: 'competitive' };
const load = (scenario = 'ready', override = {}) => provider.createMockProvider(scenario)({ ...query, ...override }, new AbortController().signal);

test('home identity, all four matches and weighted profile totals use the same source', async () => {
  assert.equal(provider.demoProfile.name, 'DemoPlayer01');
  assert.equal(provider.demoProfile.href, '/players/demo-player-01');
  const data = await load(), vm = view.createProfileView(data, true), totals = vm.summarize(vm.matches);
  assert.equal(vm.matches.length, 4);
  assert.deepEqual([totals.kills, totals.deaths, totals.assists, totals.wins, totals.losses], [65, 56, 23, 3, 1]);
  assert.equal(totals.kd, 65 / 56); assert.equal(totals.rounds, 89);
  assert.equal(totals.acs, data.summary.score / 89);
  assert.equal(totals.adr, data.summary.damageDealt / 89);
  assert.equal(totals.hs, data.summary.headshots / (data.summary.headshots + data.summary.bodyshots + data.summary.legshots) * 100);
  assert.equal(totals.body + totals.hs + totals.legs, 100);
  for (const key of ['kast','score','firstBloods','flawless','aces']) assert.equal(totals[key], null);
  for (const match of vm.matches) { assert.equal(match.rr, null); assert.equal(match.score, null); assert.equal(match.kast, null); }
});
test('agent/map filters and day summaries preserve actual records', async () => {
  const vm = view.createProfileView(await load(), true);
  const jett = view.filterViewMatches(vm.matches, { agent: catalog.contentIds.agents.jett });
  assert.deepEqual([vm.summarize(jett).kills, vm.summarize(jett).deaths, vm.summarize(jett).assists], [42,32,11]);
  assert.equal(vm.agentStats(vm.matches).find(a => a.agent === 'Jett').matches, 2);
  assert.equal(vm.mapStats(vm.matches).find(a => a.map === 'Bind').matches, 1);
  assert.equal(view.filterViewMatches(vm.matches, { result: 'loss' }).length, 1);
  for (const row of vm.matches) assert.equal(vm.summarize([row]).kills, row.kills);
});
test('weapon stats use weapon kill events, exclude abilities and do not invent weapon HS/KD', async () => {
  const data = await load(), vm = view.createProfileView(data, true);
  const rows = vm.weaponStats(vm.matches);
  assert.equal(rows.reduce((n,row) => n + row.kills, 0) + data.matches.reduce((n,row) => n + row.otherKills, 0), 65);
  for (const row of rows) {
    assert.equal(row.hs, null); assert.equal(row.kd, null);
    const ids = data.matches.filter(m => m.weaponKills.some(w => w.weapon.id === row.id)).map(m => m.matchId);
    assert.deepEqual(view.filterViewMatches(vm.matches, { weapon: row.id }).map(m => m.id), ids);
  }
});
test('valid content with duplicate display names keeps IDs, groups, roles and filter options distinct', () => {
  const content = structuredClone(catalog.content), ids = catalog.contentIds;
  content.characters.find(row => row.id === ids.agents.omen).name = 'Jett';
  content.maps.find(row => row.id === ids.maps.haven.id).name = 'Ascent';
  content.equips.find(row => row.id === ids.weapons.phantom).name = 'Vandal';
  const data = profile.buildProfile(fixtures.matchList, fixtures.matches.map(raw => ({
    matchId: raw.matchInfo.matchId, status: 'ok', data: raw,
  })), content, query);
  assert.equal(data.state, 'ready'); assert.equal(data.coverage.invalid, 0);
  const vm = view.createProfileView(data, true), agents = vm.agentStats(vm.matches), maps = vm.mapStats(vm.matches);
  assert.equal(agents.length, 3); assert.equal(maps.length, 3);
  assert.deepEqual(agents.filter(row => row.agent === 'Jett').map(row => [row.id, row.kills, row.role]), [
    [ids.agents.jett, 42, 'Duelist'], [ids.agents.omen, 10, 'Controller'],
  ]);
  assert.deepEqual(maps.filter(row => row.map === 'Ascent').map(row => [row.id, row.kills]), [
    [ids.maps.ascent.assetPath, 42], [ids.maps.haven.assetPath, 10],
  ]);
  for (const row of vm.matches) {
    const original = data.matches.find(match => match.matchId === row.id);
    assert.equal(row.agentId, original.agent.id); assert.equal(row.mapId, original.map.id);
    assert.deepEqual(row.weaponIds, original.weaponKills.map(item => item.weapon.id));
  }
  for (const [field, options, originalKey] of [
    ['agent', vm.options.agents, 'agent'], ['map', vm.options.maps, 'map'], ['weapon', vm.options.weapons, null],
  ]) {
    assert.equal(new Set(options.map(option => option.value)).size, options.length);
    assert.equal(new Set(options.map(option => option.label)).size, options.length - 1);
    for (const option of options) {
      const originals = data.matches.filter(row => originalKey ? row[originalKey].id === option.value : row.weaponKills.some(item => item.weapon.id === option.value));
      const selected = view.filterViewMatches(vm.matches, { [field]: option.value });
      assert.deepEqual(selected.map(row => row.id), originals.map(row => row.matchId));
      assert.equal(vm.summarize(selected).kills, originals.reduce((sum, row) => sum + row.kills, 0));
    }
    assert.deepEqual(view.filterViewMatches(vm.matches, { [field]: options[0].label }), []);
  }
  const weapons = vm.weaponStats(vm.matches);
  assert.equal(weapons.filter(row => row.name === 'Vandal').length, 2);
  for (const weapon of weapons) {
    const originalKills = data.matches.flatMap(row => row.weaponKills).filter(item => item.weapon.id === weapon.id).reduce((sum, item) => sum + item.kills, 0);
    assert.equal(weapon.kills, originalKills);
  }
  assert.deepEqual([vm.summarize(vm.matches).kills, vm.summarize(vm.matches).deaths, vm.summarize(vm.matches).assists], [65, 56, 23]);
});
test('partial/empty/error/unsupported and cancellation stay distinct', async () => {
  const partial = await load('partial'); assert.equal(partial.state,'partial'); assert.equal(partial.matches.length,3); assert.equal(partial.coverage.failed,1);
  const empty = await load('empty'); assert.equal(empty.state,'empty'); const vm = view.createProfileView(empty,true), totals = vm.summarize([]); assert.equal(totals.kills,0); assert.equal(totals.hs,null); assert.equal(totals.kd,null);
  assert.equal((await load('ready', { platform: 'console' })).state,'unavailable');
  assert.equal((await load('ready', { seasonId: 'missing' })).state,'empty');
  assert.equal((await load('ready', { puuid: 'unknown' })).state,'error');
  await assert.rejects(load('error'), /Demo request failure/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(provider.createMockProvider()(query,controller.signal), /cancelled/);
  assert.equal(format.number(0,0),'0'); assert.equal(format.number(null),'—'); assert.equal(format.percent(null),'—');
});
test('legacy source and filters keep previous computed summaries', () => {
  const vm = view.createProfileView(null,false);
  for (const filters of [{platform:'PC', mode:'Competitive',act:'V26: A5'}, {agent:'Jett', result:'loss'}, {weapon:'Vandal',date:'week'}, {platform:'Console',mode:'Premier'}]) {
    const rows = view.filterViewMatches(vm.matches, filters), expected = legacy.filterMatches(legacy.matches,filters);
    assert.deepEqual(rows,expected); assert.deepEqual(vm.summarize(rows),legacy.summarize(expected));
    assert.deepEqual(vm.agentStats(rows),legacy.agentStats(expected).map(row => ({ id: row.agent, ...row })));
    assert.deepEqual(vm.mapStats(rows),legacy.mapStats(expected).map(row => ({ id: row.map, ...row })));
  }
  for (const options of Object.values(vm.options)) for (const option of options) assert.equal(option.value, option.label);
  for (const row of vm.weaponStats(vm.matches)) assert.equal(row.id, row.name);
});
