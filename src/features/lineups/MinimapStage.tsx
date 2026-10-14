import type { CSSProperties } from "react";
import { agentIconPath, mapMiniPath, skillIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { minimapLabels, type Lineup, type Point } from "@/mocks/lineups";

/** 512px 미니맵 좌표를 %로 바꾼다. 화면 폭이 줄어도 같은 위치에 그린다. */
const pct = (value: number) => `${(value / 512) * 100}%`;
const at = (point: Point) => ({ left: pct(point.x), top: pct(point.y) });

type MinimapStageProps = {
  mapId: string;
  mapName: string;
  agentId: string;
  lineups: Lineup[];
  selected?: Lineup;
  onSelect: (lineup: Lineup) => void;
};

/**
 * 23 라인업 미니맵 (Figma 74:175 · 74:321). 상세를 열면 고른 마커만 강조하고,
 * 던지는 위치 → 착지 지점을 직선으로 잇고 그 위로 점이 계속 날아가게 한다(애니메이션은 styles/index.css의 lineup-throw).
 */
export function MinimapStage({ mapId, mapName, agentId, lineups, selected, onSelect }: MinimapStageProps) {
  const labels = minimapLabels(mapId);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[512px]">
      <img src={mapMiniPath(mapId)} alt={`${mapName} 미니맵`} className="size-full object-contain" />
      {labels.sites.map((label) => (
        <span
          key={label.text}
          aria-hidden
          lang="en"
          className="absolute text-20 font-semibold opacity-50"
          style={{ left: pct(label.x), top: pct(label.y) }}
        >
          {label.text}
        </span>
      ))}
      {labels.areas.map((label) => (
        <span
          key={label.text}
          aria-hidden
          className={cx("absolute rounded-sm bg-page px-2 py-1 text-12 font-medium whitespace-nowrap", selected && "opacity-50")}
          style={{ left: pct(label.x), top: pct(label.y) }}
        >
          {label.text}
        </span>
      ))}
      {selected && (
        <>
          <svg aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 size-full">
            <line
              x1={selected.throwFrom.x}
              y1={selected.throwFrom.y}
              x2={selected.landing.x}
              y2={selected.landing.y}
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span
            aria-hidden
            data-testid="throw-dot"
            className="lineup-throw-dot pointer-events-none absolute z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface"
            style={
              {
                "--from-x": pct(selected.throwFrom.x),
                "--from-y": pct(selected.throwFrom.y),
                "--to-x": pct(selected.landing.x),
                "--to-y": pct(selected.landing.y),
                "--mid-x": pct((selected.throwFrom.x + selected.landing.x) / 2),
                "--mid-y": pct((selected.throwFrom.y + selected.landing.y) / 2),
              } as CSSProperties
            }
          />
        </>
      )}
      {lineups.map((lineup) => {
        const active = lineup.id === selected?.id;
        return (
          <button
            key={lineup.id}
            type="button"
            onClick={() => onSelect(lineup)}
            aria-label={`${lineup.title} 라인업 보기`}
            aria-pressed={active}
            className={cx(
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-opacity",
              active
                ? "z-10 size-11 border-main bg-primary drop-shadow-[0_0_8px_rgba(91,140,255,0.45)]"
                : "size-9 border-primary bg-surface hover:opacity-100",
              selected && !active && "opacity-35",
            )}
            style={at(lineup.landing)}
          >
            <img src={skillIconPath(lineup.skillId)} alt="" className={active ? "size-7" : "size-[22px]"} />
          </button>
        );
      })}
      {selected && (
        <>
          <span
            aria-hidden
            className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-2 border-main bg-surface"
            style={at(selected.throwFrom)}
          >
            <img src={agentIconPath(agentId)} alt="" className="size-10 rounded-full object-cover" />
          </span>
          <span
            className="absolute -translate-x-1/2 rounded-md border border-line bg-elevated px-2 py-1 text-12 font-semibold whitespace-nowrap"
            style={{ left: pct(selected.throwFrom.x), top: pct(selected.throwFrom.y + 28) }}
          >
            던지는 위치
          </span>
        </>
      )}
    </div>
  );
}
