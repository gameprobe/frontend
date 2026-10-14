// TASK-FE-059 라인업·스모크 영상 상세 페이지
// 사용: Playwright가 설치된 폴더에 복사해 `node flows-detail.mjs <출력폴더>` (vite preview :4173)
// 브라우저 경로를 직접 줄 때: CHROMIUM_PATH=/path/to/chrome-headless-shell
import { chromium } from "playwright";
const out = process.argv[2] ?? ".";
const base = process.env.BASE_URL ?? "http://localhost:4173";
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errors = [];
const results = [];
const check = (name, ok) => results.push(`${ok ? "PASS" : "FAIL"} ${name}`);
const EMBED = "https://www.youtube-nocookie.com/embed/qHhYLiFSs8k";

for (const w of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, hasTouch: w === 390 });
  // 외부 영상은 불러오지 않는다. iframe 주소만 확인한다
  await ctx.route(/youtube/, (route) => route.abort());
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${w} ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/youtube|ERR_FAILED/.test(m.text()) && errors.push(`${w} ${m.text()}`));
  const shot = async (name) => {
    await page.evaluate(() => document.fonts.ready);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) errors.push(`${w} ${name} horizontal overflow ${sw}`);
    await page.screenshot({ path: `${out}/${name}-${w}.png`, fullPage: true });
  };
  const path = () => new URL(page.url()).pathname + new URL(page.url()).search;
  const open = async (group) => (w === 1440 ? group.hover() : group.click());
  const info = () => page.locator("dl").innerText();

  // 1. 라인업 보드 출발지 → 상세
  await page.goto(`${base}/lineups/ascent/sova?sort=latest`, { waitUntil: "networkidle" });
  await open(page.getByRole("button", { name: "A 사이트 착지 지점 · 출발지 3곳 보기" }));
  await page.getByRole("button", { name: "미드 → A 사이트 정찰 던지는 위치 · 영상 보기" }).click();
  await page.waitForURL(/\/lineups\/ascent\/sova\/a-site-from-mid$/);
  check(`${w} start click → lineup detail`, true);
  check(`${w} lineup title`, await page.getByRole("heading", { level: 1, name: "미드 → A 사이트 정찰" }).isVisible());
  check(`${w} lineup autoplay embed`, (await page.locator("iframe").getAttribute("src")) === `${EMBED}?autoplay=1`);
  check(`${w} lineup 3 step cards`, (await page.locator("main ol > li").count()) === 3);
  const lineupInfo = await info();
  check(`${w} lineup info rows`, ["스킬", "충전", "바운스", "난이도"].every((label) => lineupInfo.includes(label)) && lineupInfo.includes("정찰용 화살 (E)"));
  check(`${w} lineup route map + ball`, (await page.getByTestId("throw-dot").count()) === 1 && (await page.getByText("던지는 위치", { exact: true }).isVisible()));
  await shot("lineup-detail");

  // 2. 목록으로: 보드 쿼리 유지 + 그 라인업 선택
  await page.getByRole("link", { name: "← 라인업 목록" }).click();
  await page.waitForURL(/\/lineups\/ascent\/sova\?/);
  const back = new URL(page.url()).searchParams;
  check(`${w} back keeps query + selects`, back.get("sort") === "latest" && back.get("lineup") === "a-site-from-mid");
  check(`${w} back panel open`, await page.getByRole("region", { name: "미드 → A 사이트 정찰 상세" }).isVisible());

  // 3. 보드 패널의 영상 자리 → 상세
  await page.getByRole("link", { name: /상세 페이지에서 보기$/ }).click();
  await page.waitForURL(/\/lineups\/ascent\/sova\/a-site-from-mid$/);
  check(`${w} panel video link → detail`, true);

  // 4. 시안 설명 글, 수비 라인업의 기본 목록 주소, 404
  await page.goto(`${base}/lineups/ascent/sova/a-lobby-a-site`, { waitUntil: "networkidle" });
  check(`${w} figma description`, await page.getByText("A 로비 오른쪽 상자 모서리에서 정찰용 화살을 쏴 A 사이트 안쪽을 확인해요.", { exact: false }).isVisible());
  await page.goto(`${base}/lineups/ascent/sova/sova-defense-1`, { waitUntil: "networkidle" });
  check(`${w} defense back link`, (await page.getByRole("link", { name: "← 라인업 목록" }).getAttribute("href")) === "/lineups/ascent/sova?side=defense&lineup=sova-defense-1");
  await page.goto(`${base}/lineups/ascent/sova/nope`, { waitUntil: "networkidle" });
  check(`${w} lineup 404`, await page.getByText("페이지를 찾을 수 없어요").isVisible());

  // 5. 스모크 보드 출발지 → 상세
  await page.goto(`${base}/smokes/ascent`, { waitUntil: "networkidle" });
  await open(page.getByRole("button", { name: "A 메인 입구 도착 위치 · 던지는 위치 3곳 보기" }));
  await page.getByRole("button", { name: "A 메인 입구 원형 연막 (브림스톤) 던지는 위치 · 영상 보기" }).click();
  await page.waitForURL(/\/smokes\/ascent\/a-main-from-mid$/);
  check(`${w} start click → smoke detail`, true);
  check(`${w} smoke autoplay embed`, (await page.locator("iframe").getAttribute("src")) === `${EMBED}?autoplay=1`);
  const smokeInfo = await info();
  check(`${w} smoke info rows`, ["요원", "연막 유형", "진영", "사이트"].every((label) => smokeInfo.includes(label)) && smokeInfo.includes("브림스톤"));
  check(`${w} smoke save button`, await page.getByRole("button", { name: "스모크 저장" }).isVisible());
  await shot("smoke-detail");
  await page.getByRole("link", { name: "← 스모크 목록" }).click();
  await page.waitForURL(/\/smokes\/ascent\?/);
  check(`${w} smoke back selects`, new URL(page.url()).searchParams.get("smoke") === "a-main-from-mid");

  // 6. 스모크 목록 펼침의 영상 자리 → 상세, 404
  await page.goto(`${base}/smokes/ascent`, { waitUntil: "networkidle" });
  await page.getByRole("list", { name: "연막 예시 목록" }).getByRole("button", { name: /^A 천국 원형 연막/ }).click();
  await page.getByRole("link", { name: /상세 페이지에서 보기$/ }).click();
  await page.waitForURL(/\/smokes\/ascent\/a-heaven$/);
  check(`${w} smoke list video link → detail`, path() === "/smokes/ascent/a-heaven");
  await page.goto(`${base}/smokes/ascent/nope`, { waitUntil: "networkidle" });
  check(`${w} smoke 404`, await page.getByText("페이지를 찾을 수 없어요").isVisible());

  await ctx.close();
}

await browser.close();
console.log(results.join("\n"));
console.log(`errors: ${errors.length}`);
errors.forEach((e) => console.log(e));
