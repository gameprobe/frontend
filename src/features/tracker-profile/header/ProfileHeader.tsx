import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "../../stats-shell/locale";
import s from "./ProfileHeader.module.css";

type ProfileHeaderProps = {
  displayName: string;
  displayTag: string;
  views: number | null;
  saved: boolean;
  refreshed: boolean;
  onFavorite: () => void;
  onRefresh: () => void;
  onShare: () => void;
  tabs: readonly {
    label: string;
    active: boolean;
    onSelect: () => void;
  }[];
  icons: {
    star: ReactNode;
    refresh: ReactNode;
    share: ReactNode;
    arrow: ReactNode;
  };
  // 부모의 기존 이미지 helper·경로·속성을 유지하고, 여기서는 배치 클래스만 제공한다.
  renderHero: (className: string) => ReactNode;
  renderAvatar: (className: string) => ReactNode;
};

/**
 * P02/P03: 프로필 배너·신원·동작 버튼과 프로필 탭.
 * 공통 Search 내비게이션인 StatsHeader와 별개이며, 상태·저장·공유·탭 전환은 부모가 맡는다.
 */
export function ProfileHeader({
  displayName,
  displayTag,
  views,
  saved,
  refreshed,
  onFavorite,
  onRefresh,
  onShare,
  tabs,
  icons,
  renderHero,
  renderAvatar,
}: ProfileHeaderProps) {
  const { t, copy } = useLocale();
  return (
    <header className={s.profileHeader}>
      <div className={s.hero}>
        <span className={s.heroType} aria-hidden="true">JETT</span>
        <div className={s.heroSlash} />
        {renderHero(s.heroAgent)}
        <div className={s.heroTop}>
          <button
            className={`${s.saveButton} ${saved ? s.saved : ""}`}
            onClick={onFavorite}
            aria-pressed={saved}
          >
            {icons.star}
            {saved ? "Profile Saved" : "Save Profile"}
          </button>
          <button className={s.updateButton} onClick={onRefresh}>
            <i />
            {refreshed ? t("확인 완료 · 데모", "Just updated · Demo") : copy.demoPreview}
            {icons.refresh}
          </button>
        </div>
        <div className={s.identity}>
          {renderAvatar(s.avatar)}
          <div>
            <span className={s.views}>{views == null ? t("새 데이터 데모", "New data demo") : t(`${views.toLocaleString("en-US")} profile views · 예시 데이터`, `${views.toLocaleString("en-US")} profile views · Sample data`)}</span>
            <h1>{displayName}<span>#{displayTag}</span></h1>
          </div>
        </div>
        <button className={s.shareButton} aria-label={t("프로필 링크 복사", "Copy profile link")} onClick={onShare}>
          {icons.share}
        </button>
      </div>
      <nav className={s.tabs} aria-label="Profile sections">
        {tabs.map(item => (
          <button
            key={item.label}
            aria-current={item.active ? "page" : undefined}
            className={item.active ? s.activeTab : ""}
            onClick={item.onSelect}
          >
            {item.label}
          </button>
        ))}
        <Link href="/lineups">Lineups {icons.arrow}</Link>
      </nav>
    </header>
  );
}
