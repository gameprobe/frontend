import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { RiotName } from "@/components/ui/RiotName";
import { agentIconPath } from "@/lib/assets";
import { playerPath } from "@/lib/riot-id";
import { ACHIEVEMENT_RANKINGS, ACHIEVEMENT_TYPES, type AchievementType } from "@/mocks/ranking";

const parseType = (value: string | null): AchievementType =>
  ACHIEVEMENT_TYPES.find((option) => option.value === value)?.value ?? "ace";

/** 14 랭킹 - 업적 랭킹 (Figma 56:2). 업적 종류는 ?type= 으로 고른다. */
export function AchievementsTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = parseType(searchParams.get("type"));
  const label = ACHIEVEMENT_TYPES.find((option) => option.value === type)?.label;

  const changeType = (next: AchievementType) => {
    const params = new URLSearchParams(searchParams);
    if (next === "ace") params.delete("type");
    else params.set("type", next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex flex-col gap-5">
      <FilterChipGroup label="업적 종류" options={ACHIEVEMENT_TYPES} value={type} onChange={changeType} size="lg" />
      <Card as="section" aria-label={`${label} 랭킹`} className="px-5 py-2 md:px-6">
        <ol>
          {ACHIEVEMENT_RANKINGS[type].map((entry) => (
            <li key={entry.rank} className="border-b border-line-light last:border-b-0">
              <Link
                to={playerPath(entry)}
                className="grid grid-cols-[24px_40px_minmax(0,1fr)_auto] items-center gap-3 py-3 hover:bg-elevated/40 md:grid-cols-[64px_40px_minmax(0,1fr)_minmax(0,1fr)_120px] md:gap-4"
              >
                <span lang="en" className="text-15 font-semibold text-sub">
                  {entry.rank}
                </span>
                <img src={agentIconPath(entry.agentId)} alt="" className="size-10 rounded-lg object-cover" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <RiotName id={entry} weight="semibold" />
                  <span className="truncate text-13 text-sub md:hidden">
                    {entry.tier} · {entry.games}경기
                  </span>
                </span>
                <span className="hidden text-14 text-sub md:block">
                  {entry.tier} · {entry.games}경기
                </span>
                <span className="text-right text-16 font-semibold md:text-18">{entry.value}</span>
              </Link>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
