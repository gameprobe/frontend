import type { MatchDetail, MatchSummary } from "../../../../types";
import type { SyntheticMatchDetailData } from "../../data/matchDetail";

// M04 상세 공급 경계. 현재 목록이 가진 값만 요구하며 실제 Riot API 계약이 아니다.
export interface DetailMatchInput {
  id: string; date: string; time: string; agent: string; map: string; mode: string;
  kills: number; deaths: number; assists: number; teamScore: number; enemyScore: number;
  adr: number; acs: number; hs: number; duration: number; weapon: string;
}

export interface DetailViewer { puuid: string; gameName: string; tagLine: string }

export interface LegacyMatchDetailData {
  source?: "legacy";
  summary: MatchSummary;
  detail: MatchDetail | null;
  viewerPuuid: string;
  notice: string;
  reason?: string;
}

export type MatchDetailData = LegacyMatchDetailData | SyntheticMatchDetailData;

// 목록의 날짜/시각을 결정적으로 보관하기 위한 표본 UTC 직렬화다. 실제 지역 시각 변환이 아니다.
export const detailStartedAt = (match: DetailMatchInput) => `${match.date}T${match.time}:00.000Z`;
const integer = (value: number) => Number.isSafeInteger(value) && value >= 0;
const finite = (value: number) => Number.isFinite(value) && value >= 0;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const slug = (value: string) => typeof value === "string" ? value.toLowerCase().replaceAll(" ", "-") : "";

// 공급자와 화면 연결이 같은 경기·선수를 유지하는지 검사한다. 누락은 0으로 보정하지 않는다.
export function validateMatchDetail(match: DetailMatchInput, viewer: DetailViewer, data: LegacyMatchDetailData): string | null {
  const { summary, detail } = data;
  if (!summary || !summary.stats || !summary.score || !summary.primaryWeapon) return "경기 요약 정보가 없습니다.";
  if (typeof data.notice !== "string" || !data.notice.trim()) return "상세 표본 안내가 없습니다.";
  if (data.viewerPuuid !== viewer.puuid || !viewer.puuid || !viewer.gameName || !viewer.tagLine) return "선택 선수 정보가 일치하지 않습니다.";
  if (summary.matchId !== match.id || summary.map !== match.map || summary.mapId !== slug(match.map) || summary.mode !== match.mode
    || summary.startedAt !== detailStartedAt(match) || summary.agent !== match.agent || summary.agentId !== slug(match.agent)
    || summary.score.roundsWon !== match.teamScore || summary.score.roundsLost !== match.enemyScore
    || summary.primaryWeapon.displayName !== match.weapon || summary.primaryWeapon.weaponId !== slug(match.weapon)
    || summary.result !== (match.teamScore > match.enemyScore ? "win" : match.teamScore < match.enemyScore ? "loss" : "draw")) return "선택 경기와 상세 요약이 일치하지 않습니다.";
  const expected = { kills: match.kills, deaths: match.deaths, assists: match.assists,
    averageCombatScore: match.acs, adr: match.adr, headshotPercentage: match.hs };
  if (Object.entries(expected).some(([key, value]) => !finite(value) || summary.stats[key as keyof typeof expected] !== value)) return "선택 경기의 개인 기록이 일치하지 않습니다.";
  if (!detail) return summary.team === "" && !!data.reason ? null : "미제공 상세에 팀 정보 또는 누락 안내가 잘못 연결되었습니다.";
  if (match.mode === "Deathmatch") return "데스매치에는 팀·라운드형 상세를 연결할 수 없습니다.";
  if (!["Competitive", "Premier", "Unrated", "Swiftplay"].includes(match.mode)) return "이 모드의 상세 표본은 제공하지 않습니다.";
  if (detail.matchId !== match.id || detail.map !== match.map || detail.mode !== match.mode
    || detail.startedAt !== summary.startedAt || detail.durationSeconds !== match.duration * 60) return "경기 식별자·시각·시간이 목록과 일치하지 않습니다.";
  if (!Array.isArray(detail.participants) || detail.participants.length !== 10) return "10명 참가자 정보가 없습니다.";
  const participants = detail.participants;
  if (participants.some(player => !player || !player.stats || !player.riotId)) return "참가자 정보가 누락되었습니다.";
  if (new Set(participants.map(player => player.puuid)).size !== 10) return "참가자 식별자가 중복되었습니다.";
  const selected = participants.find(player => player.puuid === viewer.puuid);
  if (!selected || selected.team !== summary.team || selected.agent !== match.agent || selected.agentId !== summary.agentId
    || selected.riotId.gameName !== viewer.gameName || selected.riotId.tagLine !== viewer.tagLine
    || Object.entries(expected).some(([key, value]) => selected.stats[key as keyof typeof expected] !== value)) return "선택 선수의 참가자·팀·개인 기록이 일치하지 않습니다.";
  if (summary.team !== "attackers" || participants.some(player => !["attackers", "defenders"].includes(player.team))) return "표본 팀 구성이 일치하지 않습니다.";
  const allies = participants.filter(player => player.team === summary.team);
  const opponents = participants.filter(player => player.team !== summary.team);
  if (allies.length !== 5 || opponents.length !== 5) return "양 팀의 참가자 수가 일치하지 않습니다.";
  if (participants.some(player => ![player.stats.kills, player.stats.deaths, player.stats.assists].every(integer)
    || ![player.stats.averageCombatScore, player.stats.adr, player.stats.headshotPercentage].every(finite)
    || player.stats.headshotPercentage > 100)) return "참가자 기록에 유효하지 않은 수치가 있습니다.";
  for (const [team, enemy] of [[allies, opponents], [opponents, allies]]) {
    if (sum(team.map(player => player.stats.kills)) !== sum(enemy.map(player => player.stats.deaths))) return "양 팀 킬·데스 합계가 맞지 않습니다.";
  }
  // 분포가 제공된 경우에만 합계를 검사한다. 누락된 분포 자체는 허용한다.
  for (const player of participants) {
    if (player.weaponKills && (!Array.isArray(player.weaponKills)
      || player.weaponKills.some(weapon => !weapon || !integer(weapon.kills))
      || sum(player.weaponKills.map(weapon => weapon.kills)) !== player.stats.kills)) return "무기별 킬 합계가 개인 기록과 맞지 않습니다.";
    if (player.duels) {
      if (!Array.isArray(player.duels) || player.duels.some(duel => !duel)
        || new Set(player.duels.map(duel => duel.opponentPuuid)).size !== player.duels.length) return "교전 상대 정보가 중복되거나 잘못되었습니다.";
      for (const duel of player.duels) {
        const opponent = participants.find(candidate => candidate.puuid === duel.opponentPuuid);
        if (!opponent || opponent.team === player.team || !integer(duel.kills) || !integer(duel.deaths)
          || duel.kills > opponent.stats.deaths || duel.deaths > opponent.stats.kills) return "교전 상대·수치가 참가자 기록과 맞지 않습니다.";
      }
      if (sum(player.duels.map(duel => duel.kills)) !== player.stats.kills
        || sum(player.duels.map(duel => duel.deaths)) !== player.stats.deaths) return "교전 킬·데스 합계가 개인 기록과 맞지 않습니다.";
    }
  }
  if (!Array.isArray(detail.rounds) || detail.rounds.length !== match.teamScore + match.enemyScore) return "라운드 수가 최종 점수와 맞지 않습니다.";
  let attackers = 0, defenders = 0;
  for (let index = 0; index < detail.rounds.length; index += 1) {
    const round = detail.rounds[index];
    if (!round || !round.scoreAfterRound || round.roundNumber !== index + 1) return "라운드 순서·점수가 누락되었습니다.";
    if (round.winningTeam === "attackers") attackers += 1;
    else if (round.winningTeam === "defenders") defenders += 1;
    else return "라운드 승리 팀이 일치하지 않습니다.";
    if (round.scoreAfterRound.attackers !== attackers || round.scoreAfterRound.defenders !== defenders) return "라운드 누적 점수가 맞지 않습니다.";
  }
  return attackers === match.teamScore && defenders === match.enemyScore ? null : "라운드 최종 점수가 목록과 맞지 않습니다.";
}
