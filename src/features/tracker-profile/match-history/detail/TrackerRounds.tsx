"use client";

import Image from "next/image";
import { useState } from "react";
import { getAgentAssetPath } from "../../../../lib/asset-map";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import s from "./TrackerRounds.module.css";

interface TrackerRoundsProps {
  match: MatchHistoryEntry;
  data: MatchDetailData;
}

// M04 모달의 Rounds 탭. 라운드 선택만 이곳에서 관리하고 공급 데이터는 변경하지 않는다.
// 현재 표본에는 승리 팀과 누적 점수만 있다. 경기 전체 기록을 라운드 기록으로 대신 쓰지 않는다.
export function TrackerRounds({ match, data }: TrackerRoundsProps) {
  const rounds = [...(data.detail?.rounds ?? [])].sort((a, b) => a.roundNumber - b.roundNumber);
  const [selectedNumber, setSelectedNumber] = useState(rounds[0]?.roundNumber ?? 0);
  const selected = rounds.find(round => round.roundNumber === selectedNumber) ?? rounds[0];
  const participants = data.detail?.participants ?? [];
  const teamA = data.summary.team;
  const teamB = participants.find(player => player.team !== teamA)?.team;
  const teams = [
    { id: teamA, label: "Team A", className: s.teamA },
    { id: teamB, label: "Team B", className: s.teamB },
  ];

  if (!selected) {
    return <div className={s.unavailable}>
      <strong>Rounds</strong>
      <p>{data.reason ?? "이 경기의 라운드 기록은 제공되지 않습니다."}</p>
    </div>;
  }

  const selectedWon = selected.winningTeam === teamA;
  const scoreA = teamA === "attackers" ? selected.scoreAfterRound.attackers : selected.scoreAfterRound.defenders;
  const scoreB = teamA === "attackers" ? selected.scoreAfterRound.defenders : selected.scoreAfterRound.attackers;
  const selectedPlayers = data.source === "riot-synthetic" ? data.roundPlayers[selected.roundNumber] : undefined;
  const playerName = (puuid: string) => participants.find(player => player.puuid === puuid)?.riotId.gameName ?? "알 수 없는 선수";

  return <div className={s.rounds}>
    {/* 막대 높이로 표시할 라운드별 수치가 없으므로 승패와 누적 점수만 표시한다. */}
    <div className={s.strip} role="group" aria-label="라운드 선택">
      {rounds.map(round => {
        const won = round.winningTeam === teamA;
        const first = teamA === "attackers" ? round.scoreAfterRound.attackers : round.scoreAfterRound.defenders;
        const second = teamA === "attackers" ? round.scoreAfterRound.defenders : round.scoreAfterRound.attackers;
        return <button
          key={round.roundNumber}
          type="button"
          className={`${s.round} ${won ? s.win : s.loss} ${selected.roundNumber === round.roundNumber ? s.selected : ""}`}
          aria-label={`라운드 ${round.roundNumber}, ${won ? "우리 팀 승리" : "우리 팀 패배"}, ${first} 대 ${second}`}
          aria-pressed={selected.roundNumber === round.roundNumber}
          onClick={() => setSelectedNumber(round.roundNumber)}
        >
          <span>{round.roundNumber}</span>
          <strong>{first}<span>:</span>{second}</strong>
          <small>{won ? "W" : "L"}</small>
        </button>;
      })}
    </div>

    <div className={s.result} aria-live="polite" aria-atomic="true">
      <h3>ROUND {selected.roundNumber}</h3>
      <strong className={selectedWon ? s.winText : s.lossText}>
        {selectedWon ? "TEAM A" : "TEAM B"} WIN
      </strong>
      <span>{scoreA} : {scoreB} · {selected.endType || "종료 원인 미제공"}</span>
      <p>위에서 라운드를 선택해 결과를 확인하세요.</p>
    </div>

    <div className={s.columns}>
      <section className={s.players} aria-label={`라운드 ${selected.roundNumber} 참가자`}>
        <div className={s.tableScroll} tabIndex={0} role="region" aria-label="라운드 참가자 표, 가로 스크롤 가능">
          {teams.map(team => <table key={team.label} className={s.table}>
            <caption className={s.srOnly}>{team.label} 라운드별 {selectedPlayers ? "기록" : "기록 미제공"}</caption>
            <thead className={team.className}>
              <tr>
                <th scope="col">{team.label}</th>
                <th scope="col">Score</th>
                <th scope="col">K</th>
                <th scope="col">D</th>
                <th scope="col">A</th>
                <th scope="col">Econ</th>
              </tr>
            </thead>
            <tbody>
              {participants.filter(player => player.team === team.id).map(player => {
                const record = selectedPlayers?.[player.puuid];
                return <tr
                key={player.puuid}
                className={player.puuid === data.viewerPuuid ? s.viewer : undefined}
              >
                <th scope="row">
                  <span className={s.player}>
                    <Image src={getAgentAssetPath(player.agentId)} alt={player.agent} width={32} height={32} />
                    <span title={`${player.riotId.gameName}#${player.riotId.tagLine}`}>
                      <strong>{player.riotId.gameName}</strong>
                      <small>#{player.riotId.tagLine}</small>
                    </span>
                  </span>
                </th>
                <td>{record?.score ?? "—"}</td><td>{record?.kills ?? "—"}</td><td>{record?.deaths ?? "—"}</td><td>{record?.assists ?? "—"}</td><td>{record?.loadout ?? "—"}</td>
              </tr>; })}
            </tbody>
          </table>)}
        </div>
        <p className={s.note}>{selectedPlayers ? "라운드별 합성 원본 · Econ은 장비 가치입니다. Score는 단순화한 합성 점수입니다." : "참가자 목록 · 라운드별 Score/K/D/A/Econ은 미제공(—)입니다."}</p>
      </section>

      <section className={s.section} aria-label={`라운드 ${selected.roundNumber} 이벤트`}>
        <h4>Event Log</h4>
        {selected.killEvents ? <>
          <ol className={s.eventLog}>{selected.killEvents.map((event, index) => <li key={`${event.timeSeconds}:${index}`}>
            <time>{event.timeSeconds}s</time><strong>{playerName(event.killerPuuid)}</strong><span>→ {playerName(event.victimPuuid)}</span><small>{event.displayName ?? "무기 미제공"}{event.isFirstKill ? " · First Kill" : ""}</small>
          </li>)}</ol>
          <p className={s.note}>{selected.killEvents.length === 0 ? "기록된 킬 0건 · " : ""}설치·해체 이벤트는 이 합성 표본에서 제공하지 않습니다.</p>
        </> : <div className={s.empty}>
          <strong>이벤트 기록 미제공</strong>
          <p>이 라운드의 킬·스파이크 이벤트가 제공되지 않았습니다.</p>
        </div>}
      </section>

      <section className={s.section} aria-label={`${match.map} 라운드 ${selected.roundNumber} 선수 위치`}>
        <h4>Player Positions</h4>
        <div className={s.empty}>
          <strong>선수 위치 미제공</strong>
          <p>{match.map}의 라운드별 좌표 기록이 없어 선수 위치를 표시할 수 없습니다.</p>
        </div>
      </section>
    </div>
  </div>;
}
