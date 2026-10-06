import Image from "next/image";
import { getAgentAssetPath, getAgentFullAssetPath, getTierAssetPath } from "../lib/asset-map";
import type { GameProbeProfileScore } from "../lib/score-gameprobe";
import type { Player, PlayerHeaderProfile } from "../types";
import type {
  CareerPeakRank,
  PreviousSeasonRank,
  RecentTwentySummary,
  SeasonSummary,
} from "../types/profile-overview";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface PlayerHeaderCardProps {
  careerPeakRank: CareerPeakRank;
  header: PlayerHeaderProfile;
  player: Player;
  previousSeasonRank: PreviousSeasonRank | null;
  profileScore: GameProbeProfileScore | null;
  recentTwenty: RecentTwentySummary;
  seasonSummary: SeasonSummary;
}

function formatRiotId(player: Player): string {
  return `${player.riotId.gameName}#${player.riotId.tagLine}`;
}

function formatRecord(wins: number, losses: number): string {
  return `${wins}승 ${losses}패`;
}

export function PlayerHeaderCard({
  careerPeakRank,
  header,
  player,
  previousSeasonRank,
  profileScore,
  recentTwenty,
  seasonSummary,
}: PlayerHeaderCardProps) {
  const kpis = [
    {
      label: "승률",
      value: `${seasonSummary.winRate}%`,
      detail: formatRecord(seasonSummary.wins, seasonSummary.losses),
    },
    { label: "K/D", value: seasonSummary.kd.toFixed(2), detail: seasonSummary.season },
    { label: "HS%", value: `${seasonSummary.headshotPercentage}%`, detail: "Headshot" },
    { label: "ACS", value: String(seasonSummary.acs), detail: `ADR ${seasonSummary.adr}` },
  ];

  return (
    <section className="player-hero-card" aria-labelledby="player-profile-heading">
      {/* Background Full Agent Illustration */}
      <div className="player-hero-bg-agent">
        <Image
          alt={`${formatRiotId(player)} 대표 요원 전신 이미지`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          src={getAgentFullAssetPath(header.avatarAgentId)}
          className="agent-hero-image-fit"
        />
      </div>

      <div className="player-hero-content">
        <div className="player-hero-primary">
          <div className="player-hero-identity">
            <div className="player-avatar-wrapper">
              <Image
                alt={`${formatRiotId(player)} 대표 요원 아바타`}
                height="72"
                src={getAgentAssetPath(header.avatarAgentId)}
                width="72"
              />
            </div>
            <div>
              <div className="section-kicker">
                <span className="badge-region">{header.region}</span>
              </div>
              <div className="player-name-wrapper">
                <h1 id="player-profile-heading">{formatRiotId(player)}</h1>
                <span className="mock-preview-badge" data-tooltip="Riot Production API 승인 전에 제공되는 데모 데이터 기반의 화면입니다">
                  Mock Preview
                </span>
              </div>
              <p className="player-title">{header.title}</p>
              <div className="player-hero-meta">
                <span className="level-badge">Lv. {header.level}</span>
              </div>
            </div>
          </div>

          <div className="player-hero-kpi-grid" aria-label="시즌 핵심 지표">
            {kpis.map((kpi) => (
              <article className="kpi-card" key={kpi.label}>
                <span className="kpi-label">{kpi.label}</span>
                <strong className="kpi-value">{kpi.value}</strong>
                <em className="kpi-detail">{kpi.detail}</em>
              </article>
            ))}
          </div>
        </div>

        <div className="player-hero-rank-panel" aria-label="티어 및 최근 폼 요약">
          <div className="player-hero-rank">
            <Image
              alt={`${header.currentTier} 티어 이미지`}
              height="64"
              src={getTierAssetPath(header.currentTier)}
              width="64"
            />
            <div>
              <span className="rank-label">현재 티어</span>
              <strong className="rank-name">{header.currentTier}</strong>
              <em className="rank-detail">{seasonSummary.rr} RR</em>
            </div>
          </div>

          <div className="player-hero-rank-context">
            <article>
              <span className="context-label">Career Peak</span>{" "}
              <strong className="context-value">{careerPeakRank.tier}</strong>{" "}
              <em className="context-detail">{careerPeakRank.season} · {careerPeakRank.rr} RR</em>
            </article>
            {previousSeasonRank ? (
              <article>
                <span className="context-label">Previous</span>{" "}
                <strong className="context-value">{previousSeasonRank.tier}</strong>{" "}
                <em className="context-detail">
                  {previousSeasonRank.season} · {formatRecord(previousSeasonRank.wins, previousSeasonRank.losses)}
                </em>
              </article>
            ) : null}
          </div>

          <div className="player-hero-form">
            <span className="form-label">최근 {recentTwenty.sampleLabel}</span>
            <strong className="form-value">{recentTwenty.winRate}% WR · {recentTwenty.kast}% KAST</strong>
            <em className="form-detail">{formatRecord(recentTwenty.wins, recentTwenty.losses)} · Round WR {recentTwenty.roundWinRate}%</em>
          </div>

          <div className="player-hero-score-wrapper">
            <MatchScoreBadge label="GameProbe Preview Score" score={profileScore} />
            <p className="player-hero-preview-note">Riot 공식 점수가 아닌 GameProbe Preview입니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
