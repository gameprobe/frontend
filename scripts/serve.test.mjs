import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { createStaticServer } from './serve.mjs';

test('built frontend supports navigation while isolating files and methods', async (t) => {
  const temp = await mkdtemp(join(tmpdir(), 'gameprobe-static-'));
  const root = join(temp, 'dist');
  await mkdir(join(root, 'assets'), { recursive: true });
  await writeFile(join(root, 'index.html'), '<main>GameProbe</main>');
  await writeFile(join(root, 'assets/app.js'), 'console.log("test")');
  await writeFile(join(temp, 'private.txt'), 'must stay private');
  await symlink(join(temp, 'private.txt'), join(root, 'outside.txt'));
  const server = createStaticServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(temp, { recursive: true });
  });
  const get = (path, method = 'GET', accept = 'text/html') => new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: server.address().port, path, method, headers: { accept } }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject); req.end();
  });
  for (const path of ['/', '/players/name%23KR1', '/players/name.with.dot%23KR1/matches', '/lineups/ascent/sova?site=A']) {
    await t.test(`SPA navigation ${path}`, async () => {
      const res = await get(path);
      assert.equal(res.status, 200); assert.equal(res.body, '<main>GameProbe</main>');
      assert.match(res.headers['content-type'], /text\/html/);
    });
  }
  await t.test('JavaScript MIME and HEAD', async () => {
    const res = await get('/assets/app.js', 'GET', '*/*');
    assert.equal(res.status, 200); assert.match(res.headers['content-type'], /javascript/);
    const head = await get('/assets/app.js', 'HEAD');
    assert.equal(head.body, ''); assert.equal(head.headers['content-length'], String(res.body.length));
  });
  await t.test('root responds to ordinary HTTP health probes without an HTML Accept header', async () => {
    assert.equal((await get('/', 'GET', '*/*')).status, 200);
    assert.equal((await get('/', 'HEAD', '*/*')).status, 200);
  });
  for (const path of ['/assets/missing.js', '/img/missing.webp', '/api/health', '/.env.local', '/../private.txt', '/%2e%2e/private.txt', '/..%5cprivate.txt', '/outside.txt']) {
    await t.test(`no source, missing asset, API or traversal access ${path}`, async () => assert.equal((await get(path)).status, 404));
  }
  await t.test('invalid encoding and methods', async () => {
    assert.equal((await get('/%zz')).status, 400);
    assert.equal((await get('/', 'POST')).status, 405);
    assert.equal((await get('/unknown', 'GET', 'application/json')).status, 404);
  });
});
