import type { ReactNode } from "react";
import { number, percent } from "../format";
import s from "./MatchHistory.module.css";

interface RecentSummaryProps {
  summary: { wins: number; losses: number; winRate: number | null; kd: number | null; adr: number | null };
  matchingCount: number;
  agents: readonly {
    id?: string;
    agent: string;
    portrait: ReactNode;
    wins: number;
    losses: number;
    winRate: number | null;
    kd: number | null;
  }[];
  matches: readonly {
    id: string;
    dateLabel: string;
    teamScore: number;
    enemyScore: number;
    victory: boolean;
    kd: number | null;
    onSelect: () => void;
  }[];
}

// M02: 최근20경기 요약과 최근8경기 스트립. 집계·대상 선택·스크롤은 부모 책임이다.
export function RecentSummary({ summary, matchingCount, agents, matches }: RecentSummaryProps) {
  return <>
    <div className={s.recentSummary} aria-live="polite">
      <div>
        <strong><em>{summary.wins}W</em> - <b>{summary.losses}L</b> <span>({percent(summary.winRate, 0)})</span></strong>
        <small>{number(summary.kd, 2)} K/D | {number(summary.adr, 0)} ADR</small>
        <small>{matchingCount} matching games · latest {Math.min(matchingCount, 20)}</small>
      </div>
      <div className={s.recentAgents}>
        {agents.map(item => <div key={item.id ?? item.agent}>
          {item.portrait}
          <span><b>{item.wins}W - {item.losses}L</b> ({percent(item.winRate, 0)})<small>K/D {number(item.kd, 2)}</small></span>
        </div>)}
      </div>
    </div>
    {!!matches.length && <div className={s.formStrip}>
      {matches.map(match => <button key={match.id} className={match.victory ? s.formWin : s.formLoss} onClick={match.onSelect}>
        <small>{match.dateLabel}</small>
        <strong>{match.teamScore} : <span>{match.enemyScore}</span></strong>
        <span>K/D {number(match.kd)}</span>
      </button>)}
    </div>}
  </>;
}
