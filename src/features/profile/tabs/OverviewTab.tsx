import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HitMap, type HitPart } from "@/features/profile/HitMap";
import { MatchRow } from "@/features/profile/MatchRow";
import { useProfileContext } from "@/features/profile/profile-context";
import { agentIconPath, ROLE_LABELS, roleIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { formatNumber, winRateClass } from "@/lib/format";
import type { PlayerProfile } from "@/mocks/profile";

const RECENT_MATCH_LIMIT = 10;

function CardTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="flex-1 text-18 font-semibold">{title}</h2>
      {meta && <p className="text-13 whitespace-nowrap text-sub">{meta}</p>}
    </div>
  );
}

function RankCard({ rank }: { rank: PlayerProfile["rank"] }) {
  return (
    <Card as="section" aria-label="랭크" className="flex flex-col gap-7 p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-sub">현재 티어 · {rank.act}</p>
          <p className="text-28 font-semibold">{rank.tier}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between text-13">
            <span className="text-sub">랭크 등급 점수</span>
            <span lang="en" className="font-semibold">
              {rank.rr} / 100 RR
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full bg-main" style={{ width: `${rank.rr}%` }} />
          </div>
        </div>
      </div>
      <div className="h-px bg-line" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-13 text-sub">최고 티어</p>
          <p className="text-18 font-semibold">{rank.peakTier}</p>
        </div>
        <p className="text-12 text-sub-weak">{rank.peakAct}</p>
      </div>
    </Card>
  );
}

function FrequentAgentsCard({ agents }: { agents: PlayerProfile["agents"] }) {
  return (
    <Card as="section" className="flex flex-col gap-4 px-6 pt-6 pb-4">
      <CardTitle title="자주 쓰는 요원" />
      <ul>
        {agents.slice(0, 3).map((agent) => (
          <li key={agent.agentId} className="flex items-center gap-3 py-2">
            <img src={agentIconPath(agent.agentId)} alt="" className="size-11 shrink-0 rounded-lg object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-15 font-semibold">{agent.name}</p>
              <p className="text-12 text-sub-weak">{agent.matches}경기</p>
            </div>
            <div lang="en" className="flex flex-col items-end gap-1">
              <p className="text-14 font-semibold">{agent.winRate}%</p>
              <p className="text-12 whitespace-nowrap text-sub">KDA {agent.kda.toFixed(2)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TeammatesCard({ teammates }: { teammates: PlayerProfile["teammates"] }) {
  return (
    <Card as="section" className="flex flex-col gap-3 p-6">
      <CardTitle title="같이 게임한 플레이어" meta="최근 20경기" />
      <ul className="flex flex-col gap-3">
        {teammates.map((mate) => (
          <li key={`${mate.gameName}#${mate.tagLine}`} className="flex items-center gap-2.5">
            <img src={agentIconPath(mate.agentId)} alt="" className="size-7 shrink-0 rounded-full object-cover" />
            <p className="flex min-w-0 flex-1 items-baseline gap-0.5 truncate">
              <span className="text-13 font-medium">{mate.gameName}</span>
              <span lang="en" className="text-12 text-sub-weak">
                #{mate.tagLine}
              </span>
            </p>
            <span className="text-12 text-sub">{mate.matches}경기</span>
            <span lang="en" className={cx("w-10 text-right text-13 font-semibold", winRateClass(mate.winRate, "sub"))}>
              {mate.winRate}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** 승률 도넛: 트랙 위에 승률만큼 primary 호를 12시 방향부터 그린다. */
function WinRateDonut({ winRate }: { winRate: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-24">
      <svg viewBox="0 0 96 96" className="size-24 -rotate-90" aria-hidden>
        <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="8"
          strokeDasharray={`${(circumference * winRate) / 100} ${circumference}`}
        />
      </svg>
      <p lang="en" className="absolute inset-0 flex items-center justify-center text-28 font-semibold">
        {winRate}%
      </p>
    </div>
  );
}

function Recent20Card({ profile }: { profile: PlayerProfile }) {
  const { recent20, summary, matches } = profile;
  // 시안의 W/L 칸은 최근 경기부터 10칸씩 두 줄이다
  const results = matches.slice(0, 20).map((match) => match.result);
  return (
    <Card as="section" className="flex flex-col gap-4 p-6">
      <CardTitle title="최근 20 매치" meta={`경쟁전 · ${summary.wins}승 ${summary.losses}패`} />
      <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
        <div className="flex flex-col items-center gap-2">
          <WinRateDonut winRate={summary.winRate} />
          <p className="text-12 text-sub">
            {summary.wins + summary.losses}전 {summary.wins}승 {summary.losses}패
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p lang="en" className="flex items-baseline gap-1 text-20">
            <span className="font-semibold">{recent20.avgKills}</span>
            <span className="text-sub-weak">/</span>
            <span className="font-semibold text-loss">{recent20.avgDeaths}</span>
            <span className="text-sub-weak">/</span>
            <span className="font-semibold">{recent20.avgAssists}</span>
          </p>
          <p className="text-14 font-semibold text-primary">{recent20.rating.toFixed(2)} : 1 평점</p>
          <p className="text-12 text-sub">킬 관여율 {recent20.killParticipation}%</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <p className="text-12 font-medium text-sub">최근 플레이 요원</p>
          {recent20.agents.map((agent) => (
            <p key={agent.agentId} className="flex items-center gap-2 text-12 whitespace-nowrap">
              <img src={agentIconPath(agent.agentId)} alt="" className="size-6 rounded-full object-cover" />
              <span className="text-13 font-medium">{agent.name}</span>
              <span className={winRateClass(agent.winRate, "sub")}>
                {agent.winRate}% ({agent.wins}승 {agent.losses}패)
              </span>
              <span className="text-sub">{agent.rating.toFixed(2)} 평점</span>
            </p>
          ))}
        </div>
        <div className="flex min-w-[236px] flex-1 flex-col gap-1.5">
          <p className="text-12 font-medium text-sub">최근 20경기</p>
          <ol className="grid w-fit grid-cols-10 gap-1" aria-label="최근 20경기 결과, 최근 경기부터">
            {results.map((result, index) => (
              <li
                key={index}
                lang="en"
                className={cx(
                  "flex size-[22px] items-center justify-center rounded text-11 font-semibold",
                  result === "win" ? "bg-win-soft text-win" : "bg-loss-soft text-loss",
                )}
              >
                {result === "win" ? "W" : "L"}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
}

function HitPartsCard({ parts }: { parts: PlayerProfile["hitParts"] }) {
  const top = parts.reduce((best, part) => (part.percent > best.percent ? part : best), parts[0]);
  return (
    <Card as="section" className="flex flex-col gap-4 p-6">
      <CardTitle title="타격 부위" meta="최근 20경기" />
      <div className="flex items-center gap-8">
        <HitMap highlight={top.label as HitPart} />
        <ul className="flex min-w-0 flex-1 flex-col gap-5 py-2">
          {parts.map((part) => (
            <li key={part.label} className="flex flex-col gap-1.5">
              <div className="flex items-center">
                <span className="flex-1 text-13 font-medium text-sub">{part.label}</span>
                <span lang="en" className="text-15 font-semibold">
                  {part.percent.toFixed(1)}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className={cx("h-full rounded-full", part === top ? "bg-loss" : "bg-sub")}
                  style={{ width: `${part.percent}%` }}
                />
              </div>
              <span className="text-12 text-sub-weak">{formatNumber(part.count)}회</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function RolesCard({ roles }: { roles: PlayerProfile["roles"] }) {
  return (
    <Card as="section" className="flex flex-col gap-4 p-6">
      <CardTitle title="역할군" />
      <ul className="flex flex-col gap-7">
        {roles.map((role) => (
          <li key={role.role} className="flex items-center gap-3">
            <img src={roleIconPath(role.role)} alt="" className="size-8 shrink-0 object-contain" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-14 font-medium">{ROLE_LABELS[role.role]}</p>
              <p className="text-12 text-sub-weak">플레이 비중 {role.share}%</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <p lang="en" className={cx("text-14 font-semibold", winRateClass(role.winRate, "loss"))}>
                {role.winRate}%
              </p>
              <p className="text-12 text-sub">{role.rating.toFixed(2)} 평점</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** 04 프로필 - 개요 (Figma 170:3616) */
export function OverviewTab() {
  const { profile, basePath, search } = useProfileContext();
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <RankCard rank={profile.rank} />
        <FrequentAgentsCard agents={profile.agents} />
        <RolesCard roles={profile.roles} />
        <HitPartsCard parts={profile.hitParts} />
        <TeammatesCard teammates={profile.teammates} />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <Recent20Card profile={profile} />
        <Card as="section" className="flex flex-col gap-2 px-4 py-6 md:px-8">
          <CardTitle title="최근 매치" meta="경쟁전" />
          <ul className="flex flex-col gap-2">
            {profile.matches.slice(0, RECENT_MATCH_LIMIT).map((match) => (
              <li key={match.id}>
                <MatchRow match={match} />
              </li>
            ))}
          </ul>
          <div className="flex justify-center pt-2">
            <ButtonLink to={`${basePath}/matches${search}`} variant="secondary" className="px-5">
              매치 기록 전체 보기
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
