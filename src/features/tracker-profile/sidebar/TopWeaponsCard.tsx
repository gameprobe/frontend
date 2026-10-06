import type { ReactNode } from "react";
import { number, percent } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./ProfileSidebar.module.css";

type WeaponRow = {
  id?: string;
  name: string;
  category: string;
  image: ReactNode;
  hs: number | null;
  kills: number;
};

type TopWeaponsCardProps = {
  rows: readonly WeaponRow[];
  onSelectWeapon: (name: string) => void;
  onViewAll: () => void;
  arrowIcon: ReactNode;
};

/** S05: Top Weapons. 집계·정렬·이미지는 부모가 제공한다. 새 데이터는 처치 무기 이벤트, legacy는 대표 무기 기준이다. */
export function TopWeaponsCard({ rows, onSelectWeapon, onViewAll, arrowIcon }: TopWeaponsCardProps) {
  return (
    <section>
      <h2 className={`${shared.sectionHeading} ${s.sectionHeading}`}>TOP WEAPONS</h2>
      <div className={`${shared.card} ${s.weaponList}`}>
        {rows.map(item => (
          <button key={item.id ?? item.name} onClick={() => onSelectWeapon(item.id ?? item.name)}>
            <div>{item.image}<strong>{item.name}</strong><small>{item.category}</small></div>
            <span><small>HS</small><b>{percent(item.hs, 0)}</b></span>
            <span><small>Kills</small><b>{item.kills}</b></span>
          </button>
        ))}
        <button className={s.viewAll} onClick={onViewAll}>View All Weapons {arrowIcon}</button>
      </div>
    </section>
  );
}
