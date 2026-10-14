import { Link } from "react-router-dom";
import chevronIcon from "@/assets/icons/chevron-right-sm.svg";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { formatSigned } from "@/lib/format";
import type { ProfileMatch } from "@/mocks/profile";

function StatCell({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <span className={cx("flex-col gap-1", className)}>
      <span lang="en" className="text-15 font-semibold">
        {value}
      </span>
      <span className="text-12 text-sub">{label}</span>
    </span>
  );
}

/**
 * Figma Match Row / Screen(100:2138). 승패는 색과 글자(승리/패배)로 함께 구분한다.
 * 모바일은 결과·요원/맵·스코어만, md부터 KDA, lg부터 ACS·헤드샷·RR까지 보여준다.
 */
export function MatchRow({ match }: { match: ProfileMatch }) {
  const win = match.result === "win";

  return (
    <Link
      to={`/matches/${match.id}`}
      className={cx(
        "grid h-20 items-center gap-3 overflow-hidden rounded-thumb pr-3 transition-[filter] hover:brightness-125",
        "grid-cols-[4px_56px_minmax(0,1fr)_auto_16px]",
        "md:grid-cols-[4px_80px_minmax(0,1.4fr)_72px_minmax(0,1fr)_20px] md:gap-4 md:pr-4",
        "lg:grid-cols-[4px_96px_minmax(0,1.4fr)_88px_minmax(0,1fr)_72px_72px_72px_20px] lg:gap-5 lg:pr-5",
        win ? "bg-win-soft" : "bg-loss-soft",
      )}
    >
      <span aria-hidden className={cx("h-full", win ? "bg-win" : "bg-loss")} />
      <span className="flex flex-col gap-1">
        <span className={cx("text-16 font-semibold", win ? "text-win" : "text-loss")}>{win ? "승리" : "패배"}</span>
        <span className="text-12 whitespace-nowrap text-sub-weak">{match.ago}</span>
      </span>
      <span className="flex min-w-0 items-center gap-3">
        <img src={agentIconPath(match.agentId)} alt="" className="size-10 shrink-0 rounded-lg object-cover md:size-12" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-15 font-semibold">{match.mapName}</span>
          <span className="truncate text-12 text-sub">
            {match.agentName} · {match.queue} · {match.durationMin}분
          </span>
        </span>
      </span>
      <span lang="en" className="text-18 font-semibold whitespace-nowrap md:text-20">
        {match.score[0]} : {match.score[1]}
      </span>
      <StatCell
        className="hidden md:flex"
        value={`${match.kills} / ${match.deaths} / ${match.assists}`}
        label={`KDA ${match.kda.toFixed(2)}`}
      />
      <StatCell className="hidden lg:flex" value={String(match.acs)} label="ACS" />
      <StatCell className="hidden lg:flex" value={`${match.headshot}%`} label="헤드샷" />
      <StatCell className="hidden lg:flex" value={`${formatSigned(match.rrChange)} RR`} label={match.badge ?? "RR 변동"} />
      <img src={chevronIcon} alt="" width={20} height={16} />
    </Link>
  );
}
