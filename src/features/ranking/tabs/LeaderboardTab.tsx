import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { RiotName } from "@/components/ui/RiotName";
import { agentIconPath } from "@/lib/assets";
import { playerPath } from "@/lib/riot-id";
import { LEADERBOARD, type LeaderboardEntry } from "@/mocks/ranking";

const GRID =
  "grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[64px_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] md:gap-4";

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Link
      to={playerPath(entry)}
      className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 transition-colors hover:border-line-strong md:p-6"
    >
      <p lang="en" className="w-6 shrink-0 text-32 font-semibold text-sub-weak md:text-36">
        {entry.rank}
      </p>
      <img src={agentIconPath(entry.agentIds[0])} alt="" className="size-14 shrink-0 rounded-thumb object-cover md:size-16" />
      <div className="flex min-w-0 flex-col gap-1">
        <RiotName id={entry} weight="semibold" size={18} />
        <p className="text-14 text-sub">
          {entry.tier} · <span className="font-semibold text-main">{entry.rr} RR</span>
        </p>
      </div>
    </Link>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <Link to={playerPath(entry)} className={`${GRID} py-3 text-15 hover:bg-elevated/40`}>
      <span lang="en" className="font-semibold text-sub">
        {entry.rank}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <RiotName id={entry} weight="semibold" />
        {/* md 미만: 티어·승률을 이름 아래에 모은다 */}
        <span className="truncate text-13 text-sub md:hidden">
          {entry.tier} · {entry.wins}승 · {entry.winRate.toFixed(1)}%
        </span>
      </span>
      <span className="hidden text-sub md:block">
        {entry.tier}
      </span>
      <span lang="en" className="text-right font-semibold md:text-left">
        {entry.rr}
        <span className="text-13 font-normal text-sub md:hidden"> RR</span>
      </span>
      <span className="hidden text-sub md:block">
        <span className="text-main">{entry.wins}승</span> · {entry.winRate.toFixed(1)}%
      </span>
      <span className="hidden gap-1 md:flex">
        {entry.agentIds.map((agentId) => (
          <img key={agentId} src={agentIconPath(agentId)} alt="" className="size-7 rounded-md object-cover" />
        ))}
      </span>
    </Link>
  );
}

/** 13 랭킹 - 공식 리더보드 (Figma 54:1070). 1~3위는 카드, 4위부터 표. */
export function LeaderboardTab() {
  const podium = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="1~3위" className="grid gap-4 lg:grid-cols-3">
        {podium.map((entry) => (
          <PodiumCard key={entry.rank} entry={entry} />
        ))}
      </section>
      <Card as="section" aria-label="공식 리더보드" className="px-5 py-2 md:px-6">
        <div aria-hidden className={`${GRID} border-b border-line py-3 text-13 font-medium text-sub-weak`}>
          <span>순위</span>
          <span>플레이어</span>
          <span className="hidden md:block">티어</span>
          <span lang="en" className="text-right md:text-left">
            RR
          </span>
          <span className="hidden md:block">승리 · 승률</span>
          <span className="hidden md:block">주 요원</span>
        </div>
        <ol aria-label="4위부터 50위까지">
          {rest.map((entry) => (
            <li key={entry.rank} className="border-b border-line-light last:border-b-0">
              <LeaderboardRow entry={entry} />
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
