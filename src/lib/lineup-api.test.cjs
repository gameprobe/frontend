const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, afterEach } = require('node:test');
const ts = require('typescript');

const allowed = new Set([
  path.join(__dirname, 'lineup-api.ts'),
  path.resolve(__dirname, '../features/lineup-explorer/model.ts'),
]);
const previousLoader = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (!allowed.has(filename)) throw new Error('Test loader scope exceeded');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
let api, groupLineupDestinations, getLineupRoute;
try {
  api = require('./lineup-api.ts');
  ({ groupLineupDestinations, getLineupRoute } = require('../features/lineup-explorer/model.ts'));
} finally {
  if (previousLoader) require.extensions['.ts'] = previousLoader;
  else delete require.extensions['.ts'];
}

const originalFetch = global.fetch;
const originalPublicBase = process.env.NEXT_PUBLIC_BACKEND_URL;
afterEach(() => {
  global.fetch = originalFetch;
  if (originalPublicBase === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
  else process.env.NEXT_PUBLIC_BACKEND_URL = originalPublicBase;
});

function response(overrides = {}) {
  return {
    id: 'guide-1', title: '개별 공략', description: '영상의 조준점을 따라 사용합니다.',
    mapId: 'ascent', side: 'ATTACK', agentId: 'sova', difficulty: 'MEDIUM',
    skillMarkers: [{ abilityId: 'existing-custom-recon-id', position: { x: .72, y: .28 }, order: 2 }],
    agentMarkers: [{ position: { x: .35, y: .8 }, label: '출발 위치' }],
    pathPoints: [{ x: .45, y: .6 }, { x: .61, y: .45 }],
    status: 'PUBLISHED', authorId: 'admin-1',
    createdAt: '2026-10-05T00:00:00Z', updatedAt: '2026-10-05T01:00:00Z',
    registration: {
      destination: { id: 'ascent-a-default', name: 'A 사이트 기본 위치', point: { x: .72, y: .28 } },
      media: { type: 'IMAGE', url: 'https://example.com/lineup.png' },
      site: 'MID', abilitySlot: 'E',
    },
    ...overrides,
  };
}

function payload(overrides = {}) {
  const backend = response();
  return {
    title: backend.title, description: backend.description, mapId: backend.mapId,
    side: 'attack', agentId: backend.agentId, difficulty: 'medium',
    skillMarkers: backend.skillMarkers, agentMarkers: backend.agentMarkers,
    pathPoints: backend.pathPoints, status: 'published', registration: backend.registration,
    ...overrides,
  };
}

function mockFetch(body, status = 200) {
  const calls = [];
  process.env.NEXT_PUBLIC_BACKEND_URL = 'http://lineup.test///';
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(status === 204 ? null : JSON.stringify(body), {
      status, headers: { 'Content-Type': 'application/json' },
    });
  };
  return calls;
}

test('backend normalization retains complete registration, path, status, all markers and original ability IDs', () => {
  const backend = response();
  const detail = api.normalizeBackendLineup(backend);
  assert.deepEqual(detail.registration, backend.registration);
  assert.deepEqual(detail.skillMarkers, backend.skillMarkers);
  assert.deepEqual(detail.agentMarkers, backend.agentMarkers);
  assert.deepEqual(detail.pathPoints, backend.pathPoints);
  assert.equal(detail.skillMarkers[0].abilityId, 'existing-custom-recon-id');
  assert.equal(detail.status, 'PUBLISHED');
  assert.equal(detail.side, 'attack');
  assert.equal(detail.difficulty, 'medium');
  assert.equal(detail.createdAt, backend.createdAt);
  assert.equal(detail.updatedAt, backend.updatedAt);
  assert.equal(detail.youtubeUrl, undefined);
});

test('public normalization maps explicit destination, IMAGE, site and slot without replacing unknown ability IDs', () => {
  const backend = response();
  const card = api.normalizeBackendCard(backend);
  assert.deepEqual(card.registration, backend.registration);
  assert.equal(card.mapPreview.destinationId, 'ascent-a-default');
  assert.equal(card.mapPreview.destinationName, 'A 사이트 기본 위치');
  assert.deepEqual(card.mapPreview.skillPosition, backend.registration.destination.point);
  assert.deepEqual(card.media, { imageUrls: [backend.registration.media.url] });
  assert.equal(card.ability.abilityId, 'existing-custom-recon-id');
  assert.equal(card.ability.slot, 'E');
  assert.equal(card.registration.site, 'MID');
  assert.deepEqual(getLineupRoute(card), [backend.agentMarkers[0].position, ...backend.pathPoints, backend.registration.destination.point]);
});

test('explicit destination ID groups distinct origins and preserves their own media and intermediate paths', () => {
  const first = response();
  const second = response({ id: 'guide-2', pathPoints: [], agentMarkers: [{ position: { x: .1, y: .9 } }] });
  second.registration.media = { type: 'VIDEO', url: 'https://example.com/lineup.mp4' };
  const cards = [first, second].map(api.normalizeBackendCard);
  const groups = groupLineupDestinations(cards);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].entries.length, 2);
  assert.deepEqual(getLineupRoute(cards[1]), [second.agentMarkers[0].position, second.registration.destination.point]);
  assert.equal(cards[1].media.youtubeUrl, second.registration.media.url);
  assert.equal(api.normalizeBackendLineup(second).youtubeUrl, second.registration.media.url);
});

test('legacy multi-marker responses retain every marker and carry no invented registration', () => {
  const legacy = response({ registration: null, skillMarkers: [
    { abilityId: 'legacy-1', position: { x: .1, y: .2 }, youtubeUrl: 'https://example.com/legacy.mp4', order: 4 },
    { abilityId: 'legacy-2', position: { x: .3, y: .4 }, order: 5 },
  ], agentMarkers: [{ position: { x: .5, y: .6 }, label: 'one' }, { position: { x: .7, y: .8 }, label: 'two' }] });
  const detail = api.normalizeBackendLineup(legacy);
  assert.deepEqual(detail.skillMarkers, legacy.skillMarkers);
  assert.deepEqual(detail.agentMarkers, legacy.agentMarkers);
  assert.equal(detail.registration, null);
  assert.equal(detail.youtubeUrl, legacy.skillMarkers[0].youtubeUrl);
  const card = api.normalizeBackendCard(legacy);
  assert.equal(card.mapPreview, undefined);
  assert.deepEqual(getLineupRoute(card), []);
  assert.deepEqual(groupLineupDestinations([card]), []);
});

test('public and admin reads bypass cache and only admin reads carry the supplied token', async () => {
  const backend = response();
  let calls = mockFetch([backend]);
  const publicList = await api.fetchPublicLineups();
  assert.equal(publicList[0].registration.destination.id, backend.registration.destination.id);
  assert.equal(calls[0].url, 'http://lineup.test/api/lineups');
  assert.equal(calls[0].options.cache, 'no-store');
  assert.equal(calls[0].options.headers['X-Admin-Token'], undefined);
  calls = mockFetch(backend);
  await api.fetchLineup('guide / 1');
  assert.equal(calls[0].url, 'http://lineup.test/api/lineups/guide%20%2F%201');
  assert.equal(calls[0].options.cache, 'no-store');
  await api.fetchAdminLineup('guide / 1', 'test-token');
  assert.equal(calls[1].url, 'http://lineup.test/api/admin/lineups/guide%20%2F%201');
  assert.equal(calls[1].options.cache, 'no-store');
  assert.equal(calls[1].options.headers['X-Admin-Token'], 'test-token');
  calls = mockFetch([backend]);
  assert.equal((await api.fetchAdminLineups('test-token'))[0].id, backend.id);
  assert.equal(calls[0].options.headers['X-Admin-Token'], 'test-token');
});

test('create and PUT send BE-003 fields, full path and original marker identity while excluding discarded fields', async () => {
  const original = payload({ sovaSettings: { chargeLevel: 2, bounceCount: 1 } });
  original.registration.routePoints = [{ kind: 'BOUNCE', x: .2, y: .3 }];
  original.pathPoints[0].kind = 'BOUNCE';
  const before = JSON.stringify(original);
  const calls = mockFetch(response(), 201);
  const created = await api.createLineup(original, 'test-token');
  const updated = await api.updateLineup('guide / 1', original, 'test-token');
  for (const { options } of calls) {
    const sent = JSON.parse(options.body);
    assert.equal(options.headers['X-Admin-Token'], 'test-token');
    assert.equal(sent.side, 'ATTACK');
    assert.equal(sent.difficulty, 'MEDIUM');
    assert.equal(sent.status, 'PUBLISHED');
    assert.deepEqual(sent.skillMarkers, original.skillMarkers);
    assert.deepEqual(sent.agentMarkers, original.agentMarkers);
    assert.deepEqual(sent.pathPoints, response().pathPoints);
    assert.deepEqual(sent.registration, response().registration);
    assert.equal('sovaSettings' in sent, false);
  }
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[1].options.method, 'PUT');
  assert.equal(calls[1].url, 'http://lineup.test/api/admin/lineups/guide%20%2F%201');
  assert.deepEqual(created.registration, response().registration);
  assert.deepEqual(updated.registration, response().registration);
  assert.equal(JSON.stringify(original), before);
});

test('PUT keeps zero, one, multiple and repeated intermediate points and every legacy marker', async () => {
  const middle = { x: .4, y: .5 };
  const extraSkill = { abilityId: 'unknown-extra', position: { x: .3, y: .6 }, order: 10 };
  const calls = mockFetch(response());
  for (const pathPoints of [[], [middle], [middle, middle, { x: .6, y: .7 }]]) {
    const original = payload({ pathPoints, registration: undefined });
    original.skillMarkers.push(extraSkill);
    original.agentMarkers.push({ position: { x: .2, y: .1 }, label: 'extra' });
    await api.updateLineup('legacy', original, 'test-token');
    const body = JSON.parse(calls.at(-1).options.body);
    assert.deepEqual(body.pathPoints, pathPoints);
    assert.deepEqual(body.skillMarkers, original.skillMarkers);
    assert.deepEqual(body.agentMarkers, original.agentMarkers);
    assert.equal('registration' in body, false);
  }
});

test('missing PUT path is rejected before a request can erase stored intermediate points', async () => {
  const calls = mockFetch(response());
  await assert.rejects(api.updateLineup('guide-1', payload({ pathPoints: undefined }), 'test-token'), error => {
    assert.ok(error instanceof api.LineupApiError);
    assert.match(error.message, /중간 경로/);
    return true;
  });
  assert.equal(calls.length, 0);
});

test('status PATCH and DELETE use existing token endpoints and DELETE accepts an empty 204', async () => {
  let calls = mockFetch(response({ status: 'REVIEW' }));
  const updated = await api.updateLineupStatus('guide / 1', 'REVIEW', 'test-token');
  assert.equal(updated.status, 'REVIEW');
  assert.equal(calls[0].options.method, 'PATCH');
  assert.equal(calls[0].url, 'http://lineup.test/api/admin/lineups/guide%20%2F%201/status');
  assert.deepEqual(JSON.parse(calls[0].options.body), { status: 'REVIEW' });
  calls = mockFetch(null, 204);
  assert.equal(await api.deleteLineup('guide / 1', 'test-token'), undefined);
  assert.equal(calls[0].url, 'http://lineup.test/api/admin/lineups/guide%20%2F%201');
  assert.equal(calls[0].options.method, 'DELETE');
  assert.equal(calls[0].options.headers['X-Admin-Token'], 'test-token');
});

test('session validation uses existing POST contract and error statuses remain available to every screen', async () => {
  const calls = mockFetch({ role: 'ADMIN', adminId: 'admin-1' });
  assert.deepEqual(await api.validateAdminToken('test-token'), { role: 'ADMIN', adminId: 'admin-1' });
  assert.equal(calls[0].url, 'http://lineup.test/api/admin/session');
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), { token: 'test-token' });
  for (const status of [400, 401, 403, 404, 409, 503]) {
    mockFetch({ message: 'An arbitrary Spring response shape' }, status);
    await assert.rejects(api.fetchAdminLineups('test-token'), error => {
      assert.ok(error instanceof api.LineupApiError);
      assert.equal(error.status, status);
      assert.equal(api.getLineupApiErrorMessage(error), error.message);
      assert.doesNotMatch(error.message, /Spring/);
      return true;
    });
  }
});

test('network errors, malformed successful JSON, and missing public configuration receive safe actionable errors', async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = 'http://lineup.test';
  global.fetch = async () => { throw new Error('Internal URL or token detail must not be shown'); };
  await assert.rejects(api.fetchPublicLineups(), error => {
    assert.ok(error instanceof api.LineupApiError);
    assert.equal(error.status, null);
    assert.match(error.message, /연결/);
    assert.doesNotMatch(error.message, /token/);
    return true;
  });
  global.fetch = async () => new Response('not JSON');
  await assert.rejects(api.fetchPublicLineups(), error => {
    assert.ok(error instanceof api.LineupApiError);
    assert.equal(error.status, 200);
    assert.match(error.message, /응답/);
    return true;
  });
  const calls = mockFetch([]);
  delete process.env.NEXT_PUBLIC_BACKEND_URL;
  await assert.rejects(api.fetchPublicLineups(), /API 주소/);
  assert.equal(calls.length, 0);
});
