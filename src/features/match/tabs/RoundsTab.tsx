import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useMatchContext } from "@/features/match/match-context";
import { cx } from "@/lib/cx";
import { formatNumber } from "@/lib/format";
import { ROUND_END_LABELS, ROUND_END_TITLES, roundType, type MatchRound, type RoundEnd, type TeamSide } from "@/mocks/match";

/** 전반(1~12)과 후반(13~)을 나눠, 후반 칸은 남은 폭을 나눠 쓴다 (시안: 두 묶음 각각 flex-1). */
function splitHalves(rounds: MatchRound[]) {
  return [rounds.filter((round) => round.number <= 12), rounds.filter((round) => round.number > 12)];
}

type CellProps = {
  round: MatchRound;
  side: TeamSide;
  selected: boolean;
  onSelect: (round: number) => void;
};

function RoundCell({ round, side, selected, onSelect }: CellProps) {
  const won = round.winner === side;
  return (
    <button
      type="button"
      onClick={() => onSelect(round.number)}
      aria-label={`라운드 ${round.number} ${side === "ours" ? "우리 팀" : "상대 팀"} ${won ? `승리, ${ROUND_END_LABELS[round.end]}` : "패배"}`}
      aria-pressed={selected}
      className={cx(
        "flex h-9 min-w-0 flex-1 items-center justify-center rounded-md text-11 font-semibold transition-[filter] hover:brightness-125",
        won ? (side === "ours" ? "bg-win-soft text-win" : "bg-loss-soft text-loss") : "bg-elevated",
        selected && "outline outline-1 outline-sub-weak",
      )}
    >
      <span lang="en">{won ? round.end : ""}</span>
    </button>
  );
}

function TimelineRow({ label, side, halves, selected, onSelect }: {
  label: string;
  side: TeamSide;
  halves: MatchRound[][];
  selected: number;
  onSelect: (round: number) => void;
}) {
  return (
    <>
      <p className="text-13 font-semibold">{label}</p>
      <div className="flex gap-3 md:gap-5">
        {halves.map((half, index) => (
          <div key={index} className="flex min-w-0 flex-1 gap-1">
            {half.map((round) => (
              <RoundCell key={round.number} round={round} side={side} selected={round.number === selected} onSelect={onSelect} />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

const LEGEND: RoundEnd[] = ["K", "B", "D", "T"];

/** 10 매치 상세 - 라운드 타임라인 (Figma 54:453). 칸을 누르면 아래에 라운드 요약을 보여준다. */
export function RoundsTab() {
  const { match } = useMatchContext();
  const [selected, setSelected] = useState(1);
  const halves = splitHalves(match.rounds);
  const round = match.rounds.find((item) => item.number === selected) ?? match.rounds[0];
  const ourWin = round.winner === "ours";

  const facts = [
    { label: "첫 킬", value: round.firstKill },
    { label: "우리 팀 장비 가치", value: formatNumber(round.oursLoadout), en: true },
    { label: "상대 팀 장비 가치", value: formatNumber(round.theirsLoadout), en: true },
    { label: "라운드 유형", value: roundType(round) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card as="section" className="flex flex-col gap-9 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-18 font-semibold">라운드 타임라인</h2>
          <ul className="flex flex-wrap gap-4 text-12 text-sub">
            {LEGEND.map((end) => (
              <li key={end}>
                <span lang="en">{end}</span> {ROUND_END_LABELS[end]}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            <div className="grid min-w-[640px] grid-cols-[64px_minmax(0,1fr)] items-center gap-3 md:grid-cols-[88px_minmax(0,1fr)]">
              <TimelineRow label="우리 팀" side="ours" halves={halves} selected={selected} onSelect={setSelected} />
              <TimelineRow label="상대 팀" side="theirs" halves={halves} selected={selected} onSelect={setSelected} />
              <span />
              <div lang="en" className="flex gap-3 text-center text-11 text-sub-weak md:gap-5">
                {halves.map((half, index) => (
                  <div key={index} className="flex min-w-0 flex-1 gap-1">
                    {half.map((item) => (
                      <span key={item.number} className={cx("min-w-0 flex-1", item.number === selected && "font-semibold text-main")}>
                        {item.number}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-12 text-sub-weak">
            <p>1–12 라운드: 우리 팀 공격</p>
            <p>13–24 라운드: 우리 팀 수비</p>
          </div>
        </div>
      </Card>

      <Card as="section" aria-live="polite" className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-sub">
            라운드 {round.number} · 우리 팀 {round.ourSide}
          </p>
          <h2 className="text-20 font-semibold md:text-24">
            <span className={ourWin ? "text-win" : "text-loss"}>{ourWin ? "우리 팀 승리" : "상대 팀 승리"}</span>
            {` — ${ROUND_END_TITLES[round.end]}`}
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 rounded-thumb bg-elevated p-4">
              <dt className="text-13 text-sub">{fact.label}</dt>
              <dd lang={fact.en ? "en" : undefined} className="text-18 font-semibold">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
