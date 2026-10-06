"use client";

import Image from "next/image";
import { useState } from "react";
import { getAgentAssetPath } from "../../../../lib/asset-map";
import { branding } from "../../../stats-shell/branding";
import type { SyntheticParticipant } from "../../data/matchDetail";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import styles from "./TrackerScoreboard.module.css";

interface Props { match: MatchHistoryEntry; data: MatchDetailData; showTimeline?: boolean }
type Metric = "ps" | "acs" | "kills" | "deaths" | "assists" | "difference" | "kd" | "dda" | "adr" | "hs" | "kast" | "fk" | "fd" | "mk";
const columns: { key: Metric; label: string; title: string }[] = [
  { key: "ps", label: branding.scoreAbbreviation, title: `${branding.scoreName} · ${branding.name} 표본 점수` },
  { key: "acs", label: "ACS", title: "Average Combat Score" },
  { key: "kills", label: "K", title: "Kills" }, { key: "deaths", label: "D", title: "Deaths" },
  { key: "assists", label: "A", title: "Assists" }, { key: "difference", label: "+/−", title: "Kills − Deaths" },
  { key: "kd", label: "K/D", title: "Kill / Death Ratio" }, { key: "dda", label: "DDΔ", title: "Damage Delta per Round" },
  { key: "adr", label: "ADR", title: "Average Damage per Round" }, { key: "hs", label: "HS%", title: "Headshot Percentage" },
  { key: "kast", label: "KAST", title: "Kill, Assist, Survive or Trade" },
  { key: "fk", label: "FK", title: "First Kills" }, { key: "fd", label: "FD", title: "First Deaths" },
  { key: "mk", label: "MK", title: "Multi Kills" },
];

// 모달 Scoreboard/Economy에서 공유하는 표. 프로필의 랭크를 모든 참가자에게 복사하지 않는다.
export function TrackerScoreboard({ match, data, showTimeline = true }: Props) {
  const [sort, setSort] = useState<{ key: Metric; direction: "ascending" | "descending" }>({ key: "acs", direction: "descending" });
  if (!data.detail) return <p className={styles.missing}>{data.reason ?? "스코어보드 기록이 제공되지 않았습니다."}</p>;
  const { participants, rounds } = data.detail;
  const teamA = data.summary.team;
  const teams = [teamA, ...Array.from(new Set(participants.map(player => player.team))).filter(team => team !== teamA)];
  function value(player: SyntheticParticipant, key: Metric): number | undefined {
    const stats = player.stats, viewer = player.puuid === data.viewerPuuid;
    switch (key) {
      case "ps": return data.source !== "riot-synthetic" && viewer ? match.score ?? undefined : undefined;
      case "acs": return stats.averageCombatScore;
      case "kills": return stats.kills;
      case "deaths": return stats.deaths;
      case "assists": return stats.assists;
      case "difference": return stats.kills - stats.deaths;
      case "kd": return stats.deaths === 0 ? data.source === "riot-synthetic" ? undefined : stats.kills : stats.kills / stats.deaths;
      case "dda": return data.source === "riot-synthetic" && stats.damageDealt !== undefined && stats.damageReceived !== undefined
        ? (stats.damageDealt - stats.damageReceived) / rounds.length : viewer ? match.dd ?? undefined : undefined;
      case "adr": return stats.adr;
      case "hs": return stats.headshotPercentage ?? undefined;
      case "kast": return data.source !== "riot-synthetic" && viewer ? match.kast ?? undefined : undefined;
      case "fk": return stats.firstKills;
      case "fd": return stats.firstDeaths;
      case "mk": return stats.multiKills;
    }
  }
  const display = (number: number | undefined, key: Metric) => {
    if (number === undefined) return "—";
    if (key === "kd") return number.toFixed(2);
    const displayed = data.source === "riot-synthetic" ? Number(number.toFixed(1)) : number;
    if (key === "hs" || key === "kast") return `${displayed}%`;
    if ((key === "difference" || key === "dda") && number > 0) return `+${displayed}`;
    return displayed;
  };
  const changeSort = (key: Metric) => setSort(current => ({ key, direction: current.key === key && current.direction === "descending" ? "ascending" : "descending" }));
  return <div className={styles.scoreboard}>
    {showTimeline && <div className={styles.timelineScroll} tabIndex={0} role="region" aria-label="라운드 승리 타임라인">
      <div className={styles.timeline}>
        <div className={styles.totals}><span>Team A <b className={styles.positive}>{match.teamScore}</b></span><span>Team B <b className={styles.negative}>{match.enemyScore}</b></span></div>
        {rounds.map(round => <div className={styles.round} key={round.roundNumber} title={`Round ${round.roundNumber}: ${round.winningTeam === teamA ? "Team A" : "Team B"} 승리 · ${round.endType || "종료 원인 미제공"}`}>
          <span className={round.winningTeam === teamA ? styles.positive : styles.inactive}>{round.winningTeam === teamA ? "◆" : "·"}</span>
          <span className={round.winningTeam !== teamA ? styles.negative : styles.inactive}>{round.winningTeam !== teamA ? "◆" : "·"}</span>
          <small>{round.roundNumber}</small>
        </div>)}
      </div>
    </div>}
    <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="경기 스코어보드 가로 스크롤">
      <table className={styles.table} aria-label="경기 스코어보드">
        <colgroup><col className={styles.playerColumn}/><col className={styles.rankColumn}/>{columns.map(column => <col key={column.key}/>)}</colgroup>
        {teams.map((team, index) => <tbody key={team} className={index === 0 ? styles.teamA : styles.teamB}>
          <tr className={styles.heading}>
            <th scope="col" className={styles.teamHeading}>Team {index === 0 ? "A" : "B"}<span> · Avg. Rank: —</span></th>
            <th scope="col" title="경기 랭크 미제공">Match Rank</th>
            {columns.map(column => <th key={column.key} scope="col" aria-sort={sort.key === column.key ? sort.direction : undefined}>
              <button type="button" title={column.title} onClick={() => changeSort(column.key)} aria-label={`${index === 0 ? "Team A" : "Team B"} ${column.label} 정렬`}>
                {sort.key === column.key && <span aria-hidden="true">{sort.direction === "descending" ? "▾" : "▴"} </span>}{column.label}
              </button>
            </th>)}
          </tr>
          {participants.filter(player => player.team === team).sort((left, right) => {
            const a = value(left, sort.key), b = value(right, sort.key);
            if (a === undefined) return b === undefined ? 0 : 1;
            if (b === undefined) return -1;
            return (a - b) * (sort.direction === "ascending" ? 1 : -1);
          }).map(player => <tr key={player.puuid} data-viewer={player.puuid === data.viewerPuuid || undefined}>
            <th scope="row" className={styles.player}>
              <Image src={getAgentAssetPath(player.agentId)} alt={player.agent} width={40} height={40}/>
              <span className={styles.identity}><span className={styles.name} title={`${player.riotId.gameName}#${player.riotId.tagLine}`}>{player.riotId.gameName} <small>#{player.riotId.tagLine}</small></span><span className={styles.agent}>{player.agent}{player.puuid === data.viewerPuuid && <b>YOU</b>}</span></span>
            </th>
            <td className={styles.unavailable}>—</td>
            {columns.map(column => {
              const number = value(player, column.key);
              const signed = column.key === "difference" || column.key === "dda" || column.key === "kd";
              const compare = column.key === "kd" ? 1 : 0;
              const tone = number === undefined ? styles.unavailable : signed && number !== compare ? number > compare ? styles.positive : styles.negative : "";
              return <td key={column.key} className={`${sort.key === column.key ? styles.sorted : ""} ${tone}`}>{display(number, column.key)}</td>;
            })}
          </tr>)}
        </tbody>)}
      </table>
    </div>
    <p className={styles.note}>{data.source === "riot-synthetic"
      ? `— 미제공 또는 분모 0 · ${branding.scoreAbbreviation}/KAST와 랭크 명칭은 미제공입니다. ACS는 합성 score의 라운드 평균입니다.`
      : `— 미제공 기록 · ${branding.scoreAbbreviation}는 ${branding.name} 표본 점수입니다. 참가자 랭크와 라운드 종료 원인은 제공되지 않았습니다.`}</p>
  </div>;
}
