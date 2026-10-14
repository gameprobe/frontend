import { Link, useParams, useSearchParams } from "react-router-dom";
import closeIcon from "@/assets/icons/close-sub.svg";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { agentFullPath, ROLE_LABELS, roleIconPath, type AgentRole, mapListPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { AGENT_INFOS, findAgentInfo, type AgentInfo } from "@/mocks/game-info";
import { META_MAPS } from "@/mocks/meta";

const ROLE_OPTIONS = [
  { value: "all", label: "전체" },
  ...(["duelist", "initiator", "controller", "sentinel"] as const).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
    icon: roleIconPath(role),
  })),
] as const;

type RoleFilter = AgentRole | "all";

const mapName = (mapId: string) => META_MAPS.find((map) => map.mapId === mapId)?.name ?? mapId;

function RoleLabel({ role, className }: { role: AgentRole; className?: string }) {
  return (
    <span className={cx("flex items-center gap-1.5", className)}>
      <img src={roleIconPath(role)} alt="" className="size-4 object-cover" />
      {ROLE_LABELS[role]}
    </span>
  );
}

/** 19b 요원 상세 패널 (Figma 56:1857) */
function AgentDetail({ agent, search }: { agent: AgentInfo; search: string }) {
  const stats = [
    { label: "메타 티어", value: agent.tier },
    { label: "승률", value: `${agent.winRate.toFixed(1)}%` },
    { label: "픽률", value: `${agent.pickRate.toFixed(1)}%` },
    { label: "KDA", value: agent.kda.toFixed(2) },
  ];

  return (
    <Card as="section" aria-label={`${agent.name} 상세`} className="relative mt-4 grid gap-0 overflow-hidden p-3 md:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:grid-cols-[420px_minmax(0,1fr)]">
      <div className="relative h-72 overflow-hidden rounded-thumb bg-elevated md:h-auto md:min-h-[460px]">
        <img
          src={agentFullPath(agent.agentId)}
          alt=""
          className="absolute top-0 left-1/2 h-full max-w-none -translate-x-1/2 object-cover"
        />
      </div>
      <div className="flex flex-col gap-8 p-5 md:p-8 lg:gap-10 lg:p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <RoleLabel role={agent.role} className="text-16 font-medium text-sub" />
            <h2 className="text-32 font-semibold md:text-40">{agent.name}</h2>
          </div>
          <p className="text-16 text-sub">{agent.description}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 rounded-thumb bg-elevated p-4">
              <dt className="text-13 text-sub">{stat.label}</dt>
              <dd lang="en" className="text-24 font-semibold">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-5">
          <h3 className="text-14 font-medium">추천 맵</h3>
          <ul className="grid gap-3 sm:grid-cols-3">
            {agent.recommendedMaps.map((map) => (
              <li key={map.mapId}>
                <Link to={`/game-info/maps/${map.mapId}`} className="relative block h-28 overflow-hidden rounded-thumb">
                  <img src={mapListPath(map.mapId)} alt="" className="size-full object-cover" />
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,19,27,0)_30%,rgba(14,19,27,0.92))]" />
                  <span className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 font-semibold">
                    <span className="text-15">{mapName(map.mapId)}</span>
                    <span lang="en" className="text-13 text-win">
                      {map.winRate.toFixed(1)}%
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link
        to={`/game-info${search}`}
        aria-label="요원 상세 닫기"
        className="absolute top-8 right-8 flex size-9 items-center justify-center rounded-full bg-elevated hover:bg-line"
      >
        <img src={closeIcon} alt="" width={14} height={14} />
      </Link>
    </Card>
  );
}

/** 19 게임 정보 - 요원 (Figma 56:1508) · 19b 요원 상세 (56:1815). 역할군은 ?role= 로 고른다. */
export function AgentsGuideTab() {
  const { agentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = (ROLE_OPTIONS.find((option) => option.value === searchParams.get("role"))?.value ?? "all") as RoleFilter;
  const search = role === "all" ? "" : `?role=${role}`;
  const selected = agentId ? findAgentInfo(agentId) : undefined;
  const agents = role === "all" ? AGENT_INFOS : AGENT_INFOS.filter((agent) => agent.role === role);

  const changeRole = (next: RoleFilter) => {
    setSearchParams(next === "all" ? {} : { role: next }, { replace: true });
  };

  return (
    <div className="flex flex-col gap-5">
      {agentId && !selected && (
        <Card as="section" role="status" className="p-6 text-15 text-sub">
          요원을 찾을 수 없어요. 아래 목록에서 골라 주세요.
        </Card>
      )}
      {/* 시안: 탭~상세 패널 36px, 패널~목록 36px → 둘 다 32px(간격 규칙) */}
      {selected && <AgentDetail agent={selected} search={search} />}
      <div className={cx("flex flex-col gap-5", selected && "mt-3")}>
        <FilterChipGroup label="역할군" options={ROLE_OPTIONS} value={role} onChange={changeRole} size="lg" />
        <ul aria-label="요원 목록" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
          {agents.map((agent) => {
            const isSelected = agent.agentId === selected?.agentId;
            return (
              <li key={agent.agentId}>
                <Link
                  to={`/game-info/agents/${agent.agentId}${search}`}
                  aria-current={isSelected ? "true" : undefined}
                  className={cx(
                    "flex flex-col overflow-hidden rounded-card border bg-surface transition-colors",
                    isSelected ? "border-main" : "border-line hover:border-line-strong",
                  )}
                >
                  <span className="relative h-40 overflow-hidden bg-elevated">
                    <img
                      src={agentFullPath(agent.agentId)}
                      alt=""
                      loading="lazy"
                      className="absolute -top-1 left-1/2 h-[254.5px] w-[280px] max-w-none -translate-x-1/2 object-cover"
                    />
                  </span>
                  <span className="flex flex-col gap-1 px-4 pt-3 pb-4">
                    <span className="text-16 font-semibold">{agent.name}</span>
                    <RoleLabel role={agent.role} className="pt-1 text-12 text-sub" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
