import { Card } from "@/components/ui/Card";
import { useMatchContext } from "@/features/match/match-context";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { formatSigned } from "@/lib/format";
import type { MatchDetail, MatchPlayer, TeamSide } from "@/mocks/match";

const COLUMNS = ["플레이어", "ACS", "K", "D", "A", "+/-", "K/D", "ADR", "HS%", "첫 킬"];
const GRID = "grid grid-cols-[minmax(0,2.4fr)_repeat(9,minmax(0,0.7fr))] items-center gap-3";

function PlayerRow({ player }: { player: MatchPlayer }) {
  const diff = player.kills - player.deaths;
  const values = [player.kills, player.deaths, player.assists];
  return (
    <div role="row" className={cx(GRID, "rounded-lg p-3 text-15", player.isMe && "bg-elevated")}>
      <span role="cell" className="flex min-w-0 items-center gap-3">
        <img src={agentIconPath(player.agentId)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate">
            <span className="font-semibold">{player.gameName}</span>
            <span lang="en" className="text-sub-weak">
              #{player.tagLine}
            </span>
          </span>
          <span className="text-12 whitespace-nowrap text-sub">
            {player.agentName} · {player.tier}
          </span>
        </span>
        {(player.badge || player.isMe) && (
          <span className="flex h-[19px] shrink-0 items-center rounded-md border border-line px-2 text-11 font-semibold">
            {player.badge ?? "나"}
          </span>
        )}
      </span>
      <span role="cell" lang="en" className="font-semibold">
        {player.acs}
      </span>
      {values.map((value, index) => (
        <span key={index} role="cell" lang="en">
          {value}
        </span>
      ))}
      <span role="cell" lang="en" className={diff < 0 ? "text-loss" : "text-win"}>
        {formatSigned(diff)}
      </span>
      <span role="cell" lang="en">
        {(player.kills / Math.max(player.deaths, 1)).toFixed(2)}
      </span>
      <span role="cell" lang="en">
        {player.adr}
      </span>
      <span role="cell" lang="en">
        {player.headshot}%
      </span>
      <span role="cell" lang="en">
        {player.firstKills}
      </span>
    </div>
  );
}

function TeamTable({ match, side }: { match: MatchDetail; side: TeamSide }) {
  const players = match.players.filter((player) => player.side === side);
  const roundsWon = side === "ours" ? match.score[0] : match.score[1];
  const won = side === "ours" ? match.result === "win" : match.result === "loss";
  const title = side === "ours" ? "우리 팀" : "상대 팀";

  return (
    <Card as="section" aria-label={title} className="overflow-hidden pb-3">
      <div
        className={cx(
          "flex flex-wrap items-center justify-between gap-2 border-l-4 px-6 py-4",
          won ? "border-win bg-win-soft" : "border-loss bg-loss-soft",
        )}
      >
        <h2 className="flex items-center gap-3 font-semibold">
          <span className="text-18">{title}</span>
          <span className={cx("text-15", won ? "text-win" : "text-loss")}>
            {won ? "승리" : "패배"} · {roundsWon}라운드
          </span>
        </h2>
        <p className="text-13 text-sub">평균 티어 {match.averageTier[side]}</p>
      </div>
      <div className="overflow-x-auto px-6">
        <div role="table" aria-label={`${title} 스코어보드`} className="min-w-[900px]">
          <div role="row" className={cx(GRID, "border-b border-line py-3 text-12 font-medium text-sub-weak")}>
            {COLUMNS.map((column) => (
              <span key={column} role="columnheader">
                {column}
              </span>
            ))}
          </div>
          {players.map((player) => (
            <PlayerRow key={`${player.gameName}#${player.tagLine}`} player={player} />
          ))}
        </div>
      </div>
    </Card>
  );
}

/** 09 매치 상세 - 스코어보드 (Figma 54:182) */
export function ScoreboardTab() {
  const { match } = useMatchContext();
  return (
    <div className="flex flex-col gap-4">
      <TeamTable match={match} side="ours" />
      <TeamTable match={match} side="theirs" />
    </div>
  );
}
