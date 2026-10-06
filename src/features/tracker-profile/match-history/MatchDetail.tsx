import { DetailedMatchPanel } from "./detail/DetailedMatchPanel";
import { getMockMatchDetail } from "./detail/mockDetail";
import { MatchDetailDialog } from "./detail/MatchDetailDialog";
import { matchDetailPresentation } from "./detail/presentation";
import { TrackerMatchPanel } from "./detail/TrackerMatchPanel";
import { getSyntheticMatchDetail } from "../data/matchDetail";
import type { MatchDetailData } from "./detail/detailData";
import type { MatchDetailContext, MatchHistoryEntry } from "./types";

interface MatchDetailProps extends MatchDetailContext {
  match: MatchHistoryEntry;
}

// M04 연결부: 선택 경기와 조회 중인 프로필을 데이터 공급자에게 넘긴다.
// API 확보 후에는 공급자를 교체한다. 표시 컴포넌트는 Mock 생성·조회 방법을 알지 않는다.
export function MatchDetail({ match, viewerPuuid, displayName, displayTag, detailTab, onDetailTabChange, onDetailClose }: MatchDetailProps) {
  let data: MatchDetailData;
  if (match.id.startsWith("demo-match-")) {
    const synthetic = getSyntheticMatchDetail(match.id, viewerPuuid);
    if (!synthetic) return <p role="status">선택한 경기·선수의 합성 상세 기록이 없습니다.</p>;
    data = synthetic;
  } else {
    const { adr, acs, hs } = match;
    if (adr === null || acs === null || hs === null) return <p role="status">기존 상세 표본에 필요한 개인 기록이 없습니다.</p>;
    data = getMockMatchDetail({ ...match, adr, acs, hs }, { puuid: viewerPuuid, gameName: displayName, tagLine: displayTag });
  }
  const panel = <DetailedMatchPanel
    match={match} data={data} displayName={displayName} displayTag={displayTag}
    activeTab={detailTab} onTabChange={onDetailTabChange}
    presentation={matchDetailPresentation} onClose={onDetailClose}
  />;
  // 인라인은 기존 4탭을 보존하고, 모달은 같은 공급 데이터로 Tracker 형태의 5탭을 표시한다.
  if (matchDetailPresentation === "inline") return <div id={`details-${match.id}`}>{panel}</div>;
  return <MatchDetailDialog id={`details-${match.id}`} labelledBy={`match-${match.id}-title`} onClose={onDetailClose}>
    <TrackerMatchPanel match={match} data={data} displayName={displayName} displayTag={displayTag} onClose={onDetailClose}/>
  </MatchDetailDialog>;
}
