import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { useMatchContext } from "@/features/match/match-context";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import type { MatchPlayer } from "@/mocks/match";

const playerKey = (player: MatchPlayer) => `${player.gameName}#${player.tagLine}`;

const METRICS: { label: string; value: (player: MatchPlayer) => number; format?: (value: number) => string }[] = [
  { label: "ACS", value: (player) => player.acs },
  { label: "K/D", value: (player) => player.kills / Math.max(player.deaths, 1), format: (value) => value.toFixed(2) },
  { label: "ADR", value: (player) => player.adr },
  { label: "헤드샷 %", value: (player) => player.headshot },
  { label: "첫 킬", value: (player) => player.firstKills },
  { label: "멀티킬", value: (player) => player.multiKills },
  { label: "클러치", value: (player) => player.clutches },
];

/** 값이 큰 쪽은 진하게, 작은 쪽은 보조색. 같으면 둘 다 진하게 (시안 헤드샷 27 : 27). */
const valueClass = (mine: number, other: number) =>
  mine >= other ? "font-semibold text-main" : "font-normal text-sub";

/** 12 매치 상세 - 플레이어 비교 (Figma 54:928). 막대 길이는 두 값 중 큰 값을 100%로 둔다. */
export function CompareTab() {
  const { match } = useMatchContext();
  const ours = match.players.filter((player) => player.side === "ours");
  const theirs = match.players.filter((player) => player.side === "theirs");
  const defaultRight = theirs.find((player) => player.badge) ?? theirs[0];

  const [leftKey, setLeftKey] = useState(playerKey(ours.find((player) => player.isMe) ?? ours[0]));
  const [rightKey, setRightKey] = useState(playerKey(defaultRight));
  const left = ours.find((player) => playerKey(player) === leftKey) ?? ours[0];
  const right = theirs.find((player) => playerKey(player) === rightKey) ?? theirs[0];

  const toOptions = (players: MatchPlayer[], prefix: string) =>
    players.map((player) => ({ value: playerKey(player), label: `[${prefix}] ${player.gameName} · ${player.agentName}` }));

  return (
    <Card as="section" aria-label="플레이어 비교" className="flex flex-col gap-8 p-5 md:p-8">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)] md:gap-6">
        <div className="flex items-center gap-4">
          <img src={agentIconPath(left.agentId)} alt="" className="size-12 shrink-0 rounded-thumb object-cover md:size-16" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Dropdown label="우리 팀 플레이어" appearance="field" options={toOptions(ours, "우리")} value={leftKey} onChange={setLeftKey} />
            <p className="text-12 text-sub">
              {left.agentName} · {left.tier}
            </p>
          </div>
        </div>
        <p lang="en" className="self-center text-center text-16 font-semibold text-sub-weak">
          VS
        </p>
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 flex-1 flex-col items-end gap-1.5">
            <Dropdown
              label="상대 팀 플레이어"
              appearance="field"
              options={toOptions(theirs, "상대")}
              value={rightKey}
              onChange={setRightKey}
              className="w-full"
            />
            <p className="text-12 text-sub">
              {right.agentName} · {right.tier}
            </p>
          </div>
          <img src={agentIconPath(right.agentId)} alt="" className="size-12 shrink-0 rounded-thumb object-cover md:size-16" />
        </div>
      </div>

      <ul aria-label="지표 비교" className="flex flex-col gap-4">
        {METRICS.map((metric) => {
          const a = metric.value(left);
          const b = metric.value(right);
          const max = Math.max(a, b);
          const format = metric.format ?? String;
          return (
            <li
              key={metric.label}
              className="grid grid-cols-[48px_minmax(0,1fr)_72px_minmax(0,1fr)_48px] items-center gap-3 md:grid-cols-[64px_minmax(0,1fr)_160px_minmax(0,1fr)_64px] md:gap-4"
            >
              <span lang="en" className={cx("text-16", valueClass(a, b))}>
                {format(a)}
              </span>
              <span aria-hidden className="flex h-2.5 justify-end overflow-hidden rounded-full bg-elevated">
                <span className="h-full rounded-full bg-primary" style={{ width: `${max ? (a / max) * 100 : 0}%` }} />
              </span>
              <span className="text-center text-14 font-medium text-sub">{metric.label}</span>
              <span aria-hidden className="flex h-2.5 overflow-hidden rounded-full bg-elevated">
                <span className="h-full rounded-full bg-sub" style={{ width: `${max ? (b / max) * 100 : 0}%` }} />
              </span>
              <span lang="en" className={cx("text-right text-16", valueClass(b, a))}>
                {format(b)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
