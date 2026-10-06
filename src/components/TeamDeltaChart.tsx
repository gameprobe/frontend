interface TeamDeltaMetric {
  label: string;
  myValue: number;
  opponentValue: number;
  format?: "number" | "compact";
}

interface TeamDeltaChartProps {
  metrics: TeamDeltaMetric[];
}

function formatValue(value: number, format: TeamDeltaMetric["format"]): string {
  return format === "compact"
    ? new Intl.NumberFormat("ko-KR", { notation: "compact", maximumFractionDigits: 1 }).format(value)
    : value.toLocaleString("ko-KR");
}

export function TeamDeltaChart({ metrics }: TeamDeltaChartProps) {
  return (
    <section className="team-delta-card" aria-label="우리 팀과 상대 팀 지표 비교">
      <div className="analysis-widget-head">
        <div>
          <span className="match-tab-section-label">Team delta</span>
          <h4>팀 전투 지표</h4>
        </div>
        <div className="team-delta-legend">
          <span><i className="team-delta-my" />우리 팀</span>
          <span><i className="team-delta-opponent" />상대 팀</span>
        </div>
      </div>

      <div className="team-delta-list">
        {metrics.map((metric) => {
          const maximum = Math.max(metric.myValue, metric.opponentValue, 1);
          const myWidth = (metric.myValue / maximum) * 100;
          const opponentWidth = (metric.opponentValue / maximum) * 100;
          const myLead = metric.myValue > metric.opponentValue;
          const opponentLead = metric.opponentValue > metric.myValue;

          return (
            <article className="team-delta-row" key={metric.label}>
              <div className={`team-delta-value${myLead ? " is-leading" : ""}`}>
                {formatValue(metric.myValue, metric.format)}
              </div>
              <div className="team-delta-track team-delta-track-left">
                <i style={{ width: `${myWidth}%` }} />
              </div>
              <strong>{metric.label}</strong>
              <div className="team-delta-track team-delta-track-right">
                <i style={{ width: `${opponentWidth}%` }} />
              </div>
              <div className={`team-delta-value${opponentLead ? " is-leading" : ""}`}>
                {formatValue(metric.opponentValue, metric.format)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
