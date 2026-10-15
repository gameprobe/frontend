const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const payload = { title: "연막", mapId: "ascent", destination: { x: 0.4, y: 0.6 }, notes: "입구", status: "inactive" };
const record = { ...payload, id: "smoke-1", createdAt: "2026-10-15T00:00:00Z", updatedAt: "2026-10-15T00:00:00Z" };

function loadStore(fetchImpl) {
  let token = "test-only-token";
  let version = 1;
  let expired = 0;
  const session = {
    getAdminToken: () => token,
    getAdminSessionVersion: () => version,
    expireAdminToken: () => { token = ""; version += 1; expired += 1; },
  };
  function compile(filename, dependencies) {
    const compiled = new Module(filename, module);
    compiled.require = (name) => {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Unexpected import: ${name}`);
    };
    const source = readFileSync(filename, "utf8").replace("import.meta.env.VITE_BACKEND_URL", JSON.stringify("http://localhost:8001"));
    compiled._compile(ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText, filename);
    return compiled.exports;
  }
  const model = compile(join(__dirname, "../smokes/smoke-model.ts"), {});
  const api = compile(join(__dirname, "../smokes/smoke-api.ts"), { "./smoke-model": model });
  const store = compile(join(__dirname, "admin-smoke-store.ts"), {
    react: { useSyncExternalStore: (_subscribe, snapshot) => snapshot() },
    "../smokes/smoke-model": model,
    "../smokes/smoke-api": { ...api, createSmokeApi: (base) => api.createSmokeApi(base, fetchImpl) },
    "./admin-session": session,
  });
  return {
    store,
    changeSession(nextToken) { token = nextToken; version += 1; },
    currentToken: () => token,
    expiredCount: () => expired,
  };
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}
const page = (items, total = items.length, offset = 0) => Response.json({ items, total, offset, limit: 100 });

test("all pages load atomically, and an incomplete response reports an error instead of a partial list", async () => {
  let calls = 0;
  const { store } = loadStore(async (url) => {
    const offset = Number(new URL(url).searchParams.get("offset"));
    assert.equal(offset, calls);
    calls += 1;
    assert.equal(store.useAdminSmokes().entries.length, 0);
    return page([{ ...record, id: `smoke-${calls}` }], 2, offset);
  });
  await store.loadAdminSmokes();
  assert.equal(calls, 2);
  assert.equal(store.useAdminSmokes().loaded, true);
  assert.deepEqual(store.useAdminSmokes().entries.map((entry) => entry.id), ["smoke-1", "smoke-2"]);

  const broken = loadStore(async () => page([], 1)).store;
  await broken.loadAdminSmokes();
  assert.match(broken.useAdminSmokes().error, /모두 읽지/);
  assert.equal(broken.useAdminSmokes().loaded, false);
  assert.equal(broken.useAdminSmokes().loading, false);
});

test("logout discards delayed list data and stops further pages", async () => {
  const delayed = deferred();
  let calls = 0;
  const { store, changeSession } = loadStore(async () => { calls += 1; return delayed.promise; });
  const loading = store.loadAdminSmokes();
  changeSession("");
  store.clearAdminSmokes();
  delayed.resolve(page([record], 2));
  await loading;
  assert.equal(calls, 1);
  assert.equal(store.useAdminSmokes().loaded, false);
  assert.deepEqual(store.useAdminSmokes().entries, []);
});

test("current 401 expires the token; stale 401 never expires newer authentication", async () => {
  const current = loadStore(async () => Response.json({ detail: "인증 실패" }, { status: 401 }));
  await current.store.loadAdminSmokes();
  assert.equal(current.currentToken(), "");
  assert.equal(current.expiredCount(), 1);
  assert.match(current.store.useAdminSmokes().error, /인증 실패/);

  const delayed = deferred();
  const newer = loadStore(async () => delayed.promise);
  const reading = newer.store.fetchAdminSmoke(record.id);
  newer.changeSession("new-test-token");
  delayed.resolve(Response.json({ detail: "이전 인증 실패" }, { status: 401 }));
  await assert.rejects(reading, (error) => {
    assert.match(newer.store.smokeErrorMessage(error), /인증이 변경/);
    return true;
  });
  assert.equal(newer.currentToken(), "new-test-token");
  assert.equal(newer.expiredCount(), 0);
});

test("successful save wins over an older in-flight list, and delete removes the saved record", async () => {
  const delayed = deferred();
  const calls = [];
  let initialLoad = true;
  const { store } = loadStore(async (_url, init) => {
    calls.push(init.method);
    if (init.method === "GET" && initialLoad) { initialLoad = false; return page([record]); }
    if (init.method === "GET") return delayed.promise;
    if (init.method === "DELETE") return new Response(null, { status: 204 });
    return Response.json({ ...record, ...JSON.parse(init.body) });
  });
  await store.loadAdminSmokes();
  const loading = store.loadAdminSmokes();
  const saved = await store.saveAdminSmoke(payload);
  delayed.resolve(page([{ ...record, title: "오래된 제목" }]));
  await loading;
  assert.equal(store.useAdminSmokes().entries[0].title, "연막");
  await store.saveAdminSmoke({ ...payload, status: "active" }, saved.id);
  assert.equal(store.useAdminSmokes().entries[0].status, "active");
  await store.deleteAdminSmoke(saved.id);
  assert.deepEqual(store.useAdminSmokes().entries, []);
  assert.deepEqual(calls, ["GET", "GET", "POST", "PUT", "DELETE"]);
});

test("late create or delete after logout cannot restore or alter cache", async () => {
  for (const action of ["create", "delete"]) {
    const delayed = deferred();
    const { store, changeSession } = loadStore(async () => delayed.promise);
    const pending = action === "create" ? store.saveAdminSmoke(payload) : store.deleteAdminSmoke(record.id);
    changeSession("");
    store.clearAdminSmokes();
    delayed.resolve(action === "create" ? Response.json(record, { status: 201 }) : new Response(null, { status: 204 }));
    await assert.rejects(pending, /인증이 변경/);
    assert.deepEqual(store.useAdminSmokes().entries, []);
  }
});

test("demo CRUD is separate memory data and never calls the backend", () => {
  const { store } = loadStore(() => assert.fail("Demo must not call API"));
  assert.deepEqual(store.useDemoSmokes(), []);
  const saved = store.saveDemoSmoke(payload);
  assert.ok(saved.id);
  assert.equal(saved.status, "inactive");
  const edited = store.saveDemoSmoke({ ...payload, status: "active", destination: { x: 0, y: 1 } }, saved.id);
  assert.equal(edited.id, saved.id);
  assert.equal(edited.createdAt, saved.createdAt);
  assert.equal(store.useDemoSmokes()[0].status, "active");
  assert.deepEqual(store.useAdminSmokes().entries, []);
  store.deleteDemoSmoke(saved.id);
  assert.deepEqual(store.useDemoSmokes(), []);
  store.saveDemoSmoke(payload);
  store.clearDemoSmokes();
  assert.deepEqual(store.useDemoSmokes(), []);
  assert.throws(() => store.saveDemoSmoke(payload, "missing"), /찾을 수 없/);
});


test("mutation during the first list restarts only the read and eventually exposes the complete list", async () => {
  for (const action of ["save", "delete"]) {
    const oldList = deferred();
    const freshList = deferred();
    let reads = 0;
    let writes = 0;
    const { store } = loadStore(async (_url, init) => {
      if (init.method === "GET") return ++reads === 1 ? oldList.promise : freshList.promise;
      writes += 1;
      return init.method === "DELETE" ? new Response(null, { status: 204 }) : Response.json(record);
    });
    const loading = store.loadAdminSmokes();
    if (action === "save") await store.saveAdminSmoke(payload);
    else await store.deleteAdminSmoke(record.id);
    assert.equal(store.useAdminSmokes().loaded, false, "a mutation result is not a complete list");
    assert.equal(store.useAdminSmokes().loading, true, "the initial list must restart after a mutation");
    assert.equal(reads, 2);
    oldList.resolve(page([{ ...record, title: "이전 목록" }]));
    await loading;
    assert.equal(store.useAdminSmokes().loading, true, "stale list cannot stop the replacement read");
    const expected = action === "save" ? [record, { ...record, id: "other", title: "다른 연막" }] : [{ ...record, id: "other" }];
    freshList.resolve(page(expected));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(store.useAdminSmokes().loaded, true);
    assert.equal(store.useAdminSmokes().loading, false);
    assert.deepEqual(store.useAdminSmokes().entries, expected);
    assert.equal(writes, 1, "refreshing the list must not retry the mutation");
  }
});

test("a failed read after a successful save keeps the success and presents a retriable list error", async () => {
  let reads = 0;
  let writes = 0;
  const { store } = loadStore(async (_url, init) => {
    if (init.method === "POST") { writes += 1; return Response.json(record); }
    reads += 1;
    return Response.json({ detail: "목록 서버 오류" }, { status: 503 });
  });
  assert.equal((await store.saveAdminSmoke(payload)).id, record.id);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(store.useAdminSmokes().loaded, false);
  assert.equal(store.useAdminSmokes().loading, false);
  assert.match(store.useAdminSmokes().error, /목록 서버 오류/);
  assert.equal(store.useAdminSmokes().entries[0].id, record.id);
  assert.equal(reads, 1);
  assert.equal(writes, 1);
});
