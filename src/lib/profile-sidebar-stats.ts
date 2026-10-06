import { profileSidebarStats } from "../data/profile-sidebar-stats";
import type { ProfileSidebarStats } from "../types/profile-sidebar";

export function getProfileSidebarStats(puuid: string): ProfileSidebarStats | null {
  return profileSidebarStats.find((stats) => stats.puuid === puuid) ?? null;
}
