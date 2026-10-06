"use client";

import Image from "next/image";
import { useState } from "react";
import { getAgentAssetPath, getAgentFullAssetPath, getWeaponAssetPath } from "../../../../lib/asset-map";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import styles from "./TrackerPerformance.module.css";

interface TrackerPerformanceProps { match: MatchHistoryEntry; data: MatchDetailData }
type DuelSort = { field: "kills" | "deaths"; descending: boolean };

// 모달 Performance 전용. 경기나 프로필이 바뀌면 선택 선수를 원래 조회 선수로 초기화한다.
export function TrackerPerformance(props: TrackerPerformanceProps) {
  return <PerformanceContent key={`${props.match.id}:${props.data.viewerPuuid}`} {...props} />;
}

function PerformanceContent({ match, data }: TrackerPerformanceProps) {
  const [selectedId, setSelectedId] = useState(data.viewerPuuid);
  const [duelSort, setDuelSort] = useState<DuelSort>({ field: "kills", descending: true });
  const [weaponDescending, setWeaponDescending] = useState(true);
  const detail = data.detail;
  const viewer = detail?.participants.find(player => player.puuid === data.viewerPuuid);
  if (!detail || !viewer) {
    return <div className={styles.empty}><h3>Performance</h3><p>{data.reason ?? "선택 선수의 참가 기록이 없어 성과 상세를 표시할 수 없습니다."}</p></div>;
  }

  const selected = detail.participants.find(player => player.puuid === selectedId) ?? viewer;
  const teamA = detail.participants.filter(player => player.team === viewer.team);
  const teamB = detail.participants.filter(player => player.team !== viewer.team);
  const isTeamA = selected.team === viewer.team;
  const stats = selected.stats;
  const portraitSrc = getAgentFullAssetPath(selected.agentId);
  const synthetic = data.source === "riot-synthetic";
  const kd = stats.deaths === 0 && synthetic ? "—" : (stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills).toFixed(2);
  const displayNumber = (value: number | null) => value === null ? "—" : synthetic ? String(Number(value.toFixed(1))) : String(value);
  const personalRound = (roundNumber: number) => data.source === "riot-synthetic" ? data.roundPlayers[roundNumber]?.[selected.puuid] : undefined;
  const sideSummary = (side: string) => {
    if (data.source !== "riot-synthetic") return null;
    const records = detail.rounds.map(round => data.roundPlayers[round.roundNumber]?.[selected.puuid]);
    if (records.some(record => !record || record.side === null)) return null;
    return records.filter(record => record.side === side).reduce((total, record) => ({
      kills: total.kills + record.kills, deaths: total.deaths + record.deaths, assists: total.assists + record.assists,
    }), { kills: 0, deaths: 0, assists: 0 });
  };
  const opponents = detail.participants.filter(player => player.team !== selected.team).map(player => ({
    player, duel: selected.duels?.find(duel => duel.opponentPuuid === player.puuid),
  })).sort((a, b) => {
    if (!a.duel) return b.duel ? 1 : 0;
    if (!b.duel) return -1;
    return (a.duel[duelSort.field] - b.duel[duelSort.field]) * (duelSort.descending ? -1 : 1);
  });
  const weapons = selected.weaponKills?.slice().sort((a, b) => (a.kills - b.kills) * (weaponDescending ? -1 : 1));
  const changeDuelSort = (field: DuelSort["field"]) => setDuelSort(current => ({ field, descending: current.field === field ? !current.descending : true }));
  const metrics = [
    ["K/D/A", `${stats.kills} / ${stats.deaths} / ${stats.assists}`], ["K/D", kd],
    ["ADR", displayNumber(stats.adr)], ["ACS", displayNumber(stats.averageCombatScore)],
    ["HS%", stats.headshotPercentage === null ? "—" : `${displayNumber(stats.headshotPercentage)}%`],
    ["KAST", !synthetic && selected.puuid === data.viewerPuuid && Number.isFinite(match.kast) ? `${match.kast}%` : "—"],
  ];

  return <div className={styles.performance}>
    <div className={styles.selectorScroll} role="region" aria-label="성과를 볼 참가자 선택" tabIndex={0}>
      <div className={styles.selector}>
        {[teamA, teamB].map((team, index) => <div key={index} className={`${styles.teamSelector} ${index === 0 ? styles.teamA : styles.teamB}`}>
          {index === 1 && <span className={styles.versus} aria-hidden="true">VS</span>}
          <strong className={styles.teamName}>Team {index === 0 ? "A" : "B"}</strong>
          {team.map(player => <button type="button" key={player.puuid} className={styles.playerButton}
            aria-pressed={selected.puuid === player.puuid}
            aria-label={`${player.riotId.gameName} #${player.riotId.tagLine} 성과 보기`}
            title={`${player.riotId.gameName} #${player.riotId.tagLine} · ${player.agent}`}
            onClick={() => setSelectedId(player.puuid)}>
            <Image src={getAgentAssetPath(player.agentId)} alt="" width={60} height={60} />
          </button>)}
        </div>)}
      </div>
    </div>

    <section className={`${styles.playerSummary} ${isTeamA ? styles.summaryA : styles.summaryB}`} aria-label={`${selected.riotId.gameName} 개인 기록`}>
      <div className={styles.identity}>
        <div className={styles.portraitFrame}>
          <Image className={portraitSrc.endsWith("/placeholder.svg") ? styles.placeholderPortrait : styles.portrait} src={portraitSrc} alt={selected.agent} width={180} height={240} />
        </div>
        <div className={styles.summaryContent}>
          <p className={styles.playerMeta}>Team {isTeamA ? "A" : "B"} · {selected.agent}</p>
          <h3>{selected.riotId.gameName}<span>#{selected.riotId.tagLine}</span></h3>
          <dl className={styles.metrics}>{metrics.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
      </div>

      {/* 팀 식별자와 공수 역할은 다르다. 새 원본의 개인 라운드 기록이 있을 때만 K/D/A를 연결한다. */}
      <div className={styles.roundHeading}><span>팀 라운드 결과 · {synthetic ? "개인 K/D/A" : "개인 라운드 기록 미제공"}</span></div>
      {detail.rounds.length ? <div className={styles.roundScroll} role="region" aria-label="팀 라운드 결과" tabIndex={0}>
        <ol className={styles.roundStrip}>{detail.rounds.map(round => {
          const won = round.winningTeam === selected.team;
          const record = personalRound(round.roundNumber);
          const recordText = record ? `${record.kills}/${record.deaths}/${record.assists}` : "—";
          return <li key={round.roundNumber} className={won ? styles.roundWin : styles.roundLoss} aria-label={`${round.roundNumber}라운드 팀 ${won ? "승리" : "패배"}, ${record ? `개인 K/D/A ${recordText}` : "개인 기록 미제공"}`}>
            <span>{round.roundNumber}</span><b aria-hidden="true">{recordText}</b><em>{won ? "W" : "L"}</em>
          </li>;
        })}</ol>
      </div> : <p className={styles.missing}>라운드 기록 미제공</p>}
    </section>

    <section className={styles.allRounds} aria-label="진영별 개인 기록">
      <h3>All Rounds</h3>
      <div className={styles.sides}>{["Attack", "Defense"].map(side => {
        const record = sideSummary(side);
        const values = record ? [record.kills, record.assists, record.deaths, record.deaths ? (record.kills / record.deaths).toFixed(2) : "—"] : ["—", "—", "—", "—"];
        return <div key={side} className={styles.side}>
        <div className={styles.sideHeading}><h4>{side}</h4>
          <dl>{["Kills", "Assists", "Deaths", "K/D"].map((label, index) => <div key={label}><dt>{label}</dt><dd>{values[index]}</dd></div>)}</dl>
        </div>
        <p className={styles.sideNotice}>{record ? "라운드별 실제 공수 역할을 기준으로 합산한 합성 기록" : "진영별 기록 미제공"}</p>
      </div>; })}</div>
    </section>

    <div className={styles.tables}>
      <section className={styles.tableSection} aria-label="선택 선수의 상대별 교전">
        <h3 className={styles.srOnly}>Opponents · 상대별 교전</h3>
        {!selected.duels && <p className={styles.missing}>이 선수의 상대별 교전 기록은 미제공입니다.</p>}
        {selected.duels?.length === 0 && <p className={styles.missing}>기록된 교전 0건 · 상대별 기록은 없습니다.</p>}
        <div className={styles.tableScroll} role="region" aria-label="상대별 교전 표" tabIndex={0}>
          <table className={styles.opponentTable}><thead><tr>
            {(["kills", "deaths"] as const).map(field => <th key={field} scope="col" aria-sort={duelSort.field === field ? duelSort.descending ? "descending" : "ascending" : "none"}>
              <button type="button" onClick={() => changeDuelSort(field)}>{field === "kills" ? "Kills" : "Deaths"}<span aria-hidden="true">{duelSort.field === field ? duelSort.descending ? " ↓" : " ↑" : " ↕"}</span></button>
            </th>)}
            <th scope="col">Dealt</th><th scope="col">Received</th><th scope="col">Opponent</th>
          </tr></thead><tbody>{opponents.map(({ player, duel }) => <tr key={player.puuid}>
            <td className={styles.kills}>{duel?.kills ?? "—"}</td><td>{duel?.deaths ?? "—"}</td>
            <td className={styles.muted}>{data.source === "riot-synthetic" ? data.opponentDamage[selected.puuid]?.[player.puuid]?.dealt ?? "—" : "—"}</td>
            <td className={styles.muted}>{data.source === "riot-synthetic" ? data.opponentDamage[selected.puuid]?.[player.puuid]?.received ?? "—" : "—"}</td>
            <th scope="row" className={isTeamA ? styles.opponentB : styles.opponentA}><div className={styles.opponentIdentity}>
              <Image src={getAgentAssetPath(player.agentId)} alt="" width={38} height={38} />
              <span>{player.riotId.gameName}<small>#{player.riotId.tagLine}</small></span>
            </div></th>
          </tr>)}</tbody></table>
        </div>
        <p className={styles.tableNote}>Dealt / Received: {synthetic ? "같은 원본의 상대별 피해 합계" : "상대별 피해 기록 미제공"}</p>
      </section>

      <section className={styles.tableSection} aria-label="선택 선수의 무기별 기록">
        <h3 className={styles.srOnly}>Weapons · 무기별 기록</h3>
        <div className={styles.tableScroll} role="region" aria-label="무기별 기록 표" tabIndex={0}>
          <table className={styles.weaponTable}><thead><tr><th scope="col">Weapon</th>
            <th scope="col" aria-sort={weaponDescending ? "descending" : "ascending"}><button type="button" onClick={() => setWeaponDescending(current => !current)}>Kills <span aria-hidden="true">{weaponDescending ? "↓" : "↑"}</span></button></th>
            <th scope="col">Damage</th></tr></thead>
            <tbody>{weapons?.length ? weapons.map(weapon => <tr key={weapon.weaponId}>
              <th scope="row"><div className={styles.weaponIdentity}><span>{weapon.displayName}</span><Image src={getWeaponAssetPath(weapon.weaponId)} alt="" width={140} height={46} /></div></th>
              <td className={styles.kills}>{weapon.kills}</td><td className={styles.muted}>—</td>
            </tr>) : <tr><td colSpan={3} className={styles.emptyCell}>{weapons ? "기록된 무기 킬 0회" : "이 선수의 무기별 기록은 미제공입니다."}</td></tr>}</tbody>
          </table>
        </div>
        <p className={styles.tableNote}>Damage: 무기별 피해 기록 미제공</p>
      </section>
    </div>
  </div>;
}
