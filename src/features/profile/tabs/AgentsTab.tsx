import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { useProfileContext } from "@/features/profile/profile-context";
import { agentIconPath, ROLE_LABELS, roleIconPath, type AgentRole } from "@/lib/assets";

const ROLE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "duelist", label: ROLE_LABELS.duelist },
  { value: "controller", label: ROLE_LABELS.controller },
  { value: "sentinel", label: ROLE_LABELS.sentinel },
  { value: "initiator", label: ROLE_LABELS.initiator },
] as const satisfies readonly { value: AgentRole | "all"; label: string }[];

type RoleFilter = (typeof ROLE_OPTIONS)[number]["value"];

const COLUMNS = ["요원", "경기", "승률", "KDA", "평균 ACS", "헤드샷", "ADR", "첫 킬"];
const GRID = "grid grid-cols-[minmax(0,2fr)_repeat(7,minmax(0,1fr))] items-center gap-4";

/** 06 프로필 - 요원별 통계 (Figma 53:1254). 좁은 화면에서는 표를 가로로 스크롤한다. */
export function AgentsTab() {
  const { profile } = useProfileContext();
  const [role, setRole] = useState<RoleFilter>("all");
  const agents = role === "all" ? profile.agents : profile.agents.filter((agent) => agent.role === role);

  return (
    <section aria-label="요원별 통계" className="flex flex-col gap-4">
      <FilterChipGroup label="역할군" options={ROLE_OPTIONS} value={role} onChange={setRole} />
      <Card className="overflow-x-auto px-6 py-2">
        <div role="table" aria-label="요원별 통계" className="min-w-[840px]">
          <div role="row" className={`${GRID} border-b border-line py-3 text-13 font-medium text-sub-weak`}>
            {COLUMNS.map((column) => (
              <span key={column} role="columnheader">
                {column}
              </span>
            ))}
          </div>
          {agents.length === 0 && <p className="py-6 text-14 text-sub">이 역할군으로 플레이한 기록이 없어요.</p>}
          {agents.map((agent) => (
            <div key={agent.agentId} role="row" className={`${GRID} border-b border-line-light py-3 text-15`}>
              <span role="cell" className="flex items-center gap-3">
                <img src={agentIconPath(agent.agentId)} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                <span className="flex flex-col gap-1">
                  <span className="font-semibold">{agent.name}</span>
                  <span className="flex items-center gap-1.5 text-12 text-sub-weak">
                    <img src={roleIconPath(agent.role)} alt="" className="size-4 object-cover" />
                    {ROLE_LABELS[agent.role]}
                  </span>
                </span>
              </span>
              <span role="cell" lang="en">
                {agent.matches}
              </span>
              <span role="cell" className="flex items-center gap-2">
                <span lang="en" className="font-semibold">
                  {agent.winRate}%
                </span>
                <span
                  className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-loss"
                  role="img"
                  aria-label={`승 ${agent.winRate}%, 패 ${100 - agent.winRate}%`}
                >
                  <span className="block h-full bg-win" style={{ width: `${agent.winRate}%` }} />
                </span>
              </span>
              <span role="cell" lang="en">
                {agent.kda.toFixed(2)}
              </span>
              <span role="cell" lang="en">
                {agent.acs}
              </span>
              <span role="cell" lang="en">
                {agent.headshot}%
              </span>
              <span role="cell" lang="en">
                {agent.adr}
              </span>
              <span role="cell" lang="en">
                {agent.firstKills}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
