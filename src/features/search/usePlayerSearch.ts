import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRecentSearches } from "@/features/search/player-lists";
import { parseRiotId, playerPath } from "@/lib/riot-id";
import { findMockPlayer } from "@/mocks/players";

/**
 * Riot ID 검색. 예시 플레이어면 프로필로, 아니면(형식 오류 포함) 결과 없음 화면으로 보낸다.
 * 백엔드 연결 전까지는 예시 데이터에서만 찾는다.
 */
export function usePlayerSearch() {
  const navigate = useNavigate();
  const { add } = useRecentSearches();

  return useCallback(
    (input: string) => {
      const query = input.trim();
      if (!query) return;

      const riotId = parseRiotId(query);
      const player = riotId ? findMockPlayer(riotId) : undefined;
      if (player) {
        add(player);
        navigate(playerPath(player));
        return;
      }
      navigate(`/search?q=${encodeURIComponent(query)}`);
    },
    [add, navigate],
  );
}
