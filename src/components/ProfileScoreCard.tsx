import type { GameProbeProfileScore } from "../lib/score-gameprobe";
import type { MatchSummary, Player } from "../types";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface ProfileScoreCardProps {
  averageHeadshotPercentage: number | null;
  peakRank: string | null;
  player: Player;
  profileScore: GameProbeProfileScore | null;
  recentMatches: MatchSummary[];
}

function formatRiotId(player: Player): string {
  return `${player.riotId.gameName}#${player.riotId.tagLine}`;
}

function formatRatio(value: number): string {
  return value.toFixed(2);
}

function resultToken(result: string): string {
  if (result === "win") {
    return "W";
  }

  if (result === "loss") {
    return "L";
  }

  return "D";
}

export function ProfileScoreCard({
  averageHeadshotPercentage,
  peakRank,
  player,
  profileScore,
  recentMatches,
}: ProfileScoreCardProps) {
  const stats = player.statsSummary;
  const averageKd = stats.averageDeaths === 0
    ? stats.averageKills
    : stats.averageKills / stats.averageDeaths;

  return (
    <section className="profile-score-card" aria-labelledby="player-profile-heading">
      <div className="section-kicker">
        <p className="eyebrow">Player profile</p>
        <span className="data-badge">Demo Profile</span>
      </div>
      <div className="profile-score-hero">
        <div className="profile-score-title">
          <h1 id="player-profile-heading">{formatRiotId(player)}</h1>
          <p>
            현재 티어 {player.currentRank} · 최고 티어 {peakRank ?? "—"} · 벤치마크 준비 중
          </p>
        </div>
        <MatchScoreBadge label="GameProbe Preview Score" score={profileScore} />
      </div>

      <p className="score-explainer">
        Preview Score는 최근 경기의 경기별 Mock Score 산술평균입니다. Riot 공식
        점수나 실제 랭킹 지표가 아니며, 랭커 비교 벤치마크는 준비 중입니다.
      </p>

      <div className="profile-core-grid">
        <article>
          <span>기준</span>
          <strong className="profile-score-period">
            {profileScore ? `최근 ${profileScore.usedCount}경기` : "—"}
          </strong>
        </article>
        <article>
          <span>승률</span>
          <strong>{stats.winRate}%</strong>
          <em>{stats.matchesPlayed}경기 표본</em>
        </article>
        <article>
          <span>평균 ACS</span>
          <strong>{stats.averageCombatScore}</strong>
        </article>
        <article>
          <span>평균 K/D</span>
          <strong>{formatRatio(averageKd)}</strong>
        </article>
        <article>
          <span>평균 HS%</span>
          <strong>
            {averageHeadshotPercentage === null ? "—" : `${averageHeadshotPercentage}%`}
          </strong>
        </article>
      </div>

      <div className="recent-form" aria-label="최근 승패 흐름">
        {recentMatches.map((match) => (
          <span className={`form-token form-token-${match.result}`} key={match.matchId}>
            {resultToken(match.result)}
          </span>
        ))}
      </div>
    </section>
  );
}
