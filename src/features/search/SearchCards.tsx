import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import alertIcon from "@/assets/icons/alert.svg";
import closeIcon from "@/assets/icons/close.svg";
import starIcon from "@/assets/icons/star.svg";
import { Card } from "@/components/ui/Card";
import { RiotName } from "@/components/ui/RiotName";
import { CardTitleRow } from "@/components/ui/SectionHeader";
import { favoriteSummary, useFavoritePlayers, useRecentSearches } from "@/features/search/player-lists";
import { agentIconPath } from "@/lib/assets";
import { formatRiotId, playerPath } from "@/lib/riot-id";
import type { MockPlayer } from "@/mocks/players";

type PlayerRowProps = {
  player: MockPlayer;
  description: string;
  action: ReactNode;
};

/** 카드 안 플레이어 행(53:289): 초상 40 + 이름·설명 + 32px 아이콘 버튼. */
function PlayerRow({ player, description, action }: PlayerRowProps) {
  return (
    <li className="flex items-center gap-3 border-b border-line-light py-3">
      <Link to={playerPath(player)} className="group flex min-w-0 flex-1 items-center gap-3">
        <img src={agentIconPath(player.agentId)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
        <span className="flex min-w-0 flex-col gap-1">
          <RiotName id={player} className="group-hover:underline" />
          <span className="text-13 text-sub">{description}</span>
        </span>
      </Link>
      {action}
    </li>
  );
}

function EmptyRow({ children }: { children: ReactNode }) {
  return <p className="border-b border-line-light py-3 text-14 text-sub">{children}</p>;
}

/** 최근 검색 기록(53:284) */
export function RecentSearchesCard() {
  const { players, remove, clear } = useRecentSearches();

  return (
    <Card as="section" className="flex flex-col gap-4 self-start p-6">
      <CardTitleRow
        title="최근 검색 기록"
        action={
          players.length > 0 && (
            <button type="button" onClick={clear} className="text-13 font-medium text-sub hover:text-main">
              전체 삭제
            </button>
          )
        }
      />
      {players.length > 0 ? (
        <ul>
          {players.map((player) => (
            <PlayerRow
              key={formatRiotId(player)}
              player={player}
              description={player.tier}
              action={
                <button
                  type="button"
                  onClick={() => remove(player)}
                  aria-label={`${formatRiotId(player)} 검색 기록 삭제`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-elevated"
                >
                  <img src={closeIcon} alt="" width={14} height={14} />
                </button>
              }
            />
          ))}
        </ul>
      ) : (
        <EmptyRow>최근 검색 기록이 없어요.</EmptyRow>
      )}
    </Card>
  );
}

/** 즐겨찾기 플레이어(53:305). 별을 누르면 즐겨찾기에서 뺀다. */
export function FavoritePlayersCard() {
  const { players, remove } = useFavoritePlayers();

  return (
    <Card as="section" className="flex flex-col gap-4 p-6">
      <CardTitleRow title="즐겨찾기 플레이어" />
      {players.length > 0 ? (
        <ul>
          {players.map((player) => (
            <PlayerRow
              key={formatRiotId(player)}
              player={player}
              description={favoriteSummary(player)}
              action={
                <button
                  type="button"
                  onClick={() => remove(player)}
                  aria-label={`${formatRiotId(player)} 즐겨찾기 해제`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-elevated"
                >
                  <img src={starIcon} alt="" width={18} height={18} />
                </button>
              }
            />
          ))}
        </ul>
      ) : (
        <EmptyRow>즐겨찾기한 플레이어가 없어요.</EmptyRow>
      )}
    </Card>
  );
}

const NOT_FOUND_TIPS = [
  "이름과 태그를 # 으로 구분해 입력했는지 확인해 주세요. (예: 프로브#KR1)",
  "태그는 3~5자의 영문·숫자로 이루어져 있어요.",
  "최근 Riot ID를 변경했다면 새 ID로 검색해 주세요.",
  "기본 서버 지역(한국)과 플레이어의 지역이 같은지 확인해 주세요.",
];

/** 결과 없음 안내(53:358) */
export function PlayerNotFoundCard({ query }: { query: string }) {
  return (
    <Card as="section" role="status" className="flex flex-col gap-4 p-6 sm:flex-row sm:gap-6 md:p-8">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-thumb bg-elevated">
        <img src={alertIcon} alt="" width={24} height={24} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-sub">Riot ID 확인 안내</p>
          <h2 className="text-20 font-semibold break-words md:text-24">‘{query}’ 플레이어를 찾지 못했어요</h2>
        </div>
        <ul className="text-15 text-sub sm:pl-5">
          {NOT_FOUND_TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
