import type { MatchRound, ValorantTeam } from "../types";

interface MatchEconomyChartProps {
  rounds: MatchRound[];
  viewerTeam: ValorantTeam;
}

export function MatchEconomyChart({ rounds, viewerTeam }: MatchEconomyChartProps) {
  const economyRounds = rounds.filter((round) => round.economy);
  const maximumLoadout = Math.max(
    ...economyRounds.flatMap((round) => [
      round.economy?.attackersLoadout ?? 0,
      round.economy?.defendersLoadout ?? 0,
    ]),
    1,
  );

  return (
    <section className="economy-chart-card" aria-label="라운드별 팀 경제 비교">
      <div className="analysis-widget-head">
        <div>
          <span className="match-tab-section-label">Round economy</span>
          <h4>로드아웃 · Bank 추이</h4>
        </div>
        <span className="analysis-preview-badge">Mock Preview</span>
      </div>

      {economyRounds.length > 0 ? (
        <>
          <div className="economy-chart-scroll">
            <div className="economy-chart">
              {economyRounds.map((round) => {
                const economy = round.economy;
                if (!economy) {
                  return null;
                }

                const myLoadout = viewerTeam === "attackers"
                  ? economy.attackersLoadout
                  : economy.defendersLoadout;
                const opponentLoadout = viewerTeam === "attackers"
                  ? economy.defendersLoadout
                  : economy.attackersLoadout;
                const myBank = viewerTeam === "attackers"
                  ? economy.attackersBank ?? 0
                  : economy.defendersBank ?? 0;
                const opponentBank = viewerTeam === "attackers"
                  ? economy.defendersBank ?? 0
                  : economy.attackersBank ?? 0;
                const myAdvantage = myLoadout >= opponentLoadout;

                return (
                  <article
                    className={`economy-round${myAdvantage ? " is-positive" : " is-negative"}`}
                    key={round.roundNumber}
                    title={`R${round.roundNumber} · 우리 팀 ${myLoadout.toLocaleString()} / 상대 ${opponentLoadout.toLocaleString()} · Bank ${myBank.toLocaleString()} / ${opponentBank.toLocaleString()}`}
                  >
                    <div className="economy-bars">
                      <i
                        className="economy-bar-my"
                        style={{ height: `${(myLoadout / maximumLoadout) * 100}%` }}
                      />
                      <i
                        className="economy-bar-opponent"
                        style={{ height: `${(opponentLoadout / maximumLoadout) * 100}%` }}
                      />
                    </div>
                    <strong>R{round.roundNumber}</strong>
                    <span>{myAdvantage ? "+" : ""}{(myLoadout - opponentLoadout).toLocaleString()}</span>
                    <small>B {Math.round(myBank / 1000)}k/{Math.round(opponentBank / 1000)}k</small>
                  </article>
                );
              })}
            </div>
          </div>
          <div className="economy-chart-legend">
            <span><i className="economy-legend-my" />우리 팀 Loadout</span>
            <span><i className="economy-legend-opponent" />상대 팀 Loadout</span>
            <span>하단 B = 양 팀 Bank</span>
          </div>
        </>
      ) : (
        <p className="analysis-empty">경제 기록 없음(Mock)</p>
      )}
    </section>
  );
}
