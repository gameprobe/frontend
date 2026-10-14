import markerIcon from "@/assets/smoke/marker.svg";
import { groupByDestination, useOpenDestination } from "@/components/guide-map/destination-groups";
import { RouteBall, RouteLine } from "@/components/guide-map/RouteSvg";
import markerSelectedIcon from "@/assets/smoke/marker-selected.svg";
import { agentIconPath, mapMiniPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { minimapLabels, type Point } from "@/mocks/lineups";
import type { SmokeGuide } from "@/mocks/smokes";

/** 512px 미니맵 좌표를 %로 바꾼다 (MinimapStage와 같은 방식). */
const pct = (value: number) => `${(value / 512) * 100}%`;
const at = (point: Point) => ({ left: pct(point.x), top: pct(point.y) });

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
  /** 던지는 위치(요원 초상)를 눌렀을 때. 상세를 열고 영상을 바로 튼다 */
  onPlay: (smoke: SmokeGuide) => void;
};

/**
 * 09 스모크 가이드 미니맵 (Figma 182:4237 · 185:4375). 고른 연막은 던지는 위치와 투척 경로(꺾은 실선)를 함께 그린다.
 * TASK-FE-056: 도착 위치가 같은 연막은 마커 하나로 묶고, 마커에 마우스를 올리면 연결된 던지는 위치·경로를 모두 켠다(Figma 206:5458).
 */
export function SmokeMinimap({ mapId, mapName, smokes, selected, onSelect, onPlay }: SmokeMinimapProps) {
  const labels = minimapLabels(mapId);
  const walls = smokes.filter((smoke) => smoke.wallEnd);
  const groups = groupByDestination(smokes);
  const { openKey, hover, leave, togglePin } = useOpenDestination(selected ? (selected.destinationId ?? selected.id) : null);
  const open = groups.find((group) => group.key === openKey);
  const others = open?.guides.filter((smoke) => smoke.id !== selected?.id) ?? [];

  return (
    <div className="relative aspect-square w-full max-w-[512px]" onMouseLeave={leave}>
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
      {(walls.length > 0 || selected || others.length > 0) && (
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
          {others.map((smoke) => (
            <RouteLine key={smoke.id} from={smoke.throwFrom} path={smoke.path} to={smoke.landing} />
          ))}
          {selected && <RouteLine from={selected.throwFrom} path={selected.path} to={selected.landing} />}
        </svg>
      )}
      {groups.map((group) => {
        const active = group.guides.some((smoke) => smoke.id === selected?.id);
        const single = group.guides.length === 1;
        const first = group.guides[0];
        return (
          <button
            key={group.key}
            type="button"
            onMouseEnter={() => hover(group.key)}
            onFocus={() => hover(group.key)}
            onBlur={leave}
            onClick={() => (single ? onSelect(first) : togglePin(group.key))}
            aria-label={single ? `${first.title} 보기` : `${group.name} 도착 위치 · 던지는 위치 ${group.guides.length}곳 보기`}
            aria-pressed={single ? active : undefined}
            aria-expanded={single ? undefined : group.key === openKey}
            className="absolute size-9 -translate-1/2 rounded-full"
            style={{ ...at(group.landing), zIndex: active ? 10 : undefined }}
          >
            <SmokeMarkerIcon selected={active || group.key === openKey} />
            {!single && (
              <span lang="en" className="absolute -top-1.5 -right-1.5 flex size-[18px] items-center justify-center rounded-full bg-main text-11 font-bold text-on-primary">
                {group.guides.length}
              </span>
            )}
          </button>
        );
      })}
      {others.map((smoke) => (
        <button
          key={smoke.id}
          type="button"
          onMouseEnter={() => open && hover(open.key)}
          onClick={() => onPlay(smoke)}
          aria-label={`${smoke.title} 던지는 위치 · 영상 보기`}
          title={smoke.title}
          className="absolute z-20 flex -translate-1/2 rounded-full transition-transform hover:scale-110"
          style={at(smoke.throwFrom)}
        >
          <img src={agentIconPath(smoke.agentId)} alt="" className="size-9 shrink-0 rounded-full bg-elevated object-cover" />
        </button>
      ))}
      {selected && (
        <>
          <button
            type="button"
            onClick={() => onPlay(selected)}
            aria-label={`${selected.title} 던지는 위치 · 영상 보기`}
            className="absolute z-20 flex w-max -translate-1/2 rounded-full bg-win p-0.5 drop-shadow-[0_0_6px_rgba(46,212,191,0.5)]"
            style={at(selected.throwFrom)}
          >
            <img src={agentIconPath(selected.agentId)} alt="" className="size-9 shrink-0 rounded-full bg-elevated object-cover" />
          </button>
          <span
            className={cx(
              "pointer-events-none absolute z-20 rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap text-win",
              // 지도 오른쪽 끝에서는 라벨이 잘리지 않게 오른쪽을 맞춘다
              selected.throwFrom.x > 440 ? "-translate-x-[85%]" : "-translate-x-1/2",
            )}
            style={{ left: pct(selected.throwFrom.x), top: pct(selected.throwFrom.y + 26) }}
          >
            던지는 위치
          </span>
        </>
      )}
      {open && !selected && open.guides.length > 1 && (
        <span
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-md bg-page px-2 py-1 text-12 font-medium whitespace-nowrap"
          style={{ left: pct(Math.min(430, Math.max(80, open.landing.x))), top: pct(Math.max(0, open.landing.y - 46)) }}
        >
          {open.name} · 던지는 위치 {open.guides.length}곳
        </span>
      )}
      {(open || selected) && (
        <svg aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 z-30 size-full">
          {[...others, ...(selected ? [selected] : [])].map((smoke) => (
            <RouteBall
              key={smoke.id}
              from={smoke.throwFrom}
              path={smoke.path}
              to={smoke.landing}
              testId={smoke.id === selected?.id ? "throw-dot" : undefined}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
