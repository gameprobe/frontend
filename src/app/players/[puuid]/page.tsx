import { demoProfile, demoScenario } from "../../../features/tracker-profile/data/provider";
import { TrackerProfile } from "../../../features/tracker-profile/TrackerProfile";
import { getDemoPlayerByPuuid } from "../../../lib/mock-data";
import { MissingRecordPage } from "../../../features/stats-shell/SupportPage";

interface PlayerRoutePageProps {
  searchParams?: { scenario?: string };
  params: {
    puuid: string;
  };
}

export default function PlayerRoutePage({ params, searchParams }: PlayerRoutePageProps) {
  const puuid = decodeURIComponent(params.puuid);
  if (puuid === demoProfile.puuid) return <TrackerProfile key={puuid} playerId={puuid} playerName={demoProfile.name} playerTag={demoProfile.tag} synthetic scenario={demoScenario(searchParams?.scenario)} />;
  const player = getDemoPlayerByPuuid(puuid);

  if (player || puuid === "ied-agent-allen") {
    return (
      <TrackerProfile
        playerId={puuid}
        playerName={player?.riotId.gameName ?? "IED agent"}
        playerTag={player?.riotId.tagLine ?? "Allen"}
      />
    );
  }

  return (
    <MissingRecordPage
      eyebrow="Player profile"
      title={{ ko: "플레이어를 찾을 수 없음", en: "Player not found" }}
      description={{ ko: "이 플레이어의 데모 기록이 없습니다.", en: "No demo record is available for this player." }}
    />
  );
}
