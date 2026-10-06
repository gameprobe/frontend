const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// 기존 TypeScript 도구만 사용한다. API 함수 모듈을 읽되 네트워크 함수는 호출하지 않는다.
const allowed = new Set([
  path.join(__dirname, 'model.ts'),
  path.join(__dirname, 'preview-data.ts'),
  path.resolve(__dirname, '../../lib/lineup-api.ts'),
]);
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (!allowed.has(filename)) throw new Error('Test loader scope exceeded');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename);
};
let groupLineupDestinations, getLineupRoute, buildLineupRoute, isValidPoint, orientLineupPoint, previewLineups;
let normalizeMockLineup, normalizeBackendLineup, normalizeBackendCard;
try {
  ({ groupLineupDestinations, getLineupRoute, buildLineupRoute, isValidPoint, orientLineupPoint } = require('./model.ts'));
  ({ previewLineups } = require('./preview-data.ts'));
  ({ normalizeMockLineup, normalizeBackendLineup, normalizeBackendCard } = require('../../lib/lineup-api.ts'));
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
const originalFixtures = require('../../data/mock-lineups.json');
const copy = value => JSON.parse(JSON.stringify(value));
const make = overrides => ({ ...copy(previewLineups[0]), ...overrides });
function frozen(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(frozen);
    Object.freeze(value);
  }
  return value;
}

test('map coordinates accept normalized finite points including boundaries only', () => {
  for (const point of [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: .4, y: .6 }]) assert.equal(isValidPoint(point), true);
  for (const point of [null, undefined, {}, '0,1', { x: '0', y: 1 }, { x: .5 }, { x: NaN, y: .5 },
    { x: .5, y: Infinity }, { x: -0.01, y: .5 }, { x: .5, y: 1.01 }]) assert.equal(isValidPoint(point), false);
});

test('explicit destination groups collect three origins while another destination of the same ability stays separate', () => {
  const entries = previewLineups.filter(entry => entry.mapId === 'ascent' && entry.ability.abilityId === 'sova-recon-bolt');
  const groups = groupLineupDestinations(entries);
  assert.deepEqual(groups.map(group => group.entries.length), [3, 1]);
  assert.equal(groups[0].name, '예시 A 도착점');
  assert.equal(new Set(groups[0].entries.map(entry => JSON.stringify(entry.mapPreview.agentPosition))).size, 3);
  assert.equal(new Set(groups[0].entries.map(entry => JSON.stringify(getLineupRoute(entry)))).size, 3);
  assert.notEqual(groups[0].key, groups[1].key);
});

test('a destination ID is scoped by map, side, agent and ability, not coordinates', () => {
  const first = make();
  const entries = [first,
    make({ id: 'other-map', mapId: 'haven' }),
    make({ id: 'other-side', side: 'defense' }),
    make({ id: 'other-agent', agentId: 'omen' }),
    make({ id: 'other-ability', ability: { ...first.ability, abilityId: 'sova-shock-bolt' } }),
  ];
  const groups = groupLineupDestinations(entries);
  assert.equal(groups.length, 5);
  assert.equal(new Set(groups.map(group => group.key)).size, 5);
  assert.ok(groups.every(group => group.entries.length === 1));
});

test('legacy guides with equal coordinates and ability never merge without an explicit destination ID', () => {
  const entries = ['legacy-1', 'legacy-2', 'legacy-3'].map((id, index) => {
    const entry = make({ id });
    entry.mapPreview.destinationId = index === 2 ? '  ' : undefined;
    entry.mapPreview.destinationName = undefined;
    return entry;
  });
  const groups = groupLineupDestinations(entries);
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.map(group => group.name), entries.map(entry => entry.title));
  assert.equal(new Set(groups.map(group => group.key)).size, 3);
});

test('missing and invalid destinations have no map group while an originless guide can retain its valid destination', () => {
  const noPreview = make({ id: 'none', mapPreview: undefined });
  const noTarget = make({ id: 'no-target', mapPreview: { agentPosition: { x: .2, y: .3 } } });
  const invalid = make({ id: 'invalid', mapPreview: { skillPosition: { x: 3, y: .3 } } });
  const noOrigin = make({ id: 'no-origin', mapPreview: { skillPosition: { x: .2, y: .3 } } });
  const groups = groupLineupDestinations([noPreview, noTarget, invalid, noOrigin]);
  assert.deepEqual(groups.map(group => group.entries[0].id), ['no-origin']);
  assert.deepEqual(getLineupRoute(noOrigin), []);
});

test('group construction does not mutate source entries or expose its representative coordinate object', () => {
  const entries = frozen([make(), make({ id: 'second-origin' })]);
  const before = JSON.stringify(entries);
  const group = groupLineupDestinations(entries)[0];
  group.point.x = 0;
  group.entries.pop();
  assert.equal(JSON.stringify(entries), before);
  assert.equal(entries.length, 2);
  assert.notEqual(entries[0].mapPreview.skillPosition.x, 0);
});

test('all routes connect anchors around ordered intermediates and preserve repeated coordinates', () => {
  const start = { x: .1, y: .8 }, mid = { x: .4, y: .5 }, target = { x: .8, y: .2 };
  for (const isExample of [undefined, false, true]) {
    const entry = frozen(make({ isExample, mapPreview: { agentPosition: start, skillPosition: target, pathPoints: [mid, mid] } }));
    const route = getLineupRoute(entry);
    assert.deepEqual(route, [start, mid, mid, target]);
    route[1].x = .9;
    assert.equal(mid.x, .4);
    assert.deepEqual(buildLineupRoute(start, target, [mid]), [start, mid, target]);
  }
});

test('API, legacy and example guides connect zero or one intermediate point with the same rules', () => {
  const start = { x: .1, y: .8 }, target = { x: .8, y: .2 }, middle = { x: .4, y: .5 };
  for (const isExample of [undefined, false, true]) {
    for (const pathPoints of [undefined, [], [middle]]) {
      const entry = make({ isExample, mapPreview: {
        agentPosition: start, skillPosition: target, pathPoints,
      } });
      assert.deepEqual(getLineupRoute(entry), [start, ...(pathPoints || []), target]);
    }
  }
});

test('complete API routes preserve intermediate order without mutating source coordinates', () => {
  const recorded = frozen([{ x: .3, y: .7 }, { x: .5, y: .4 }, { x: .5, y: .4 }, { x: .7, y: .3 }]);
  const start = { x: .1, y: .8 }, target = { x: .8, y: .2 };
  const entry = frozen(make({ isExample: undefined, mapPreview: {
    agentPosition: start, skillPosition: target, pathPoints: recorded,
  } }));
  const route = getLineupRoute(entry);
  assert.deepEqual(route, [start, ...recorded, target]);
  assert.notEqual(route[1], recorded[0]);
  route[1].x = .9;
  assert.equal(recorded[0].x, .3);
  for (const markers of [{}, { agentPosition: { x: NaN, y: .2 }, skillPosition: { x: .1, y: 2 } }]) {
    assert.deepEqual(getLineupRoute(make({ mapPreview: { ...markers, pathPoints: recorded } })), []);
  }
});

test('API paths containing an invalid point are omitted instead of repairing a missing segment', () => {
  for (const invalid of [{ x: NaN, y: .2 }, { x: .4, y: Infinity }, { x: -.1, y: .3 }]) {
    const entry = make({ isExample: false, mapPreview: {
      agentPosition: { x: .1, y: .8 }, skillPosition: { x: .8, y: .2 },
      pathPoints: [{ x: .1, y: .8 }, invalid, { x: .8, y: .2 }],
    } });
    assert.deepEqual(getLineupRoute(entry), []);
    const detail = normalizeMockLineup(entry);
    assert.deepEqual(detail.pathPoints, entry.mapPreview.pathPoints);
    assert.deepEqual(buildLineupRoute(detail.agentMarkers[0].position, detail.skillMarkers[0].position, detail.pathPoints), []);
  }
});

test('invalid or missing route coordinates never become an invented direct path', () => {
  for (const mapPreview of [undefined,
    { skillPosition: { x: .8, y: .2 } },
    { agentPosition: { x: .1, y: .8 } },
    { agentPosition: { x: -1, y: .8 }, skillPosition: { x: .8, y: .2 } },
    { agentPosition: { x: .1, y: .8 }, skillPosition: { x: .8, y: Infinity } },
    { agentPosition: { x: .1, y: .8 }, skillPosition: { x: .8, y: .2 }, pathPoints: [{ x: NaN, y: .4 }] },
  ]) assert.deepEqual(getLineupRoute(make({ mapPreview })), []);
});

test('orientation preserves the existing attack/defense quarter-turn and input points', () => {
  const point = frozen({ x: .25, y: .75 });
  assert.deepEqual(orientLineupPoint(point, 'attack'), { x: .25, y: .25 });
  assert.deepEqual(orientLineupPoint(point, 'defense'), { x: .75, y: .75 });
  assert.deepEqual(point, { x: .25, y: .75 });
});

test('shared preview source preserves all ten existing guide identities and marks all thirteen positions synthetic', () => {
  assert.equal(previewLineups.length, 13);
  assert.equal(new Set(previewLineups.map(entry => entry.id)).size, 13);
  for (const original of originalFixtures) {
    const entry = previewLineups.find(candidate => candidate.id === original.id);
    assert.ok(entry);
    assert.equal(entry.title, original.title);
    assert.deepEqual(entry.ability, original.ability);
    assert.equal(entry.description, original.description);
    assert.deepEqual(entry.steps, original.steps);
    assert.match(original.media.youtubeUrl, /v=demo-/);
    assert.equal(original.mapPreview, undefined);
  }
  for (const entry of previewLineups) {
    assert.equal(entry.isExample, true);
    assert.equal(entry.media.youtubeUrl, undefined);
    assert.ok(entry.mapPreview.destinationId);
    assert.ok(isValidPoint(entry.mapPreview.agentPosition));
    assert.ok(isValidPoint(entry.mapPreview.skillPosition));
    assert.ok(getLineupRoute(entry).length >= 2);
  }
});

test('each chosen preview guide opens detail with its own same source origin, destination and route', () => {
  for (const entry of previewLineups) {
    const detail = normalizeMockLineup(entry);
    assert.equal(detail.id, entry.id);
    assert.equal(detail.isExample, true);
    assert.deepEqual(detail.agentMarkers[0].position, entry.mapPreview.agentPosition);
    assert.deepEqual(detail.skillMarkers[0].position, entry.mapPreview.skillPosition);
    assert.deepEqual(detail.pathPoints, entry.mapPreview.pathPoints);
    assert.deepEqual(buildLineupRoute(detail.agentMarkers[0].position, detail.skillMarkers[0].position, detail.pathPoints), getLineupRoute(entry));
    assert.equal(detail.youtubeUrl, undefined);
    assert.equal(detail.skillMarkers[0].youtubeUrl, undefined);
    assert.notEqual(detail.agentMarkers[0].position, entry.mapPreview.agentPosition);
    assert.notEqual(detail.skillMarkers[0].position, entry.mapPreview.skillPosition);
  }
});

test('mock detail never generates absent positions and suppresses the original fake demo video URLs', () => {
  const detail = normalizeMockLineup(originalFixtures[0]);
  assert.deepEqual(detail.skillMarkers, []);
  assert.deepEqual(detail.agentMarkers, []);
  assert.deepEqual(detail.pathPoints, []);
  assert.equal(detail.youtubeUrl, undefined);
  const partial = normalizeMockLineup(make({ mapPreview: { skillPosition: { x: .3, y: .4 } } }));
  assert.equal(partial.skillMarkers.length, 1);
  assert.deepEqual(partial.agentMarkers, []);
  assert.deepEqual(partial.pathPoints, []);
});

test('non-demo mock media remains associated with the selected guide rather than another origin', () => {
  const youtubeUrl = 'https://www.youtube.com/watch?v=abc12345';
  const detail = normalizeMockLineup(make({ media: { youtubeUrl } }));
  assert.equal(detail.youtubeUrl, youtubeUrl);
  assert.equal(detail.skillMarkers[0].youtubeUrl, youtubeUrl);
});

test('existing backend detail normalization keeps its API marker arrays, media and metadata semantics', () => {
  const response = frozen({
    id: 'api-guide', title: 'API title', description: 'API description', mapId: 'ascent', side: 'ATTACK',
    agentId: 'sova', difficulty: 'EASY',
    skillMarkers: [{ abilityId: 'sova-recon-bolt', position: { x: .2, y: .3 }, youtubeUrl: 'https://www.youtube.com/watch?v=real123', order: 2 }],
    agentMarkers: [{ position: { x: .6, y: .7 }, label: 'API start' }],
    pathPoints: [{ x: .6, y: .7 }, { x: .2, y: .3 }],
    sovaSettings: { chargeLevel: 2, bounceCount: 1 }, status: 'PUBLISHED', authorId: 'author-1',
  });
  const detail = normalizeBackendLineup(response);
  assert.equal(detail.id, response.id);
  assert.equal(detail.side, 'attack');
  assert.equal(detail.difficulty, 'easy');
  assert.deepEqual(detail.skillMarkers, response.skillMarkers);
  assert.deepEqual(detail.agentMarkers, response.agentMarkers);
  assert.deepEqual(detail.pathPoints, response.pathPoints);
  assert.equal('sovaSettings' in detail, false);
  assert.equal(detail.youtubeUrl, response.skillMarkers[0].youtubeUrl);
  assert.equal(detail.isExample, undefined);
});

test('published Abyss Brimstone Q guide renders start, one intermediate and destination in both list orientations', () => {
  const start = { x: .125, y: .75 };
  const intermediate = { x: .375, y: .625 };
  const destination = { x: .75, y: .25 };
  const response = frozen({
    id: 'abyss-brimstone-one-bend', title: '합성 예시 · 어비스 브림스톤', description: '실제 공략이 아닌 경로 표시 검증 예시입니다.',
    mapId: 'abyss', side: 'ATTACK', agentId: 'brimstone', difficulty: 'MEDIUM',
    skillMarkers: [{ abilityId: 'brimstone-incendiary', position: destination, order: 0 }],
    agentMarkers: [{ position: start }], pathPoints: [intermediate], status: 'PUBLISHED', authorId: 'test-author',
    registration: {
      destination: { id: 'abyss-a-synthetic', name: '합성 A 도착점', point: destination },
      media: { type: 'IMAGE', url: 'https://example.com/abyss-example.png' }, site: 'A', abilitySlot: 'Q',
    },
  });
  const expected = {
    attack: [{ x: .25, y: .125 }, { x: .375, y: .375 }, { x: .75, y: .75 }],
    defense: [{ x: .75, y: .875 }, { x: .625, y: .625 }, { x: .25, y: .25 }],
  };
  for (const side of ['ATTACK', 'DEFENSE']) {
    const card = normalizeBackendCard({ ...response, side });
    const detail = normalizeBackendLineup({ ...response, side });
    assert.equal(card.ability.abilityId, 'brimstone-incendiary');
    assert.equal(card.ability.slot, 'Q');
    assert.equal(card.mapPreview.destinationId, 'abyss-a-synthetic');
    assert.deepEqual(detail.pathPoints, [intermediate]);
    assert.deepEqual(getLineupRoute(card), [start, intermediate, destination]);
    assert.deepEqual(buildLineupRoute(detail.agentMarkers[0].position, detail.skillMarkers[0].position, detail.pathPoints), getLineupRoute(card));
    assert.deepEqual(getLineupRoute(card).map(point => orientLineupPoint(point, card.side)), expected[card.side]);
    assert.deepEqual(groupLineupDestinations([card])[0].point, destination);
  }
  assert.deepEqual(response.pathPoints, [intermediate]);
});
