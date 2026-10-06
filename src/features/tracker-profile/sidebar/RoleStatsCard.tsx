import { number, percent } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./ProfileSidebar.module.css";

type RoleStatsRow = {
  role: string;
  icon: string;
  winRate: number | null;
  wins: number;
  losses: number;
  kad: number | null;
  kills: number;
  deaths: number;
  assists: number;
};

/** S04: 역할별 표본 표시. 새 데이터는 같은 역할의 원본 경기 전체, legacy는 기존 표본 집계를 부모에서 전달한다. */
export function RoleStatsCard({ rows }: { rows: readonly RoleStatsRow[] }) {
  return (
    <section>
      <h2 className={`${shared.sectionHeading} ${s.sectionHeading}`}>ROLES</h2>
      <div className={`${shared.card} ${s.roles}`}>
        {rows.map(row => (
          <div key={row.role}>
            <span className={s.roleIcon}>{row.icon}</span>
            <div>
              <span>{row.role}</span>
              <strong>WR <em>{percent(row.winRate)}</em></strong>
              <small>{row.wins}W - {row.losses}L</small>
            </div>
            <p>KDA <b>{number(row.kad, 2)}</b><small>{row.kills} / {row.deaths} / {row.assists}</small></p>
          </div>
        ))}
      </div>
    </section>
  );
}
