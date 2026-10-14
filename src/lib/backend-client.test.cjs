const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const ts = require("typescript");

// Compile the actual client with the project's existing TypeScript dependency.
const directory = mkdtempSync(join(tmpdir(), "gameprobe-backend-client-"));
const compiledPath = join(directory, "backend-client.cjs");
const compiled = ts.transpileModule(readFileSync(join(__dirname, "backend-client.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
writeFileSync(compiledPath, compiled.outputText);
const originalFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error("Unexpected request on module import"); };
const { createBackendClient } = require(compiledPath);
globalThis.fetch = originalFetch;
afterEach(() => { globalThis.fetch = originalFetch; });
after(() => { rmSync(directory, { recursive: true, force: true }); });

function unexpectedFetch() {
  assert.fail("No request should be sent");
}

const apiOrigin = "https://api.game-probe.com";

test("constructing a client never starts a request or rejects missing configuration", () => {
  globalThis.fetch = unexpectedFetch;
  assert.equal(typeof createBackendClient(undefined).getHealth, "function");
  assert.equal(typeof createBackendClient(apiOrigin).getHealth, "function");
});

test("missing configuration fails before a request instead of using a production or relative fallback", async () => {
  globalThis.fetch = unexpectedFetch;
  for (const value of [undefined, "", "   "]) {
    await assert.rejects(createBackendClient(value).getHealth(), /VITE_BACKEND_URL/);
  }
});

test("invalid origins fail before a request", async () => {
  globalThis.fetch = unexpectedFetch;
  for (const value of [
    "/api", "api.game-probe.com", "//api.game-probe.com", "not a url",
    "ftp://api.game-probe.com", "javascript:alert(1)",
    "https://user:password@api.game-probe.com", `${apiOrigin}/health`,
    `${apiOrigin}/api`, `${apiOrigin}?token=value`, `${apiOrigin}#fragment`,
  ]) {
    await assert.rejects(createBackendClient(value).getHealth(), /VITE_BACKEND_URL/);
  }
});

test("GET uses the configured origin and omits cookies and custom headers", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json({ status: "UP" });
  };
  assert.deepEqual(await createBackendClient(` ${apiOrigin}/ `).getHealth(), { status: "UP" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${apiOrigin}/health`);
  assert.equal(calls[0].init.method, "GET");
  assert.equal(calls[0].init.mode, "cors");
  assert.equal(calls[0].init.credentials, "omit");
  assert.equal(calls[0].init.redirect, "error");
  assert.equal(calls[0].init.cache, "no-store");
  assert.equal(calls[0].init.headers, undefined);
});

test("explicit local backend uses the configured port without falling back to production", async () => {
  globalThis.fetch = async (url) => {
    assert.equal(String(url), "http://localhost:8000/health");
    return Response.json({ status: "UP" });
  };
  await createBackendClient("http://localhost:8000").getHealth();
});

test("HTTP failures are not accepted even if the body claims UP", async () => {
  for (const status of [401, 404, 500, 503]) {
    globalThis.fetch = async () => Response.json({ status: "UP" }, { status });
    await assert.rejects(createBackendClient(apiOrigin).getHealth(), new RegExp(`HTTP ${status}`));
  }
});

test("malformed or empty JSON responses are not accepted", async () => {
  for (const body of ["<html>SPA fallback</html>", "{bad-json", ""]) {
    globalThis.fetch = async () => new Response(body);
    await assert.rejects(createBackendClient(apiOrigin).getHealth(), SyntaxError);
  }
});

test("unexpected health payloads are not accepted", async () => {
  for (const body of [null, [], {}, "UP", { status: "DOWN" }, { status: "up" }, { status: true }]) {
    globalThis.fetch = async () => Response.json(body);
    await assert.rejects(createBackendClient(apiOrigin).getHealth(), /응답 형식/);
  }
});

test("network failures propagate without retries or pretending that the backend is healthy", async () => {
  const error = new TypeError("Failed to fetch");
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw error; };
  await assert.rejects(createBackendClient(apiOrigin).getHealth(), (actual) => actual === error);
  assert.equal(calls, 1);
});

test("the caller's AbortSignal and cancellation reach the request", async () => {
  const controller = new AbortController();
  controller.abort();
  globalThis.fetch = async (_url, init) => {
    assert.equal(init.signal, controller.signal);
    init.signal.throwIfAborted();
  };
  await assert.rejects(createBackendClient(apiOrigin).getHealth(controller.signal), { name: "AbortError" });
});
