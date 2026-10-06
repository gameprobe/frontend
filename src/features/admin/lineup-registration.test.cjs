const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (![path.join(__dirname, 'lineup-registration.ts'), path.join(__dirname, 'preview/model.ts')].includes(filename)) throw new Error('Test loader scope exceeded');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
let model;
try { model = require('./lineup-registration.ts'); }
finally { if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts']; }
const { createRegistrationDraft, createAtRegisteredDestination, draftFromLineup, isIndividualLineup, registrationPayload, validateRegistrationDraft } = model;

function record(overrides = {}) {
  return { id: 'lineup-1', title: 'A 정찰', description: '상자 모서리에 서서 사용합니다.', mapId: 'ascent', mapName: 'Ascent', agentId: 'sova', agentName: 'Sova', side: 'attack', difficulty: 'hard', status: 'PUBLISHED',
    skillMarkers: [{ abilityId: 'existing-custom-recon', position: { x: .7, y: .3 }, order: 5 }], agentMarkers: [{ position: { x: .2, y: .8 }, label: '기존 출발 위치' }], pathPoints: [{ x: .4, y: .6 }, { x: .6, y: .4 }],
    registration: { destination: { id: 'shared-destination', name: 'A 기본 위치', point: { x: .7, y: .3 } }, media: { type: 'IMAGE', url: 'https://example.com/guide.png' }, site: 'MID', abilitySlot: 'E' }, ...overrides };
}

test('new registration requires description, destination, media and origin and uses an actual ability ID', () => {
  const draft = createRegistrationDraft('new-point');
  assert.equal(draft.abilityId, 'sova-recon-bolt');
  assert.equal(draft.abilitySlot, 'E');
  assert.deepEqual(Object.keys(validateRegistrationDraft(draft)).sort(), ['destination', 'mediaUrl', 'notes', 'start', 'title']);
  assert.throws(() => registrationPayload(draft));
});

test('round trip preserves all individual registration metadata, status and original ability ID without input mutation', () => {
  for (const status of ['DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED']) {
    const source = record({ status });
    const snapshot = structuredClone(source);
    const draft = draftFromLineup(source);
    assert.equal(draft.site, 'Mid');
    assert.equal(draft.abilityId, 'existing-custom-recon');
    const payload = registrationPayload(draft);
    assert.deepEqual(payload, { title: source.title, description: source.description, mapId: source.mapId, side: source.side, agentId: source.agentId, difficulty: source.difficulty, status: status.toLowerCase(), skillMarkers: source.skillMarkers, agentMarkers: source.agentMarkers, pathPoints: source.pathPoints, registration: source.registration });
    draft.path[0].x = 0; draft.start.y = 0; draft.destination.point.x = 0;
    assert.deepEqual(source, snapshot);
  }
});

test('zero, one and many intermediate points never include endpoints or discarded route metadata', () => {
  for (const pathPoints of [[], [{ x: .4, y: .6 }], [{ x: .4, y: .6 }, { x: .6, y: .4 }]]) {
    const draft = draftFromLineup(record({ pathPoints }));
    draft.path = draft.path.map(point => ({ ...point, kind: 'bounce' }));
    const payload = registrationPayload(draft);
    assert.deepEqual(payload.pathPoints, pathPoints);
    assert.ok(!Object.hasOwn(payload, 'sovaSettings'));
    assert.ok(!Object.hasOwn(payload.registration, 'routePoints'));
    assert.deepEqual(payload.skillMarkers[0].position, payload.registration.destination.point);
    assert.notStrictEqual(payload.skillMarkers[0].position, payload.registration.destination.point);
  }
});

test('legacy data is never converted by taking only the first marker', () => {
  const legacy = record({ registration: null, agentMarkers: [{ position: { x: 0, y: 1 } }, { position: { x: 1, y: 0 } }] });
  const multipleSkill = record({ skillMarkers: [...record().skillMarkers, { abilityId: 'other', position: { x: .9, y: .8 } }] });
  const missingStatus = record({ status: undefined });
  const before = structuredClone(legacy);
  for (const entry of [legacy, multipleSkill, missingStatus, record({ registration: undefined })]) {
    assert.equal(isIndividualLineup(entry), false);
    assert.equal(draftFromLineup(entry), null);
  }
  assert.deepEqual(legacy, before);
});

test('new guide at shared destination copies ID/name/coordinates and requires a separate start, path and media', () => {
  const source = draftFromLineup(record());
  const fresh = createAtRegisteredDestination(source);
  assert.deepEqual(fresh.destination, source.destination);
  assert.notStrictEqual(fresh.destination.point, source.destination.point);
  assert.equal(fresh.id, ''); assert.equal(fresh.status, 'draft'); assert.equal(fresh.mediaUrl, '');
  assert.equal(fresh.title, ''); assert.equal(fresh.notes, ''); assert.equal(fresh.start, null);
  assert.deepEqual(fresh.path, []);
  assert.equal(fresh.abilityId, source.abilityId); assert.equal(fresh.site, source.site);
});

test('image/video and site/slot edits serialize explicitly and never treat a slot as an ability ID', () => {
  const draft = draftFromLineup(record());
  draft.mediaType = 'video'; draft.mediaUrl = 'https://example.com/how-to.mp4'; draft.site = 'B'; draft.abilitySlot = 'Q';
  const payload = registrationPayload(draft);
  assert.deepEqual(payload.registration.media, { type: 'VIDEO', url: draft.mediaUrl });
  assert.equal(payload.registration.site, 'B'); assert.equal(payload.registration.abilitySlot, 'Q');
  assert.equal(payload.skillMarkers[0].abilityId, 'existing-custom-recon');
  for (const value of ['', ' ']) assert.ok(validateRegistrationDraft({ ...draft, abilityId: value }).abilityId);
});

test('registration validation rejects out-of-bounds points, oversized URL/route/title and empty descriptions', () => {
  const draft = draftFromLineup(record());
  assert.deepEqual(validateRegistrationDraft(draft), {});
  assert.deepEqual(validateRegistrationDraft({ ...draft, title: '가'.repeat(160) }), {});
  for (const next of [
    { notes: ' ' }, { title: '가'.repeat(161) }, { destination: { ...draft.destination, name: '가'.repeat(121) } },
    { start: { x: NaN, y: .2 } }, { path: Array.from({ length: 31 }, () => ({ x: .4, y: .5 })) },
    { path: [{ x: 1.01, y: .5 }] }, { mediaUrl: 'javascript:alert(1)' },
    { mediaUrl: `https://example.com/${'a'.repeat(2048)}` }, { mediaUrl: 'https://user:pass@example.com/x' },
  ]) assert.ok(Object.keys(validateRegistrationDraft({ ...draft, ...next })).length);
});

test('existing legacy video marker follows its registration video and is omitted only when explicitly changing to image', () => {
  const source = record();
  source.registration.media = { type: 'VIDEO', url: 'https://example.com/original.mp4' };
  source.skillMarkers[0].youtubeUrl = source.registration.media.url;
  const draft = draftFromLineup(source);
  assert.equal(registrationPayload(draft).skillMarkers[0].youtubeUrl, source.skillMarkers[0].youtubeUrl);
  draft.mediaUrl = 'https://example.com/updated.mp4';
  assert.equal(registrationPayload(draft).skillMarkers[0].youtubeUrl, draft.mediaUrl);
  draft.mediaType = 'image'; draft.mediaUrl = 'https://example.com/guide.png';
  assert.equal(registrationPayload(draft).skillMarkers[0].youtubeUrl, undefined);
});


test('existing backend-accepted short ability IDs survive title-only edits without inferred replacement', () => {
  for (const abilityId of ['C', 'Q', 'E', 'X']) {
    const source = record();
    source.skillMarkers[0].abilityId = abilityId;
    const draft = draftFromLineup(source);
    draft.title = 'Updated title';
    assert.equal(registrationPayload(draft).skillMarkers[0].abilityId, abilityId);
  }
});

test('Abyss Brimstone one-bend guide preserves an uncatalogued ability ID, Q slot and intermediate-only path on edit round trip', () => {
  const start = { x: .125, y: .75 };
  const intermediate = { x: .375, y: .625 };
  const destination = { x: .75, y: .25 };
  const source = record({
    id: 'abyss-brimstone-one-bend', title: '합성 예시 · 어비스 브림스톤',
    mapId: 'abyss', mapName: 'Abyss', agentId: 'brimstone', agentName: 'Brimstone',
    skillMarkers: [{ abilityId: 'brimstone-incendiary', position: destination, order: 3 }],
    agentMarkers: [{ position: start, label: '합성 출발점' }],
    pathPoints: [intermediate],
    registration: {
      destination: { id: 'abyss-a-synthetic', name: '합성 A 도착점', point: destination },
      media: { type: 'IMAGE', url: 'https://example.com/abyss-example.png' },
      site: 'A', abilitySlot: 'Q',
    },
  });
  const before = structuredClone(source);
  assert.equal(model.ABILITY_OPTIONS.brimstone, undefined);
  const draft = draftFromLineup(source);
  assert.deepEqual(validateRegistrationDraft(draft), {});
  draft.title = '합성 예시 · 어비스 브림스톤 수정';
  const payload = registrationPayload(draft);
  assert.equal(payload.mapId, 'abyss');
  assert.equal(payload.agentId, 'brimstone');
  assert.equal(payload.skillMarkers[0].abilityId, 'brimstone-incendiary');
  assert.equal(payload.registration.abilitySlot, 'Q');
  assert.equal(payload.status, 'published');
  assert.deepEqual(payload.agentMarkers, source.agentMarkers);
  assert.deepEqual(payload.skillMarkers, source.skillMarkers);
  assert.deepEqual(payload.pathPoints, [intermediate]);
  assert.deepEqual(payload.registration, source.registration);
  const reloaded = { ...source, ...payload, status: payload.status.toUpperCase() };
  assert.deepEqual(registrationPayload(draftFromLineup(reloaded)), payload);
  assert.deepEqual(source, before);
});
