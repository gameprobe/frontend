import Image from "next/image";
import { getAgentAssetPath } from "../../../../lib/asset-map";
import type { MatchHistoryEntry } from "../types";
import type { MatchDetailData } from "./detailData";
import styles from "./TrackerDuels.module.css";

interface TrackerDuelsProps { match: MatchHistoryEntry; data: MatchDetailData }

// 모달 Duels 전용. 새 원본은 25조합, legacy는 제공된 조회 선수의 교전만 연결한다.
export function TrackerDuels({ match, data }: TrackerDuelsProps) {
  const detail = data.detail;
  const viewer = detail?.participants.find(player => player.puuid === data.viewerPuuid);
  if (!detail || !viewer) {
    return <div className={styles.empty}><h3>Duels</h3><p>{data.reason ?? "선택 선수의 참가 기록이 없어 교전 상세를 표시할 수 없습니다."}</p></div>;
  }

  const allies = detail.participants.filter(player => player.team === viewer.team);
  const opponents = detail.participants.filter(player => player.team !== viewer.team);
  const recorded = opponents.map(opponent => viewer.duels?.find(duel => duel.opponentPuuid === opponent.puuid)).filter(duel => duel !== undefined);
  const combinationCount = allies.length * opponents.length;
  const kills = recorded.reduce((total, duel) => total + (duel?.kills ?? 0), 0);
  const deaths = recorded.reduce((total, duel) => total + (duel?.deaths ?? 0), 0);
  const hasRecordedDuels = viewer.duels !== undefined;
  const complete = data.source === "riot-synthetic";
  const recordedCount = complete ? allies.reduce((total, player) => total + opponents.filter(opponent => player.duels?.some(duel => duel.opponentPuuid === opponent.puuid)).length, 0) : recorded.length;

  return <div className={styles.duels}>
    <div className={styles.summary}>
      <section className={styles.playerRecord} aria-label="조회 선수의 제공된 교전 합계">
        <Image src={getAgentAssetPath(viewer.agentId)} alt={viewer.agent} width={58} height={58} />
        <div><h3>{viewer.riotId.gameName}</h3><p>제공된 교전 기록</p><strong className={styles.recordNumbers}>
          <span>{hasRecordedDuels ? kills : "—"}<small>Kills</small></span><i>/</i><span>{hasRecordedDuels ? deaths : "—"}<small>Deaths</small></span>
        </strong></div>
      </section>
      <section className={styles.coverage} aria-label="교전 기록 제공 범위"><h3>Recorded Duels</h3><strong>{recordedCount}<span>/ {combinationCount}</span></strong><p>기록이 제공된 선수 조합</p></section>
      <section className={styles.unavailable}><h3>전체 교전 비교</h3><strong>{complete ? `${recordedCount} / ${combinationCount}` : "—"}</strong><p>미제공 조합 {combinationCount - recordedCount}개 · 전체 라이벌 순위 미제공</p></section>
    </div>

    <div className={styles.description}><strong>{match.map} · Team A vs Team B</strong><p>각 칸은 행 선수의 킬 / 데스입니다. <span>— 기록 미제공</span></p></div>
    <div className={styles.matrixScroll} role="region" aria-label="팀 간 교전 매트릭스, 가로로 스크롤할 수 있습니다" tabIndex={0}>
      <table className={styles.matrix}>
        <caption>Team A와 Team B의 상대별 교전 기록</caption>
        <thead><tr><th scope="col" className={styles.corner}><span>A</span><b>vs</b><span>B</span></th>
          {opponents.map(player => <th scope="col" key={player.puuid} className={styles.opponent}>
            <div className={styles.player}><Image src={getAgentAssetPath(player.agentId)} alt="" width={52} height={52} />
              <div><strong>{player.riotId.gameName}</strong><small>#{player.riotId.tagLine}</small><span>{player.agent}</span></div>
            </div>
          </th>)}
        </tr></thead>
        <tbody>{allies.map(player => <tr key={player.puuid} className={player.puuid === viewer.puuid ? styles.viewerRow : undefined}>
          <th scope="row" className={styles.ally}><div className={styles.player}>
            <Image src={getAgentAssetPath(player.agentId)} alt="" width={52} height={52} />
            <div><strong>{player.riotId.gameName}{player.puuid === viewer.puuid && <em>YOU</em>}</strong><small>#{player.riotId.tagLine}</small><span>{player.agent}</span></div>
          </div></th>
          {opponents.map(opponent => {
            // 완전한 새 표본은 모든 조합을 사용하고, legacy의 미제공 조합은 추정하지 않는다.
            const duel = complete || player.puuid === viewer.puuid ? player.duels?.find(record => record.opponentPuuid === opponent.puuid) : undefined;
            return <td key={opponent.puuid}>{duel ? <div className={styles.duel} aria-label={`${player.riotId.gameName} 대 ${opponent.riotId.gameName}: ${duel.kills}킬, ${duel.deaths}데스`}>
              <span className={duel.kills > duel.deaths ? styles.ahead : duel.kills < duel.deaths ? styles.behind : styles.tied}>{duel.kills}</span>
              <b aria-hidden="true">/</b>
              <span className={duel.deaths > duel.kills ? styles.ahead : duel.deaths < duel.kills ? styles.behind : styles.tied}>{duel.deaths}</span>
            </div> : <span className={styles.missing} aria-label="교전 기록 미제공">—</span>}</td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
    <p className={styles.note}>{complete ? "전체 킬 이벤트에서 양 팀 25개 조합을 계산했습니다. 0은 기록된 교전이 없는 조합입니다." : `현재는 ${viewer.riotId.gameName} 선수의 교전 표본만 제공합니다. 다른 선수 조합의 빈 값은 0회를 의미하지 않습니다.`}</p>
  </div>;
}
