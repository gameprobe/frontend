import markerIcon from "@/assets/smoke/marker.svg";
import markerSelectedIcon from "@/assets/smoke/marker-selected.svg";
import { agentIconPath, mapMiniPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { minimapLabels, type Point } from "@/mocks/lineups";
import type { SmokeGuide } from "@/mocks/smokes";

/** 512px 미니맵 좌표를 %로 바꾼다 (MinimapStage와 같은 방식). */
const pct = (value: number) => `${(value / 512) * 100}%`;
const at = (point: Point) => ({ left: pct(point.x), top: pct(point.y) });

/** 던지는 위치 → 도착 위치를 위로 휘는 곡선으로 잇는다 (Figma throw path 185:4574). */
function arcPath(from: Point, to: Point) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const lift = Math.min(90, Math.hypot(to.x - from.x, to.y - from.y) * 0.35);
  return `M ${from.x} ${from.y} Q ${midX} ${midY - lift} ${to.x} ${to.y}`;
}

/** Figma smoke-marker(182:4064). Default 36px, Selected는 그림자 포함 64px 이미지라 같은 가운데에 크게 놓는다. */
export function SmokeMarkerIcon({ selected = false }: { selected?: boolean }) {
  return selected ? (
    <img src={markerSelectedIcon} alt="" width={64} height={64} className="pointer-events-none absolute top-1/2 left-1/2 max-w-none -translate-1/2" />
  ) : (
    <img src={markerIcon} alt="" width={36} height={36} />
  );
}

type SmokeMinimapProps = {
  mapId: string;
  mapName: string;
  smokes: SmokeGuide[];
  selected?: SmokeGuide;
  onSelect: (smoke: SmokeGuide) => void;
};

/** 09 스모크 가이드 미니맵 (Figma 182:4237 · 185:4474). 고른 연막은 던지는 위치와 점선 곡선을 함께 그린다. */
export function SmokeMinimap({ mapId, mapName, smokes, selected, onSelect }: SmokeMinimapProps) {
  const labels = minimapLabels(mapId);
  const walls = smokes.filter((smoke) => smoke.wallEnd);

  return (
    <div className="relative aspect-square w-full max-w-[512px]">
      <img src={mapMiniPath(mapId)} alt={`${mapName} 미니맵`} className="size-full object-contain" />
      {labels.sites.map((label) => (
        <span key={label.text} aria-hidden lang="en" className="absolute text-20 font-bold opacity-85" style={at(label)}>
          {label.text}
        </span>
      ))}
      {labels.areas.map((label) => (
        <span
          key={label.text}
          aria-hidden
          className="absolute rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap text-sub"
          style={at(label)}
        >
          {label.text}
        </span>
      ))}
      {(walls.length > 0 || selected) && (
        <svg aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 size-full">
          {walls.map((smoke) => (
            <line
              key={smoke.id}
              x1={smoke.landing.x}
              y1={smoke.landing.y}
              x2={smoke.wallEnd!.x}
              y2={smoke.wallEnd!.y}
              stroke="var(--color-primary)"
              strokeOpacity={0.45}
              strokeWidth="8"
              strokeLinecap="round"
            />
          ))}
          {selected && (
            <path
              d={arcPath(selected.throwFrom, selected.landing)}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
            />
          )}
        </svg>
      )}
      {smokes.map((smoke) => {
        const active = smoke.id === selected?.id;
        return (
          <button
            key={smoke.id}
            type="button"
            onClick={() => onSelect(smoke)}
            aria-label={`${smoke.title} 보기`}
            aria-pressed={active}
            className="absolute size-9 -translate-1/2 rounded-full"
            style={{ ...at(smoke.landing), zIndex: active ? 10 : undefined }}
          >
            <SmokeMarkerIcon selected={active} />
          </button>
        );
      })}
      {selected && (
        <>
          <span
            aria-hidden
            className="absolute z-20 flex w-max -translate-1/2 rounded-full bg-win p-0.5 drop-shadow-[0_0_6px_rgba(46,212,191,0.5)]"
            style={at(selected.throwFrom)}
          >
            <img src={agentIconPath(selected.agentId)} alt="" className="size-9 shrink-0 rounded-full bg-elevated object-cover" />
          </span>
          <span
            className={cx(
              "absolute z-20 rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap text-win",
              // 지도 오른쪽 끝에서는 라벨이 잘리지 않게 오른쪽을 맞춘다
              selected.throwFrom.x > 440 ? "-translate-x-[85%]" : "-translate-x-1/2",
            )}
            style={{ left: pct(selected.throwFrom.x), top: pct(selected.throwFrom.y + 26) }}
          >
            던지는 위치
          </span>
        </>
      )}
    </div>
  );
}
