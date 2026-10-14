import { Card } from "@/components/ui/Card";
import { useProfileContext } from "@/features/profile/profile-context";
import { mapImagePath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { winRateClass } from "@/lib/format";
import type { MapStat } from "@/mocks/profile";

function MapCard({ map }: { map: MapStat }) {
  // 공격/수비 막대는 두 승률의 비율로 나눈다 (시안: 36% / 49% → 왼쪽 42%)
  const attackShare = (map.attackWinRate / (map.attackWinRate + map.defenseWinRate)) * 100;
  const stats = [
    { label: "K/D", value: map.kd.toFixed(2) },
    { label: "평균 ACS", value: String(map.acs) },
    { label: "첫 킬", value: `${map.firstKillRate}%` },
  ];

  return (
    <Card as="li" className="overflow-hidden">
      {/* 사용자 조정(2026-10-09): 시안의 96px 목록 이미지 대신 큰 맵 이미지를 160px로 */}
      <img src={mapImagePath(map.mapId)} alt="" className="h-40 w-full object-cover" />
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-18 font-semibold">{map.name}</h2>
            <p className="text-13 text-sub-weak">
              {map.matches}경기 · {map.wins}승 {map.losses}패
            </p>
          </div>
          <p lang="en" className={cx("text-28 font-semibold", winRateClass(map.winRate, "loss"))}>
            {map.winRate}%
          </p>
        </div>
        <dl className="flex flex-wrap gap-4 text-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex gap-1">
              <dt className="text-sub">{stat.label}</dt>
              <dd lang="en" className="font-semibold">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-13 text-sub">
            <span>공격 {map.attackWinRate}%</span>
            <span>수비 {map.defenseWinRate}%</span>
          </div>
          <div className="flex h-1.5 gap-1 overflow-hidden rounded-full" aria-hidden>
            <span className="h-full bg-main" style={{ width: `${attackShare}%` }} />
            <span className="h-full flex-1 bg-disabled" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/** 07 프로필 - 맵별 통계 (Figma 53:1395) */
export function MapsTab() {
  const { profile } = useProfileContext();
  return (
    <ul aria-label="맵별 통계" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profile.maps.map((map) => (
        <MapCard key={map.mapId} map={map} />
      ))}
    </ul>
  );
}
