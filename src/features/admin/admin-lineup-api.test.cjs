const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const ts = require("typescript");
const directory = mkdtempSync(join(tmpdir(), "gameprobe-admin-api-"));
const output = join(directory, "admin-lineup-api.cjs");
writeFileSync(output, ts.transpileModule(readFileSync(join(__dirname, "admin-lineup-api.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText);
const { AdminApiError, createAdminLineupApi, toLineupPayload, fromLineupRecord } = require(output);
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
after(() => rmSync(directory, { recursive: true, force: true }));
const origin = "http://localhost:8001";
const token = "test-only-token";
const record = {
  id: "saved-id", title: "테스트 공략", mapId: "ascent", agentId: "brimstone", abilitySlot: "Q",
  side: "attack", site: "A", status: "inactive", notes: "설명", videoUrl: "https://example.com/video.mp4",
  destination: { id: "destination-1", name: "도착점", point: { x: 0.45500538482730984, y: 0.14341172640068126 } },
  start: { x: 0.6393417987827785, y: 0.07448593683472338 },
  path: [{ x: 0.4742404888922283, y: 0.2173717033586295 }, { x: 0, y: 1 }],
  createdAt: "2026-10-15T00:00:00Z", updatedAt: "2026-10-15T00:00:00Z",
};

test("API coordinates round-trip unchanged, preserving intermediate point order and DTO names", () => {
  const entry = fromLineupRecord(record);
  assert.equal(entry.kind, "lineup");
  assert.equal(entry.start.x, record.start.x * 512);
  assert.equal(entry.path[1].y, 512);
  const { id: _id, createdAt: _created, updatedAt: _updated, ...expected } = record;
  assert.deepEqual(toLineupPayload(entry), expected);
  assert.equal("kind" in toLineupPayload(entry), false);
  assert.equal("id" in toLineupPayload(entry), false);
});

test("active and inactive survive API round-trips and are sent unchanged when saving", async () => {
  const calls = [];
  globalThis.fetch = async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return Response.json({ ...record, ...JSON.parse(init.body) });
  };
  const client = createAdminLineupApi(origin);
  for (const status of ["active", "inactive"]) {
    const entry = fromLineupRecord({ ...record, status });
    assert.equal(entry.status, status);
    const payload = toLineupPayload(entry);
    assert.equal(payload.status, status);
    const saved = await client.update(token, record.id, payload);
    assert.equal(fromLineupRecord(saved).status, status);
  }
  assert.deepEqual(calls.map((payload) => payload.status), ["active", "inactive"]);
});

test("missing coordinates fail before an incomplete payload is sent", () => {
  const entry = fromLineupRecord(record);
  assert.throws(() => toLineupPayload({ ...entry, start: null }), /출발 위치/);
  assert.throws(() => toLineupPayload({ ...entry, destination: { ...entry.destination, point: null } }), /도착 위치/);
});

test("client construction does not send requests and invalid origins never receive tokens", async () => {
  globalThis.fetch = () => assert.fail("No request expected");
  for (const base of [undefined, "", "/api", "javascript:alert(1)", "https://user:pass@example.com", "https://example.com/api", "https://example.com?token=x"]) {
    const client = createAdminLineupApi(base);
    await assert.rejects(client.authenticate(token), /VITE_BACKEND_URL/);
  }
  await assert.rejects(createAdminLineupApi(origin).list(""), (error) => error.status === 401);
});

test("login puts raw token only in the header and rejects unsuccessful authentication", async () => {
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), `${origin}/api/admin/session`);
    assert.equal(init.method, "POST");
    assert.deepEqual(init.headers, { "X-Admin-Token": token });
    assert.equal(init.body, undefined);
    assert.equal(init.credentials, "omit");
    assert.equal(init.redirect, "error");
    return Response.json({ authenticated: true });
  };
  await createAdminLineupApi(origin).authenticate(token);
  globalThis.fetch = async () => Response.json({ authenticated: false });
  await assert.rejects(createAdminLineupApi(origin).authenticate(token), /인증 응답/);
});

test("CRUD uses separate methods, an encoded ID and JSON payload without credentials in URL", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), ...init });
    return init.method === "DELETE" ? new Response(null, { status: 204 }) : Response.json(record);
  };
  const client = createAdminLineupApi(origin);
  const payload = toLineupPayload(fromLineupRecord(record));
  await client.list(token, 100);
  await client.get(token, "id/with space");
  await client.create(token, payload);
  await client.update(token, record.id, payload);
  await client.remove(token, record.id);
  assert.deepEqual(calls.map((call) => call.method), ["GET", "GET", "POST", "PUT", "DELETE"]);
  assert.equal(calls[0].url, `${origin}/api/admin/lineups?limit=100&offset=100`);
  assert.equal(calls[1].url, `${origin}/api/admin/lineups/id%2Fwith%20space`);
  for (const call of calls) {
    assert.equal(call.url.includes(token), false);
    assert.equal(call.headers["X-Admin-Token"], token);
    assert.equal(call.cache, "no-store");
  }
  assert.deepEqual(JSON.parse(calls[2].body), payload);
  assert.deepEqual(JSON.parse(calls[3].body), payload);
  assert.equal(calls[4].body, undefined);
});

test("401, missing data, legacy conflicts and server failures keep their status for the UI", async () => {
  for (const status of [401, 404, 409, 503]) {
    globalThis.fetch = async () => Response.json({ detail: "안내 문구" }, { status });
    await assert.rejects(createAdminLineupApi(origin).get(token, "id"), (error) => {
      assert.ok(error instanceof AdminApiError);
      assert.equal(error.status, status);
      assert.equal(error.message, "안내 문구");
      return true;
    });
  }
  globalThis.fetch = async () => Response.json({ detail: [{ input: "private-value" }] }, { status: 422 });
  await assert.rejects(createAdminLineupApi(origin).get(token, "id"), (error) => error.status === 422 && !error.message.includes("private-value"));
});

test("network failure never retries a write automatically", async () => {
  let count = 0;
  globalThis.fetch = async () => { count += 1; throw new TypeError("fetch failed"); };
  await assert.rejects(createAdminLineupApi(origin).create(token, toLineupPayload(fromLineupRecord(record))), /저장 여부/);
  assert.equal(count, 1);
});

// 저장소 모듈은 실제 코드를 실행하고 React 구독과 로그인 상태만 테스트용으로 바꾼다.
function loadStore() {
  const Module = require("node:module");
  let sessionToken = token;
  let version = 1;
  const session = {
    getAdminToken: () => sessionToken,
    getAdminSessionVersion: () => version,
    expireAdminToken: () => { sessionToken = ""; version += 1; },
  };
  const filename = join(__dirname, "admin-lineup-store.ts");
  const source = readFileSync(filename, "utf8").replace("import.meta.env.VITE_BACKEND_URL", JSON.stringify(origin));
  const compiled = new Module(filename, module);
  compiled.require = (name) => {
    if (name === "react") return { useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot() };
    if (name === "./admin-lineup-api") return require(output);
    if (name === "./admin-session") return session;
    throw new Error(`Unexpected import: ${name}`);
  };
  compiled._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  return {
    store: compiled.exports,
    changeSession(nextToken) { sessionToken = nextToken; version += 1; },
    currentToken: () => sessionToken,
  };
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

test("list collects all pages before exposing the complete cache", async () => {
  const { store } = loadStore();
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls += 1;
    assert.equal(new URL(url).searchParams.get("offset"), calls === 1 ? "0" : "1");
    return Response.json({ items: [{ ...record, id: `id-${calls}` }], total: 2, limit: 100, offset: calls - 1, unsupportedCount: 1 });
  };
  await store.loadAdminLineups();
  assert.equal(calls, 2);
  assert.equal(store.useAdminLineups().entries.length, 2);
  assert.equal(store.useAdminLineups().loaded, true);
  assert.equal(store.useAdminLineups().unsupportedCount, 1);
});

test("logout during list loading drops the response and stops pagination", async () => {
  const { store, changeSession } = loadStore();
  const delayed = deferred();
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return delayed.promise; };
  const loading = store.loadAdminLineups();
  changeSession("");
  store.clearAdminLineups();
  delayed.resolve(Response.json({ items: [record], total: 2, limit: 100, offset: 0, unsupportedCount: 0 }));
  await loading;
  assert.equal(calls, 1);
  assert.equal(store.useAdminLineups().entries.length, 0);
  assert.equal(store.useAdminLineups().loaded, false);
});

test("late create success after logout does not restore the previous cache", async () => {
  const { store, changeSession } = loadStore();
  const delayed = deferred();
  globalThis.fetch = async () => delayed.promise;
  const saving = store.saveAdminLineup({ ...fromLineupRecord(record), id: "" });
  changeSession("");
  store.clearAdminLineups();
  delayed.resolve(Response.json(record, { status: 201 }));
  await assert.rejects(saving, /인증이 변경/);
  assert.equal(store.useAdminLineups().entries.length, 0);
});

test("a stale 401 cannot invalidate a newer authentication when the UI formats the error", async () => {
  const { store, changeSession, currentToken } = loadStore();
  const delayed = deferred();
  globalThis.fetch = async () => delayed.promise;
  const reading = store.fetchAdminLineup("id");
  changeSession("new-test-token");
  delayed.resolve(Response.json({ detail: "인증 실패" }, { status: 401 }));
  await assert.rejects(reading, (error) => {
    assert.match(store.adminErrorMessage(error), /인증이 변경/);
    assert.equal(currentToken(), "new-test-token");
    return true;
  });
});
