import type { MatchParticipant } from "../types";
import type { DuelRecord } from "../types/match";

interface MatchDuelMatrixProps {
  duels: DuelRecord[];
  opponents: MatchParticipant[];
}

function opponentFor(
  opponentPuuid: string,
  opponents: MatchParticipant[],
): MatchParticipant | undefined {
  return opponents.find((opponent) => opponent.puuid === opponentPuuid);
}

function duelTone(duel: DuelRecord): "win" | "loss" | "even" {
  if (duel.kills > duel.deaths) {
    return "win";
  }

  if (duel.kills < duel.deaths) {
    return "loss";
  }

  return "even";
}

function participantName(participant: MatchParticipant | undefined): string {
  return participant
    ? `${participant.riotId.gameName}#${participant.riotId.tagLine}`
    : "Unknown opponent";
}

export function MatchDuelMatrix({ duels, opponents }: MatchDuelMatrixProps) {
  const sortedDuels = [...duels].sort((left, right) => {
    const leftDelta = left.kills - left.deaths;
    const rightDelta = right.kills - right.deaths;
    return rightDelta - leftDelta || right.kills - left.kills;
  });
  const mostDefeated = [...duels].sort((left, right) => right.kills - left.kills)[0];
  const biggestThreat = [...duels].sort((left, right) => right.deaths - left.deaths)[0];
  const totalKills = duels.reduce((sum, duel) => sum + duel.kills, 0);
  const totalDeaths = duels.reduce((sum, duel) => sum + duel.deaths, 0);

  return (
    <section className="duel-matrix-card" aria-label="상대별 일대일 전적">
      <div className="performance-widget-head">
        <div>
          <span className="match-tab-section-label">Head-to-head</span>
          <h4>라이벌 매치업</h4>
        </div>
        <strong>{totalKills} : {totalDeaths}</strong>
      </div>

      {sortedDuels.length > 0 ? (
        <div className="duel-matrix">
          <div className="duel-matrix-heading" aria-hidden="true">
            <span>상대</span>
            <span>내 킬</span>
            <span>당한 데스</span>
            <span>우열</span>
          </div>
          {sortedDuels.map((duel) => {
            const opponent = opponentFor(duel.opponentPuuid, opponents);
            const tone = duelTone(duel);
            const delta = duel.kills - duel.deaths;

            return (
              <article className={`duel-matrix-row duel-matrix-${tone}`} key={duel.opponentPuuid}>
                <span className="duel-opponent">
                  <small>{opponent?.agent ?? "Unknown"}</small>
                  <strong>{participantName(opponent)}</strong>
                </span>
                <strong className="duel-kills">{duel.kills}</strong>
                <strong className="duel-deaths">{duel.deaths}</strong>
                <span className="duel-delta">
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="performance-empty">듀얼 기록 없음(Mock)</p>
      )}

      <div className="duel-summary">
        <span>
          가장 많이 잡은 상대
          <strong>
            {mostDefeated
              ? participantName(opponentFor(mostDefeated.opponentPuuid, opponents))
              : "—"}
          </strong>
        </span>
        <span>
          가장 위협적인 상대
          <strong>
            {biggestThreat
              ? participantName(opponentFor(biggestThreat.opponentPuuid, opponents))
              : "—"}
          </strong>
        </span>
      </div>
    </section>
  );
}
