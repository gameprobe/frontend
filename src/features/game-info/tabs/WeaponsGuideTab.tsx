import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { weaponPath } from "@/lib/assets";
import { formatNumber } from "@/lib/format";
import { WEAPON_CATEGORIES, WEAPON_INFOS, type WeaponInfo } from "@/mocks/game-info";

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체" },
  ...WEAPON_CATEGORIES.map((category) => ({ value: category, label: category })),
];

/** 피해량 막대 기준값 (시안 막대 길이: 몸통 150 ≈ 50%) */
const DAMAGE_SCALE = 300;

function DamageBar({ label, value, tone }: { label: string; value: number; tone: "main" | "sub" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-13 text-sub">{label}</span>
      <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
        <span
          className={tone === "main" ? "block h-full bg-main" : "block h-full bg-sub"}
          style={{ width: `${Math.min(value / DAMAGE_SCALE, 1) * 100}%` }}
        />
      </span>
      <span lang="en" className="w-7 text-right text-13 font-semibold">
        {value}
      </span>
    </div>
  );
}

function WeaponCard({ weapon }: { weapon: WeaponInfo }) {
  return (
    <Card as="li" className="flex flex-col overflow-hidden">
      <div className="flex h-[140px] items-center justify-center bg-elevated px-7 py-5">
        <img src={weaponPath(weapon.weaponId)} alt="" loading="lazy" className="max-h-[100px] max-w-full object-contain" />
      </div>
      <div className="flex flex-col gap-6 px-6 pt-5 pb-6">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-18 font-semibold">{weapon.name}</h2>
            <p className="text-13 text-sub">{weapon.category}</p>
          </div>
          <p className="text-14 font-semibold whitespace-nowrap">
            {weapon.price ? `${formatNumber(weapon.price)} 크레딧` : "기본 지급"}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 rounded-lg bg-elevated px-3 py-2">
            <dt className="text-12 text-sub">연사 속도</dt>
            <dd className="text-15 font-semibold">{weapon.fireRate}발/초</dd>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-elevated px-3 py-2">
            <dt className="text-12 text-sub">탄창</dt>
            <dd className="text-15 font-semibold">{weapon.magazine}발</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2" aria-label={`피해량 머리 ${weapon.headDamage}, 몸통 ${weapon.bodyDamage}`}>
          <DamageBar label="머리" value={weapon.headDamage} tone="main" />
          <DamageBar label="몸통" value={weapon.bodyDamage} tone="sub" />
        </div>
      </div>
    </Card>
  );
}

/** 21 게임 정보 - 무기 (Figma 57:159). 분류는 ?category= 로 고른다. */
export function WeaponsGuideTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = CATEGORY_OPTIONS.find((option) => option.value === searchParams.get("category"))?.value ?? "all";
  const weapons = category === "all" ? WEAPON_INFOS : WEAPON_INFOS.filter((weapon) => weapon.category === category);

  return (
    <div className="flex flex-col gap-5">
      <FilterChipGroup
        label="무기 분류"
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={(next) => setSearchParams(next === "all" ? {} : { category: next }, { replace: true })}
        size="xl"
      />
      <div className="flex flex-col gap-4">
        <ul aria-label="무기 목록" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {weapons.map((weapon) => (
            <WeaponCard key={weapon.weaponId} weapon={weapon} />
          ))}
        </ul>
        <p className="text-12 text-sub-weak">피해량은 가장 가까운 거리 구간 기준이에요. (Riot 공식 데이터)</p>
      </div>
    </div>
  );
}
