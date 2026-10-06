import type { ReactNode } from "react";
import { number, percent } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./ProfileSidebar.module.css";

type MapRow = {
  id?: string;
  map: string;
  backgroundImage: string;
  winRate: number | null;
  wins: number;
  losses: number;
};

type TopMapsCardProps = {
  rows: readonly MapRow[];
  onSelectMap: (name: string) => void;
  onViewAll: () => void;
  arrowIcon: ReactNode;
};

/** S06: Top Maps. 부모가 시즌별 집계와 기존 배경 이미지를 전달하며, 선택 시 기존 경기 필터/탭 동작을 호출한다. */
export function TopMapsCard({ rows, onSelectMap, onViewAll, arrowIcon }: TopMapsCardProps) {
  return (
    <section>
      <h2 className={`${shared.sectionHeading} ${s.sectionHeading}`}>TOP MAPS</h2>
      <div className={`${shared.card} ${s.mapList}`}>
        {rows.map(item => (
          <button key={item.id ?? item.map} style={{ backgroundImage: item.backgroundImage }} onClick={() => onSelectMap(item.id ?? item.map)}>
            <strong>{item.map}</strong>
            <span><b>{percent(item.winRate, 0)}</b><small>{item.wins}W - {item.losses}L</small></span>
          </button>
        ))}
        <button className={s.viewAll} onClick={onViewAll}>View All Maps {arrowIcon}</button>
      </div>
    </section>
  );
}
