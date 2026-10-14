import { Link, useParams, useSearchParams } from "react-router-dom";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LineupHeading, LineupSteps } from "@/features/lineups/LineupSteps";
import { agentIconPath, mapImagePath, ROLE_LABELS, roleIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { findLineupMap, LINEUP_ROLES, lineupAgents } from "@/mocks/lineups";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** 08 라인업 - 요원 선택 (Figma 72:34). ?agent= 는 맵 뷰에서 '변경'으로 돌아왔을 때 현재 요원 표시. */
export function AgentSelectPage() {
  const { mapId } = useParams();
  const [searchParams] = useSearchParams();
  const map = findLineupMap(mapId);
  if (!map) return <NotFoundPage />;

  const current = searchParams.get("agent");
  const agents = lineupAgents(map.mapId);

  return (
    <div className="container-page flex flex-col gap-6 pt-8 pb-20">
      <LineupSteps current={2} />
      <Card as="section" aria-label="선택한 맵" className="flex flex-wrap items-center gap-x-6 gap-y-4 py-5 pr-6 pl-5">
        <img src={mapImagePath(map.mapId)} alt="" className="h-[90px] w-40 shrink-0 rounded-thumb object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-14 font-medium text-sub">선택한 맵</p>
            <p className="text-20 font-semibold">{map.name}</p>
          </div>
          <p className="text-14 text-sub">
            라인업 {map.total}개 · 공격 {map.attack} · 수비 {map.defense}
          </p>
        </div>
        <ButtonLink to="/lineups" variant="secondary" className="h-[46px] px-4 text-14 font-semibold">
          맵 변경
        </ButtonLink>
      </Card>
      <LineupHeading
        label="요원 선택"
        title="어떤 요원의 라인업을 볼까요?"
        description="라인업이 등록된 요원만 표시돼요. 역할군별로 정리했어요."
      />
      <div className="flex flex-col gap-4">
        {LINEUP_ROLES.map((role) => {
          const group = agents.filter((agent) => agent.role === role);
          return (
            <Card
              as="section"
              key={role}
              aria-label={ROLE_LABELS[role]}
              className="flex flex-col gap-4 px-5 py-5 md:flex-row md:gap-6 md:px-6"
            >
              <div className="flex shrink-0 items-center gap-2 md:w-[136px] md:flex-col md:items-start">
                <img src={roleIconPath(role)} alt="" className="size-6 object-cover" />
                <p className="text-16 font-semibold">{ROLE_LABELS[role]}</p>
                <p className="text-13 text-sub">{group.length}명</p>
              </div>
              <ul className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-3 md:flex md:flex-wrap">
                {group.map((agent) => {
                  const selected = agent.agentId === current;
                  return (
                    <li key={agent.agentId}>
                      <Link
                        to={`/lineups/${map.mapId}/${agent.agentId}`}
                        aria-current={selected ? "true" : undefined}
                        className={cx(
                          "flex flex-col items-center gap-2 rounded-thumb border px-2 py-3 transition-colors md:w-32",
                          selected ? "border-primary bg-primary-soft" : "border-transparent bg-elevated hover:border-line-strong",
                        )}
                      >
                        <img src={agentIconPath(agent.agentId)} alt="" className="size-16 rounded-thumb object-cover" />
                        <span className={cx("text-14 font-medium", selected && "text-primary")}>{agent.name}</span>
                        <span className="text-12 text-sub-weak">라인업 {agent.count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
