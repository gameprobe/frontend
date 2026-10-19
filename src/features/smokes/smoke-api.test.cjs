const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const ts = require("typescript");
const directory = mkdtempSync(join(tmpdir(), "gameprobe-smoke-api-"));
for (const name of ["smoke-model", "smoke-api"]) {
  writeFileSync(join(directory, `${name}.js`), ts.transpileModule(readFileSync(join(__dirname, `${name}.ts`), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText);
}
const { createSmokeApi, SmokeApiError, smokeErrorMessage } = require(join(directory, "smoke-api.js"));
after(() => rmSync(directory, { recursive: true, force: true }));
const origin = "http://localhost:8001";
const token = "test-only-smoke-token";
const payload = { title: "단일 연막", mapId: "ascent", side: "attack", destination: { x: 0.45500538482730984, y: 1 }, notes: "입구를 가립니다.", status: "inactive" };
const record = { ...payload, id: "smoke-1", createdAt: "2026-10-15T00:00:00Z", updatedAt: "2026-10-15T00:00:00Z" };

test("public reads encode map/ID and pagination without any administrator token", async () => {
  const calls = [];
  const client = createSmokeApi(origin, async (url, init) => {
    calls.push({ url: String(url), ...init });
    return Response.json({ ...record });
  });
  const controller = new AbortController();
  await client.listPublic("map with space", "defense", 100, controller.signal);
  await client.getPublic("id/space name", controller.signal);
  const query = new URL(calls[0].url).searchParams;
  assert.equal(query.get("mapId"), "map with space");
  assert.equal(query.get("side"), "defense");
  assert.equal(query.get("limit"), "100");
  assert.equal(query.get("offset"), "100");
  assert.equal(calls[1].url, `${origin}/api/smokes/id%2Fspace%20name`);
  for (const call of calls) {
    assert.deepEqual(call.headers, {});
    assert.equal(call.signal, controller.signal);
    assert.equal(call.credentials, "omit");
    assert.equal(call.redirect, "error");
    assert.equal(call.cache, "no-store");
  }
});

test("admin CRUD sends exactly six writable fields, preserving normalized precision and status", async () => {
  const calls = [];
  const client = createSmokeApi(origin, async (url, init) => {
    calls.push({ url: String(url), ...init });
    return init.method === "DELETE" ? new Response(null, { status: 204 }) : Response.json(record);
  });
  await client.list(token, 100);
  await client.get(token, "id/with space");
  await client.create(token, { ...record, title: " 단일 연막 ", videoUrl: "old-field", destination: { ...payload.destination, name: "old-name" } });
  await client.update(token, record.id, { ...record, side: "defense", status: "active" });
  assert.equal(await client.remove(token, record.id), undefined);
  assert.deepEqual(calls.map((call) => call.method), ["GET", "GET", "POST", "PUT", "DELETE"]);
  assert.equal(calls[0].url, `${origin}/api/admin/smokes?limit=100&offset=100`);
  assert.equal(calls[1].url, `${origin}/api/admin/smokes/id%2Fwith%20space`);
  assert.deepEqual(JSON.parse(calls[2].body), payload);
  assert.deepEqual(JSON.parse(calls[3].body), { ...payload, side: "defense", status: "active" });
  for (const call of calls) {
    assert.equal(call.headers["X-Admin-Token"], token);
    assert.equal(call.url.includes(token), false);
  }
});

test("invalid origin, absent token, and invalid points fail before sending any request", async () => {
  const fetchNever = () => assert.fail("No request expected");
  for (const base of [undefined, "", "/api", "javascript:alert(1)", "https://user:pass@example.com", "https://example.com/api", "https://example.com?secret=x"]) {
    await assert.rejects(createSmokeApi(base, fetchNever).list(token), /VITE_BACKEND_URL/);
  }
  const client = createSmokeApi(origin, fetchNever);
  await assert.rejects(client.list(""), (error) => error.status === 401);
  for (const coordinate of [Infinity, NaN, -0.1, 1.1]) {
    await assert.rejects(client.create(token, { ...payload, destination: { x: coordinate, y: 0.5 } }), /연막 위치/);
  }
  await assert.rejects(client.update(token, record.id, { ...payload, status: "published" }), /공개 상태/);
  for (const side of [undefined, null, "", "ATTACK", "both"]) {
    await assert.rejects(client.create(token, { ...payload, side }), /스모크 진영/);
  }
});

test("HTTP failures retain status; validation details do not expose submitted values", async () => {
  for (const status of [401, 404, 503]) {
    const client = createSmokeApi(origin, async () => Response.json({ detail: "요청 실패" }, { status }));
    await assert.rejects(client.get(token, record.id), (error) => {
      assert.ok(error instanceof SmokeApiError);
      assert.equal(error.status, status);
      assert.equal(smokeErrorMessage(error), "요청 실패");
      return true;
    });
  }
  const client = createSmokeApi(origin, async () => Response.json({ detail: [{ input: "private-value" }] }, { status: 422 }));
  await assert.rejects(client.create(token, payload), (error) => error.status === 422 && !error.message.includes("private-value"));
});

test("network failures do not retry writes and cancellation retains the abort error", async () => {
  let attempts = 0;
  const client = createSmokeApi(origin, async () => { attempts += 1; throw new TypeError("network failed"); });
  await assert.rejects(client.create(token, payload), /저장 여부/);
  assert.equal(attempts, 1);
  const controller = new AbortController();
  controller.abort();
  const cancelled = createSmokeApi(origin, async () => { throw controller.signal.reason; });
  await assert.rejects(cancelled.listPublic("ascent", "attack", 0, controller.signal), (error) => error.name === "AbortError");
});


test("public side filters stay on every page and never send credentials", async () => {
  const calls = [];
  const client = createSmokeApi(origin, async (url, init) => {
    calls.push({ url: new URL(url), init });
    return Response.json({ items: [], total: 0, limit: 100, offset: 0 });
  });
  for (const side of ["attack", "defense"]) {
    for (const offset of [0, 100]) await client.listPublic("ascent", side, offset);
  }
  assert.deepEqual(calls.map(({ url }) => [url.searchParams.get("side"), url.searchParams.get("offset")]), [
    ["attack", "0"], ["attack", "100"], ["defense", "0"], ["defense", "100"],
  ]);
  for (const { init } of calls) assert.deepEqual(init.headers, {});
});

test("legacy null-side responses are retained until an administrator chooses a side", async () => {
  const client = createSmokeApi(origin, async () => Response.json({ ...record, side: null }));
  assert.equal((await client.get(token, record.id)).side, null);
  assert.equal((await client.getPublic(record.id)).side, null);
});
