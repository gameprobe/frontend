import type { ComponentProps, ReactNode } from "react";
import { useLocale } from "../../stats-shell/locale";
import shared from "../ProfileShared.module.css";
import s from "./MatchHistory.module.css";
import { MatchFilters } from "./MatchFilters";
import { RecentSummary } from "./RecentSummary";
import { MatchDayGroup } from "./MatchDayGroup";
import type { MatchDay, MatchDetailContext } from "./types";

interface MatchHistoryProps {
  title: string;
  showBanner: boolean;
  onDismissBanner: () => void;
  onAllMatches: () => void;
  filters: ComponentProps<typeof MatchFilters>;
  recent: ComponentProps<typeof RecentSummary>;
  groups: readonly MatchDay[];
  expandedId: string | null;
  detail: MatchDetailContext;
  empty: ReactNode;
  canLoadMore: boolean;
  onLoadMore: () => void;
  icons: { target: ReactNode; close: ReactNode; arrow: ReactNode; chevron: ReactNode };
}

// M01~M05 전체 조합. Overview/Matches에서 사용하며 상태·집계·브라우저 동작은 부모가 맡는다.
export function MatchHistory({ title, showBanner, onDismissBanner, onAllMatches, filters, recent, groups, expandedId, detail, empty, canLoadMore, onLoadMore, icons }: MatchHistoryProps) {
  const { t } = useLocale();
  return <section className={s.matchSection} aria-label="Match history">
    {showBanner && <div className={s.matchBanner}>
      {icons.target}
      <div><strong>{t("다음 승리를 준비하세요.", "Prepare for your next win.")}</strong><small>{t("경기를 돌아보고 플레이 패턴과 변화를 확인해 보세요.", "Review your matches, spot patterns, and track your progress.")}</small></div>
      <button aria-label={t("경기 안내 닫기", "Dismiss match banner")} onClick={onDismissBanner}>{icons.close}</button>
    </div>}
    <div className={shared.sectionHeading}><h2>{title}</h2><button onClick={onAllMatches}>All Matches {icons.arrow}</button></div>
    <MatchFilters {...filters} />
    <RecentSummary {...recent} />
    {empty}
    {groups.map(group => <MatchDayGroup key={group.day} group={group} expandedId={expandedId} detail={detail} chevronIcon={icons.chevron} />)}
    {/* M05: 빈 결과 요소와 추가 표시량의 변경은 부모의 기존 분기·콜백을 따른다. */}
    {canLoadMore && <button className={s.loadMore} onClick={onLoadMore}>Load more matches {icons.chevron}</button>}
  </section>;
}
