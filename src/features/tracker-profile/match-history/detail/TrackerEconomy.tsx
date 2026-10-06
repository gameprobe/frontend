"use client";

import { useState } from "react";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import { TrackerScoreboard } from "./TrackerScoreboard";
import s from "./TrackerEconomy.module.css";

interface TrackerEconomyProps {
  match: MatchHistoryEntry;
  data: MatchDetailData;
}

const views = {
  Bank: "라운드별 보유 크레딧",
  Loadout: "라운드별 장비 가치",
  Total: "라운드별 보유 크레딧과 장비 가치 합계",
} as const;
type EconomyView = keyof typeof views;

// M04 모달 Economy 탭. 새 표본은 원본 라운드별 팀 경제 합계를 표시한다.
// legacy는 미제공 안내와 기존 스코어보드를 유지한다.
export function TrackerEconomy({ match, data }: TrackerEconomyProps) {
  const [view, setView] = useState<EconomyView>("Total");
  const rounds = data.detail?.rounds ?? [];
  const available = data.source === "riot-synthetic" && rounds.length > 0 && rounds.every(round => round.economy?.attackersBank !== undefined && round.economy?.defendersBank !== undefined);
  const average = (field: "attackersBank" | "defendersBank" | "attackersLoadout" | "defendersLoadout") => available
    ? Math.round(rounds.reduce((total, round) => total + round.economy![field]!, 0) / rounds.length).toLocaleString("en-US") : "—";
  const roundValue = (round: typeof rounds[number], side: "attackers" | "defenders") => {
    const bank = round.economy![side === "attackers" ? "attackersBank" : "defendersBank"]!;
    const loadout = round.economy![side === "attackers" ? "attackersLoadout" : "defendersLoadout"];
    return (view === "Bank" ? bank : view === "Loadout" ? loadout : bank + loadout).toLocaleString("en-US");
  };

  return <div className={s.economy}>
    <section className={s.region} aria-label="경기 경제 기록">
      <div className={s.heading}>
        <h3>Economy</h3>
        <div className={s.averages}>
          <span>Avg. Bank: <strong>{average("attackersBank")} / {average("defendersBank")}</strong></span>
          <span>Avg. Loadout: <strong>{average("attackersLoadout")} / {average("defendersLoadout")}</strong></span>
        </div>
        <div className={s.controls} role="group" aria-label="경제 보기 선택">
          {(Object.keys(views) as EconomyView[]).map(option => <button
            type="button"
            key={option}
            aria-pressed={view === option}
            className={view === option ? s.active : undefined}
            onClick={() => setView(option)}
          >{option}</button>)}
        </div>
      </div>
      {/* 원본 수치가 있으면 표로 표시하고 없으면 미제공 사유를 표시한다. */}
      {available ? <div className={s.records} role="region" aria-label={`${view} 라운드별 팀 경제 기록`} tabIndex={0}>
        <table><caption>{views[view]} · Team A / Team B 합계</caption><thead><tr><th>Round</th><th>Team A</th><th>Team B</th></tr></thead>
          <tbody>{rounds.map(round => <tr key={round.roundNumber}><th scope="row">{round.roundNumber}</th><td>{roundValue(round, "attackers")}</td><td>{roundValue(round, "defenders")}</td></tr>)}</tbody>
        </table><p>라운드별 합성 관측값입니다. 평균은 전체 {rounds.length}라운드 기준이며, 구매 이력과 실제 게임 경제 규칙을 재현하지 않습니다.</p>
      </div> : <div className={s.graphEmpty} aria-live="polite" aria-atomic="true">
        <strong>{view} · 경제 기록 미제공</strong>
        <p>{views[view]} 데이터가 없어 그래프를 표시할 수 없습니다.</p>
        <span>누락된 값은 0으로 계산하지 않습니다.</span>
      </div>}
    </section>
    <TrackerScoreboard match={match} data={data} showTimeline={false} />
  </div>;
}
