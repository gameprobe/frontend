import { Link, useParams } from "react-router-dom";
import closeIcon from "@/assets/icons/close-light.svg";
import { Card } from "@/components/ui/Card";
import { TextLink } from "@/components/ui/SectionHeader";
import { agentIconPath, mapImagePath, mapMiniPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { findMapInfo, MAP_INFOS, type MapInfo } from "@/mocks/game-info";
import { metaAgentName } from "@/mocks/meta";

/** 20b 맵 상세 패널 (Figma 57:44) */
function MapDetail({ map }: { map: MapInfo }) {
  const stats = [
    { label: "스파이크 사이트", value: `${map.sites}개` },
    { label: "공격 승률", value: `${map.attackWinRate.toFixed(1)}%` },
    { label: "수비 승률", value: `${(100 - map.attackWinRate).toFixed(1)}%` },
  ];

  return (
    <Card as="section" aria-label={`${map.name} 상세`} className="relative overflow-hidden">
      <div className="relative h-52 md:h-[280px]">
        <img src={mapImagePath(map.mapId)} alt="" className="size-full object-cover" />
        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,#161d28,rgba(22,29,40,0.2)_70%)]" />
        <div className="absolute bottom-5 left-5 flex flex-col md:left-10">
          <p lang="en" className="text-16 font-medium">
            {map.englishName}
          </p>
          <h2 className="text-32 font-semibold md:text-40">{map.name}</h2>
        </div>
        <Link
          to="/game-info/maps"
          aria-label="맵 상세 닫기"
          className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full bg-page hover:bg-elevated md:right-10"
        >
          <img src={closeIcon} alt="" width={14} height={14} />
        </Link>
      </div>
      <div className="grid gap-8 px-5 pt-6 pb-8 md:px-10 md:pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-8">
          <dl className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 rounded-thumb bg-elevated p-4">
                <dt className="text-13 text-sub">{stat.label}</dt>
                <dd className="text-20 font-semibold md:text-24">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3">
            <h3 className="text-14 font-medium">이 맵에서 승률 높은 요원</h3>
            <ul className="flex flex-wrap gap-3">
              {map.topAgents.map((agent) => (
                <li key={agent.agentId}>
                  <Link
                    to={`/game-info/agents/${agent.agentId}`}
                    className="flex items-center gap-2 rounded-thumb bg-elevated py-2 pr-3 pl-2 hover:bg-line"
                  >
                    <img src={agentIconPath(agent.agentId)} alt="" className="size-9 rounded-lg object-cover" />
                    <span className="text-14 font-semibold">{metaAgentName(agent.agentId)}</span>
                    <span lang="en" className="text-13 text-sub">
                      {agent.winRate.toFixed(1)}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <TextLink to={`/game-info/lineups?map=${map.mapId}`}>{map.name} 라인업 보기 →</TextLink>
          </div>
        </div>
        {/* 시안 미니맵 카드 높이 397px(왼쪽 열 높이에 맞춤) */}
        <div className="rounded-thumb bg-elevated p-4 lg:min-h-[397px]">
          <img src={mapMiniPath(map.mapId)} alt={`${map.name} 미니맵`} className="mx-auto aspect-square w-full max-w-[328px] object-contain opacity-90" />
        </div>
      </div>
    </Card>
  );
}

/** 20 게임 정보 - 맵 (Figma 56:2170) · 20b 맵 상세 (57:2) */
export function MapsGuideTab() {
  const { mapId } = useParams();
  const selected = mapId ? findMapInfo(mapId) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {mapId && !selected && (
        <Card as="section" role="status" className="p-6 text-15 text-sub">
          맵을 찾을 수 없어요. 아래 목록에서 골라 주세요.
        </Card>
      )}
      {selected && <MapDetail map={selected} />}
      <ul aria-label="맵 목록" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MAP_INFOS.map((map) => {
          const isSelected = map.mapId === selected?.mapId;
          return (
            <li key={map.mapId}>
              <Link
                to={`/game-info/maps/${map.mapId}`}
                aria-current={isSelected ? "true" : undefined}
                className={cx(
                  "relative block h-[180px] overflow-hidden rounded-card border transition-colors",
                  isSelected ? "border-main" : "border-line hover:border-line-strong",
                )}
              >
                <img src={mapImagePath(map.mapId)} alt="" loading="lazy" className="h-[178px] w-full object-cover" />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(14,19,27,0.9),rgba(14,19,27,0)_60%)]" />
                <span className="absolute bottom-[15px] left-5 flex flex-col gap-1">
                  <span className="text-20 font-semibold">{map.name}</span>
                  <span className="text-13">
                    <span lang="en">{map.englishName}</span> · 사이트 {map.sites}개
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
