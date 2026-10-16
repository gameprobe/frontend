const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const sourceRoot = resolve(__dirname, "../..");
const cache = new Map();
function load(path) {
  const filename = resolve(sourceRoot, path);
  if (cache.has(filename)) return cache.get(filename);
  const mod = new Module(filename, module);
  mod.require = (name) => {
    assert.ok(name.startsWith("@/"), `Unexpected runtime dependency: ${name}`);
    return load(name.slice(2) + ".ts");
  };
  mod._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  cache.set(filename, mod.exports);
  return mod.exports;
}
const { rotatePoint } = load("components/guide-map/geometry.ts");
const { minimapView, MINIMAP_LAYOUTS } = load("data/minimap-layout.ts");
const { toLineupPayload, fromLineupRecord } = load("features/admin/admin-lineup-api.ts");
const near = (a, b) => { assert.ok(Math.abs(a.x - b.x) < 1e-9); assert.ok(Math.abs(a.y - b.y) < 1e-9); };

test("quarter turns have known clockwise direction and preserve corners", () => {
  assert.deepEqual(rotatePoint({ x: 100, y: 200 }, 90), { x: 312, y: 100 });
  assert.deepEqual(rotatePoint({ x: 100, y: 200 }, 270), { x: 200, y: 412 });
  for (const angle of [0, 90, 180, 270]) {
    for (const point of [{ x: 0, y: 0 }, { x: 512, y: 0 }, { x: 0, y: 512 }, { x: 512, y: 512 }, { x: 138.2, y: 400.8 }]) {
      near(rotatePoint(rotatePoint(point, angle), -angle), point);
    }
  }
});

const expected = { ascent: 90, bind: 0, breeze: 0, fracture: 0, haven: 90, icebox: 270, lotus: 0, pearl: 0, split: 90, sunset: 0 };
for (const [mapId, rotation] of Object.entries(expected)) {
  for (const side of ["attack", "defense"]) {
    test(`${mapId}/${side}: selected spawn below opponent, readable map plane and reversible coordinates`, () => {
      const view = minimapView(mapId, side);
      assert.equal(view.rotation, (rotation + (side === "defense" ? 180 : 0)) % 360);
      const spawns = MINIMAP_LAYOUTS[mapId].spawns;
      const own = view.project(spawns[side]);
      const other = view.project(spawns[side === "attack" ? "defense" : "attack"]);
      assert.ok(own.y > other.y, `Own spawn must be lower: ${own.y} vs ${other.y}`);
      assert.ok(own.y > 256, "Own spawn must be in lower half");
      for (const point of [spawns.attack, spawns.defense, { x: 0, y: 512 }, { x: 371.15, y: 217.5 }]) near(view.unproject(view.project(point)), point);
      const apiPoint = { x: 0.23, y: 0.74 };
      near(view.unproject(view.project(apiPoint, 1), 1), apiPoint);
      const before = view.project(apiPoint, 1);
      const canonicalDelta = view.unproject({ x: 0.02, y: 0 }, 0);
      const moved = view.project({ x: apiPoint.x + canonicalDelta.x, y: apiPoint.y + canonicalDelta.y }, 1);
      near(moved, { x: before.x + 0.02, y: before.y });
    });
  }
}

test("view-only quarter turns cannot change saved canonical lineup start, destination or path order", () => {
  const original = { id: "qa", kind: "lineup", mapId: "icebox", agentId: "sova", abilitySlot: "E", side: "defense", site: "A", status: "inactive", title: "Coordinate preservation", videoUrl: "https://www.youtube.com/watch?v=example", notes: "", shape: "circle", destination: { id: "qa-destination", name: "QA", point: { x: 120, y: 200 } }, start: { x: 80, y: 350 }, path: [{ x: 90, y: 320 }, { x: 100, y: 260 }] };
  const snapshot = JSON.stringify(original);
  const payload = toLineupPayload(original);
  const view = minimapView(original.mapId, original.side);
  const shown = [original.start, ...original.path, original.destination.point].map((p) => view.project(p));
  shown.forEach((p, i) => near(view.unproject(p), [original.start, ...original.path, original.destination.point][i]));
  assert.equal(JSON.stringify(original), snapshot);
  assert.deepEqual(payload.start, { x: 80 / 512, y: 350 / 512 });
  assert.deepEqual(payload.path, original.path.map(({ x, y }) => ({ x: x / 512, y: y / 512 })));
  assert.deepEqual(fromLineupRecord({ ...payload, id: "qa" }).path, original.path);
});
