import type { ReactNode } from "react";
import { useLocale } from "../../stats-shell/locale";
import { number, signed, percent } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./AgentStatsTable.module.css";

type AgentStatsRow = {
  id?: string;
  agent: string;
  // 기존 Asset의 이미지 선택·표시를 유지하도록 부모가 초상화를 제공한다.
  portrait: ReactNode;
  hours: number;
  matches: number;
  winRate: number | null;
  kd: number | null;
  adr: number | null;
  acs: number | null;
  dd: number | null;
  bestMap: string;
};

type AgentStatsTableProps = {
  rows: readonly AgentStatsRow[];
  onSelectAgent: (agent: string) => void;
};

/** P08: Overview·Performance의 Top Agents와 Agents 탭. 집계·표시 행 선택·탭 이동은 부모가 맡는다. */
export function AgentStatsTable({ rows, onSelectAgent }: AgentStatsTableProps) {
  const { t } = useLocale();
  return (
    <div
      className={`${shared.card} ${shared.tableScroll}`}
      tabIndex={0}
      role="region"
      aria-label={t("요원 통계, 가로 스크롤 가능", "Agent statistics, scroll horizontally")}
    >
      <table className={s.agentTable}>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Matches</th>
            <th>Win %</th>
            <th>K/D</th>
            <th>ADR</th>
            <th>{t("성과점수", "ACS")}</th>
            <th>DDΔ</th>
            <th>Best Map</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(item => (
            <tr key={item.id ?? item.agent}>
              <td>
                <button className={s.agentCell} onClick={() => onSelectAgent(item.id ?? item.agent)}>
                  {item.portrait}
                  <span>
                    <strong>{item.agent}</strong>
                    <small>{number(item.hours)} hours</small>
                  </span>
                </button>
              </td>
              <td>{item.matches}</td>
              <td className={item.winRate != null && item.winRate >= 60 ? shared.yellow : ""}>{percent(item.winRate)}</td>
              <td>{number(item.kd, 2)}</td>
              <td className={shared.yellow}>{number(item.adr)}</td>
              <td>{number(item.acs)}</td>
              <td>{signed(item.dd)}</td>
              <td>{item.bestMap || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <div className={shared.empty}>{t("선택한 조건에 해당하는 요원 통계가 없습니다.", "No agent stats in this selection.")}</div>}
    </div>
  );
}
