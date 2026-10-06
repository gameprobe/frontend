import Image from "next/image";
import { getAgentAssetPath } from "../lib/asset-map";
import type { MatchDetail, MatchParticipant, MatchSummary, ValorantTeam } from "../types";

interface MatchScoreboardTabProps {
  matchDetail: MatchDetail;
  matchSummary: MatchSummary;
  viewerPuuid: string;
}

function formatRiotId(participant: MatchParticipant): string {
  return `${participant.riotId.gameName}#${participant.riotId.tagLine}`;
}

function formatKd(participant: MatchParticipant): string {
  if (participant.stats.deaths === 0) {
    return participant.stats.kills.toFixed(2);
  }

  return (participant.stats.kills / participant.stats.deaths).toFixed(2);
}

function teamLabel(team: ValorantTeam, viewerTeam: ValorantTeam): string {
  return team === viewerTeam ? "우리 팀" : "상대 팀";
}

function resultLabel(team: ValorantTeam, winningTeam: ValorantTeam): string {
  return team === winningTeam ? "승리" : "패배";
}

function teamScoreLine(team: ValorantTeam, matchSummary: MatchSummary): string {
  if (team === matchSummary.team) {
    return `${matchSummary.score.roundsWon}-${matchSummary.score.roundsLost}`;
  }

  return `${matchSummary.score.roundsLost}-${matchSummary.score.roundsWon}`;
}

function teamResultClass(team: ValorantTeam, winningTeam: ValorantTeam): string {
  return team === winningTeam ? "scoreboard-team-win" : "scoreboard-team-loss";
}

function sortedTeamParticipants(
  participants: MatchParticipant[],
  team: ValorantTeam,
): MatchParticipant[] {
  return participants
    .filter((participant) => participant.team === team)
    .sort((left, right) => right.stats.averageCombatScore - left.stats.averageCombatScore);
}

function teamTotals(participants: MatchParticipant[]) {
  const totals = participants.reduce(
    (accumulator, participant) => ({
      assists: accumulator.assists + participant.stats.assists,
      deaths: accumulator.deaths + participant.stats.deaths,
      kills: accumulator.kills + participant.stats.kills,
      totalAcs: accumulator.totalAcs + participant.stats.averageCombatScore,
    }),
    { assists: 0, deaths: 0, kills: 0, totalAcs: 0 },
  );

  return {
    ...totals,
    averageAcs: participants.length > 0 ? Math.round(totals.totalAcs / participants.length) : 0,
  };
}

function TeamScoreboard({
  matchSummary,
  participants,
  team,
  viewerPuuid,
  viewerTeam,
  winningTeam,
}: {
  matchSummary: MatchSummary;
  participants: MatchParticipant[];
  team: ValorantTeam;
  viewerPuuid: string;
  viewerTeam: ValorantTeam;
  winningTeam: ValorantTeam;
}) {
  const totals = teamTotals(participants);
  const isMyTeam = team === viewerTeam;
  const teamClass = isMyTeam ? "scoreboard-team-blue" : "scoreboard-team-red";
  const mvpParticipant = participants.reduce<MatchParticipant | null>(
    (currentMvp, participant) => (
      currentMvp === null ||
      participant.stats.averageCombatScore > currentMvp.stats.averageCombatScore
        ? participant
        : currentMvp
    ),
    null,
  );

  return (
    <section className={`scoreboard-team ${teamClass}`}>
      <div className="scoreboard-team-header">
        <div>
          <span className="match-tab-section-label">Team scoreboard</span>
          <h4>{teamLabel(team, viewerTeam)}</h4>
          <p>
            {teamScoreLine(team, matchSummary)} · K/D/A {totals.kills}/{totals.deaths}/{totals.assists} ·
            평균 ACS {totals.averageAcs}
          </p>
        </div>
        <span className={teamResultClass(team, winningTeam)}>
          {resultLabel(team, winningTeam)}
        </span>
      </div>

      <div className="scoreboard-table" role="table" tabIndex={0} aria-label={`${teamLabel(team, viewerTeam)} 스코어보드`}>
        <div className="scoreboard-row scoreboard-heading" role="row">
          <span role="columnheader">플레이어</span>
          <span role="columnheader">K / D / A</span>
          <span role="columnheader">ACS</span>
          <span role="columnheader">FK</span>
          <span role="columnheader">FD</span>
          <span role="columnheader">K/D Ratio</span>
          <span role="columnheader">ADR</span>
          <span role="columnheader">HS%</span>
        </div>
        {participants.map((participant) => {
          const isViewer = participant.puuid === viewerPuuid;
          const isMvp = participant.puuid === mvpParticipant?.puuid;

          return (
            <div
              className={isViewer ? "scoreboard-row scoreboard-row-viewer" : "scoreboard-row"}
              key={participant.puuid}
              role="row"
            >
              <span className="scoreboard-player" role="cell">
                <Image
                  src={getAgentAssetPath(participant.agentId)}
                  alt={`${participant.agent} 요원 이미지`}
                  width="28"
                  height="28"
                />
                <span className="scoreboard-player-name">{formatRiotId(participant)}</span>
                {isMvp ? <span className="scoreboard-mvp-badge">MVP</span> : null}
                {isViewer ? <span className="you-badge">YOU</span> : null}
              </span>
              <span data-label="KDA" role="cell">
                {participant.stats.kills}/{participant.stats.deaths}/
                {participant.stats.assists}
              </span>
              <span className="scoreboard-primary-metric" data-label="ACS" role="cell">
                {participant.stats.averageCombatScore}
              </span>
              {/* 현재 Mock/API에서 받지 않은 지표는 실제 0회와 구분한다. */}
              <span className="scoreboard-first-kill" data-label="FK" role="cell" title={participant.stats.firstKills == null ? "첫 킬 기록 미제공" : undefined}>
                {participant.stats.firstKills ?? "—"}
              </span>
              <span className="scoreboard-first-death" data-label="FD" role="cell" title={participant.stats.firstDeaths == null ? "첫 데스 기록 미제공" : undefined}>
                {participant.stats.firstDeaths ?? "—"}
              </span>
              <span data-label="K/D Ratio" role="cell">{formatKd(participant)}</span>
              <span data-label="ADR" role="cell">{participant.stats.adr}</span>
              <span data-label="HS%" role="cell">{participant.stats.headshotPercentage}%</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MatchScoreboardTab({
  matchDetail,
  matchSummary,
  viewerPuuid,
}: MatchScoreboardTabProps) {
  const winningTeam = matchSummary.result === "win"
    ? matchSummary.team
    : matchDetail.participants.find((participant) => participant.team !== matchSummary.team)?.team ??
      matchSummary.team;
  const opponentTeams = matchDetail.participants
    .map((participant) => participant.team)
    .filter((team, index, teamsInMatch) => (
      team !== matchSummary.team && teamsInMatch.indexOf(team) === index
    ));
  const teams = [matchSummary.team, ...opponentTeams];

  return (
    <div className="scoreboard-layout">
      {teams.map((team) => (
        <TeamScoreboard
          key={team}
          matchSummary={matchSummary}
          participants={sortedTeamParticipants(matchDetail.participants, team)}
          team={team}
          viewerPuuid={viewerPuuid}
          viewerTeam={matchSummary.team}
          winningTeam={winningTeam}
        />
      ))}
    </div>
  );
}
