import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { agentIconPath, ROLE_LABELS, roleIconPath, type AgentRole } from "@/lib/assets";
import { AGENT_TIER_LABELS, META_AGENTS, type AgentTier, type MetaAgent } from "@/mocks/meta";

const ROLE_OPTIONS = [
  { value: "all", label: "전체" },
  ...(["duelist", "initiator", "controller", "sentinel"] as const).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
    icon: roleIconPath(role),
  })),
] as const;

const SORT_OPTIONS = [
  { value: "winRate", label: "승률순" },
  { value: "pickRate", label: "픽률순" },
  { value: "acs", label: "ACS순" },
] as const;

type RoleFilter = AgentRole | "all";

const TIERS: AgentTier[] = ["S", "A", "B", "C"];
const GRID = "grid grid-cols-[48px_minmax(0,2fr)_repeat(6,minmax(0,1fr))] items-center gap-4";

function TierRow({ tier, agents }: { tier: AgentTier; agents: MetaAgent[] }) {
  return (
    <li className="flex border-b border-line last:border-b-0">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center bg-elevated md:w-24">
        <p lang="en" className="text-28 font-semibold md:text-32">
          {tier}
        </p>
        <p className="text-12 text-sub">{AGENT_TIER_LABELS[tier]}</p>
      </div>
      {/* 시안 행 높이 147px(테두리 포함)에 맞춰 위아래 여백을 13px로 둔다 */}
      <ul className="flex flex-1 flex-wrap content-center items-center gap-1 p-3 md:gap-3 md:px-4 md:py-[13px]">
        {agents.length === 0 && <li className="px-2 text-14 text-sub-weak">해당 역할군 요원이 없어요</li>}
        {agents.map((agent) => (
          <li key={agent.agentId}>
            <Link
              to={`/game-info/agents/${agent.agentId}`}
              className="flex w-[76px] flex-col items-center gap-1.5 rounded-thumb p-2 hover:bg-elevated md:w-[104px]"
            >
              <img src={agentIconPath(agent.agentId)} alt="" className="size-12 rounded-thumb object-cover md:size-14" />
              <span className="text-14 font-semibold whitespace-nowrap">{agent.name}</span>
              <span lang="en" className="text-12 text-sub">
                {agent.winRate.toFixed(1)}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

/** 15 메타 - 요원 티어리스트 (Figma 56:193). 역할군은 ?role=, 상세 지표 정렬은 ?sort= 로 고른다. */
export function AgentsTierTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const role = (ROLE_OPTIONS.find((option) => option.value === searchParams.get("role"))?.value ?? "all") as RoleFilter;
  const sort = SORT_OPTIONS.find((option) => option.value === searchParams.get("sort"))?.value ?? "winRate";

  const setParam = (key: string, next: string, fallback: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === fallback) params.delete(key);
    else params.set(key, next);
    setSearchParams(params, { replace: true });
  };

  const agents = role === "all" ? META_AGENTS : META_AGENTS.filter((agent) => agent.role === role);
  const sorted = [...agents].sort((a, b) => b[sort] - a[sort]);

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="요원 티어리스트" className="flex flex-col gap-5">
        <FilterChipGroup
          label="역할군"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(next) => setParam("role", next, "all")}
          size="lg"
        />
        <Card as="ol" className="overflow-hidden">
          {TIERS.map((tier) => (
            <TierRow key={tier} tier={tier} agents={agents.filter((agent) => agent.tier === tier)} />
          ))}
        </Card>
      </section>

      <section aria-labelledby="agent-detail-title" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 id="agent-detail-title" className="text-20 font-semibold">
            요원별 상세 지표
          </h2>
          <FilterChipGroup
            label="정렬"
            options={SORT_OPTIONS}
            value={sort}
            onChange={(next) => setParam("sort", next, "winRate")}
            size="sm"
          />
        </div>
        <Card className="overflow-x-auto px-5 py-2 md:px-6">
          <div role="table" aria-label="요원별 상세 지표" className="min-w-[760px]">
            <div role="row" className={`${GRID} border-b border-line py-3 text-13 font-medium text-sub-weak`}>
              {["#", "요원", "역할", "티어", "승률", "픽률", "KDA", "평균 ACS"].map((column) => (
                <span key={column} role="columnheader">
                  {column}
                </span>
              ))}
            </div>
            {sorted.map((agent, index) => (
              <div
                key={agent.agentId}
                role="row"
                className={`${GRID} border-b border-line-light py-3 text-15 last:border-b-0`}
              >
                <span role="cell" lang="en" className="text-sub-weak">
                  {index + 1}
                </span>
                <span role="cell" className="flex min-w-0 items-center gap-3">
                  <img src={agentIconPath(agent.agentId)} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
                  <span className="truncate font-semibold">{agent.name}</span>
                </span>
                <span role="cell" className="flex items-center gap-1.5 text-sub">
                  <img src={roleIconPath(agent.role)} alt="" className="size-4 object-cover" />
                  {ROLE_LABELS[agent.role]}
                </span>
                <span role="cell" lang="en" className="font-semibold">
                  {agent.tier}
                </span>
                <span role="cell" lang="en" className="font-semibold">
                  {agent.winRate.toFixed(1)}%
                </span>
                <span role="cell" lang="en">
                  {agent.pickRate.toFixed(1)}%
                </span>
                <span role="cell" lang="en">
                  {agent.kda.toFixed(2)}
                </span>
                <span role="cell" lang="en">
                  {agent.acs}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
