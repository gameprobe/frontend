import { Link } from "react-router-dom";
import { RiotIdSearchBar } from "@/components/search/RiotIdSearchBar";
import { Card } from "@/components/ui/Card";
import { useRecentSearches } from "@/features/search/player-lists";
import { usePlayerSearch } from "@/features/search/usePlayerSearch";
import { agentFullPath, mapImagePath } from "@/lib/assets";
import { formatRiotId, playerPath } from "@/lib/riot-id";

const HERO_CHIP_LIMIT = 2;

/** 메인 홈 Hero · VALORANT 전적 검색(53:21) */
export function HomeHero() {
  const search = usePlayerSearch();
  const { players: recentPlayers } = useRecentSearches();
  const recentChips = recentPlayers.slice(0, HERO_CHIP_LIMIT);

  return (
    <Card as="section" className="relative overflow-hidden" aria-labelledby="home-hero-title">
      {/* 배경: 어센트 이미지(오른쪽 64%, 30%) + 왼쪽에서 오른쪽으로 옅어지는 그라데이션 + 제트 */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src={mapImagePath("ascent")}
          alt=""
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-30 md:w-[64%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#161d28_36%,rgba(22,29,40,0.7)_64%,rgba(22,29,40,0.3))]" />
        <img
          src={agentFullPath("jett")}
          alt=""
          className="absolute -top-[9px] right-4 hidden h-[382px] w-[420px] object-cover opacity-40 md:block xl:h-[520px] xl:w-[572px] xl:opacity-100"
        />
      </div>

      <div className="relative flex w-full max-w-[680px] flex-col gap-8 p-6 md:p-10 xl:p-14">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <p className="text-16 font-medium md:text-18">VALORANT 전적 검색</p>
            <h1 id="home-hero-title" className="text-28 font-semibold md:text-40 xl:text-48">
              플레이어 전적부터
              <br />
              매치 분석까지 한 번에
            </h1>
          </div>
          <p className="text-16 text-sub md:text-18 xl:text-20">
            Riot ID로 검색하고 라운드 단위까지 경기를 돌아보세요.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <RiotIdSearchBar onSearch={search} placeholder="플레이어 이름#태그  (예: 프로브#KR1)" />
          {recentChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pl-1">
              <p className="mr-1 text-13 text-sub-weak">최근 검색</p>
              {recentChips.map((player) => (
                <Link
                  key={formatRiotId(player)}
                  to={playerPath(player)}
                  className="flex h-[25px] items-center rounded-full border border-line bg-surface px-3 text-13 font-medium text-sub hover:text-main"
                >
                  {formatRiotId(player)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
