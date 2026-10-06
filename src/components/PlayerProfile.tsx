import { getRecentMatchesForPlayer } from "../lib/mock-data";
import { getProfileOverview } from "../lib/profile-overview";
import { getProfileSidebarStats } from "../lib/profile-sidebar-stats";
import { computeProfileScore } from "../lib/score-gameprobe";
import type { Player } from "../types";
import { AppVersionBadge } from "./AppVersionBadge";
import { MatchSummaryList } from "./MatchSummaryList";
import { PlayerHeaderCard } from "./PlayerHeaderCard";
import { ProfileFilterBar } from "./ProfileFilterBar";
import { ProfileSidebar } from "./ProfileSidebar";
import { RankHistoryChart } from "./RankHistoryChart";
import { RecentTwentySummaryCard } from "./RecentTwentySummaryCard";
import { SeasonSummaryCard } from "./SeasonSummaryCard";

interface PlayerProfileProps {
  player: Player;
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const recentMatches = getRecentMatchesForPlayer(player.puuid);
  const overview = getProfileOverview(player.puuid);
  const sidebarStats = getProfileSidebarStats(player.puuid);
  const profileScore = computeProfileScore(recentMatches);

  return (
    <div className="profile-shell">
      {overview ? (
        <>
          <PlayerHeaderCard
            careerPeakRank={overview.careerPeakRank}
            header={overview.header}
            player={player}
            previousSeasonRank={overview.previousSeasonRanks[0] ?? null}
            profileScore={profileScore}
            recentTwenty={overview.recentTwenty}
            seasonSummary={overview.seasonSummary}
          />
          <ProfileFilterBar defaultFilter={overview.defaultFilter} options={overview.filterOptions} />
        </>
      ) : null}

      <div className="profile-dashboard-grid">
        <aside className="profile-rail" aria-label="요약 정보">
          <ProfileSidebar overview={overview} player={player} stats={sidebarStats} />
          {overview ? (
            <div className="profile-rail-stack" aria-label="시즌 및 랭크 요약">
              <SeasonSummaryCard summary={overview.seasonSummary} />
              <RankHistoryChart points={overview.rankHistory} />
              <RecentTwentySummaryCard summary={overview.recentTwenty} />
            </div>
          ) : null}
        </aside>

        <div className="profile-main">
          <section aria-labelledby="recent-matches-heading" className="profile-matches-section">
            <div className="dashboard-section-head">
              <div>
                <p className="eyebrow">Match history</p>
                <h2 id="recent-matches-heading">최근 경기</h2>
              </div>
            </div>
            <MatchSummaryList matches={recentMatches} viewerPuuid={player.puuid} />
          </section>
        </div>
      </div>
      <AppVersionBadge />
    </div>
  );
}
