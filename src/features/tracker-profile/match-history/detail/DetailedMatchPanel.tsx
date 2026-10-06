import { MatchAnalysisTab } from "../../../../components/MatchAnalysisTab";
import { MatchPerformanceTab } from "../../../../components/MatchPerformanceTab";
import { MatchRoundsTab } from "../../../../components/MatchRoundsTab";
import { MatchScoreboardTab } from "../../../../components/MatchScoreboardTab";
import { MatchTabs, type MatchTabId } from "../../../../components/MatchTabs";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import { MatchPersonalSummary } from "./MatchPersonalSummary";
import { TrackerScoreboard } from "./TrackerScoreboard";
import { TrackerPerformance } from "./TrackerPerformance";
import { TrackerRounds } from "./TrackerRounds";
import { TrackerEconomy } from "./TrackerEconomy";
import type { MatchDetailPresentation } from "./presentation";
import s from "./MatchDetailTheme.module.css";

interface DetailedMatchPanelProps {
  match: MatchHistoryEntry;
  data: MatchDetailData;
  displayName: string;
  displayTag: string;
  activeTab: MatchTabId;
  onTabChange: (tab: MatchTabId) => void;
  presentation?: MatchDetailPresentation;
  onClose?: () => void;
}

const tabIds: MatchTabId[] = ["scoreboard", "rounds", "performance", "analysis"];

// M04 표시 조합: 기존 4탭과 누락 안내를 현재 테마 안에 배치한다.
// 같은 경기/선수인지와 제공 가능한 데이터의 판정은 detailData/mockDetail 경계에서 처리한다.
export function DetailedMatchPanel({ match, data, displayName, displayTag, activeTab, onTabChange, presentation = "inline", onClose }: DetailedMatchPanelProps) {
  const { detail, viewerPuuid } = data;
  const panelPrefix = `match-${match.id}`;
  const noDetail = <div className={s.unavailable}>
    <strong>상세 기록 미제공</strong>
    <p>{data.reason ?? "이 경기의 상세 기록이 아직 준비되지 않았습니다."}</p>
  </div>;

  function tabContent(tab: MatchTabId) {
    if (!detail) {
      return <>
        {noDetail}
        {(tab === "scoreboard" || tab === "performance") && <MatchPersonalSummary
          match={match} displayName={displayName} displayTag={displayTag} showMetrics={tab === "performance"}
        />}
      </>;
    }
    if (data.source === "riot-synthetic") {
      switch (tab) {
        case "scoreboard": return <TrackerScoreboard match={match} data={data} />;
        case "rounds": return <TrackerRounds match={match} data={data} />;
        case "performance": return <TrackerPerformance match={match} data={data} />;
        case "analysis": return <TrackerEconomy match={match} data={data} />;
      }
    }
    switch (tab) {
      case "scoreboard": return <>
        <p className={s.dataNote}>— 는 미제공 기록입니다. FK: 첫 킬 · FD: 첫 데스</p>
        <MatchScoreboardTab matchDetail={data.detail!} matchSummary={data.summary} viewerPuuid={viewerPuuid} />
      </>;
      case "rounds": return <MatchRoundsTab matchDetail={data.detail!} matchSummary={data.summary} />;
      case "performance": return <>
        <MatchPersonalSummary match={match} displayName={displayName} displayTag={displayTag} showMetrics />
        <MatchPerformanceTab matchDetail={data.detail!} matchSummary={data.summary} viewerPuuid={viewerPuuid} />
      </>;
      case "analysis": return <MatchAnalysisTab matchDetail={data.detail!} viewerPuuid={viewerPuuid} />;
    }
  }

  return <section className={`${s.panel}${presentation === "modal" ? ` ${s.modalPanel}` : ""}`} aria-label="경기 상세">
    <header className={s.heading}>
      <div className={s.headingCopy}>
        <span>{match.mode} · 경기 상세</span>
        <h3 id={`${panelPrefix}-title`}>{match.map} <strong>{match.teamScore} : {match.enemyScore}</strong></h3>
      </div>
      <div className={s.headingMeta}>
        <span>{match.date} {match.time}</span>
        <span>{match.duration}분</span>
        <span>Mock Preview</span>
      </div>
      {presentation === "modal" && <button type="button" className={s.closeButton} onClick={onClose} aria-label="경기 상세 닫기" data-detail-close>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>}
    </header>
    <p className={s.dataNote}>{data.notice}</p>
    <MatchTabs activeTab={activeTab} panelPrefix={panelPrefix} onTabChange={onTabChange} />
    {/* 모든 aria-controls 대상은 유지하고, 비활성 탭의 상태는 기존처럼 해제한다. */}
    {tabIds.map(tab => <div
      key={tab} className={s.body} role="tabpanel" hidden={activeTab !== tab}
      id={`${panelPrefix}-${tab}-panel`} aria-labelledby={`${panelPrefix}-${tab}-tab`} tabIndex={0}
    >{activeTab === tab && tabContent(tab)}</div>)}
    <p className={s.footnote}>Mock 경기 데이터 · 실제 Riot 경기 기록은 연결되지 않았습니다.
      {data.source === "riot-synthetic" && <> · <a href={`/matches/${encodeURIComponent(match.id)}?viewer=${encodeURIComponent(viewerPuuid)}`} target="_blank" rel="noreferrer">같은 경기·선수 새 탭에서 보기</a></>}
    </p>
  </section>;
}
