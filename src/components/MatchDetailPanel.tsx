"use client";

import { useState } from "react";
import type { MatchDetail, MatchSummary } from "../types";
import { MatchAnalysisTab } from "./MatchAnalysisTab";
import { MatchPerformanceTab } from "./MatchPerformanceTab";
import { MatchRoundsTab } from "./MatchRoundsTab";
import { MatchScoreboardTab } from "./MatchScoreboardTab";
import { MatchTabs, type MatchTabId } from "./MatchTabs";

interface MatchDetailPanelProps {
  matchDetail: MatchDetail | null;
  matchSummary: MatchSummary;
  viewerPuuid: string;
}

export function MatchDetailPanel({
  matchDetail,
  matchSummary,
  viewerPuuid,
}: MatchDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<MatchTabId>("scoreboard");
  const panelPrefix = `match-${matchSummary.matchId}`;

  return (
    <div className="match-detail-panel">
      <div className="match-detail-panel-head">
        <div>
          <p className="eyebrow">Inline match detail</p>
          <h3>경기 상세</h3>
        </div>
      </div>
      {matchDetail ? (
        <>
          <MatchTabs
            activeTab={activeTab}
            panelPrefix={panelPrefix}
            onTabChange={setActiveTab}
          />
          <div
            aria-labelledby={`${panelPrefix}-${activeTab}-tab`}
            className="match-tab-panel"
            id={`${panelPrefix}-${activeTab}-panel`}
            role="tabpanel"
            tabIndex={0}
          >
            {activeTab === "scoreboard" ? (
              <MatchScoreboardTab
                matchDetail={matchDetail}
                matchSummary={matchSummary}
                viewerPuuid={viewerPuuid}
              />
            ) : null}
            {activeTab === "rounds" ? (
              <MatchRoundsTab matchDetail={matchDetail} matchSummary={matchSummary} />
            ) : null}
            {activeTab === "performance" ? (
              <MatchPerformanceTab
                matchDetail={matchDetail}
                matchSummary={matchSummary}
                viewerPuuid={viewerPuuid}
              />
            ) : null}
            {activeTab === "analysis" ? (
              <MatchAnalysisTab
                matchDetail={matchDetail}
                viewerPuuid={viewerPuuid}
              />
            ) : null}
          </div>
        </>
      ) : (
        <div className="match-detail-empty">
          <h3>상세 데이터 없음</h3>
          <p>이 Mock 경기에는 아직 스코어보드와 라운드 상세 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
