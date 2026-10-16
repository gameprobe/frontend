const assert = require("node:assert/strict");
const { test, afterEach } = require("node:test");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const originalWindow = globalThis.window;
afterEach(() => { globalThis.window = originalWindow; });
function loadSession(storage = new Map(), disabled = false) {
  globalThis.window = { sessionStorage: {
    getItem: (key) => { if (disabled) throw new Error("disabled"); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (disabled) throw new Error("disabled"); storage.set(key, value); },
    removeItem: (key) => { if (disabled) throw new Error("disabled"); storage.delete(key); },
  } };
  const filename = join(__dirname, "admin-session.ts");
  const compiled = new Module(filename, module);
  compiled.paths = module.paths;
  compiled._compile(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
  return compiled.exports;
}

test("real login persists only in sessionStorage; refresh restores token and logout clears it", () => {
  const storage = new Map();
  let session = loadSession(storage);
  session.startAdminSession("test-only-token");
  assert.equal(storage.get("gameprobe-admin-token"), "test-only-token");
  session = loadSession(storage);
  assert.equal(session.getAdminToken(), "test-only-token");
  assert.equal(session.hasDemoSession(), false);
  session.endDemoSession();
  assert.equal(session.getAdminToken(), "");
  assert.equal(storage.size, 0);
});

test("demo and real mode are exclusive, and expiration removes token while retaining reauth mode", () => {
  const storage = new Map();
  const session = loadSession(storage);
  session.startAdminSession("test-only-token");
  session.expireAdminToken();
  assert.equal(session.getAdminToken(), "");
  assert.equal(storage.get("gameprobe-admin-mode"), "real");
  session.startDemoSession();
  assert.equal(session.hasDemoSession(), true);
  assert.equal(storage.has("gameprobe-admin-token"), false);
  assert.equal(storage.has("gameprobe-admin-mode"), false);
  session.startAdminSession("next-test-token");
  assert.equal(session.hasDemoSession(), false);
  assert.equal(storage.has("gameprobe-admin-demo"), false);
});

test("blocked browser storage falls back to memory without crashing", () => {
  const session = loadSession(new Map(), true);
  session.startAdminSession("test-only-token");
  assert.equal(session.getAdminToken(), "test-only-token");
  session.endDemoSession();
  session.startDemoSession();
  assert.equal(session.hasDemoSession(), true);
});
