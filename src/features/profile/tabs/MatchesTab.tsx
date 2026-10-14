import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterChipGroup } from "@/components/ui/FilterChip";
import { MatchRow } from "@/features/profile/MatchRow";
import { useProfileContext } from "@/features/profile/profile-context";
import type { ProfileMatch } from "@/mocks/profile";

const RESULT_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "win", label: "승리" },
  { value: "loss", label: "패배" },
] as const;

type ResultFilter = (typeof RESULT_OPTIONS)[number]["value"];

type DayGroup = { day: string; matches: ProfileMatch[] };

function groupByDay(matches: ProfileMatch[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const match of matches) {
    const last = groups.at(-1);
    if (last?.day === match.day) last.matches.push(match);
    else groups.push({ day: match.day, matches: [match] });
  }
  return groups;
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** 날짜 묶음 제목 (Figma 108:1984): 날짜, 승/패 수, K/D · 평균 ACS · 헤드샷 */
function DayHeader({ group }: { group: DayGroup }) {
  const wins = group.matches.filter((match) => match.result === "win").length;
  const kills = group.matches.reduce((sum, match) => sum + match.kills, 0);
  const deaths = group.matches.reduce((sum, match) => sum + match.deaths, 0);
  const acs = Math.round(average(group.matches.map((match) => match.acs)));
  const headshot = Math.round(average(group.matches.map((match) => match.headshot)));

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 pt-4 pb-1">
      <h2 className="text-15 font-semibold">{group.day}</h2>
      <p className="flex gap-1 text-13 font-medium">
        <span className="text-win">{wins}승</span>
        <span className="text-loss">{group.matches.length - wins}패</span>
      </p>
      <p className="ml-auto text-13 text-sub">
        K/D {(kills / Math.max(deaths, 1)).toFixed(2)} · 평균 ACS {acs} · 헤드샷 {headshot}%
      </p>
    </div>
  );
}

/** 처음에 보여 줄 경기 수. '더보기'를 누를 때마다 이만큼 더 펼친다. */
const PAGE_SIZE = 10;

/** 05 프로필 - 매치 기록 (Figma 53:684) */
export function MatchesTab() {
  const { profile } = useProfileContext();
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const matches = filter === "all" ? profile.matches : profile.matches.filter((match) => match.result === filter);
  // 날짜 묶음 머리줄의 요약도 지금 보이는 경기만으로 계산한다.
  const groups = groupByDay(matches.slice(0, visibleCount));
  const hasMore = matches.length > visibleCount;

  const changeFilter = (next: ResultFilter) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section aria-label="매치 기록" className="flex flex-col gap-4">
      <FilterChipGroup label="경기 결과" options={RESULT_OPTIONS} value={filter} onChange={changeFilter} />
      {groups.length > 0 ? (
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <section key={group.day} className="flex flex-col gap-2">
              <DayHeader group={group} />
              <ul className="flex flex-col gap-2">
                {group.matches.map((match) => (
                  <li key={match.id}>
                    <MatchRow match={match} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {hasMore && (
            <Button variant="secondary" className="mt-2 w-full" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              더보기
            </Button>
          )}
        </div>
      ) : (
        <Card className="p-6 text-14 text-sub">조건에 맞는 경기가 없어요.</Card>
      )}
    </section>
  );
}
