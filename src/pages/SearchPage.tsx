import { useSearchParams } from "react-router-dom";
import { RiotIdSearchBar } from "@/components/search/RiotIdSearchBar";
import { FavoritePlayersCard, PlayerNotFoundCard, RecentSearchesCard } from "@/features/search/SearchCards";
import { usePlayerSearch } from "@/features/search/usePlayerSearch";

/** 02 전적 검색(53:253) · 03 결과 없음(53:328). 결과 없음은 `?q=`가 있을 때. */
export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const search = usePlayerSearch();

  return (
    <div className="container-page flex flex-col gap-8 pt-8 pb-20 md:pt-10">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-1">
          <p className="text-16 font-medium text-sub">전적 검색</p>
          <h1 className="text-24 font-semibold md:text-28 xl:text-32">Riot ID로 플레이어 찾기</h1>
        </div>
        <RiotIdSearchBar onSearch={search} defaultValue={query} className="max-w-[720px]" />
      </div>

      {query && <PlayerNotFoundCard query={query} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSearchesCard />
        <FavoritePlayersCard />
      </div>
    </div>
  );
}
