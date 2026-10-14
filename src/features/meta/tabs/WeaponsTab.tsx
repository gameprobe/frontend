import { Card } from "@/components/ui/Card";
import { weaponPath } from "@/lib/assets";
import { formatNumber } from "@/lib/format";
import { META_WEAPONS } from "@/mocks/meta";

const GRID =
  "grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-4";
const MAX_BUY_RATE = Math.max(...META_WEAPONS.map((weapon) => weapon.buyRate));

/** 18 메타 - 무기 통계 (Figma 56:1207). 구매율 막대는 최고 구매율을 100%로 둔다. */
export function MetaWeaponsTab() {
  return (
    <Card as="section" aria-label="무기 통계" className="overflow-x-auto px-5 py-2 md:px-6">
      <div role="table" aria-label="무기 통계" className="min-w-[760px]">
        <div role="row" className={`${GRID} border-b border-line py-3 text-13 font-medium text-sub-weak`}>
          {["무기", "가격", "구매율", "처치 비중", "헤드샷"].map((column) => (
            <span key={column} role="columnheader">
              {column}
            </span>
          ))}
        </div>
        {META_WEAPONS.map((weapon) => (
          <div key={weapon.weaponId} role="row" className={`${GRID} border-b border-line-light py-3 text-15`}>
            <span role="cell" className="flex min-w-0 items-center gap-4">
              <span className="flex h-10 w-24 shrink-0 items-center justify-center">
                <img src={weaponPath(weapon.weaponId)} alt="" className="max-h-10 w-24 object-contain" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold whitespace-nowrap">{weapon.name}</span>
                <span className="text-12 text-sub-weak">{weapon.category}</span>
              </span>
            </span>
            <span role="cell">{weapon.price ? `${formatNumber(weapon.price)} 크레딧` : "기본 지급"}</span>
            <span role="cell" className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                <span className="block h-full bg-main" style={{ width: `${(weapon.buyRate / MAX_BUY_RATE) * 100}%` }} />
              </span>
              <span lang="en" className="w-11 text-right text-13 text-sub">
                {weapon.buyRate.toFixed(1)}%
              </span>
            </span>
            <span role="cell" lang="en">
              {weapon.killShare.toFixed(1)}%
            </span>
            <span role="cell" lang="en">
              {weapon.headshot.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
