import type { CombatStats, MatchDetail, MatchParticipant, MatchRound, MatchSummary } from "../../../../types";
import { matches } from "../../mock";
import { detailStartedAt, validateMatchDetail, type DetailMatchInput, type DetailViewer, type LegacyMatchDetailData as MatchDetailData } from "./detailData";

const notice = "현재 경기 요약에 맞춰 구성한 Mock 표본입니다. 참가자·라운드 순서·무기/교전 분포는 실제 기록이 아닙니다.";
const teamModes = ["Competitive", "Premier", "Unrated", "Swiftplay"];
const fields: (keyof DetailMatchInput)[] = ["id", "date", "time", "agent", "map", "mode", "kills", "deaths", "assists", "teamScore", "enemyScore", "adr", "acs", "hs", "duration", "weapon"];
const slug = (value: string) => typeof value === "string" ? value.toLowerCase().replaceAll(" ", "-") : "";

function seedFor(id: string) {
  let seed = 2166136261;
  for (const character of id) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  return seed;
}

function randomFor(id: string) {
  let state = seedFor(id);
  return (max: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % max;
  };
}

function spread(total: number, next: (max: number) => number): number[] {
  const result = [0, 0, 0, 0, 0];
  const start = next(5);
  for (let index = 0; index < total; index += 1) result[(index + start) % 5] += 1;
  return result;
}

function summaryFor(match: DetailMatchInput): MatchSummary {
  return {
    matchId: match.id, map: match.map, mapId: slug(match.map), mode: match.mode,
    startedAt: detailStartedAt(match), result: match.teamScore > match.enemyScore ? "win" : match.teamScore < match.enemyScore ? "loss" : "draw",
    agent: match.agent, agentId: slug(match.agent), team: "",
    score: { roundsWon: match.teamScore, roundsLost: match.enemyScore },
    stats: { kills: match.kills, deaths: match.deaths, assists: match.assists,
      averageCombatScore: match.acs, adr: match.adr, headshotPercentage: match.hs },
    primaryWeapon: { weaponId: slug(match.weapon), displayName: match.weapon },
  };
}

function roundsFor(match: DetailMatchInput, next: (max: number) => number): MatchRound[] {
  const winner = match.teamScore > match.enemyScore ? "attackers" : "defenders";
  const winScore = Math.max(match.teamScore, match.enemyScore), lossScore = Math.min(match.teamScore, match.enemyScore);
  const target = match.mode === "Swiftplay" ? 5 : 13;
  // 마지막 승리 이전에 종료 점수를 먼저 채우지 않는다. 기존 14:12는 12:12 뒤 연장 두 승리다.
  const overtime = winScore > target;
  const endingWins = overtime ? winScore - (target - 1) : 1;
  const sequence: string[] = [
    ...Array.from({ length: winScore - endingWins }, () => winner),
    ...Array.from({ length: lossScore }, () => winner === "attackers" ? "defenders" : "attackers"),
  ];
  for (let index = sequence.length - 1; index > 0; index -= 1) {
    const other = next(index + 1);
    [sequence[index], sequence[other]] = [sequence[other], sequence[index]];
  }
  sequence.push(...Array.from({ length: endingWins }, () => winner));
  let attackers = 0, defenders = 0;
  return sequence.map((winningTeam, index) => {
    if (winningTeam === "attackers") attackers += 1;
    else defenders += 1;
    // 종료 원인·킬 이벤트·좌표·경제는 제공하지 않는다. 빈 종료 원인은 기존 UI의 기록 없음이다.
    return { roundNumber: index + 1, winningTeam, endType: "", scoreAfterRound: { attackers, defenders } };
  });
}

// M04 전용 결정적 공급자. 원본 목록/구형 JSON을 수정하거나 다른 경기의 상세를 재매핑하지 않는다.
export function getMockMatchDetail(match: DetailMatchInput, viewer: DetailViewer): MatchDetailData {
  const summary = summaryFor(match);
  const missing = (reason: string): MatchDetailData => ({ summary, detail: null, viewerPuuid: viewer.puuid, notice, reason });
  const original = matches.find(candidate => candidate.id === match.id);
  if (!original) return missing("이 경기 ID에 연결된 상세 Mock이 없습니다.");
  if (fields.some(field => original[field] !== match[field])) return missing("현재 경기 요약과 상세 Mock의 기준 정보가 일치하지 않습니다.");
  if (!viewer.puuid || !viewer.gameName || !viewer.tagLine) return missing("선택 선수 정보가 없어 상세를 연결할 수 없습니다.");
  if (match.mode === "Deathmatch") return missing("데스매치는 팀·라운드형 상세를 제공하지 않습니다. 선택 경기의 개인 요약을 확인할 수 있습니다.");
  if (!teamModes.includes(match.mode)) return missing("이 모드의 상세 Mock은 제공하지 않습니다.");
  if (![match.kills, match.deaths, match.assists, match.teamScore, match.enemyScore].every(value => Number.isSafeInteger(value) && value >= 0)
    || match.teamScore === match.enemyScore || match.duration <= 0) return missing("현재 기록으로 일관된 상세 표본을 구성할 수 없습니다.");
  const next = randomFor(match.id);
  const rounds = match.teamScore + match.enemyScore;
  const sampleStats = (kills: number, deaths: number): CombatStats => ({ kills, deaths,
    assists: next(Math.max(1, Math.min(rounds, 12))), averageCombatScore: 120 + next(201), adr: 80 + next(141), headshotPercentage: 12 + next(30) });
  // 요원 선택은 미제공이다. 기존 placeholder를 사용하며 실제 팀의 요원 조합을 꾸며내지 않는다.
  const sample = (team: string, index: number, stats: CombatStats): MatchParticipant => ({
    puuid: `detail:${match.id}:${team}:${index}`, riotId: { gameName: `Mock ${team === "attackers" ? "Ally" : "Opponent"} ${index + 1}`, tagLine: "MOCK" },
    team, agent: "표본 요원", agentId: "mock-unknown", stats,
  });
  const allies = Array.from({ length: 4 }, (_, index) => sample("attackers", index,
    sampleStats(3 + next(Math.max(1, rounds - 4)), 1 + next(rounds))));
  const duelKills = spread(match.kills, next), duelDeaths = spread(match.deaths, next);
  const allyKills = spread(allies.reduce((total, player) => total + player.stats.kills, 0), next);
  const allyDeaths = spread(allies.reduce((total, player) => total + player.stats.deaths, 0), next);
  const opponents = Array.from({ length: 5 }, (_, index) => sample("defenders", index,
    sampleStats(duelDeaths[index] + allyDeaths[index], duelKills[index] + allyKills[index])));
  if ([...allies, ...opponents].some(player => player.puuid === viewer.puuid)) return missing("선택 선수 식별자가 표본 참가자와 중복됩니다.");
  const primaryKills = Math.ceil(match.kills * 0.7), remainingKills = match.kills - primaryKills;
  const alternate = match.weapon === "Phantom" ? "Vandal" : "Phantom";
  const selected: MatchParticipant = {
    puuid: viewer.puuid, riotId: { gameName: viewer.gameName, tagLine: viewer.tagLine },
    team: "attackers", agent: match.agent, agentId: slug(match.agent), stats: { ...summary.stats },
    weaponKills: [
      { weaponId: slug(match.weapon), displayName: match.weapon, kills: primaryKills },
      { weaponId: slug(alternate), displayName: alternate, kills: remainingKills },
    ].filter(weapon => weapon.kills > 0),
    duels: opponents.map((opponent, index) => ({ opponentPuuid: opponent.puuid, kills: duelKills[index], deaths: duelDeaths[index] })),
  };
  const detail: MatchDetail = { matchId: match.id, map: match.map, mode: match.mode,
    startedAt: detailStartedAt(match), durationSeconds: match.duration * 60,
    participants: [selected, ...allies, ...opponents], rounds: roundsFor(match, next) };
  const result: MatchDetailData = { summary: { ...summary, team: "attackers" }, detail, viewerPuuid: viewer.puuid, notice };
  const error = validateMatchDetail(match, viewer, result);
  return error ? missing(error) : result;
}
