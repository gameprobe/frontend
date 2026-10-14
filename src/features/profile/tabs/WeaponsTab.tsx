import { Card } from "@/components/ui/Card";
import { useProfileContext } from "@/features/profile/profile-context";
import { weaponPath } from "@/lib/assets";

const COLUMNS = ["무기", "처치", "처치 비중", "헤드샷", "라운드당 피해", "타격 부위 (머리 · 몸통 · 다리)"];
const GRID =
  "grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)] items-center gap-4";
const HIT_COLORS = ["bg-primary", "bg-sub", "bg-disabled"];

/** 08 프로필 - 무기별 통계 (Figma 54:2). 처치 비중 막대는 가장 많은 무기를 100%로 둔다. */
export function WeaponsTab() {
  const { profile } = useProfileContext();
  const topShare = Math.max(...profile.weapons.map((weapon) => weapon.killShare));

  return (
    <Card as="section" aria-label="무기별 통계" className="overflow-x-auto px-6 py-2">
      <div role="table" aria-label="무기별 통계" className="min-w-[880px]">
        <div role="row" className={`${GRID} border-b border-line py-3 text-13 font-medium text-sub-weak`}>
          {COLUMNS.map((column) => (
            <span key={column} role="columnheader">
              {column}
            </span>
          ))}
        </div>
        {profile.weapons.map((weapon) => (
          <div key={weapon.weaponId} role="row" className={`${GRID} border-b border-line-light py-4 text-15`}>
            <span role="cell" className="flex items-center gap-4">
              <span className="flex h-10 w-24 shrink-0 items-center justify-center">
                <img src={weaponPath(weapon.weaponId)} alt="" className="max-h-10 w-24 object-contain" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold whitespace-nowrap">{weapon.name}</span>
                <span className="text-12 text-sub-weak">{weapon.category}</span>
              </span>
            </span>
            <span role="cell" lang="en">
              {weapon.kills}
            </span>
            <span role="cell" className="flex items-center gap-2">
              <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-elevated">
                <span className="block h-full bg-main" style={{ width: `${(weapon.killShare / topShare) * 100}%` }} />
              </span>
              <span lang="en" className="w-8 text-right text-13 text-sub">
                {weapon.killShare}%
              </span>
            </span>
            <span role="cell" lang="en">
              {weapon.headshot}%
            </span>
            <span role="cell" lang="en">
              {weapon.damagePerRound}
            </span>
            <span role="cell" className="flex flex-col gap-1.5 self-start">
              <span className="flex gap-0.5" aria-hidden>
                {weapon.hits.map((value, index) => (
                  <span key={index} className={`h-1.5 basis-0 rounded-[3px] ${HIT_COLORS[index]}`} style={{ flexGrow: value }} />
                ))}
              </span>
              <span className="text-12 text-sub">{weapon.hits.map((value) => `${value}%`).join(" · ")}</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
