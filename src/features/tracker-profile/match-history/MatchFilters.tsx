import type { ReactNode } from "react";
import { useLocale } from "../../stats-shell/locale";
import s from "./MatchHistory.module.css";

interface MatchFiltersProps {
  controls: ReactNode;
  resultControl: ReactNode;
  showMore: boolean;
  onToggleMore: () => void;
  isFiltered: boolean;
  onReset: () => void;
  dateEnd: string | null;
}

// M01: Overview/Matches의 조건 줄. Select와 변경 동작은 부모에서 받는다.
export function MatchFilters({ controls, resultControl, showMore, onToggleMore, isFiltered, onReset, dateEnd }: MatchFiltersProps) {
  const { t } = useLocale();
  return <>
    <div className={s.matchFilters}>
      {controls}
      <button className={s.moreFilters} aria-expanded={showMore} onClick={onToggleMore}>{showMore ? "− Less" : "+ More"}</button>
      {showMore && resultControl}
      {isFiltered && <button className={s.reset} onClick={onReset}>Reset filters</button>}
    </div>
    {dateEnd !== null && <p className={s.filterNote}>{t(`날짜 범위의 끝은 ${dateEnd}입니다. 예시 경기의 날짜를 기준으로 합니다.`, `Date range ends on ${dateEnd}, based on the sample match timeline.`)}</p>}
  </>;
}
