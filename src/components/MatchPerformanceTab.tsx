import { MatchDuelMatrix } from "./MatchDuelMatrix";
import { WeaponDistribution } from "./WeaponDistribution";
import type { MatchDetail, MatchSummary } from "../types";

interface MatchPerformanceTabProps {
  matchDetail: MatchDetail;
  matchSummary: MatchSummary;
  viewerPuuid: string;
}

export function MatchPerformanceTab({
  matchDetail,
  matchSummary,
  viewerPuuid,
}: MatchPerformanceTabProps) {
  const viewer = matchDetail.participants.find(
    (participant) => participant.puuid === viewerPuuid,
  );
  const opponents = matchDetail.participants.filter(
    (participant) => participant.team !== matchSummary.team,
  );

  return (
    <div className="performance-tab">
      <div className="match-tab-section-head">
        <div>
          <span className="match-tab-section-label">Performance</span>
          <h3>매치업 분석</h3>
        </div>
        <span className="performance-preview-badge">Demo telemetry · Mock Preview</span>
      </div>

      {viewer ? (
        <>
          <div className="performance-compact-summary">
            <span>
              플레이어
              <strong>{viewer.riotId.gameName}#{viewer.riotId.tagLine}</strong>
            </span>
            <span>
              매치 K/D/A
              <strong>
                {viewer.stats.kills}/{viewer.stats.deaths}/{viewer.stats.assists}
              </strong>
            </span>
            <span>
              매치 임팩트
              <strong>ACS {viewer.stats.averageCombatScore}</strong>
            </span>
          </div>

          <div className="performance-analysis-grid">
            {viewer.duels ? <MatchDuelMatrix
              duels={viewer.duels}
              opponents={opponents}
            /> : <p className="performance-empty">상대별 교전 기록이 아직 제공되지 않았습니다.</p>}
            {viewer.weaponKills ? <WeaponDistribution weapons={viewer.weaponKills} />
              : <p className="performance-empty">무기별 킬 기록이 아직 제공되지 않았습니다.</p>}
          </div>
        </>
      ) : (
        <p className="performance-empty">플레이어 성과 데이터가 없습니다.</p>
      )}
    </div>
  );
}
