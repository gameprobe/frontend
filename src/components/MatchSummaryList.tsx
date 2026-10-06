"use client";

import Image from "next/image";
import { useState } from "react";
import { getAgentAssetPath, getMapAssetPath } from "../lib/asset-map";
import {
  deriveMatchHighlightTags,
  getDdDeltaPerRoundForInsight,
  getMatchInsight,
  groupMatchesByDate,
  matchDdDeltaTone,
} from "../lib/match-insights";
import { getMatchDetail } from "../lib/mock-data";
import { computeMatchSummaryScore } from "../lib/score-gameprobe";
import type { MatchDetail, MatchSummary } from "../types";
import type { MatchHighlightTag, MatchInsight } from "../types/match-insight";
import { MatchDetailPanel } from "./MatchDetailPanel";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface MatchSummaryListProps {
  matches: MatchSummary[];
  viewerPuuid: string;
}

function formatResult(result: string): string {
  if (result === "win") {
    return "승리";
  }

  if (result === "loss") {
    return "패배";
  }

  if (result === "draw") {
    return "무승부";
  }

  return result;
}

function formatStartedAt(startedAt: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeStyle: "short",
  }).format(new Date(startedAt));
}

function formatNumber(value: number | null, digits = 0): string {
  if (value === null) {
    return "—";
  }

  return value.toFixed(digits);
}

function formatPercent(value: number | null, digits = 0): string {
  if (value === null) {
    return "—";
  }

  return `${value.toFixed(digits)}%`;
}

function formatKdRatio(match: MatchSummary): string {
  if (match.stats.deaths === 0) {
    return match.stats.kills.toFixed(2);
  }

  return (match.stats.kills / match.stats.deaths).toFixed(2);
}

function formatDdDelta(value: number | null): string {
  if (value === null) {
    return "—";
  }

  const rounded = Math.round(value);

  if (rounded > 0) {
    return `+${rounded}`;
  }

  return String(rounded);
}

function formatTierChange(insight: MatchInsight | null): string {
  const change = insight?.tierChange;

  if (!change) {
    return "—";
  }

  const rr = typeof change.rrDelta === "number"
    ? `${change.rrDelta > 0 ? "+" : ""}${change.rrDelta}RR`
    : "";

  if (change.from && change.to && change.from !== change.to) {
    return `${change.from} → ${change.to}${rr ? ` · ${rr}` : ""}`;
  }

  return rr || "—";
}

function MapIcon({ mapId, mapName }: { mapId: string; mapName: string }) {
  return (
    <span className="match-map-icon-wrapper" aria-hidden="true">
      <Image
        src={getMapAssetPath(mapId)}
        alt={`${mapName} 맵 이미지`}
        width="48"
        height="27"
        className="match-map-icon"
      />
    </span>
  );
}

function MatchHighlightTags({ tags }: { tags: MatchHighlightTag[] }) {
  if (tags.length === 0) {
    return <span className="match-highlight-empty">—</span>;
  }

  const visibleTags = tags.slice(0, 3);
  const hiddenCount = tags.length - visibleTags.length;

  return (
    <div className="match-highlight-tags" aria-label="경기 하이라이트 태그">
      {visibleTags.map((tag) => (
        <span
          className={`match-highlight-tag match-highlight-tag-${tag.kind}`}
          key={`${tag.code}-${tag.label}`}
          title={`${tag.source === "mock" ? "경기 이벤트 근거" : "파생 지표"}: ${tag.evidence}`}
        >
          {tag.label}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="match-highlight-more">+{hiddenCount}</span>
      ) : null}
    </div>
  );
}

function MatchStatPill({
  label,
  title,
  tone,
  value,
}: {
  label: string;
  title?: string;
  tone?: string;
  value: string;
}) {
  return (
    <span className={`match-stat-pill${tone ? ` ${tone}` : ""}`} title={title}>
      <em>{label}</em>
      <strong>{value}</strong>
    </span>
  );
}

function TeamAgentSummary({ matchDetail }: { matchDetail: MatchDetail | null }) {
  if (!matchDetail) {
    return null;
  }

  const teams = matchDetail.participants.reduce<Record<string, typeof matchDetail.participants>>(
    (grouped, participant) => {
      return {
        ...grouped,
        [participant.team]: [...(grouped[participant.team] ?? []), participant],
      };
    },
    {},
  );

  return (
    <div className="match-agent-summary" aria-label="양 팀 요원 요약">
      {Object.entries(teams).map(([team, participants]) => (
        <div key={team}>
          {participants.map((participant) => (
            <Image
              alt={`${participant.agent} 요원 이미지`}
              key={participant.puuid}
              src={getAgentAssetPath(participant.agentId)}
              width="22"
              height="22"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function MatchCardRow({
  match,
  viewerPuuid,
  isExpanded,
  onToggle,
}: {
  match: MatchSummary;
  viewerPuuid: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const matchDetail = getMatchDetail(match.matchId);
  const matchScore = computeMatchSummaryScore(match);
  const insight = getMatchInsight(match.matchId);
  const ddDeltaPerRound = getDdDeltaPerRoundForInsight(insight);
  const ddTone = matchDdDeltaTone(ddDeltaPerRound);
  const highlightTags = deriveMatchHighlightTags(match, insight, viewerPuuid);
  const scoreLine = `${match.score.roundsWon}-${match.score.roundsLost}`;

  const isActive = isHovered || isExpanded;

  return (
    <article
      className={isExpanded ? "match-card-shell match-card-shell-expanded" : "match-card-shell"}
      key={match.matchId}
    >
      <button
        aria-controls={`match-detail-${match.matchId}`}
        aria-expanded={isExpanded}
        className={`match-card match-card-toggle ${isActive ? "is-active" : ""}`}
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        type="button"
      >
        <span className={`match-result-strip match-result-strip-${match.result}`} />

        {/* 1단: 기본 정보 (높이 70~80px 타겟) */}
        <div className="match-card-basic">
          <div className="match-card-outcome">
            <span className={`match-result match-result-${match.result}`}>
              {formatResult(match.result)}
            </span>
            <strong>{scoreLine}</strong>
            <em>{formatStartedAt(match.startedAt)}</em>
          </div>

          <div className="match-card-main">
            <div className="match-card-header">
              <span>{match.mode}</span>
              <span>{match.primaryWeapon.displayName}</span>
            </div>

            <div className="match-card-title">
              <Image
                src={getAgentAssetPath(match.agentId)}
                alt={`${match.agent} 요원 이미지`}
                width="32"
                height="32"
              />
              <div>
                <h3>{match.agent}</h3>
                <p>
                  <MapIcon mapId={match.mapId} mapName={match.map} />
                  {match.map}
                </p>
              </div>
            </div>
          </div>

          <div className="match-basic-stats" aria-label="기본 경기 요약 통계">
            <MatchStatPill
              label="K/D/A"
              tone="match-stat-pill-primary"
              value={`${match.stats.kills}/${match.stats.deaths}/${match.stats.assists}`}
            />
            <MatchStatPill label="K/D" value={formatKdRatio(match)} />
          </div>

          <div className="match-highlight-column">
            <MatchHighlightTags tags={highlightTags} />
          </div>

          <span className="match-expand-arrow" aria-hidden="true">
            ⌄
          </span>
        </div>

        {/* 2단: 추가 정보 (ACS, ADR, KAST, DDΔ/R, HS%, Preview Score, 10인 요원 아이콘) */}
        <div className="match-card-extra" aria-label="추가 경기 통계">
          <div className="match-extra-stats">
            <MatchStatPill label="ACS" value={String(match.stats.averageCombatScore)} />
            <MatchStatPill label="ADR" value={String(match.stats.adr)} />
            <MatchStatPill label="KAST" value={formatPercent(insight?.kast ?? null)} />
            <MatchStatPill
              label="DDΔ/R"
              title="DDΔ/R = (가한 피해량 - 받은 피해량) ÷ 플레이 라운드. 경기 데이터 집계 값입니다."
              tone={`dd-delta dd-delta-${ddTone}`}
              value={formatDdDelta(ddDeltaPerRound)}
            />
            <MatchStatPill label="HS%" value={`${match.stats.headshotPercentage}%`} />
            <MatchStatPill label="티어" tone="match-stat-pill-wide" value={formatTierChange(insight)} />
          </div>

          <div className="match-extra-score">
            <MatchScoreBadge label="Preview Score" score={matchScore} />
            <TeamAgentSummary matchDetail={matchDetail} />
          </div>
        </div>
      </button>

      <div
        className="match-detail-collapse"
        id={`match-detail-${match.matchId}`}
      >
        <div className="match-detail-collapse-inner">
          {isExpanded ? (
            <MatchDetailPanel
              matchDetail={matchDetail}
              matchSummary={match}
              viewerPuuid={viewerPuuid}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function MatchSummaryList({ matches, viewerPuuid }: MatchSummaryListProps) {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  if (matches.length === 0) {
    return <p>최근 경기 없음</p>;
  }

  const dailyGroups = groupMatchesByDate(matches);

  return (
    <div className="match-card-list" aria-label="날짜별 최근 전적">
      {dailyGroups.map((group) => (
        <section className="daily-match-group" key={group.dateKey}>
          <header className="daily-match-header">
            <div>
              <span className="daily-match-date">{group.dateLabel}</span>
              <strong>
                {group.count}경기 · {group.wins}승 {group.losses}패
              </strong>
            </div>
            <dl className="daily-match-metrics" aria-label="날짜별 요약 통계">
              <div>
                <dt>평균 K/D</dt>
                <dd>{formatNumber(group.avgKd, 2)}</dd>
              </div>
              <div>
                <dt>평균 DDΔ/R</dt>
                <dd className={`dd-delta dd-delta-${matchDdDeltaTone(group.avgDdDeltaPerRound)}`}>
                  {formatDdDelta(group.avgDdDeltaPerRound)}
                </dd>
              </div>
              <div>
                <dt>평균 HS%</dt>
                <dd>{formatPercent(group.avgHeadshotPercentage)}</dd>
              </div>
              <div>
                <dt>평균 ACS</dt>
                <dd>{formatNumber(group.avgAcs)}</dd>
              </div>
            </dl>
          </header>

          <div className="daily-match-rows">
            {group.matches.map((match) => (
              <MatchCardRow
                key={match.matchId}
                match={match}
                viewerPuuid={viewerPuuid}
                isExpanded={expandedMatchId === match.matchId}
                onToggle={() => setExpandedMatchId(expandedMatchId === match.matchId ? null : match.matchId)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
