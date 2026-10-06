import type { GameProbeScore } from "../lib/score-gameprobe";

interface MatchScoreBadgeProps {
  label?: string;
  score: GameProbeScore | null;
}

const scoreTitle = "GameProbe Preview Score: ACS, K/D, ADR, 승패, HS%, 어시스트, 생존 기여 기반 Mock 점수";

export function MatchScoreBadge({ label = "Preview Score", score }: MatchScoreBadgeProps) {
  return (
    <div className="score-badge" title={scoreTitle} aria-label={scoreTitle}>
      <span>{label}</span>
      {score ? (
        <strong>
          {score.score}
          <em>{score.grade}</em>
        </strong>
      ) : (
        <strong>—</strong>
      )}
    </div>
  );
}
