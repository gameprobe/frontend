import type { MatchParticipant } from "../types";
import type { RoundKillEvent } from "../types/match";

interface MatchRoundMapPlotterProps {
  events: RoundKillEvent[];
  participants: MatchParticipant[];
}

function participantLabel(puuid: string, participants: MatchParticipant[]): string {
  const participant = participants.find((candidate) => candidate.puuid === puuid);
  return participant ? `${participant.agent} ${participant.riotId.gameName}` : "Unknown";
}

function pointStyle(point: { x: number; y: number }) {
  return {
    left: `${point.x * 100}%`,
    top: `${point.y * 100}%`,
  };
}

export function MatchRoundMapPlotter({
  events,
  participants,
}: MatchRoundMapPlotterProps) {
  const plottedEvents = events.filter((event) => event.killerPos && event.victimPoint);

  return (
    <section className="round-map-card" aria-label="선택 라운드 교전 좌표">
      <div className="round-detail-heading">
        <div>
          <span className="match-tab-section-label">Tactical plot</span>
          <h4>2D 교전 위치</h4>
        </div>
        <span className="round-preview-badge">Mock Preview</span>
      </div>

      {/* 좌표가 없으면 임의 도형을 경기 지도로 오해하지 않도록 안내만 표시한다. */}
      {plottedEvents.length > 0 ? (
        <>
          <div className="round-map-plot">
            <span className="round-map-site round-map-site-a">A</span>
            <span className="round-map-site round-map-site-mid">MID</span>
            <span className="round-map-site round-map-site-b">B</span>
            {plottedEvents.flatMap((event, index) => {
              if (!event.killerPos || !event.victimPoint) {
                return [];
              }

              return [
                <span
                  aria-label={`킬 위치: ${participantLabel(event.killerPuuid, participants)}`}
                  className="round-map-dot round-map-dot-kill"
                  key={`kill-${index}`}
                  style={pointStyle(event.killerPos)}
                  title={`K · ${participantLabel(event.killerPuuid, participants)}`}
                >
                  K
                </span>,
                <span
                  aria-label={`사망 위치: ${participantLabel(event.victimPuuid, participants)}`}
                  className="round-map-dot round-map-dot-death"
                  key={`death-${index}`}
                  style={pointStyle(event.victimPoint)}
                  title={`D · ${participantLabel(event.victimPuuid, participants)}`}
                >
                  D
                </span>,
              ];
            })}
          </div>

          <div className="round-map-legend" aria-label="좌표 범례">
            <span><i className="round-map-legend-kill" />킬 위치</span>
            <span><i className="round-map-legend-death" />사망 위치</span>
          </div>
        </>
      ) : (
        <p className="round-map-empty">좌표 이벤트 기록 없음(Mock)</p>
      )}
    </section>
  );
}
