import { profileOverviews } from "../data/profile-overview";
import type { ProfileOverview } from "../types/profile-overview";

export function getProfileOverview(puuid: string): ProfileOverview | null {
  return profileOverviews.find((overview) => overview.header.puuid === puuid) ?? null;
}
