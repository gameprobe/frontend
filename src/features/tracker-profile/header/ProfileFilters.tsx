import type { ReactNode } from "react";
import s from "./ProfileFilters.module.css";

type FilterChoice = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

type ProfileFiltersProps = {
  platforms: readonly FilterChoice[];
  modes: readonly FilterChoice[];
  allActsSelected: boolean;
  onAllActs: () => void;
  // 경기 필터에서도 쓰는 기존 Select를 부모가 제공한다. 선택값·초기화 규칙은 부모 소유다.
  actSelect: ReactNode;
};

/** P05: 시즌 전체를 바꾸는 플랫폼·모드·Act 선택 UI. 아래 경기 목록 필터와 별개다. */
export function ProfileFilters({ platforms, modes, allActsSelected, onAllActs, actSelect }: ProfileFiltersProps) {
  return (
    <section className={s.filters} aria-label="Profile filters">
      <div className={s.segment}>
        {platforms.map(item => (
          <button key={item.label} aria-pressed={item.selected} className={item.selected ? s.platformActive : ""} onClick={item.onSelect}>
            {item.label}
          </button>
        ))}
      </div>
      <div className={`${s.segment} ${s.modeSegment}`}>
        {modes.map(item => (
          <button key={item.label} aria-pressed={item.selected} className={item.selected ? s.selected : ""} onClick={item.onSelect}>
            {item.label}
          </button>
        ))}
      </div>
      <div className={s.actFilter}>
        <button className={allActsSelected ? s.selected : ""} onClick={onAllActs}>All Acts</button>
        {actSelect}
      </div>
    </section>
  );
}
