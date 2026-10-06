import type { MatchDetail } from "../types";
import { MatchRoundTimeline } from "./MatchRoundTimeline";
import { MatchScoreboard } from "./MatchScoreboard";
import s from "./MatchDetailView.module.css";

interface MatchDetailViewProps {
  matchDetail: MatchDetail;
}

function formatStartedAt(startedAt: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(startedAt));
}

function formatDuration(durationSeconds: number): string {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}분 ${seconds}초`;
}

export function MatchDetailView({ matchDetail }: MatchDetailViewProps) {
  return (
    <div className={s.detail}>
      <section className={s.header} aria-labelledby="match-detail-heading">
        <p className={s.eyebrow}>Match detail</p>
        <h1 id="match-detail-heading">
          {matchDetail.map} · {matchDetail.mode}
        </h1>
        <dl className={s.metadata}>
          <div>
            <dt>시작 시각</dt>
            <dd><time dateTime={matchDetail.startedAt}>{formatStartedAt(matchDetail.startedAt)}</time></dd>
          </div>
          <div>
            <dt>경기 시간</dt>
            <dd>{formatDuration(matchDetail.durationSeconds)}</dd>
          </div>
        </dl>
      </section>

      <MatchScoreboard participants={matchDetail.participants} />
      <MatchRoundTimeline rounds={matchDetail.rounds} />
    </div>
  );
}
