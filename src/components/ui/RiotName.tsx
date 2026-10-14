import type { RiotId } from "@/lib/riot-id";
import { cx } from "@/lib/cx";

type RiotNameProps = {
  id: RiotId;
  weight?: "medium" | "semibold";
  /** 15px(기본) · 18px(랭킹 1~3위 카드) */
  size?: 15 | 18;
  className?: string;
};

/** '이름#태그' 표기: 이름은 text-main, 태그는 Regular + text-sub-weak. */
export function RiotName({ id, weight = "medium", size = 15, className }: RiotNameProps) {
  return (
    <span className={cx("truncate", size === 18 ? "text-18" : "text-15", className)}>
      <span className={weight === "semibold" ? "font-semibold" : "font-medium"}>{id.gameName}</span>
      <span className="font-normal text-sub-weak">#{id.tagLine}</span>
    </span>
  );
}
