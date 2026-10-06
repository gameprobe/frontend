const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/seochanjin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const fixture = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../frontend/src/data/mock-data.json'), 'utf8')).matchDetails.find(match => match.matchId === 'mock-match-ascent-001');
const expectedParticipants = fixture.participants.map(player => [
  `${player.riotId.gameName}#${player.riotId.tagLine}`,
  player.team,
  player.agent,
  `${player.stats.kills}/${player.stats.deaths}/${player.stats.assists}`,
  String(player.stats.averageCombatScore),
]);
const expectedRounds = [...fixture.rounds].sort((a, b) => a.roundNumber - b.roundNumber).map(round => ({
  heading: `라운드 ${round.roundNumber}`,
  values: [round.winningTeam, round.endType, `${round.scoreAfterRound.attackers}-${round.scoreAfterRound.defenders}`],
}));

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const width of [1440, 820, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(`http://localhost:3000/matches/${fixture.matchId}`, { waitUntil: 'domcontentloaded' });
      await page.locator('#match-rounds-heading').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('main').count(), 1);
      assert.equal(await page.locator('main main').count(), 0);
      assert.equal(await page.locator('#match-detail-heading').textContent(), `${fixture.map} · ${fixture.mode}`);
      assert.equal(await page.locator('time').getAttribute('datetime'), fixture.startedAt);
      const metadata = await page.locator('section[aria-labelledby="match-detail-heading"] dd').allTextContents();
      assert.equal(metadata[1], `${Math.floor(fixture.durationSeconds / 60)}분 ${fixture.durationSeconds % 60}초`);

      const participants = await page.locator('table tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent.trim())));
      assert.deepEqual(participants, expectedParticipants, `All participant names, teams, agents, K/D/A, ACS and their order must be preserved at ${width}px`);
      const rounds = await page.locator('section[aria-labelledby="match-rounds-heading"] article').evaluateAll(cards => cards.map(card => ({
        heading: card.querySelector('h3').textContent,
        values: [...card.querySelectorAll('dd')].map(cell => cell.textContent),
      })));
      assert.deepEqual(rounds, expectedRounds, `All round numbers, winners, end types, scores and sorted order must be preserved at ${width}px`);

      const metrics = await page.evaluate(() => {
        const region = document.querySelector('[role="region"][aria-labelledby="match-scoreboard-heading"]');
        const text = [...document.querySelectorAll('section[aria-labelledby^="match-"] h1, section[aria-labelledby^="match-"] h2, section[aria-labelledby^="match-"] h3, section[aria-labelledby^="match-"] p, section[aria-labelledby^="match-"] th, section[aria-labelledby^="match-"] td, section[aria-labelledby^="match-"] dt, section[aria-labelledby^="match-"] dd')].filter(element => element.getBoundingClientRect().height > 0);
        return {
          documentOverflow: document.documentElement.scrollWidth > innerWidth,
          tableScrollWidth: region.scrollWidth,
          tableClientWidth: region.clientWidth,
          minTextSize: Math.min(...text.map(element => parseFloat(getComputedStyle(element).fontSize))),
          headerBackground: getComputedStyle(document.querySelector('section[aria-labelledby="match-detail-heading"]')).backgroundColor,
        };
      });
      assert.equal(metrics.documentOverflow, false);
      assert(metrics.minTextSize >= 12, 'Match text must be at least 12px');
      assert.equal(metrics.headerBackground, 'rgb(17, 29, 38)');
      const region = page.locator('[role="region"][aria-labelledby="match-scoreboard-heading"]');
      await page.keyboard.press('Tab');
      await region.focus();
      assert.equal(await region.evaluate(element => element === document.activeElement), true);
      const outline = await region.evaluate(element => ({ width: getComputedStyle(element).outlineWidth, style: getComputedStyle(element).outlineStyle }));
      assert.equal(outline.width, '2px');
      assert.equal(outline.style, 'solid');
      if (width === 390) {
        assert(metrics.tableScrollWidth > metrics.tableClientWidth, 'Mobile table must scroll within its own region');
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('[role="region"][aria-labelledby="match-scoreboard-heading"]').scrollLeft > 0);
        await region.evaluate(element => { element.scrollLeft = element.scrollWidth; });
        const finalColumnVisible = await page.locator('thead th').last().evaluate(element => {
          const cell = element.getBoundingClientRect();
          const region = element.closest('[role="region"]').getBoundingClientRect();
          return cell.right <= region.right + 1 && cell.left >= region.left;
        });
        assert(finalColumnVisible, 'ACS must remain reachable by local horizontal scroll');
        await region.evaluate(element => { element.scrollLeft = 0; });
      }
      await page.screenshot({ path: path.join(__dirname, `match-focus-${width}.png`), fullPage: true });
      assert.deepEqual(errors, []);
      results.push({ width, status: response.status(), participants: participants.length, rounds: rounds.length, participantFieldsCompared: participants.length * 5, roundFieldsCompared: rounds.length * 4, ...metrics, keyboardFocus: outline, browserErrors: errors });
      console.log(`${width}px: ${participants.length} participants / ${rounds.length} rounds preserved, no document overflow, keyboard scroll/focus PASS`);
      await context.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(__dirname, 'match-results.json'), JSON.stringify(results, null, 2));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
