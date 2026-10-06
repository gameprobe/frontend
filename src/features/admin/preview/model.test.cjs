const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// 기존 TypeScript 의존성만 사용해 관리자 예시의 순수 입력 모델을 검증한다.
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (filename !== path.join(__dirname, 'model.ts')) throw new Error('Test loader scope exceeded');
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename);
};
let createEmpty, createExamples, validateDraft, changeMap, placePoint, isSafeMediaUrl, getRoutePoints;
let createAtDestination, detachDestination, resetPositions, groupDestinations, movePoint, savePreviewEntry;
try {
  ({ createEmpty, createExamples, validateDraft, changeMap, placePoint, isSafeMediaUrl, getRoutePoints,
    createAtDestination, detachDestination, resetPositions, groupDestinations, movePoint, savePreviewEntry } = require('./model.ts'));
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}

function valid(overrides = {}) {
  return { ...createExamples()[0], ...overrides };
}

function at(point) {
  return valid({ destination: { ...valid().destination, point } });
}

test('empty guides need title, media, destination and origin; new destinations have independent ids', () => {
  for (const kind of ['lineup', 'smoke']) {
    const draft = createEmpty(kind);
    assert.deepEqual(Object.keys(validateDraft(draft)).sort(), ['destination', 'mediaUrl', 'start', 'title']);
    assert.equal(draft.id, '');
    assert.equal(draft.kind, kind);
    assert.notEqual(draft.destination.id, createEmpty(kind).destination.id);
    assert.deepEqual(draft.path, []);
    assert.equal(draft.start, null);
    assert.equal(draft.destination.point, null);
  }
  assert.equal(createEmpty('lineup', 'chosen-id').destination.id, 'chosen-id');
});

test('five synthetic guides are valid; three lineup guides share a destination but not route or media objects', () => {
  const entries = createExamples();
  assert.equal(entries.length, 5);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, 5);
  for (const entry of entries) assert.deepEqual(validateDraft(entry), {});
  const lineups = entries.filter((entry) => entry.kind === 'lineup');
  assert.equal(lineups.length, 3);
  assert.equal(new Set(lineups.map((entry) => entry.destination.id)).size, 1);
  assert.equal(new Set(lineups.map((entry) => JSON.stringify(entry.start))).size, 3);
  assert.equal(new Set(lineups.map((entry) => entry.mediaUrl)).size, 3);
  lineups[0].destination.point.x = 0;
  lineups[0].path.length = 0;
  assert.notEqual(lineups[1].destination.point.x, 0);
  assert.notEqual(createExamples()[0].path.length, 0);
  assert.notEqual(createExamples()[0].destination.point.x, 0);
});

test('media validation permits only explicit http(s) links without credentials or malformed input', () => {
  for (const url of [
    '', ' ', 'example.com/video', '/video', '//example.com/video', 'https:example.com',
    'javascript:alert(1)', 'data:image/png;base64,anything', 'ftp://example.com/file',
    'https://user@example.com/video', 'https://user:password@example.com/video', 'https://@example.com/video',
    'https://', 'https:///example.com', 'https:////example.com', 'https://[bad', 'https://example.com:99999',
    'https://example.com/a b', 'https://exam\nple.com', 'https://example.com\\@other.test',
  ]) {
    assert.equal(isSafeMediaUrl(url), false, url);
    assert.ok(validateDraft(valid({ mediaUrl: url })).mediaUrl, url);
  }
  for (const url of ['https://example.com/video?v=1#time', 'http://example.com/image.png', ' HTTPS://example.com/%EA%B0%80 ']) {
    assert.equal(isSafeMediaUrl(url), true, url);
    assert.deepEqual(validateDraft(valid({ mediaUrl: url })), {});
  }
});

test('title validation rejects blank and overlong input while accepting the boundary', () => {
  assert.ok(validateDraft(valid({ title: '  ' })).title);
  assert.ok(validateDraft(valid({ title: '가'.repeat(121) })).title);
  assert.deepEqual(validateDraft(valid({ title: '가'.repeat(120) })), {});
});

test('destination requires an id, name and selected point', () => {
  const draft = valid();
  for (const override of [{ id: '' }, { id: ' ' }, { name: '' }, { name: '  ' }, { point: null }]) {
    assert.ok(validateDraft({ ...draft, destination: { ...draft.destination, ...override } }).destination);
  }
  assert.deepEqual(validateDraft(draft), {});
});

test('all supplied positions must be finite and normalized, including optional wall endpoints and path points', () => {
  for (const point of [{ x: -0.01, y: 0 }, { x: 1.01, y: 0 }, { x: 0, y: NaN }, { x: Infinity, y: 0 }, { x: 0, y: -Infinity }]) {
    assert.ok(validateDraft(valid({ start: point })).start);
    assert.ok(validateDraft(valid({ wallEnd: point })).wallEnd);
    assert.ok(validateDraft(at(point)).destination);
    assert.ok(validateDraft(valid({ path: [{ ...point, kind: 'waypoint' }] })).path);
  }
  assert.deepEqual(validateDraft({ ...at({ x: 1, y: 0 }), start: { x: 0, y: 1 } }), {});
  assert.ok(validateDraft(valid({ path: Array.from({ length: 31 }, () => ({ x: 0.5, y: 0.5, kind: 'bounce' })) })).path);
});

test('wall endpoint is required only for smoke walls', () => {
  assert.ok(validateDraft(valid({ kind: 'smoke', shape: 'wall', wallEnd: null })).wallEnd);
  assert.deepEqual(validateDraft(valid({ kind: 'smoke', shape: 'circle', wallEnd: null })), {});
  assert.deepEqual(validateDraft(valid({ kind: 'lineup', shape: 'wall', wallEnd: null })), {});
  assert.deepEqual(validateDraft(valid({ kind: 'smoke', shape: 'wall', wallEnd: { x: 0.6, y: 0.4 } })), {});
});

test('map change resets destination identity and all positions but preserves guide metadata; same map is a no-op', () => {
  const original = Object.freeze(valid({ wallEnd: { x: 0.3, y: 0.5 } }));
  assert.strictEqual(changeMap(original, original.mapId), original);
  const changed = changeMap(original, 'bind');
  assert.equal(changed.mapId, 'bind');
  assert.equal(changed.title, original.title);
  assert.equal(changed.mediaUrl, original.mediaUrl);
  assert.equal(changed.start, null);
  assert.notEqual(changed.destination.id, original.destination.id);
  assert.equal(changed.destination.name, '');
  assert.equal(changed.destination.point, null);
  assert.equal(changed.wallEnd, null);
  assert.deepEqual(changed.path, []);
  assert.ok(original.path.length);
  assert.notEqual(original.destination.point, null);
});

test('placing a point clamps edges without mutation and ignores nonfinite input', () => {
  const original = Object.freeze(valid());
  Object.freeze(original.destination);
  const changed = placePoint(original, 'target', { x: -0.2, y: 1.2 });
  assert.deepEqual(changed.destination.point, { x: 0, y: 1 });
  assert.equal(changed.destination.id, original.destination.id);
  assert.notDeepEqual(original.destination.point, changed.destination.point);
  for (const point of [{ x: NaN, y: 0.1 }, { x: 0.1, y: Infinity }]) {
    for (const mode of ['start', 'target', 'wallEnd', 'path', 'bounce']) assert.strictEqual(placePoint(original, mode, point), original);
  }
});

test('smoke waypoints and bounces share the 30 point limit and allow undo and re-addition', () => {
  const original = valid({ kind: 'smoke', path: Array.from({ length: 29 }, (_, index) => ({ x: 0.1, y: 0.2, kind: index % 2 ? 'waypoint' : 'bounce' })) });
  Object.freeze(original.path);
  const last = placePoint(original, 'path', { x: 1.1, y: -0.1 });
  assert.equal(last.path.length, 30);
  assert.deepEqual(last.path[29], { x: 1, y: 0, kind: 'waypoint' });
  assert.equal(original.path.length, 29);
  assert.strictEqual(placePoint(last, 'path', { x: 0.5, y: 0.5 }), last);
  assert.strictEqual(placePoint(last, 'bounce', { x: 0.5, y: 0.5 }), last);
  assert.deepEqual(validateDraft(last), {});
  const undone = { ...last, path: last.path.slice(0, -1) };
  const rebound = placePoint(undone, 'bounce', { x: 0.5, y: 0.5 });
  assert.equal(rebound.path.length, 30);
  assert.deepEqual(rebound.path[29], { x: 0.5, y: 0.5, kind: 'bounce' });
  assert.deepEqual(rebound.path.slice(0, 29), original.path);
  assert.deepEqual(validateDraft(rebound), {});
});

test('route connects origin through ordered waypoints and bounces to destination without mutating input', () => {
  const start = Object.freeze({ x: 0.1, y: 0.8 });
  const first = Object.freeze({ x: 0.6, y: 0.8, kind: 'waypoint' });
  const second = Object.freeze({ x: 0.3, y: 0.4, kind: 'bounce' });
  const target = Object.freeze({ x: 0.9, y: 0.2 });
  const draft = Object.freeze({ ...at(target), start, path: Object.freeze([first, second]), wallEnd: { x: 1, y: 1 } });
  const points = getRoutePoints(draft);
  const expected = [start, { x: first.x, y: first.y }, { x: second.x, y: second.y }, target];
  assert.deepEqual(points, expected);
  points[1].x = 0;
  points.pop();
  assert.deepEqual(draft.path, [first, second]);
  assert.deepEqual(getRoutePoints(draft), expected);
  assert.deepEqual(validateDraft(draft), {});
});

test('unfinished routes keep only supplied positions without placeholder coordinates', () => {
  const empty = createEmpty('lineup');
  const start = { x: 0.1, y: 0.8 };
  const target = { x: 0.9, y: 0.2 };
  const path = [{ x: 0.6, y: 0.8, kind: 'bounce' }, { x: 0.3, y: 0.4, kind: 'waypoint' }];
  const destination = { ...empty.destination, point: target };
  const coordinates = path.map(({ x, y }) => ({ x, y }));
  assert.deepEqual(getRoutePoints(empty), []);
  assert.deepEqual(getRoutePoints({ ...empty, start }), [start]);
  assert.deepEqual(getRoutePoints({ ...empty, destination }), [target]);
  assert.deepEqual(getRoutePoints({ ...empty, path }), coordinates);
  assert.deepEqual(getRoutePoints({ ...empty, start, path }), [start, ...coordinates]);
  assert.deepEqual(getRoutePoints({ ...empty, destination, path }), [...coordinates, target]);
  assert.deepEqual(getRoutePoints({ ...empty, start, destination }), [start, target]);
});

test('lineup input modes store coordinates only, while smoke retains its optional kind', () => {
  const first = placePoint(valid({ path: [] }), 'path', { x: 0.2, y: 0.7 });
  const second = placePoint(first, 'bounce', { x: 0.4, y: 0.3 });
  assert.deepEqual(second.path, [{ x: 0.2, y: 0.7 }, { x: 0.4, y: 0.3 }]);
  assert.deepEqual(validateDraft(second), {});
  assert.ok(createExamples().filter(entry => entry.kind === 'lineup').every(entry => entry.path.every(point => !Object.hasOwn(point, 'kind'))));
  const smoke = placePoint(valid({ kind: 'smoke', path: [] }), 'bounce', { x: 0.4, y: 0.3 });
  assert.deepEqual(smoke.path, [{ x: 0.4, y: 0.3, kind: 'bounce' }]);
  for (const kind of [null, '', 'path', 'wallEnd']) assert.ok(validateDraft(valid({ kind: 'smoke', path: [{ x: 0.5, y: 0.5, kind }] })).path);
  assert.deepEqual(validateDraft(valid({ path: [{ x: 0.5, y: 0.5 }] })), {});
});

test('adding a guide at an existing destination inherits context but requires a fresh origin, path and media', () => {
  const source = valid({ status: 'review', notes: 'existing notes', mediaType: 'image', agentId: 'harbor', side: 'defense', site: 'B', abilitySlot: 'Q', shape: 'wall', wallEnd: { x: 0.8, y: 0.2 } });
  const fresh = createAtDestination(source);
  for (const field of ['kind', 'mapId', 'agentId', 'abilitySlot', 'side', 'site', 'shape']) assert.equal(fresh[field], source[field]);
  assert.equal(fresh.id, '');
  assert.equal(fresh.title, '');
  assert.equal(fresh.status, 'draft');
  assert.equal(fresh.mediaUrl, '');
  assert.equal(fresh.notes, '');
  assert.equal(fresh.start, null);
  assert.equal(fresh.wallEnd, null);
  assert.deepEqual(fresh.path, []);
  assert.deepEqual(fresh.destination, source.destination);
  assert.notStrictEqual(fresh.destination, source.destination);
  assert.notStrictEqual(fresh.destination.point, source.destination.point);
  fresh.destination.name = 'changed';
  fresh.destination.point.x = 0;
  assert.notEqual(source.destination.name, fresh.destination.name);
  assert.notEqual(source.destination.point.x, 0);
});

test('editing a guide leaves the other guides at the same destination untouched', () => {
  const [first, second] = createExamples();
  const secondBefore = structuredClone(second);
  let changed = placePoint(first, 'start', { x: 0.2, y: 0.4 });
  changed = placePoint(changed, 'wallEnd', { x: 0.8, y: 0.4 });
  changed = placePoint(changed, 'bounce', { x: 0.5, y: 0.6 });
  assert.deepEqual(second, secondBefore);
  assert.notDeepEqual(first.start, changed.start);
  assert.equal(first.path.length + 1, changed.path.length);
  assert.strictEqual(changed.destination, first.destination);
});

test('detaching makes a new destination without altering other guides and keeps this guide origin and media', () => {
  const original = Object.freeze(valid({ wallEnd: { x: 0.3, y: 0.5 } }));
  const detached = detachDestination(original);
  assert.notEqual(detached.destination.id, original.destination.id);
  assert.equal(detached.destination.name, '');
  assert.equal(detached.destination.point, null);
  assert.strictEqual(detached.start, original.start);
  assert.equal(detached.mediaUrl, original.mediaUrl);
  assert.equal(detached.title, original.title);
  assert.deepEqual(detached.path, []);
  assert.equal(detached.wallEnd, null);
  assert.ok(original.path.length);
  assert.notEqual(original.destination.point, null);
  assert.notEqual(detachDestination(original).destination.id, detached.destination.id);
});

test('reset positions creates a new destination and clears origin/path/wall but preserves nonposition metadata', () => {
  const original = valid({ wallEnd: { x: 0.3, y: 0.5 } });
  const reset = resetPositions(original);
  assert.notEqual(reset.destination.id, original.destination.id);
  assert.deepEqual({ ...reset.destination, id: '' }, { id: '', name: '', point: null });
  assert.equal(reset.start, null);
  assert.equal(reset.wallEnd, null);
  assert.deepEqual(reset.path, []);
  for (const field of ['id', 'mapId', 'agentId', 'mediaUrl', 'title', 'notes']) assert.equal(reset[field], original[field]);
  assert.ok(original.path.length);
});

test('destination grouping uses stable ids scoped to kind and map, not coincident names or coordinates', () => {
  const [first, second, third] = createExamples();
  const separate = { ...first, id: 'different-group', destination: { ...first.destination, id: 'independent-destination' } };
  const otherMap = { ...first, id: 'other-map', mapId: 'bind' };
  const otherKind = { ...first, id: 'other-kind', kind: 'smoke' };
  const entries = [first, second, third, separate, otherMap, otherKind];
  Object.freeze(entries);
  const groups = groupDestinations(entries, 'lineup');
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.map((group) => group.entries.length), [3, 1, 1]);
  assert.deepEqual(groups[0].entries.map((entry) => entry.id), [first.id, second.id, third.id]);
  assert.equal(groups[2].mapId, 'bind');
  assert.equal(groupDestinations(entries, 'lineup', 'ascent').length, 2);
  assert.equal(groupDestinations(entries, 'lineup', 'missing').length, 0);
  assert.deepEqual(groupDestinations(entries, 'smoke')[0].entries, [otherKind]);
  assert.deepEqual(groupDestinations([], 'lineup'), []);
  groups[0].entries.pop();
  groups[0].destination.point.x = 0;
  assert.equal(groupDestinations(entries, 'lineup')[0].entries.length, 3);
  assert.notEqual(first.destination.point.x, 0);
});

test('moving an existing route marker preserves point kinds, order, neighboring references and input data', () => {
  const original = valid({ path: [
    { x: 0.1, y: 0.2, kind: 'waypoint' },
    { x: 0.3, y: 0.4, kind: 'bounce' },
    { x: 0.5, y: 0.6, kind: 'waypoint' },
  ] });
  original.path.forEach(Object.freeze);
  Object.freeze(original.path);
  Object.freeze(original);
  const snapshot = structuredClone(original);
  const moved = movePoint(original, { kind: 'path', index: 1 }, { x: 0.8, y: 0.9 });
  assert.equal(moved.path.length, 3);
  assert.deepEqual(moved.path.map((point) => point.kind), ['waypoint', 'bounce', 'waypoint']);
  assert.deepEqual(moved.path[1], { x: 0.8, y: 0.9, kind: 'bounce' });
  assert.strictEqual(moved.path[0], original.path[0]);
  assert.strictEqual(moved.path[2], original.path[2]);
  assert.strictEqual(moved.start, original.start);
  assert.strictEqual(moved.destination, original.destination);
  assert.deepEqual(original, snapshot);
});

test('moving anchors changes only the chosen existing position and clamps map edges', () => {
  const original = valid({ wallEnd: { x: 0.3, y: 0.5 } });
  const snapshot = structuredClone(original);
  for (const kind of ['start', 'wallEnd', 'target']) {
    const moved = movePoint(original, { kind }, { x: -0.1, y: 1.1 });
    const movedPoint = kind === 'target' ? moved.destination.point : moved[kind];
    assert.deepEqual(movedPoint, { x: 0, y: 1 });
    assert.strictEqual(moved.path, original.path);
    if (kind !== 'target') assert.strictEqual(moved.destination, original.destination);
    else assert.equal(moved.destination.id, original.destination.id);
    if (kind !== 'start') assert.strictEqual(moved.start, original.start);
    if (kind !== 'wallEnd') assert.strictEqual(moved.wallEnd, original.wallEnd);
  }
  const routeMove = movePoint(original, { kind: 'path', index: 0 }, { x: 1.2, y: -0.2 });
  assert.deepEqual(routeMove.path[0], { ...original.path[0], x: 1, y: 0 });
  assert.deepEqual(original, snapshot);
});

test('move does not create missing points and rejects invalid selections, indices and incoming coordinates', () => {
  const empty = createEmpty('lineup');
  for (const kind of ['start', 'target', 'wallEnd']) assert.strictEqual(movePoint(empty, { kind }, { x: 0.5, y: 0.5 }), empty);
  assert.strictEqual(movePoint(empty, { kind: 'path', index: 0 }, { x: 0.5, y: 0.5 }), empty);
  const original = valid();
  for (const index of [-1, 0.5, NaN, Infinity, original.path.length, 100]) {
    assert.strictEqual(movePoint(original, { kind: 'path', index }, { x: 0.5, y: 0.5 }), original);
  }
  assert.strictEqual(movePoint(original, { kind: 'unknown' }, { x: 0.5, y: 0.5 }), original);
  for (const point of [{ x: NaN, y: 0.5 }, { x: 0.5, y: Infinity }, { x: -Infinity, y: 0.5 }]) {
    for (const selection of [{ kind: 'start' }, { kind: 'target' }, { kind: 'path', index: 0 }]) {
      assert.strictEqual(movePoint(original, selection, point), original);
    }
  }
});

test('moving a locked destination is rejected while origins and route markers remain editable', () => {
  const original = valid();
  const point = { x: 0.2, y: 0.3 };
  assert.strictEqual(movePoint(original, { kind: 'target' }, point, true), original);
  assert.deepEqual(movePoint(original, { kind: 'target' }, point).destination.point, point);
  assert.deepEqual(movePoint(original, { kind: 'start' }, point, true).start, point);
  assert.deepEqual(movePoint(original, { kind: 'path', index: 0 }, point, true).path[0], { ...original.path[0], ...point });
});

test('move rejects invalid existing coordinates rather than creating a marker from corrupt selection data', () => {
  const point = { x: 0.2, y: 0.3 };
  const brokenStart = valid({ start: { x: NaN, y: 0.5 } });
  const brokenTarget = at({ x: 1.1, y: 0.5 });
  const brokenPath = valid({ path: [{ x: 0.5, y: Infinity, kind: 'bounce' }] });
  assert.strictEqual(movePoint(brokenStart, { kind: 'start' }, point), brokenStart);
  assert.strictEqual(movePoint(brokenTarget, { kind: 'target' }, point), brokenTarget);
  assert.strictEqual(movePoint(brokenPath, { kind: 'path', index: 0 }, point), brokenPath);
});

test('saving the sole guide moves its destination without shared approval and preserves its registered identity and name', () => {
  const original = valid();
  const saved = {
    ...movePoint(original, { kind: 'target' }, { x: 0.2, y: 0.3 }), title: 'edited title',
    destination: { ...original.destination, name: 'unintended rename', point: { x: 0.2, y: 0.3 } },
  };
  const updated = savePreviewEntry([original], saved);
  assert.equal(updated.length, 1);
  assert.deepEqual(updated[0].destination, { ...original.destination, point: { x: 0.2, y: 0.3 } });
  assert.equal(updated[0].title, 'edited title');
  assert.strictEqual(updated[0].path, saved.path);
  assert.notDeepEqual(original.destination.point, updated[0].destination.point);
});

test('unapproved shared saves restore the registered destination while retaining unrelated edits', () => {
  const entries = createExamples();
  const original = entries[1];
  const saved = {
    ...original, title: 'edited shared guide', mediaUrl: 'https://example.com/changed',
    start: { x: 0.1, y: 0.2 }, destination: { ...original.destination, name: 'changed', point: { x: 0.9, y: 0.9 } },
  };
  const updated = savePreviewEntry(entries, saved);
  assert.deepEqual(updated[1].destination, original.destination);
  assert.equal(updated[1].title, saved.title);
  assert.equal(updated[1].mediaUrl, saved.mediaUrl);
  assert.deepEqual(updated[1].start, saved.start);
  for (const index of [0, 2, 3, 4]) assert.strictEqual(updated[index], entries[index]);
});

test('approved shared movement updates only peer destination coordinates with no input mutation', () => {
  const entries = createExamples();
  const before = structuredClone(entries);
  for (const entry of entries) {
    Object.freeze(entry.destination.point);
    Object.freeze(entry.destination);
    Object.freeze(entry);
  }
  Object.freeze(entries);
  const point = { x: 0.19, y: 0.27 };
  const saved = { ...entries[1], title: 'edited title', destination: { ...entries[1].destination, name: 'not a group rename', point } };
  const updated = savePreviewEntry(entries, saved, true);
  assert.deepEqual(entries, before);
  for (const index of [0, 1, 2]) {
    assert.deepEqual(updated[index].destination.point, point);
    assert.equal(updated[index].destination.id, entries[index].destination.id);
    assert.equal(updated[index].destination.name, entries[index].destination.name);
    if (index !== 1) {
      assert.deepEqual({ ...updated[index], destination: entries[index].destination }, entries[index]);
      assert.strictEqual(updated[index].path, entries[index].path);
      assert.strictEqual(updated[index].start, entries[index].start);
    }
  }
  assert.equal(updated[1].title, saved.title);
  assert.strictEqual(updated[3], entries[3]);
  assert.strictEqual(updated[4], entries[4]);
  assert.notStrictEqual(updated[0].destination.point, updated[1].destination.point);
  saved.destination.point.x = 0;
  assert.equal(updated[0].destination.point.x, 0.19);
  assert.equal(updated[1].destination.point.x, 0.19);
});

test('a new guide attached to even one existing guide needs explicit approval to move the destination', () => {
  const original = createExamples()[3];
  const saved = {
    ...createAtDestination(original), id: 'new-attached', title: 'new guide', start: { x: 0.3, y: 0.4 },
    mediaUrl: 'https://example.com/new-video',
    destination: { ...original.destination, name: 'unregistered rename', point: { x: 0.2, y: 0.3 } },
  };
  assert.deepEqual(validateDraft(saved), {});
  const unchangedDestination = savePreviewEntry([original], saved);
  assert.equal(unchangedDestination.length, 2);
  assert.strictEqual(unchangedDestination[0], original);
  assert.deepEqual(unchangedDestination[1].destination, original.destination);
  const moved = savePreviewEntry([original], saved, true);
  assert.deepEqual(moved.map((entry) => entry.destination.point), [saved.destination.point, saved.destination.point]);
  assert.deepEqual(moved.map((entry) => entry.destination.name), [original.destination.name, original.destination.name]);
  assert.equal(moved[1].id, saved.id);
});

test('shared destination updates remain scoped to kind, map and destination id', () => {
  const first = valid();
  const peer = { ...first, id: 'matching-peer' };
  const otherMap = { ...first, id: 'other-map', mapId: 'bind' };
  const otherKind = { ...first, id: 'other-kind', kind: 'smoke' };
  const otherId = { ...first, id: 'other-destination', destination: { ...first.destination, id: 'different-id' } };
  const entries = [first, peer, otherMap, otherKind, otherId];
  const saved = movePoint(first, { kind: 'target' }, { x: 0.3, y: 0.4 });
  const updated = savePreviewEntry(entries, saved, true);
  assert.deepEqual(updated[1].destination.point, saved.destination.point);
  for (const index of [2, 3, 4]) assert.strictEqual(updated[index], entries[index]);
  assert.deepEqual(updated.map((entry) => entry.id), entries.map((entry) => entry.id));
});

test('saving a detached destination replaces only its guide and keeps its previous group untouched', () => {
  const entries = createExamples();
  let saved = detachDestination(entries[0]);
  saved = placePoint({ ...saved, destination: { ...saved.destination, name: 'new independent point' } }, 'target', { x: 0.1, y: 0.2 });
  const updated = savePreviewEntry(entries, saved);
  assert.deepEqual(updated[0].destination, saved.destination);
  assert.notEqual(updated[0].destination.id, entries[0].destination.id);
  for (const index of [1, 2, 3, 4]) assert.strictEqual(updated[index], entries[index]);
});

test('new independent guides are added with their own destination, keeping the input list intact', () => {
  const entries = createExamples();
  const saved = { ...valid(), id: 'new-independent', destination: { id: 'new-destination', name: 'new point', point: { x: 0.3, y: 0.6 } } };
  const updated = savePreviewEntry(entries, saved);
  assert.equal(entries.length, 5);
  assert.equal(updated.length, 6);
  assert.deepEqual(updated[5], saved);
  assert.notStrictEqual(updated[5].destination, saved.destination);
  for (let index = 0; index < entries.length; index += 1) assert.strictEqual(updated[index], entries[index]);
});
