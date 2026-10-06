import type { MatchParticipant } from "../types";
import s from "./MatchDetailView.module.css";

interface MatchScoreboardProps {
  participants: MatchParticipant[];
}

function formatRiotId(participant: MatchParticipant): string {
  return `${participant.riotId.gameName}#${participant.riotId.tagLine}`;
}

export function MatchScoreboard({ participants }: MatchScoreboardProps) {
  return (
    <section className={s.panel} aria-labelledby="match-scoreboard-heading">
      <div className={s.sectionHeading}>
        <h2 id="match-scoreboard-heading">스코어보드</h2>
        <p className={s.scrollHint} id="match-scoreboard-scroll-hint">표를 좌우로 스크롤해 모든 기록을 확인하세요.</p>
      </div>
      <div className={s.tableScroll} role="region" aria-labelledby="match-scoreboard-heading" aria-describedby="match-scoreboard-scroll-hint" tabIndex={0}>
        <table className={s.scoreboard}>
          <thead>
            <tr>
              <th scope="col">플레이어</th>
              <th scope="col">팀</th>
              <th scope="col">요원</th>
              <th scope="col" className={s.numeric}>K/D/A</th>
              <th scope="col" className={s.numeric}>ACS</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => (
              <tr key={participant.puuid}>
                <th scope="row">{formatRiotId(participant)}</th>
                <td><span className={s.team}>{participant.team}</span></td>
                <td>{participant.agent}</td>
                <td className={s.numeric}>{participant.stats.kills}/{participant.stats.deaths}/{participant.stats.assists}</td>
                <td className={`${s.numeric} ${s.combatScore}`}>{participant.stats.averageCombatScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
