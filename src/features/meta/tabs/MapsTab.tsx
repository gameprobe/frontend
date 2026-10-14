import { Card } from "@/components/ui/Card";
import { agentIconPath, mapImagePath } from "@/lib/assets";
import { META_MAPS, metaAgentName } from "@/mocks/meta";

/** 17 메타 - 맵별 승률 (Figma 56:944). 막대는 공격 승률 : 수비 승률. */
export function MetaMapsTab() {
  return (
    <ul aria-label="맵별 승률" className="grid gap-4 lg:grid-cols-2">
      {META_MAPS.map((map) => {
        const defense = 100 - map.attackWinRate;
        return (
          <Card as="li" key={map.mapId} className="flex overflow-hidden">
            <img
              src={mapImagePath(map.mapId)}
              alt=""
              className="w-28 shrink-0 object-cover sm:w-40 md:w-[200px]"
            />
            {/* 시안(175px)은 아래 요원 초상이 잘려 있어서, 내용 높이에 맞추고 간격을 줄였다(184px) */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:px-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h2 className="text-18 font-semibold">{map.name}</h2>
                  <p className="text-13 text-sub-weak">플레이 비중 {map.playShare.toFixed(1)}%</p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="flex justify-between text-14 font-semibold">
                    <span>
                      <span className="font-normal">공격 </span>
                      <span lang="en">{map.attackWinRate.toFixed(1)}%</span>
                    </span>
                    <span>
                      <span className="font-normal text-sub">수비 </span>
                      <span lang="en">{defense.toFixed(1)}%</span>
                    </span>
                  </p>
                  <div aria-hidden className="flex h-2 gap-1 overflow-hidden rounded-full">
                    <span className="bg-main" style={{ width: `${map.attackWinRate}%` }} />
                    <span className="flex-1 bg-disabled" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-12 text-sub-weak">승률 높은 요원</p>
                <ul className="flex gap-1.5">
                  {map.topAgentIds.map((agentId) => (
                    <li key={agentId}>
                      <img
                        src={agentIconPath(agentId)}
                        alt={metaAgentName(agentId)}
                        title={metaAgentName(agentId)}
                        className="size-8 rounded-md object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        );
      })}
    </ul>
  );
}
