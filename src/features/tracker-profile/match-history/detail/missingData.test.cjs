const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// 누락된 실제 입력이 0 또는 다른 참가자의 통계로 표시되지 않는지 SSR 출력으로 확인한다.
// 이미지 렌더링은 이 검사의 관심사가 아니며 프레임워크 Image만 간단한 img로 대체한다.
const sourceRoot = path.resolve(__dirname, '../../../..');
const cache = new Map();
function load(relative) {
  const filename = path.resolve(sourceRoot, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loaded = new Module(filename, module);
  cache.set(filename, loaded);
  loaded.filename = filename;
  loaded.paths = module.paths;
  const nativeRequire = loaded.require.bind(loaded);
  loaded.require = name => {
    if (name === 'next/image') return function TestImage(props) { return React.createElement('img', { src: props.src, alt: props.alt }); };
    // CSS 계산은 브라우저 QA에서 검증한다. SSR에서는 모듈 클래스 이름만 유지한다.
    if (name.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (name.startsWith('.')) {
      const target = path.resolve(path.dirname(filename), name);
      for (const suffix of ['.tsx', '.ts']) {
        if (fs.existsSync(target + suffix)) return load(path.relative(sourceRoot, target + suffix));
      }
    }
    return nativeRequire(name);
  };
  loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
  return loaded.exports;
}
const { MatchAnalysisTab } = load('components/MatchAnalysisTab.tsx');
const { MatchPerformanceTab } = load('components/MatchPerformanceTab.tsx');
const { MatchScoreboardTab } = load('components/MatchScoreboardTab.tsx');
const { MatchRoundsTab } = load('components/MatchRoundsTab.tsx');
const stats = { kills: 0, deaths: 0, assists: 0, averageCombatScore: 0, adr: 0, headshotPercentage: 0 };
const participant = (puuid, team) => ({ puuid, team, riotId: { gameName: puuid, tagLine: 'TEST' }, agent: 'Jett', agentId: 'jett', stats: { ...stats } });
const detail = { matchId: 'test', map: 'Ascent', mode: 'Competitive', startedAt: '2026-09-09T21:48:00Z', durationSeconds: 60, participants: [participant('viewer', 'attackers'), participant('opponent', 'defenders')], rounds: [] };
const summary = { matchId: 'test', map: 'Ascent', mapId: 'ascent', mode: 'Competitive', startedAt: detail.startedAt, result: 'win', agent: 'Jett', agentId: 'jett', team: 'attackers', score: { roundsWon: 1, roundsLost: 0 }, stats, primaryWeapon: { weaponId: 'vandal', displayName: 'Vandal' } };
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
const props = { matchDetail: detail, matchSummary: summary, viewerPuuid: 'viewer' };

let html = render(MatchScoreboardTab, props);
assert.match(html, /data-label="FK"[^>]*>—</);
assert.match(html, /data-label="FD"[^>]*>—</);
assert.match(html, /data-label="KDA"[^>]*>0\/0\/0</, 'known zero KDA stays zero');
assert.match(html, /role="table" tabindex="0"/, 'table remains keyboard scrollable');

html = render(MatchAnalysisTab, { ...props, viewerPuuid: 'missing' });
assert.match(html, /참가 기록이 없어/);
assert.doesNotMatch(html, /team-delta-list/, 'unknown viewer must never fall back to another team');
html = render(MatchAnalysisTab, props);
assert.match(html, /현재는 미제공/);
assert.doesNotMatch(html, />가한 피해</);
assert.doesNotMatch(html, />받은 피해</);
assert.match(html, /경제 기록 없음/);

const measured = structuredClone(detail);
measured.participants.forEach(player => Object.assign(player.stats, { firstKills: 0, firstDeaths: 0, damageDealt: 0, damageReceived: 0 }));
html = render(MatchScoreboardTab, { ...props, matchDetail: measured });
assert.match(html, /data-label="FK"[^>]*>0</);
assert.match(html, /data-label="FD"[^>]*>0</);
html = render(MatchAnalysisTab, { ...props, matchDetail: measured });
assert.match(html, />가한 피해</, 'complete recorded zero damage is a valid metric');
assert.match(html, />받은 피해</);
assert.doesNotMatch(html, /현재는 미제공/);
delete measured.participants[1].stats.damageDealt;
html = render(MatchAnalysisTab, { ...props, matchDetail: measured });
assert.doesNotMatch(html, />가한 피해</, 'partially missing team data must not produce partial totals');
assert.match(html, />받은 피해</);

html = render(MatchPerformanceTab, props);
assert.match(html, /상대별 교전 기록이 아직 제공되지/);
assert.match(html, /무기별 킬 기록이 아직 제공되지/);
assert.doesNotMatch(html, /KILLS|duel-matrix-card/, 'missing telemetry must not look like measured zero');
const zeroTelemetry = structuredClone(detail);
zeroTelemetry.participants[0].duels = [];
zeroTelemetry.participants[0].weaponKills = [];
html = render(MatchPerformanceTab, { ...props, matchDetail: zeroTelemetry });
assert.match(html, /0 KILLS/, 'explicit recorded zero kills remain zero');

const outcomeOnly = { ...detail, rounds: [{ roundNumber: 1, winningTeam: 'attackers', endType: '', scoreAfterRound: { attackers: 1, defenders: 0 } }] };
html = render(MatchRoundsTab, { ...props, matchDetail: outcomeOnly });
assert.match(html, /종료 원인 미제공/);
assert.doesNotMatch(html, /✦|제압/, 'unknown ending cause must not look like elimination');
assert.match(html, /이벤트 기록 없음/);
assert.match(html, /좌표 이벤트 기록 없음/);
assert.doesNotMatch(html, /round-map-plot|round-map-site/, 'missing coordinates must not show a fabricated map');
outcomeOnly.rounds[0].endType = 'Elimination';
html = render(MatchRoundsTab, { ...props, matchDetail: outcomeOnly });
assert.match(html, /✦ 제압/, 'recorded elimination retains its label');
outcomeOnly.rounds[0].killEvents = [{ killerPuuid: 'viewer', victimPuuid: 'opponent', weaponId: 'vandal', timeSeconds: 30, killerPos: { x: 0.2, y: 0.3 }, victimPoint: { x: 0.5, y: 0.7 } }];
html = render(MatchRoundsTab, { ...props, matchDetail: outcomeOnly });
assert.match(html, /round-map-plot/);
assert.match(html, /킬 위치: Jett viewer/, 'provided coordinates retain the existing plot');
assert.doesNotMatch(html, /좌표 이벤트 기록 없음/);

// 새 모달도 동일한 누락 규칙을 지키며, 개인 표본 지표를 다른 참가자에게 복사하지 않는다.
const { TrackerScoreboard } = load('features/tracker-profile/match-history/detail/TrackerScoreboard.tsx');
const trackerMatch = { id: 'test', map: 'Ascent', teamScore: 1, enemyScore: 0, score: 715, dd: 31, kast: 78.9 };
const trackerData = { summary, detail, viewerPuuid: 'viewer', notice: 'Mock test' };
function scoreboardCells(markup, name) {
  const row = [...markup.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].find(([value]) => value.includes(`title="${name}#TEST"`));
  assert.ok(row, `participant row exists: ${name}`);
  return [...row[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map(([, value]) => value.replace(/<[^>]+>/g, ''));
}
html = render(TrackerScoreboard, { match: trackerMatch, data: trackerData });
let viewerCells = scoreboardCells(html, 'viewer');
let opponentCells = scoreboardCells(html, 'opponent');
// Match Rank / PS / ACS / K / D / A / +/- / K/D / DDΔ / ADR / HS / KAST / FK / FD / MK
assert.deepEqual([viewerCells[0], viewerCells[1], viewerCells[8], viewerCells[11]], ['—', '715', '+31', '78.9%']);
assert.deepEqual([opponentCells[0], opponentCells[1], opponentCells[8], opponentCells[11]], ['—', '—', '—', '—']);
assert.deepEqual(viewerCells.slice(12), ['—', '—', '—'], 'missing FK/FD/MK stay unknown');
assert.deepEqual(viewerCells.slice(3, 6), ['0', '0', '0'], 'known zero K/D/A stays zero in the modal');

const trackerMeasured = structuredClone(detail);
trackerMeasured.participants.forEach(player => Object.assign(player.stats, { firstKills: 0, firstDeaths: 0, multiKills: 0 }));
html = render(TrackerScoreboard, { match: { ...trackerMatch, score: 0, dd: 0, kast: 0 }, data: { ...trackerData, detail: trackerMeasured } });
viewerCells = scoreboardCells(html, 'viewer');
assert.deepEqual([viewerCells[1], viewerCells[8], viewerCells[11]], ['0', '0', '0%'], 'provided zero PS/DDΔ/KAST remains visible');
assert.deepEqual(viewerCells.slice(12), ['0', '0', '0'], 'provided zero FK/FD/MK remains visible');
html = render(TrackerScoreboard, { match: trackerMatch, data: { ...trackerData, viewerPuuid: 'missing' } });
for (const name of ['viewer', 'opponent']) {
  const cells = scoreboardCells(html, name);
  assert.deepEqual([cells[1], cells[8], cells[11]], ['—', '—', '—'], 'missing viewer cannot lend personal indicators to another player');
}

const unsorted = structuredClone(detail);
unsorted.participants.push({ ...participant('ally-high', 'attackers'), stats: { ...stats, averageCombatScore: 300 } });
const originalOrder = JSON.stringify(unsorted);
Object.freeze(unsorted.participants);
html = render(TrackerScoreboard, { match: trackerMatch, data: { ...trackerData, detail: unsorted } });
assert.ok(html.indexOf('title="ally-high#TEST"') < html.indexOf('title="viewer#TEST"'), 'default ACS sort affects the displayed team');
assert.equal(JSON.stringify(unsorted), originalOrder, 'scoreboard sorting must not mutate the supplied participant order or data');
html = render(TrackerScoreboard, { match: trackerMatch, data: { ...trackerData, detail: null, reason: '상세 미제공 테스트' } });
assert.match(html, /상세 미제공 테스트/);
assert.doesNotMatch(html, /<table/, 'absent detail must not create a fabricated team table');

const { TrackerPerformance } = load('features/tracker-profile/match-history/detail/TrackerPerformance.tsx');
const { TrackerDuels } = load('features/tracker-profile/match-history/detail/TrackerDuels.tsx');
for (const Component of [TrackerPerformance, TrackerDuels]) {
  html = render(Component, { match: trackerMatch, data: { ...trackerData, viewerPuuid: 'missing' } });
  assert.match(html, /선택 선수의 참가 기록이 없어/);
  assert.doesNotMatch(html, /<table/, 'missing viewer must not display another participant performance or duels');
}
html = render(TrackerPerformance, { match: trackerMatch, data: trackerData });
assert.match(html, /이 선수의 상대별 교전 기록은 미제공/);
assert.match(html, /이 선수의 무기별 기록은 미제공/);
assert.match(html, /<dt>K\/D<\/dt><dd>0\.00<\/dd>/, 'zero deaths follows the same ratio display rule as the scoreboard');
assert.doesNotMatch(html, /기록된 교전 0건|기록된 무기 킬 0회/, 'absent distributions do not become recorded zeros');
const preciseStats = structuredClone(detail);
Object.assign(preciseStats.participants[0].stats, { adr: 143.1, averageCombatScore: 240.7, headshotPercentage: 32.4 });
html = render(TrackerPerformance, { match: trackerMatch, data: { ...trackerData, detail: preciseStats } });
assert.match(html, /<dt>ADR<\/dt><dd>143\.1<\/dd>/, 'provided ADR precision is not rounded away');
assert.match(html, /<dt>ACS<\/dt><dd>240\.7<\/dd>/);
assert.match(html, /<dt>HS%<\/dt><dd>32\.4%<\/dd>/);
assert.match(html, /<dt>KAST<\/dt><dd>78\.9%<\/dd>/);
html = render(TrackerDuels, { match: trackerMatch, data: trackerData });
assert.match(html, /<span>—<small>Kills<\/small>/);
assert.match(html, /<span>—<small>Deaths<\/small>/);
assert.match(html, /aria-label="교전 기록 미제공"/);

html = render(TrackerPerformance, { match: trackerMatch, data: { ...trackerData, detail: zeroTelemetry } });
assert.match(html, /기록된 교전 0건/);
assert.match(html, /기록된 무기 킬 0회/);
html = render(TrackerDuels, { match: trackerMatch, data: { ...trackerData, detail: zeroTelemetry } });
assert.match(html, /<span>0<small>Kills<\/small>/);
assert.match(html, /<span>0<small>Deaths<\/small>/);
assert.match(html, /aria-label="교전 기록 미제공"/, 'an empty distribution does not fabricate an opponent pair');

const knownPair = structuredClone(detail);
knownPair.participants[0].duels = [{ opponentPuuid: 'opponent', kills: 0, deaths: 0 }];
knownPair.participants[0].weaponKills = [{ weaponId: 'vandal', displayName: 'Vandal', kills: 0 }];
knownPair.participants.push(participant('ally-unknown', 'attackers'));
html = render(TrackerDuels, { match: trackerMatch, data: { ...trackerData, detail: knownPair } });
assert.match(html, /aria-label="viewer 대 opponent: 0킬, 0데스"/, 'provided zero pair is a measured record');
assert.equal((html.match(/aria-label="교전 기록 미제공"/g) ?? []).length, 1, 'another ally pair remains unknown');
assert.match(html, /<strong>1<span>\/ 2<\/span><\/strong>/, 'coverage counts provided pairs without pretending all combinations are known');
html = render(TrackerPerformance, { match: trackerMatch, data: { ...trackerData, detail: knownPair } });
assert.match(html, /Vandal/);
assert.doesNotMatch(html, /이 선수의 상대별 교전 기록은 미제공|이 선수의 무기별 기록은 미제공/);
assert.match(html, /<td class="kills">0<\/td>/, 'provided zero weapon and duel counts remain zero');

const sortableTelemetry = structuredClone(detail);
sortableTelemetry.participants[0].duels = [{ opponentPuuid: 'opponent', kills: 0, deaths: 0 }];
sortableTelemetry.participants[0].weaponKills = [
  { weaponId: 'vandal', displayName: 'Vandal', kills: 0 },
  { weaponId: 'phantom', displayName: 'Phantom', kills: 3 },
];
const originalTelemetry = JSON.stringify(sortableTelemetry);
Object.freeze(sortableTelemetry.participants[0].weaponKills);
Object.freeze(sortableTelemetry.participants[0].duels);
html = render(TrackerPerformance, { match: trackerMatch, data: { ...trackerData, detail: sortableTelemetry } });
assert.ok(html.indexOf('<span>Phantom</span>') < html.indexOf('<span>Vandal</span>'), 'provided weapon records are sorted for display');
assert.equal(JSON.stringify(sortableTelemetry), originalTelemetry, 'performance sorting must not mutate supplied distributions');
console.log('PASS: inline/modal missing viewer, unknown versus known zeros, viewer-only indicators, partial telemetry, immutable sorting, keyboard table');
