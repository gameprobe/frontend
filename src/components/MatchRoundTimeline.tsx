import type { MatchRound } from "../types";
import s from "./MatchDetailView.module.css";

interface MatchRoundTimelineProps {
  rounds: MatchRound[];
}

export function MatchRoundTimeline({ rounds }: MatchRoundTimelineProps) {
  const sortedRounds = [...rounds].sort(
    (left, right) => left.roundNumber - right.roundNumber,
  );

  return (
    <section className={s.panel} aria-labelledby="match-rounds-heading">
      <div className={s.sectionHeading}>
        <h2 id="match-rounds-heading">라운드 타임라인</h2>
        <p className={s.roundHint}>스코어 순서: attackers - defenders</p>
      </div>
      <div className={s.roundGrid}>
        {sortedRounds.map((round) => (
          <article key={round.roundNumber} className={s.round}>
            <h3>라운드 {round.roundNumber}</h3>
            <dl className={s.roundDetails}>
              <div><dt>승리 팀</dt><dd>{round.winningTeam}</dd></div>
              <div><dt>종료 방식</dt><dd>{round.endType}</dd></div>
              <div className={s.roundScore}><dt>스코어</dt><dd>{round.scoreAfterRound.attackers}-{round.scoreAfterRound.defenders}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
