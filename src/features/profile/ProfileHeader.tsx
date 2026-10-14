import { useState } from "react";
import starOutlineIcon from "@/assets/icons/star-outline.svg";
import starIcon from "@/assets/icons/star.svg";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useFavoritePlayers } from "@/features/search/player-lists";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import type { PlayerProfile } from "@/mocks/profile";

/** 프로필 카드 (Figma 53:446) */
export function ProfileHeader({ profile }: { profile: PlayerProfile }) {
  const { isFavorite, toggle } = useFavoritePlayers();
  const favorite = isFavorite(profile);
  // 백엔드 연결 전에는 갱신 시각만 '방금 전'으로 바꾼다
  const [refreshed, setRefreshed] = useState(false);

  const meta = [`레벨 ${profile.level}`, profile.tier, profile.server];

  return (
    <Card as="section" className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-3 md:p-8">
      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
        <img
          src={agentIconPath(profile.agentId)}
          alt=""
          className="size-16 shrink-0 rounded-thumb object-cover md:size-24 md:rounded-card"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="flex flex-wrap items-baseline gap-2">
            <span className="text-24 font-semibold md:text-32">{profile.gameName}</span>
            <span lang="en" className="text-14 text-sub-weak">
              #{profile.tagLine}
            </span>
          </h1>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-14">
            {meta.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sub">
                {item}
                <span aria-hidden className="text-disabled">
                  |
                </span>
              </li>
            ))}
            <li className="text-sub-weak">최근 갱신 {refreshed ? "방금 전" : profile.updatedAgo}</li>
          </ul>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          aria-pressed={favorite}
          onClick={() => toggle(profile)}
          className={cx("flex-1 px-4 sm:flex-none", favorite && "border-primary! text-primary!")}
        >
          <img src={favorite ? starIcon : starOutlineIcon} alt="" width={18} height={18} />
          즐겨찾기
        </Button>
        <Button className="flex-1 px-5 sm:flex-none" onClick={() => setRefreshed(true)} disabled={refreshed}>
          {refreshed ? "갱신 완료" : "전적 갱신"}
        </Button>
      </div>
    </Card>
  );
}
