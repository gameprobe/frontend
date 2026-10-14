import { useOutletContext } from "react-router-dom";
import type { MatchDetail } from "@/mocks/match";

export type MatchOutletContext = { match: MatchDetail };

export function useMatchContext() {
  return useOutletContext<MatchOutletContext>();
}
