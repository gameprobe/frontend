import type { ComponentProps, ReactNode } from "react";
import { useLocale } from "../../stats-shell/locale";
import { RankCard } from "./RankCard";
import { AccuracyCard } from "./AccuracyCard";
import { RoleStatsCard } from "./RoleStatsCard";
import { TopWeaponsCard } from "./TopWeaponsCard";
import { TopMapsCard } from "./TopMapsCard";
import s from "./ProfileSidebar.module.css";

type ProfileSidebarProps = {
  /** Agents/Maps/Weapons에서는 중복 통계를 줄이고 랭크와 Overview 복귀만 표시한다. */
  compact?: boolean;
  onViewOverview: () => void;
  // 카드가 요구하는 값/콜백 타입을 그대로 사용해 사이드바와 카드의 정의가 어긋나지 않게 한다.
  rank: ComponentProps<typeof RankCard>;
  accuracy: ComponentProps<typeof AccuracyCard>;
  roles: ComponentProps<typeof RoleStatsCard>;
  weapons: ComponentProps<typeof TopWeaponsCard>;
  maps: ComponentProps<typeof TopMapsCard>;
  onViewPerformance: () => void;
  targetIcon: ReactNode;
  performanceArrow: ReactNode;
};

/**
 * S01~S06: 프로필 왼쪽 사이드바(좁은 화면에서는 본문 아래)의 카드 순서와 배치.
 * 짧은 세부 탭은 compact로 표시하고 Overview에서 전체 카드를 다시 볼 수 있다.
 * 데이터·상태·이미지 선택·탭 전환은 TrackerProfile이 소유하고, 각 카드는 표시를 맡는다.
 * 공통 카드/제목 스타일은 ProfileShared.module.css를 재사용하며 전용 배치는 이 폴더의 CSS에서 관리한다.
 */
export function ProfileSidebar({ compact = false, onViewOverview, rank, accuracy, roles, weapons, maps, onViewPerformance, targetIcon, performanceArrow }: ProfileSidebarProps) {
  const { t } = useLocale();
  return (
    <aside className={s.sidebar} aria-label="Player statistics">
      <RankCard {...rank} />
      {compact ? <button className={s.overviewLink} onClick={onViewOverview}>
        {t("Overview에서 전체 통계 보기", "View all stats in Overview")} {performanceArrow}
      </button> : <>
        {/* S02: 짧은 사이드바 프로모션. 상단 P04 ProfilePromotion과 구분한다. */}
        <section className={s.sidePromo}>
          {targetIcon}
          <strong>EVERY ROUND COUNTS.</strong>
          <span>{t("다음 경기에서 개선할 점을 확인하세요.", "Find what to improve in your next match.")}</span>
          <button onClick={onViewPerformance}>View performance {performanceArrow}</button>
        </section>
        <AccuracyCard {...accuracy} />
        <RoleStatsCard {...roles} />
        <TopWeaponsCard {...weapons} />
        <TopMapsCard {...maps} />
      </>}
    </aside>
  );
}
