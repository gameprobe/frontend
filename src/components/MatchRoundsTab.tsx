"use client";

import { useState } from "react";
import { MatchRoundMapPlotter } from "./MatchRoundMapPlotter";
import type {
  MatchDetail,
  MatchParticipant,
  MatchRound,
  MatchSummary,
} from "../types";
import type { RoundKillEvent } from "../types/match";

interface MatchRoundsTabProps {
  matchDetail: MatchDetail;
  matchSummary: MatchSummary;
}

function endTypeMeta(endType: string): { icon: string; label: string } {
  if (endType === "Spike Detonation") {
    return { icon: "◆", label: "폭발" };
  }

  if (endType === "Defuse") {
    return { icon: "◇", label: "해제" };
  }

  if (endType === "Elimination") return { icon: "✦", label: "제압" };
  // 승리 팀만 알려진 라운드를 제압 승리로 오해하지 않도록 원인 미제공을 구분한다.
  return { icon: "—", label: endType || "종료 원인 미제공" };
}

function roundScore(round: MatchRound): string {
  return `${round.scoreAfterRound.attackers}-${round.scoreAfterRound.defenders}`;
}

function roundTone(round: MatchRound, matchSummary: MatchSummary): "win" | "loss" {
  return round.winningTeam === matchSummary.team ? "win" : "loss";
}

function formatEventTime(timeSeconds: number): string {
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function participantFor(
  puuid: string,
  participants: MatchParticipant[],
): MatchParticipant | undefined {
  return participants.find((participant) => participant.puuid === puuid);
}

function participantName(participant: MatchParticipant | undefined): string {
  return participant
    ? `${participant.riotId.gameName}#${participant.riotId.tagLine}`
    : "Unknown";
}

function sortedEvents(events: RoundKillEvent[] | undefined): RoundKillEvent[] {
  return [...(events ?? [])].sort((left, right) => left.timeSeconds - right.timeSeconds);
}

export function MatchRoundsTab({ matchDetail, matchSummary }: MatchRoundsTabProps) {
  const rounds = [...matchDetail.rounds].sort(
    (left, right) => left.roundNumber - right.roundNumber,
  );
  const [selectedRoundNumber, setSelectedRoundNumber] = useState(
    rounds[0]?.roundNumber ?? 0,
  );
  const selectedRound = rounds.find(
    (round) => round.roundNumber === selectedRoundNumber,
  ) ?? rounds[0] ?? null;
  const selectedEvents = sortedEvents(selectedRound?.killEvents);

  return (
    <div className="rounds-tab">
      <div className="match-tab-section-head">
        <div>
          <span className="match-tab-section-label">Round flow</span>
          <h3>라운드 타임라인</h3>
        </div>
        <span className="round-preview-badge">Demo telemetry · Mock Preview</span>
      </div>

      <div className="round-timeline-sticky">
        <div className="round-chip-strip" aria-label="라운드 결과 타임라인">
          {rounds.map((round) => {
            const tone = roundTone(round, matchSummary);
            const endType = endTypeMeta(round.endType);
            const isSelected = selectedRound?.roundNumber === round.roundNumber;

            return (
              <button
                aria-label={`라운드 ${round.roundNumber}, ${tone === "win" ? "승리" : "패배"}, ${endType.label}`}
                aria-pressed={isSelected}
                className={`round-strip-chip round-strip-chip-${tone}${isSelected ? " is-selected" : ""}`}
                key={round.roundNumber}
                onClick={() => setSelectedRoundNumber(round.roundNumber)}
                type="button"
              >
                <span>R{round.roundNumber}</span>
                <strong aria-hidden="true">{endType.icon}</strong>
                <em>{roundScore(round)}</em>
              </button>
            );
          })}
        </div>
        <div className="round-strip-legend">
          <span><i className="round-legend-win" />우리 팀 승리</span>
          <span><i className="round-legend-loss" />우리 팀 패배</span>
          {rounds.some(round => round.endType === "Elimination") && <span>✦ 제압</span>}
          {rounds.some(round => round.endType === "Spike Detonation") && <span>◆ 폭발</span>}
          {rounds.some(round => round.endType === "Defuse") && <span>◇ 해제</span>}
          {rounds.some(round => !round.endType) && <span>— 종료 원인 미제공</span>}
        </div>
      </div>

      {selectedRound ? (
        <div className="round-detail-grid" aria-live="polite">
          <section className="round-kill-log-card">
            <div className="round-detail-heading">
              <div>
                <span className="match-tab-section-label">Round {selectedRound.roundNumber}</span>
                <h4>킬 로그</h4>
              </div>
              <div className="round-detail-result">
                <strong className={
                  roundTone(selectedRound, matchSummary) === "win" ? "round-win" : "round-loss"
                }
                >
                  {roundTone(selectedRound, matchSummary) === "win" ? "승리" : "패배"}
                </strong>
                <span>{roundScore(selectedRound)} · {endTypeMeta(selectedRound.endType).label}</span>
              </div>
            </div>

            {selectedEvents.length > 0 ? (
              <ol className="round-kill-log">
                {selectedEvents.map((event, index) => {
                  const killer = participantFor(event.killerPuuid, matchDetail.participants);
                  const victim = participantFor(event.victimPuuid, matchDetail.participants);

                  return (
                    <li key={`${event.killerPuuid}-${event.victimPuuid}-${event.timeSeconds}`}>
                      <time>{formatEventTime(event.timeSeconds)}</time>
                      <span className="round-combatant">
                        <small>{killer?.agent ?? "Unknown"}</small>
                        <strong>{participantName(killer)}</strong>
                      </span>
                      <span className="round-kill-weapon">
                        <strong>{event.displayName ?? event.weaponId}</strong>
                        <small>{event.isHeadshot ? "HEADSHOT" : "KILL"}</small>
                      </span>
                      <span className="round-kill-arrow" aria-hidden="true">→</span>
                      <span className="round-combatant round-combatant-victim">
                        <small>{victim?.agent ?? "Unknown"}</small>
                        <strong>{participantName(victim)}</strong>
                      </span>
                      <span className="round-event-markers">
                        {event.isFirstKill ? <b>FIRST KILL</b> : null}
                        <i>#{index + 1}</i>
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="round-event-empty">이벤트 기록 없음(Mock)</p>
            )}
          </section>

          <MatchRoundMapPlotter
            events={selectedEvents}
            participants={matchDetail.participants}
          />
        </div>
      ) : (
        <p className="round-event-empty">라운드 기록이 없습니다.</p>
      )}
    </div>
  );
}
