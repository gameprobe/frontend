import { useCallback, useMemo } from "react";
import { isSameRiotId, type RiotId } from "@/lib/riot-id";
import { useStoredList } from "@/lib/stored-list";
import { findMockPlayer, type MockPlayer } from "@/mocks/players";

const RECENT_KEY = "gameprobe.recentSearches.v1";
const FAVORITES_KEY = "gameprobe.favorites.v1";
const RECENT_LIMIT = 10;

/** 처음 방문 시 보여줄 값 = Figma 시안에 그려진 예시 */
const RECENT_SEED: RiotId[] = [
  { gameName: "새벽두시", tagLine: "0201" },
  { gameName: "에임연습중", tagLine: "KR2" },
];
const FAVORITES_SEED: RiotId[] = [
  { gameName: "Moonlit", tagLine: "APAC" },
  { gameName: "한방에보내기", tagLine: "7777" },
];

/** 즐겨찾기 설명: '티어 · 승률 N%' */
export function favoriteSummary(player: MockPlayer): string {
  return player.winRate === undefined ? player.tier : `${player.tier} · 승률 ${player.winRate}%`;
}

/** 저장된 Riot ID를 예시 플레이어 정보와 합친다. 예시에 없는 ID는 건너뛴다. */
function resolvePlayers(ids: RiotId[]): MockPlayer[] {
  return ids.flatMap((id) => {
    const player = findMockPlayer(id);
    return player ? [player] : [];
  });
}

export function useRecentSearches() {
  const [ids, update] = useStoredList<RiotId>(RECENT_KEY, RECENT_SEED);
  const players = useMemo(() => resolvePlayers(ids), [ids]);

  const add = useCallback(
    (id: RiotId) =>
      update((current) => {
        const entry = { gameName: id.gameName, tagLine: id.tagLine };
        return [entry, ...current.filter((item) => !isSameRiotId(item, id))].slice(0, RECENT_LIMIT);
      }),
    [update],
  );
  const remove = useCallback(
    (id: RiotId) => update((current) => current.filter((item) => !isSameRiotId(item, id))),
    [update],
  );
  const clear = useCallback(() => update(() => []), [update]);

  return { players, add, remove, clear };
}

export function useFavoritePlayers() {
  const [ids, update] = useStoredList<RiotId>(FAVORITES_KEY, FAVORITES_SEED);
  const players = useMemo(() => resolvePlayers(ids), [ids]);

  const remove = useCallback(
    (id: RiotId) => update((current) => current.filter((item) => !isSameRiotId(item, id))),
    [update],
  );
  const isFavorite = useCallback((id: RiotId) => ids.some((item) => isSameRiotId(item, id)), [ids]);
  const toggle = useCallback(
    (id: RiotId) =>
      update((current) =>
        current.some((item) => isSameRiotId(item, id))
          ? current.filter((item) => !isSameRiotId(item, id))
          : [...current, { gameName: id.gameName, tagLine: id.tagLine }],
      ),
    [update],
  );

  return { players, remove, isFavorite, toggle };
}
