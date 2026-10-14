import { Card } from "@/components/ui/Card";
import { useMatchContext } from "@/features/match/match-context";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { formatNumber } from "@/lib/format";
import type { MatchDetail } from "@/mocks/match";

/** 그래프 높이 200px의 기준값. 시안 막대(최대 185px ≈ 22,580)와 같은 비율이 되도록 정했다. */
const CHART_MAX = 24_400;

function LoadoutChart({ match }: { match: MatchDetail }) {
  return (
    <Card as="section" className="flex flex-col gap-7 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-18 font-semibold">라운드별 팀 장비 가치</h2>
        <ul className="flex gap-4 text-13 text-sub">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 bg-main" />
            우리 팀
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 bg-disabled" />
            상대 팀
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-5">
        <div className="overflow-x-auto">
          <div className="flex min-w-[600px] flex-col gap-2">
            <ol className="flex h-[200px] items-end gap-1.5 border-b border-line">
              {match.rounds.map((round) => (
                <li
                  key={round.number}
                  className="flex h-full min-w-0 flex-1 items-end gap-1"
                  aria-label={`라운드 ${round.number}: 우리 팀 ${formatNumber(round.oursLoadout)}, 상대 팀 ${formatNumber(round.theirsLoadout)}`}
                  title={`라운드 ${round.number} · 우리 ${formatNumber(round.oursLoadout)} · 상대 ${formatNumber(round.theirsLoadout)}`}
                >
                  <span className="min-w-0 flex-1 rounded-t-[3px] bg-main" style={{ height: `${(round.oursLoadout / CHART_MAX) * 100}%` }} />
                  <span className="min-w-0 flex-1 rounded-t-[3px] bg-disabled" style={{ height: `${(round.theirsLoadout / CHART_MAX) * 100}%` }} />
                </li>
              ))}
            </ol>
            <ol aria-hidden className="flex gap-1.5">
              {match.rounds.map((round) => (
                <li key={round.number} className="flex min-w-0 flex-1 flex-col gap-1">
                  <span lang="en" className="text-center text-11 text-sub-weak">
                    {round.number}
                  </span>
                  <span className={cx("h-1 rounded-full", round.winner === "ours" ? "bg-win" : "bg-loss")} />
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="text-12 text-sub-weak">하단 막대: 라운드 승패 (청록 승리 · 적색 패배)</p>
      </div>
    </Card>
  );
}

const COLUMNS = ["플레이어", "평균 장비 가치", "평균 소비", "첫 킬", "첫 데스", "멀티킬", "클러치"];
const GRID = "grid grid-cols-[minmax(0,1.9fr)_repeat(6,minmax(0,1fr))] items-center gap-4";

function PerformanceTable({ match }: { match: MatchDetail }) {
  return (
    <Card as="section" aria-label="플레이어 경제·퍼포먼스" className="overflow-x-auto px-6 py-2">
      <div role="table" aria-label="플레이어 경제·퍼포먼스" className="min-w-[760px]">
        <div role="row" className={cx(GRID, "border-b border-line py-3 text-12 font-medium text-sub-weak")}>
          {COLUMNS.map((column) => (
            <span key={column} role="columnheader">
              {column}
            </span>
          ))}
        </div>
        {match.players.map((player) => (
          <div key={`${player.gameName}#${player.tagLine}`} role="row" className={cx(GRID, "border-b border-line-light py-3 text-15")}>
            <span role="cell" className="flex items-center gap-3">
              <span
                aria-label={player.side === "ours" ? "우리 팀" : "상대 팀"}
                className={cx("h-8 w-1 shrink-0 rounded-full", player.side === "ours" ? "bg-main" : "bg-disabled")}
              />
              <img src={agentIconPath(player.agentId)} alt="" className="size-8 shrink-0 rounded-md object-cover" />
              <span className="truncate font-semibold">
                {player.gameName}
                {player.isMe && " (나)"}
              </span>
            </span>
            {[formatNumber(player.avgLoadout), formatNumber(player.avgSpend), player.firstKills, player.firstDeaths, player.multiKills, player.clutches].map(
              (value, index) => (
                <span key={index} role="cell" lang="en">
                  {value}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/** 11 매치 상세 - 팀 경제 · 퍼포먼스 (Figma 54:626) */
export function EconomyTab() {
  const { match } = useMatchContext();
  return (
    <div className="flex flex-col gap-4">
      <LoadoutChart match={match} />
      <PerformanceTable match={match} />
    </div>
  );
}
