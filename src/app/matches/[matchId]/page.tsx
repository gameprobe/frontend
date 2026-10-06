import { SyntheticMatchPage } from "../../../features/tracker-profile/SyntheticMatchPage";
import { demoProfile } from "../../../features/tracker-profile/data/provider";
import { MatchDetailView } from "../../../components/MatchDetailView";
import { getMatchDetail } from "../../../lib/mock-data";
import { MissingRecordPage } from "../../../features/stats-shell/SupportPage";
import { ContentPageShell } from "../../../features/stats-shell/ContentPageShell";

interface MatchDetailPageProps {
  searchParams?: { viewer?: string };
  params: {
    matchId: string;
  };
}

export default function MatchDetailPage({ params, searchParams }: MatchDetailPageProps) {
  const matchId = decodeURIComponent(params.matchId);
  if (matchId.startsWith("demo-match-")) return <SyntheticMatchPage matchId={matchId} viewerPuuid={searchParams?.viewer ?? demoProfile.puuid} />;
  const matchDetail = getMatchDetail(matchId);

  if (!matchDetail) return <MissingRecordPage
    eyebrow="Match detail"
    title={{ ko: "경기를 찾을 수 없음", en: "Match not found" }}
    description={{ ko: "이 경기의 데모 기록이 없습니다.", en: "No demo record is available for this match." }}
  />;

  return (
    <ContentPageShell current="overview">
      <MatchDetailView matchDetail={matchDetail} />
    </ContentPageShell>
  );
}
