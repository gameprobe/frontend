import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { SectionHeader, TextLink } from "@/components/ui/SectionHeader";
import { agentFullPath, ROLE_LABELS, roleIconPath } from "@/lib/assets";
import { TOP_AGENTS, TOP_AGENTS_ACT_LABEL, type TopAgent } from "@/mocks/home";

function AgentCard({ agent, rank }: { agent: TopAgent; rank: number }) {
  return (
    <Card as="li" className="overflow-hidden">
      <Link to={`/game-info/agents/${agent.agentId}`} className="group block">
        <div className="relative h-[200px] overflow-hidden bg-elevated">
          {/* 시안: 카드 폭의 150% 크기로 왼쪽 -25% 지점부터 배치 */}
          <img
            src={agentFullPath(agent.agentId)}
            alt=""
            className="absolute -top-2 left-[-25.3%] aspect-[11/10] w-[150%] max-w-none object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span
            lang="en"
            className="absolute top-3 left-3 flex h-[19px] items-center rounded-md bg-page px-2 text-13 font-semibold"
          >
            #{rank}
          </span>
        </div>
        <div className="flex flex-col gap-1 px-5 pt-4 pb-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-16 font-semibold group-hover:underline">{agent.name}</h3>
            <span lang="en" className="flex h-[21px] items-center rounded-md border border-line px-2 text-13 font-semibold">
              {agent.tier}
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-13 text-sub">
            <span className="flex shrink-0 items-center gap-1.5">
              <img src={roleIconPath(agent.role)} alt="" className="size-4 object-cover" />
              {ROLE_LABELS[agent.role]}
            </span>
            <span className="min-w-0 flex-1">
              · 승률 {agent.winRate.toFixed(1)}% · 픽률 {agent.pickRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

/** 요원 티어 TOP 5 (53:75) */
export function TopAgents() {
  return (
    <section aria-labelledby="top-agents-title" className="flex flex-col gap-5">
      <SectionHeader
        label={TOP_AGENTS_ACT_LABEL}
        title="요원 티어 TOP 5"
        action={<TextLink to="/meta">티어리스트 전체 보기</TextLink>}
      />
      <ol className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {TOP_AGENTS.map((agent, index) => (
          <AgentCard key={agent.agentId} agent={agent} rank={index + 1} />
        ))}
      </ol>
    </section>
  );
}
