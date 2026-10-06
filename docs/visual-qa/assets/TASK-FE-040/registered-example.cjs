// User-authorized real example. Read-only by default; --create permits ONE named record.
// No credentials, browser storage, request headers or copied external assets are saved.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '../../../..');
const frontend = 'http://localhost:3000';
const backend = 'http://localhost:8080';
const title = '[테스트] 어비스 브림스톤 A 사이트 · 꺾이는 경로';
const destination = '[테스트] A 사이트 착지점';
const source = 'https://strats.gg/valorant/lineups/post-plant-molly-a-site-10727?map=abyss&agent=brimstone';
const description = '등록·조회·경로 표시를 확인하는 테스트용 예시입니다. A Main 출발 → 중간 지점 1개 → A 사이트 도착 형태를 참고 화면에 맞춰 표시했습니다. 좌표는 시각 예시이며 실제 게임에서 성공 여부를 검증하지 않았습니다. 정확한 사용법은 연결된 Strats 원본 자료를 확인하세요.';
const points = { start: { x: .64, y: .075 }, bend: { x: .475, y: .218 }, target: { x: .456, y: .144 } };
const creationManifest = path.join(__dirname, 'registered-example-results.json');
const createRequested = process.argv.includes('--create');
const output = createRequested ? creationManifest : path.join(__dirname, 'registered-example-readonly-results.json');
const results = { title, source, checks: [], created: false };
let token = '';
let browser;

function check(name, condition) {
  assert.ok(condition, name);
  results.checks.push(name);
}

async function readApi(endpoint, admin = false) {
  const response = await fetch(`${backend}${endpoint}`, {
    headers: admin ? { 'X-Admin-Token': token } : {},
  });
  assert.equal(response.status, 200, `Read ${endpoint}`);
  return response.json();
}

async function main() {
  const env = fs.readFileSync(path.join(root, 'backend/.env'), 'utf8');
  const value = env.split(/\r?\n/).find(line => /^ADMIN_API_TOKEN=/.test(line));
  token = (value || '').slice('ADMIN_API_TOKEN='.length).trim().replace(/^(['"])(.*)\1$/, '$2');
  assert.ok(token, 'Local administrator credential must exist');
  const before = await readApi('/api/admin/lineups', true);
  const matches = before.filter(entry => entry.title === title);
  assert.ok(matches.length <= 1, 'Duplicate test title: refusing further writes');
  // An operator may rename or delete the retained record. Its saved ID remains the
  // authority: do not create a replacement simply because the original title disappeared.
  const previousId = fs.existsSync(creationManifest)
    ? JSON.parse(fs.readFileSync(creationManifest, 'utf8')).id : undefined;
  let saved = previousId ? before.find(entry => entry.id === previousId) : matches[0];
  if (previousId) {
    assert.ok(saved, 'Previously registered ID is absent; refusing replacement creation');
    assert.ok(matches.every(entry => entry.id === previousId), 'Conflicting test identity; refusing further writes');
  }
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${frontend}/admin`);
  await page.getByLabel('관리자 토큰', { exact: true }).fill(token);
  await page.getByRole('button', { name: '관리자 페이지로 이동', exact: true }).click();
  await page.waitForURL('**/admin/lineups');
  check('Real admin token login', true);

  if (!saved) {
    assert.ok(createRequested, 'Example absent. Explicit --create required for the single authorized write.');
    await page.goto(`${frontend}/admin/lineups/new`);
    await page.locator('#registration-map').selectOption('abyss');
    await page.locator('#registration-agent').selectOption('brimstone');
    await page.locator('#registration-ability-id').fill('brimstone-incendiary');
    await page.locator('#registration-slot').selectOption('Q');
    await page.locator('#registration-destination-name').fill(destination);
    await page.locator('#registration-title').fill(title);
    await page.locator('#registration-notes').fill(description);
    await page.locator('#registration-media-type').selectOption('video');
    await page.locator('#registration-url').fill(source);
    await page.locator('#registration-difficulty').selectOption('medium');
    await page.locator('#registration-side').selectOption('attack');
    await page.locator('#registration-site').selectOption('A');
    await page.locator('#registration-status').selectOption('published');
    const map = page.getByRole('button', { name: '지도 위치 지정', exact: true });
    async function place(point) {
      await map.scrollIntoViewIfNeeded();
      const box = await map.boundingBox();
      await map.click({ position: { x: box.width * point.x, y: box.height * point.y } });
    }
    await page.getByRole('button', { name: '도착 위치', exact: true }).click();
    await place(points.target);
    await place(points.start);
    await page.getByText('중간 지점 추가 (선택)', { exact: true }).click();
    await page.getByRole('button', { name: '중간 지점', exact: true }).click();
    await place(points.bend);
    const response = page.waitForResponse(response => response.url() === `${backend}/api/admin/lineups` && response.request().method() === 'POST');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    const created = await response;
    assert.equal(created.status(), 201, 'Actual create response');
    saved = await created.json();
    results.created = true;
    // Persist ID immediately so an interrupted visual check never causes another registration.
    results.id = saved.id;
    fs.writeFileSync(output, JSON.stringify(results, null, 2));
    await page.waitForURL(`**/admin/lineups/${saved.id}/edit`);
    check('Created exactly one lineup through admin UI (201)', true);
  }

  results.id = saved.id;
  results.detailUrl = `${frontend}/lineups/${saved.id}`;
  results.adminUrl = `${frontend}/admin/lineups/${saved.id}/edit`;
  await page.goto(results.adminUrl);
  await page.locator('#registration-title').waitFor();
  check('Saved record survives editor reload', await page.locator('#registration-title').inputValue() === title);
  check('Custom Brimstone ability and Q slot survive reload', await page.locator('#registration-ability-id').inputValue() === 'brimstone-incendiary' && await page.locator('#registration-slot').inputValue() === 'Q');
  const published = await readApi(`/api/lineups/${saved.id}`);
  check('Anonymous API exposes published registration', published.status === 'PUBLISHED' && published.registration.media.url === source);
  check('One origin, one destination and one intermediate point retained', published.agentMarkers.length === 1 && published.skillMarkers.length === 1 && published.pathPoints.length === 1);
  const route = [published.agentMarkers[0].position, ...published.pathPoints, published.registration.destination.point];
  const expected = [points.start, points.bend, points.target];
  check('Clicked coordinates round-trip within 0.5% of the map', route.every((point, index) => Math.abs(point.x - expected[index].x) < .005 && Math.abs(point.y - expected[index].y) < .005));
  results.route = route;
  const after = await readApi('/api/admin/lineups', true);
  check('All existing records are unchanged', before.every(entry => JSON.stringify(after.find(item => item.id === entry.id)) === JSON.stringify(entry)));
  check('No duplicate or unrelated record created', after.length === before.length + Number(results.created) && after.filter(entry => entry.title === title).length === 1);

  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const publicPage = await publicContext.newPage();
  publicPage.on('pageerror', error => errors.push(error.message));
  await publicPage.goto(`${frontend}/lineups`);
  await publicPage.getByRole('button', { name: 'Abyss', exact: true }).click();
  await publicPage.getByRole('button', { name: 'Brimstone', exact: true }).click();
  await publicPage.getByRole('button', { name: 'Q', exact: true }).click();
  await publicPage.getByRole('button', { name: `${destination} · 공략 1개`, exact: true }).click();
  const origin = publicPage.getByRole('link', { name: `${title} 상세 자료 보기`, exact: true });
  await origin.hover();
  const orientedRoute = route.map(point => `${(1 - point.y) * 100},${point.x * 100}`).join(' ');
  check('Destination selection and origin hover show the saved rotated path', await publicPage.locator(`polyline[data-lineup-id="${saved.id}"]`).getAttribute('points') === orientedRoute);
  await publicPage.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
  await publicPage.screenshot({ path: path.join(__dirname, 'registered-example-public.png'), fullPage: true });
  await origin.click();
  await publicPage.getByRole('heading', { name: title, exact: true }).waitFor();
  check('Origin click opens the exact saved detail', publicPage.url() === results.detailUrl);
  check('Detail matches the list orientation and ordered path', await publicPage.locator('.lineup-path-overlay polyline').getAttribute('points') === orientedRoute);
  const media = publicPage.getByRole('link', { name: '원본 자료 새 탭에서 보기 ↗', exact: true });
  check('Original reference media link is available without copying video', await media.getAttribute('href') === source);
  await publicPage.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
  await publicPage.screenshot({ path: path.join(__dirname, 'registered-example-detail.png'), fullPage: true });
  await publicPage.setViewportSize({ width: 390, height: 844 });
  check('Mobile detail has no horizontal page overflow', await publicPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  check('No admin or public JavaScript page errors', errors.length === 0);
  results.retainedForUserReview = true;
  results.completedAt = new Date().toISOString();
  fs.writeFileSync(output, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main().catch(error => {
  // A browser error can echo a fill argument; remove the credential before reporting it.
  console.error(String(error.stack || error).split(token || '\0').join('[redacted]'));
  process.exitCode = 1;
}).finally(async () => { if (browser) await browser.close(); });
