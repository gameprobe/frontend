const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../../..');
const ts = require(path.join(root, 'frontend/node_modules/typescript'));
const code = ts.transpileModule(fs.readFileSync(path.join(root, 'frontend/src/lib/lineup-api.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function load(env, fetch) {
  const sandbox = {exports: {}, process: {env}, fetch};
  vm.runInNewContext(code, sandbox);
  return sandbox.exports;
}
(async () => {
  for (const value of [undefined, '', '   ']) {
    let calls = 0;
    const api = load({NEXT_PUBLIC_BACKEND_URL: value}, async () => { calls++; throw Error('Unexpected request'); });
    await assert.rejects(api.fetchPublicLineups(), /설정되지/);
    await assert.rejects(api.fetchLineup('example'), /설정되지/);
    assert.equal(calls, 0, 'Missing config must not contact the visitor localhost');
  }
  const calls = [];
  const api = load({NEXT_PUBLIC_BACKEND_URL: ' https://backend.example.test/ '}, async (url, options) => {
    calls.push({url, options});
    return {ok: true, json: async () => url.endsWith('/api/lineups') ? [] : {
      id: 'demo/id', title: 'Demo', description: '', mapId: 'ascent', side: 'ATTACK',
      agentId: 'sova', difficulty: 'EASY', skillMarkers: [], agentMarkers: [], pathPoints: [], status: 'PUBLISHED', authorId: 'fixture',
    }};
  });
  assert.equal((await api.fetchPublicLineups()).length, 0);
  assert.equal((await api.fetchLineup('demo/id')).id, 'demo/id');
  assert.equal(calls[0].url, 'https://backend.example.test/api/lineups');
  assert.equal(calls[1].url, 'https://backend.example.test/api/lineups/demo%2Fid');
  assert.equal(calls[0].options.headers.Accept, 'application/json');
  const failed = load({NEXT_PUBLIC_BACKEND_URL: 'https://backend.example.test'}, async () => ({ok: false, status: 503}));
  await assert.rejects(failed.fetchPublicLineups(), /503/);
  await assert.rejects(failed.fetchLineup('example'), /503/);
  console.log('PASS: missing/empty/whitespace config makes zero requests; configured list/detail URL + ID encoding; HTTP failure preserved.');
})().catch(error => { console.error(error); process.exitCode = 1; });
