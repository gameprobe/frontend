import type { ComponentProps } from "react";
import { MatchEconomyChart } from "./MatchEconomyChart";
import { TeamDeltaChart } from "./TeamDeltaChart";
import type { MatchDetail, MatchParticipant } from "../types";

interface MatchAnalysisTabProps {
  matchDetail: MatchDetail;
  viewerPuuid: string;
}

function teamTotals(participants: MatchParticipant[]) {
  return participants.reduce(
    (totals, participant) => ({
      combatScore: totals.combatScore + participant.stats.averageCombatScore,
      kills: totals.kills + participant.stats.kills,
    }),
    { combatScore: 0, kills: 0 },
  );
}

// 일부 참가자만 피해량을 제공하면 팀 합계를 계산할 수 없다. 미제공과 실제 0을 구분한다.
function damageTotal(participants: MatchParticipant[], field: "damageDealt" | "damageReceived"): number | null {
  if (!participants.length || participants.some(participant => !Number.isFinite(participant.stats[field]))) return null;
  return participants.reduce((total, participant) => total + participant.stats[field]!, 0);
}

export function MatchAnalysisTab({
  matchDetail,
  viewerPuuid,
}: MatchAnalysisTabProps) {
  const viewer = matchDetail.participants.find(
    (participant) => participant.puuid === viewerPuuid,
  );
  if (!viewer) return <p className="analysis-empty">선택한 플레이어의 참가 기록이 없어 팀 분석을 표시할 수 없습니다.</p>;
  const viewerTeam = viewer.team;
  const myTeamParticipants = matchDetail.participants.filter(
    (participant) => participant.team === viewerTeam,
  );
  const opponentParticipants = matchDetail.participants.filter(
    (participant) => participant.team !== viewerTeam,
  );
  const myTeam = teamTotals(myTeamParticipants);
  const opponentTeam = teamTotals(opponentParticipants);
  if (!myTeamParticipants.length || !opponentParticipants.length) return <p className="analysis-empty">양 팀 참가 기록이 아직 제공되지 않았습니다.</p>;
  const metrics: ComponentProps<typeof TeamDeltaChart>["metrics"] = [
    { label: "전투 점수", myValue: myTeam.combatScore, opponentValue: opponentTeam.combatScore },
    { label: "총 킬", myValue: myTeam.kills, opponentValue: opponentTeam.kills },
  ];
  for (const [field, label] of [["damageDealt", "가한 피해"], ["damageReceived", "받은 피해"]] as const) {
    const myValue = damageTotal(myTeamParticipants, field);
    const opponentValue = damageTotal(opponentParticipants, field);
    if (myValue !== null && opponentValue !== null) metrics.push({ label, myValue, opponentValue, format: "compact" });
  }

  return (
    <div className="match-analysis-tab">
      <div className="match-tab-section-head">
        <div>
          <span className="match-tab-section-label">Match analysis</span>
          <h3>팀 델타 · 경제 흐름</h3>
        </div>
        <span className="analysis-preview-badge">Demo telemetry · Mock Preview</span>
      </div>

      <TeamDeltaChart metrics={metrics} />
      {metrics.length < 4 && <p className="analysis-empty">팀 피해량은 전체 참가자의 기록이 준비되면 표시됩니다. 현재는 미제공입니다.</p>}

      <MatchEconomyChart rounds={matchDetail.rounds} viewerTeam={viewerTeam} />
    </div>
  );
}
