"use client";

import { useState, type KeyboardEvent } from "react";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import { MatchPersonalSummary } from "./MatchPersonalSummary";
import { TrackerScoreboard } from "./TrackerScoreboard";
import { TrackerPerformance } from "./TrackerPerformance";
import { TrackerEconomy } from "./TrackerEconomy";
import { TrackerRounds } from "./TrackerRounds";
import { TrackerDuels } from "./TrackerDuels";
import styles from "./TrackerMatchPanel.module.css";

const tabs = [
  ["scoreboard", "Scoreboard"], ["performance", "Performance"], ["economy", "Economy"],
  ["rounds", "Rounds"], ["duels", "Duels"],
] as const;
type Tab = typeof tabs[number][0];
interface Props {
  match: MatchHistoryEntry; data: MatchDetailData; displayName: string; displayTag: string; onClose: () => void;
}

// M04 모달의 정보 헤더/5탭 구성만 담당한다. 기존 인라인 4탭은 DetailedMatchPanel에 보존한다.
export function TrackerMatchPanel({ match, data, displayName, displayTag, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("scoreboard");
  const [shareNotice, setShareNotice] = useState("");
  const id = `match-${match.id}`;
  const detailHref = `/matches/${encodeURIComponent(match.id)}?viewer=${encodeURIComponent(data.viewerPuuid)}`;
  async function copyDetailLink() {
    try {
      await navigator.clipboard.writeText(new URL(detailHref, window.location.origin).href);
      setShareNotice("같은 경기·선수의 링크를 복사했습니다.");
    } catch {
      setShareNotice("링크를 복사하지 못했습니다. 새 탭 링크를 이용해 주세요.");
    }
  }
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next][0]);
    document.getElementById(`${id}-${tabs[next][0]}-tab`)?.focus();
  }
  return <section className={styles.panel}>
    <header className={styles.header}>
      <div className={styles.matchInfo}>
        <svg className={styles.gameIcon} width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="16" cy="16" r="10"/><path d="M16 1v9m0 12v9M1 16h9m12 0h9"/><circle cx="16" cy="16" r="3"/></svg>
        <div><span className={styles.label}>{match.mode}</span><h3 id={`${id}-title`}>{match.map}</h3></div>
      </div>
      {data.detail && <div className={styles.score} aria-label={`Team A ${match.teamScore} 대 Team B ${match.enemyScore}`}>
        <div><span>Team A</span><strong>{match.teamScore}</strong></div><b aria-hidden="true">:</b><div><span>Team B</span><strong>{match.enemyScore}</strong></div>
      </div>}
      <div className={styles.when}><span className={styles.label}>{match.date} · {match.time}</span><strong>{match.duration}m</strong></div>
      {data.detail && <div className={styles.rank}><span className={styles.label}>Average Rank</span><strong title="참가자 랭크 미제공">—</strong></div>}
      <span className={styles.mock} title={data.notice}>MOCK DATA</span>
      <button className={styles.close} type="button" data-detail-close aria-label="경기 상세 닫기" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>
      </button>
    </header>
    <div className={styles.tabs} role="tablist" aria-label="경기 상세 탭">
      {tabs.map(([tab, label], index) => <button key={tab} id={`${id}-${tab}-tab`} type="button" role="tab" aria-selected={activeTab === tab} aria-controls={`${id}-${tab}-panel`} tabIndex={activeTab === tab ? 0 : -1} onClick={() => setActiveTab(tab)} onKeyDown={event => onTabKey(event, index)}>{label}</button>)}
    </div>
    {tabs.map(([tab]) => <div key={tab} id={`${id}-${tab}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}-tab`} tabIndex={0} hidden={activeTab !== tab} className={styles.content}>
      {activeTab === tab && (data.detail ? <>
        {tab === "scoreboard" && <TrackerScoreboard match={match} data={data}/>}
        {tab === "performance" && <TrackerPerformance match={match} data={data}/>}
        {tab === "economy" && <TrackerEconomy match={match} data={data}/>}
        {tab === "rounds" && <TrackerRounds match={match} data={data}/>}
        {tab === "duels" && <TrackerDuels match={match} data={data}/>}
      </> : <div className={styles.empty}>
        <h4>{tabs.find(([key]) => key === tab)?.[1]}</h4><p>{data.reason ?? "이 경기의 상세 기록은 제공되지 않았습니다."}</p>
        {(tab === "scoreboard" || tab === "performance") && <MatchPersonalSummary match={match} displayName={displayName} displayTag={displayTag} showMetrics/>}
      </div>)}
    </div>)}
    <footer className={styles.notice}>
      {data.notice}
      {data.source === "riot-synthetic" && <div className={styles.shareLinks}>
        <a href={detailHref} target="_blank" rel="noreferrer">이 경기 새 탭에서 보기</a>
        <button type="button" onClick={copyDetailLink}>경기 링크 복사</button>
        <span role="status">{shareNotice}</span>
      </div>}
    </footer>
  </section>;
}
