import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { RiotName } from "@/components/ui/RiotName";
import { CardTitleRow, TextLink } from "@/components/ui/SectionHeader";
import { agentIconPath, mapListPath } from "@/lib/assets";
import { formatRiotId, playerPath } from "@/lib/riot-id";
import { LEADERBOARD_REGION_LABEL, LEADERBOARD_TOP5, MAP_ATTACK_WIN_RATES } from "@/mocks/home";

function MapWinRates() {
  return (
    <Card as="section" className="flex flex-col gap-4 self-start px-6 pt-6 pb-10">
      <CardTitleRow title="맵별 공격 승률" action={<TextLink to="/meta/maps">더 보기</TextLink>} />
      <ul className="flex flex-col gap-2">
        {MAP_ATTACK_WIN_RATES.map((map) => (
          <li
            key={map.mapId}
            className="grid grid-cols-[80px_72px_minmax(0,1fr)_52px] items-center gap-3 sm:grid-cols-[120px_88px_minmax(0,1fr)_56px] sm:gap-4"
          >
            <img src={mapListPath(map.mapId)} alt="" className="h-11 w-full rounded-lg object-cover" />
            <span className="text-15 font-medium">{map.name}</span>
            <span
              className="h-2 overflow-hidden rounded-full bg-elevated"
              role="meter"
              aria-label={`${map.name} 공격 승률`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={map.winRate}
            >
              <span className="block h-full rounded-full bg-main" style={{ width: `${map.winRate}%` }} />
            </span>
            <span lang="en" className="text-right text-14 font-semibold">
              {map.winRate.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Leaderboard() {
  return (
    <Card as="section" className="flex flex-col gap-4 p-6">
      <CardTitleRow
        title={`공식 리더보드 · ${LEADERBOARD_REGION_LABEL}`}
        action={<TextLink to="/ranking">전체 랭킹</TextLink>}
      />
      <ol>
        {LEADERBOARD_TOP5.map((player, index) => (
          <li key={formatRiotId(player)} className="border-b border-line-light">
            <Link
              to={playerPath(player)}
              className="group grid grid-cols-[24px_36px_minmax(0,1fr)_72px] items-center gap-3 py-2 sm:grid-cols-[32px_36px_minmax(0,1fr)_96px]"
            >
              <span lang="en" className="text-15 font-semibold text-sub">
                {index + 1}
              </span>
              <img src={agentIconPath(player.agentId)} alt="" className="size-9 rounded-lg object-cover" />
              <RiotName id={player} className="group-hover:underline" />
              <span lang="en" className="text-right text-14 font-semibold">
                {player.rr} RR
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/** 맵별 공격 승률 + 공식 리더보드 (53:167) */
export function MapsAndLeaderboard() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MapWinRates />
      <Leaderboard />
    </div>
  );
}
