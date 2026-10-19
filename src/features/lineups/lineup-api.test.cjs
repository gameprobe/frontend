const assert = require("node:assert/strict");
const { after, afterEach, test } = require("node:test");
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const ts = require("typescript");
const directory = mkdtempSync(join(tmpdir(), "gameprobe-public-lineups-"));
const output = join(directory, "lineup-api.cjs");
writeFileSync(output, ts.transpileModule(readFileSync(join(__dirname, "lineup-api.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText);
const { createPublicLineupApi, toPublicLineup, publicLineupImageUrl, PublicLineupError } = require(output);
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
after(() => rmSync(directory, { recursive: true, force: true }));
const origin = "http://localhost:8000";
const record = {
  id: "lineup-id", title: "저장된 라인업", mapId: "ascent", agentId: "brimstone", abilitySlot: "Q", side: "defense",
  destination: { id: "destination-id", name: "도착점", point: { x: 0.45500538482730984, y: 0.14341172640068126 } },
  start: { x: 0.6393417987827785, y: 0.07448593683472338 },
  path: [{ x: 0.4742404888922283, y: 0.2173717033586295 }, { x: 0, y: 1 }],
  videoUrl: "https://example.com/video", notes: "설명",
  images: { position: { id: "image-id", sizeBytes: 70, contentType: "image/png", url: "/api/lineups/lineup-id/images/position" }, aim: null },
  createdAt: "2026-10-19T00:00:00Z", updatedAt: "2026-10-19T01:00:00Z",
};
const page = (items, total = items.length, offset = 0) => ({ items, total, offset, limit: 100 });

test("실제 좌표와 경로 순서, 두 이미지 메타데이터를 표시 타입으로 변환하고 site를 만들지 않는다", () => {
  const display = toPublicLineup(record);
  assert.equal(display.skillId, "brimstone-q");
  assert.equal(display.side, "defense");
  assert.equal(display.throwFrom.x / 512, record.start.x);
  assert.equal(display.landing.y / 512, record.destination.point.y);
  assert.deepEqual(display.path.map(({ x, y }) => ({ x: x / 512, y: y / 512 })), record.path);
  assert.deepEqual(display.images, record.images);
  assert.equal("site" in display, false);
  assert.equal(display.description, record.notes);
  assert.deepEqual(toPublicLineup({ ...record, images: undefined }).images, { position: null, aim: null });
});

test("공개 목록은 맵·요원·진영 쿼리로 모든 페이지를 조회하며 토큰과 쿠키를 보내지 않는다", async () => {
  let calls = 0;
  const controller = new AbortController();
  globalThis.fetch = async (url, init) => {
    const parsed = new URL(url);
    assert.equal(parsed.origin, origin);
    assert.equal(parsed.pathname, "/api/lineups");
    assert.equal(parsed.searchParams.get("mapId"), "ascent");
    assert.equal(parsed.searchParams.get("agentId"), "brimstone");
    assert.equal(parsed.searchParams.get("side"), "defense");
    assert.equal(parsed.searchParams.get("limit"), "100");
    assert.equal(parsed.searchParams.get("offset"), String(calls));
    assert.equal(init.headers, undefined);
    assert.equal(init.credentials, "omit");
    assert.equal(init.redirect, "error");
    assert.equal(init.signal, controller.signal);
    const current = calls++;
    return Response.json(page([{ ...record, id: `saved-${current}` }], 2, current));
  };
  const result = await createPublicLineupApi(origin).listAll({ mapId: "ascent", agentId: "brimstone", side: "defense" }, controller.signal);
  assert.equal(calls, 2);
  assert.deepEqual(result.map((item) => item.id), ["saved-0", "saved-1"]);
});

test("공개 이미지 경로는 ID를 인코딩하고 이미지 버전으로 교체된 파일을 구분한다", () => {
  assert.equal(publicLineupImageUrl(origin, "id/a b", "aim", "new image"), `${origin}/api/lineups/id%2Fa%20b/images/aim?v=new+image`);
  for (const invalid of ["", undefined, "https://user:pass@example.com", "https://example.com/api", "https://example.com?token=x", "javascript:alert(1)"]) {
    assert.throws(() => publicLineupImageUrl(invalid, "id", "position", "image"), /설정/);
  }
});

test("클라이언트 생성은 요청하지 않고 잘못된 주소는 조회 전 거절한다", async () => {
  globalThis.fetch = () => assert.fail("요청하면 안 됩니다");
  for (const invalid of [undefined, "/api", "https://example.com/path", "ftp://example.com"]) {
    await assert.rejects(createPublicLineupApi(invalid).listAll(), /설정/);
  }
});

test("삭제 또는 비활성 라인업 404와 서버 오류를 예시 자료로 대체하지 않는다", async () => {
  for (const status of [404, 500, 503]) {
    globalThis.fetch = async () => Response.json({ detail: "error" }, { status });
    await assert.rejects(createPublicLineupApi(origin).get("id"), (error) => error instanceof PublicLineupError && error.status === status);
  }
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(createPublicLineupApi(origin).listAll(), /연결을 확인/);
});

test("페이지를 바꾸며 취소하면 후속 페이지 요청을 하지 않는다", async () => {
  const controller = new AbortController();
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    controller.abort();
    return Response.json(page([record], 2));
  };
  await assert.rejects(createPublicLineupApi(origin).listAll({}, controller.signal), (error) => error.name === "AbortError");
  assert.equal(calls, 1);
});

test("잘못된 페이지, 좌표와 누락된 페이지는 부분 결과를 성공으로 표시하지 않는다", async () => {
  for (const invalid of [
    { items: [], total: 2, offset: 0, limit: 100 },
    { items: [record], total: 1, offset: 3, limit: 100 },
    { items: [record], total: 1, offset: 0, limit: 0 },
    page([{ ...record, start: { x: 2, y: 0 } }]),
    page([{ ...record, images: { position: "broken", aim: null } }]),
  ]) {
    globalThis.fetch = async () => Response.json(invalid);
    await assert.rejects(createPublicLineupApi(origin).listAll(), /다시/);
  }
  let calls = 0;
  globalThis.fetch = async () => Response.json(page([record], 2, calls++));
  await assert.rejects(createPublicLineupApi(origin).listAll(), /변경/);
});

test("등록 자료가 없는 정상 목록은 빈 배열이며 상세 ID는 인코딩해서 조회한다", async () => {
  globalThis.fetch = async () => Response.json(page([]));
  assert.deepEqual(await createPublicLineupApi(origin).listAll(), []);
  globalThis.fetch = async (url) => {
    assert.equal(String(url), `${origin}/api/lineups/id%2Fa%20b`);
    return Response.json({ ...record, id: "id/a b" });
  };
  assert.equal((await createPublicLineupApi(origin).get("id/a b")).title, record.title);
});
