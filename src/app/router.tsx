import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/AppLayout";
import { AdminEditorPage } from "@/features/admin/AdminEditorPage";
import { AdminGatePage } from "@/features/admin/AdminGatePage";
import { AdminLayout } from "@/features/admin/AdminLayout";
import { AdminListPage } from "@/features/admin/AdminListPage";
import { UPCOMING_SECTIONS } from "@/app/navigation";
import { ComingSoonPage } from "@/pages/ComingSoonPage";
import { MatchLayout } from "@/features/match/MatchLayout";
import { CompareTab } from "@/features/match/tabs/CompareTab";
import { EconomyTab } from "@/features/match/tabs/EconomyTab";
import { RoundsTab } from "@/features/match/tabs/RoundsTab";
import { ScoreboardTab } from "@/features/match/tabs/ScoreboardTab";
import { ProfileLayout } from "@/features/profile/ProfileLayout";
import { AgentsTab } from "@/features/profile/tabs/AgentsTab";
import { MapsTab } from "@/features/profile/tabs/MapsTab";
import { MatchesTab } from "@/features/profile/tabs/MatchesTab";
import { OverviewTab } from "@/features/profile/tabs/OverviewTab";
import { WeaponsTab } from "@/features/profile/tabs/WeaponsTab";
import { GameInfoLayout } from "@/features/game-info/GameInfoLayout";
import { AgentsGuideTab } from "@/features/game-info/tabs/AgentsGuideTab";
import { CrosshairsTab } from "@/features/game-info/tabs/CrosshairsTab";
import { LineupsGuideTab } from "@/features/game-info/tabs/LineupsGuideTab";
import { MapsGuideTab } from "@/features/game-info/tabs/MapsGuideTab";
import { PatchNotesTab } from "@/features/game-info/tabs/PatchNotesTab";
import { WeaponsGuideTab } from "@/features/game-info/tabs/WeaponsGuideTab";
import { ConsentCard, LoginFailedCard } from "@/features/my/LoginCards";
import { MyLayout } from "@/features/my/MyLayout";
import { AccountTab, FavoritesTab, RecordTab, SettingsTab } from "@/features/my/tabs/MyTabs";
import { AgentSelectPage } from "@/features/lineups/AgentSelectPage";
import { LineupBoardPage } from "@/features/lineups/LineupBoardPage";
import { LineupDetailPage } from "@/features/lineups/LineupDetailPage";
import { MapSelectPage } from "@/features/lineups/MapSelectPage";
import { MetaLayout } from "@/features/meta/MetaLayout";
import { SmokeGuidePage } from "@/features/smokes/SmokeGuidePage";
import { SmokeMapSelectPage } from "@/features/smokes/SmokeMapSelectPage";
import { SmokeDetailPage } from "@/features/smokes/SmokeDetailPage";
import { AgentsTierTab } from "@/features/meta/tabs/AgentsTierTab";
import { CompsTab } from "@/features/meta/tabs/CompsTab";
import { MetaMapsTab } from "@/features/meta/tabs/MapsTab";
import { MetaWeaponsTab } from "@/features/meta/tabs/WeaponsTab";
import { RankingLayout } from "@/features/ranking/RankingLayout";
import { AchievementsTab } from "@/features/ranking/tabs/AchievementsTab";
import { LeaderboardTab } from "@/features/ranking/tabs/LeaderboardTab";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SearchPage } from "@/pages/SearchPage";

import { ReviewPage } from "@/features/review/ReviewPage";
import { InsightsPage } from "@/features/review/InsightsPage";
import { PolicyPage } from "@/features/review/PolicyPage";
import { DEMO_PROFILE_PATH } from "@/features/review/review-content";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "review", element: <ReviewPage /> },
      { path: "insights", element: <InsightsPage /> },
      { path: "privacy", element: <PolicyPage kind="privacy" /> },
      { path: "terms", element: <PolicyPage kind="terms" /> },
      // Keep links from the earlier Riot application usable after the frontend migration.
      { path: "connect", element: <Navigate to="/my/consent" replace /> },
      { path: "players/demo-player-01", element: <Navigate to={DEMO_PROFILE_PATH} replace /> },
      {
        path: "players/:riotId",
        element: <ProfileLayout />,
        children: [
          { index: true, element: <OverviewTab /> },
          { path: "matches", element: <MatchesTab /> },
          { path: "agents", element: <AgentsTab /> },
          { path: "maps", element: <MapsTab /> },
          { path: "weapons", element: <WeaponsTab /> },
        ],
      },
      {
        path: "matches/:matchId",
        element: <MatchLayout />,
        children: [
          { index: true, element: <ScoreboardTab /> },
          { path: "rounds", element: <RoundsTab /> },
          { path: "economy", element: <EconomyTab /> },
          { path: "compare", element: <CompareTab /> },
        ],
      },
      {
        path: "ranking",
        element: <RankingLayout />,
        children: [
          { index: true, element: <LeaderboardTab /> },
          { path: "achievements", element: <AchievementsTab /> },
        ],
      },
      {
        path: "meta",
        element: <MetaLayout />,
        children: [
          { index: true, element: <AgentsTierTab /> },
          { path: "comps", element: <CompsTab /> },
          { path: "maps", element: <MetaMapsTab /> },
          { path: "weapons", element: <MetaWeaponsTab /> },
        ],
      },
      {
        path: "game-info",
        element: <GameInfoLayout />,
        children: [
          { index: true, element: <AgentsGuideTab /> },
          { path: "agents/:agentId", element: <AgentsGuideTab /> },
          { path: "maps", element: <MapsGuideTab /> },
          { path: "maps/:mapId", element: <MapsGuideTab /> },
          { path: "weapons", element: <WeaponsGuideTab /> },
          { path: "crosshairs", element: <CrosshairsTab /> },
          { path: "lineups", element: <LineupsGuideTab /> },
          { path: "patch-notes", element: <PatchNotesTab /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      {
        path: "my",
        element: <MyLayout />,
        children: [
          { index: true, element: <AccountTab /> },
          { path: "consent", element: <ConsentCard /> },
          { path: "login-failed", element: <LoginFailedCard /> },
          { path: "record", element: <RecordTab /> },
          { path: "favorites", element: <FavoritesTab /> },
          { path: "settings", element: <SettingsTab /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      { path: "lineups", element: <MapSelectPage /> },
      { path: "lineups/:mapId", element: <AgentSelectPage /> },
      { path: "lineups/:mapId/:agentId", element: <LineupBoardPage /> },
      { path: "lineups/:mapId/:agentId/:lineupId", element: <LineupDetailPage /> },
      { path: "smokes", element: <SmokeMapSelectPage /> },
      { path: "smokes/:mapId", element: <SmokeGuidePage /> },
      { path: "smokes/:mapId/:smokeId", element: <SmokeDetailPage /> },
      // 관리자 예시 모드 (TASK-FE-055). 헤더 메뉴에는 넣지 않는다
      { path: "admin", element: <AdminGatePage /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { path: "lineups", element: <AdminListPage key="lineup" kind="lineup" /> },
          { path: "lineups/new", element: <AdminEditorPage kind="lineup" /> },
          { path: "lineups/:id", element: <AdminEditorPage kind="lineup" /> },
          { path: "smokes", element: <AdminListPage key="smoke" kind="smoke" /> },
          { path: "smokes/new", element: <AdminEditorPage kind="smoke" /> },
          { path: "smokes/:id", element: <AdminEditorPage kind="smoke" /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      ...UPCOMING_SECTIONS.flatMap(({ prefix }) => [
        { path: prefix, element: <ComingSoonPage /> },
        { path: `${prefix}/*`, element: <ComingSoonPage /> },
      ]),
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
