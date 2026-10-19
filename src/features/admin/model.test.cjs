const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// 상태와 공개 예시 연결은 실제 코드를 실행하고, React 구독·로그인·게임 카탈로그만 격리한다.
function compile(relativePath, imports = {}) {
  const filename = join(__dirname, relativePath);
  const compiled = new Module(filename, module);
  compiled.require = (name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected import: ${name}`);
  };
  compiled._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  return compiled.exports;
}
const model = compile("model.ts", {
  "@/components/guide-map/geometry": compile("../../components/guide-map/geometry.ts"),
  "@/lib/youtube": compile("../../lib/youtube.ts"),
  "@/mocks/lineups": { EXAMPLE_VIDEO_URL: "https://example.com/lineup.mp4" },
});
function preview() {
  let demo = true;
  const store = compile("guide-store.ts", {
    react: { useSyncExternalStore: (_subscribe, snapshot) => snapshot() },
    "@/features/admin/model": model,
  });
  const publicGuides = compile("public-guides.ts", {
    "@/features/admin/admin-session": { hasDemoSession: () => demo },
    "@/features/admin/guide-store": store,
    "@/data/game-names": { agentAbilities: () => [] },
  });
  return { store, publicGuides, leaveDemo: () => { demo = false; } };
}

test("new and copied guides start inactive; status labels and examples use only two states", () => {
  assert.deepEqual(model.STATUS_LABEL, { active: "활성", inactive: "비활성" });
  for (const kind of ["lineup", "smoke"]) {
    assert.equal(model.createEmpty(kind).status, "inactive");
    const publishedSource = { ...model.createExamples().find((entry) => entry.kind === kind), status: "active" };
    assert.equal(model.createAtDestination(publishedSource).status, "inactive");
  }
  const examples = model.createExamples();
  assert(examples.every((entry) => ["active", "inactive"].includes(entry.status)));
  assert.deepEqual(examples.filter((entry) => entry.status === "active").map((entry) => entry.id), ["example-lineup-02"]);
});

test("activating and deactivating a saved preview changes visibility without losing its route", () => {
  const { store, publicGuides } = preview();
  const entry = store.useGuideEntries().find((item) => item.id === "example-lineup-01");
  const publishedIds = () => publicGuides.usePublishedLineups(entry.mapId, entry.agentId).map((item) => item.id);
  assert(!publishedIds().includes(`admin-${entry.id}`));
  store.saveGuideEntry({ ...entry, status: "active" });
  const visible = publicGuides.usePublishedLineups(entry.mapId, entry.agentId).find((item) => item.id === `admin-${entry.id}`);
  assert.deepEqual(visible.path, entry.path);
  assert.deepEqual(visible.throwFrom, entry.start);
  assert.deepEqual(visible.landing, entry.destination.point);
  assert.equal(visible.videoUrl, entry.videoUrl);
  store.saveGuideEntry({ ...entry, status: "inactive" });
  assert(!publishedIds().includes(`admin-${entry.id}`));
  assert.deepEqual(store.useGuideEntries().find((item) => item.id === entry.id).path, entry.path);
});

test("public previews exclude inactive, missing, unknown and old statuses, or unplaced guides", () => {
  const { store, publicGuides } = preview();
  const entry = store.useGuideEntries().find((item) => item.id === "example-lineup-02");
  for (const status of ["inactive", "draft", "review", "published", "rejected", "unknown", undefined]) {
    store.saveGuideEntry({ ...entry, status });
    assert.equal(publicGuides.usePublishedLineups(entry.mapId, entry.agentId).length, 0);
  }
  store.saveGuideEntry({ ...entry, status: "active", start: null });
  assert.equal(publicGuides.usePublishedLineups(entry.mapId, entry.agentId).length, 0);
});

test("active smoke previews stay demo-only and remain hidden after leaving the demo", () => {
  const { store, publicGuides, leaveDemo } = preview();
  const smoke = store.useGuideEntries().find((entry) => entry.kind === "smoke");
  assert.equal(publicGuides.usePublishedSmokesOnMap(smoke.mapId).length, 0);
  store.saveGuideEntry({ ...smoke, status: "active" });
  assert.equal(publicGuides.usePublishedSmokes(smoke.mapId, smoke.side, smoke.shape).length, 1);
  assert.equal(publicGuides.usePublishedSmokesOnMap(smoke.mapId).length, 1);
  leaveDemo();
  assert.equal(publicGuides.usePublishedSmokesOnMap(smoke.mapId).length, 0);
  assert.equal(publicGuides.usePublishedLineups("ascent", "sova").length, 0);
});


test("new and destination-copied lineups have no site and never inherit uploaded images", () => {
  const entry = model.createEmpty("lineup", "destination-1");
  assert.equal("site" in entry, false);
  assert.deepEqual(entry.images, { position: null, aim: null });
  const source = {
    ...model.createExamples()[0],
    images: {
      position: { id: "existing-image", sizeBytes: 70, contentType: "image/png", url: "/api/lineups/example/images/position" },
      aim: null,
    },
  };
  const copy = model.createAtDestination(source);
  assert.equal("site" in copy, false);
  assert.deepEqual(copy.images, { position: null, aim: null });
  assert.equal(copy.destination.id, source.destination.id);
  assert.notEqual(copy.destination.point, source.destination.point);
});
