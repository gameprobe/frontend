import { useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { at, polylinePoints } from "@/components/guide-map/geometry";
import { Button } from "@/components/ui/Button";
import {
  clampPoint,
  MAP_SIZE,
  MAX_PATH_POINTS,
  movePoint,
  placePoint,
  routePoints,
  type GuideEntry,
  type PointMode,
  type PointSelection,
} from "@/features/admin/model";
import { mapMiniPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import type { Point } from "@/mocks/lineups";

type MapEditorProps = {
  entry: GuideEntry;
  mapName: string;
  onChange: (entry: GuideEntry) => void;
  /** 다른 공략과 함께 쓰는 도착점이면 '도착점 수정'을 눌러야 옮길 수 있다. */
  shared?: { count: number; editing: boolean; onToggle: () => void };
  errors: Record<string, string>;
};

const STEP_SMALL = 5;
const STEP_LARGE = 50;

function keyMovement(key: string, shift: boolean): Point | undefined {
  const step = shift ? STEP_LARGE : STEP_SMALL;
  const moves: Record<string, Point> = {
    ArrowLeft: { x: -step, y: 0 },
    ArrowRight: { x: step, y: 0 },
    ArrowUp: { x: 0, y: -step },
    ArrowDown: { x: 0, y: step },
  };
  return moves[key];
}

/** 지도 지정 버튼의 접근 이름에만 쓴다 (화면 안내 문구는 두지 않는다) */
const MODE_LABEL: Record<PointMode, string> = { target: "도착 위치", start: "출발 위치", path: "중간 지점" };

/**
 * 공략 한 건의 지도 위치 편집기 (legacy-next PreviewMap 상호작용을 옮김).
 * 단계: 1. 도착 → 2. 출발 → 3. 중간 지점(선택, 튕기는 지점도 중간 지점이다).
 * 빈 지도는 클릭 또는 방향키 커서 + Enter/Space로 찍고, 찍은 점은 끌거나 방향키로 옮긴다.
 */
export function MapEditor({ entry, mapName, onChange, shared, errors }: MapEditorProps) {
  const ids = useId();
  const mapRef = useRef<HTMLDivElement>(null);
  const destinationLocked = Boolean(shared && !shared.editing);
  const [mode, setMode] = useState<PointMode>(() => (entry.destination.point ? "start" : "target"));
  const [cursor, setCursor] = useState<Point>({ x: 256, y: 256 });
  // 잠긴 도착점은 숨은 단계로 찍지 않게 한다
  const activeMode: PointMode = mode === "target" && destinationLocked ? "start" : mode;
  const pathFull = entry.path.length >= MAX_PATH_POINTS;
  const route = routePoints(entry);

  function place(point: Point) {
    const next = clampPoint(point);
    onChange(placePoint(entry, activeMode, next));
    setCursor(next);
    if (activeMode === "target") setMode("start");
  }

  const steps: { mode: PointMode; label: string; done: boolean; disabled?: boolean }[] = [
    { mode: "target", label: destinationLocked ? "1. 도착 · 고정" : "1. 도착", done: Boolean(entry.destination.point), disabled: destinationLocked },
    { mode: "start", label: "2. 출발", done: Boolean(entry.start) },
    { mode: "path", label: "3. 중간 지점", done: entry.path.length > 0, disabled: pathFull },
  ];

  const pins: { point: Point | null; label: string; mark: string; tone: string; selection: PointSelection; locked?: boolean }[] = [
    { point: entry.destination.point, label: "도착", mark: "1", tone: "bg-loss", selection: { kind: "target" }, locked: destinationLocked },
    { point: entry.start, label: "출발", mark: "2", tone: "bg-win", selection: { kind: "start" } },
  ];

  const pathError = errors.destination ?? errors.start ?? errors.path;

  return (
    <section aria-labelledby={`${ids}-title`} className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p lang="en" className="text-12 font-semibold tracking-wider text-sub-weak">
            MAP POSITIONS
          </p>
          <h2 id={`${ids}-title`} className="text-20 font-semibold">
            지도에 위치 지정
          </h2>
        </div>
        <span className="text-13 text-sub-weak">{mapName} 미니맵</span>
      </div>

      <div role="group" aria-label="위치 지정 단계" className="flex flex-wrap gap-2">
        {steps.map((step) => {
          const selected = activeMode === step.mode;
          return (
            <button
              key={step.mode}
              type="button"
              aria-pressed={selected}
              disabled={step.disabled}
              onClick={() => setMode(step.mode)}
              className={cx(
                "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-13 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:text-disabled",
                selected ? "border-sub-weak bg-elevated text-main" : "border-line text-sub hover:text-main",
              )}
            >
              {step.label}
              {step.done && <span aria-label="지정됨" className="size-1.5 rounded-full bg-sub" />}
            </button>
          );
        })}
      </div>

      {shared && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-l-2 border-caution bg-elevated px-4 py-3">
          <p className="text-13 text-sub">
            {shared.editing
              ? `이 도착점을 함께 쓰는 공략 ${shared.count + 1}개의 도착 위치를 같이 수정합니다. 저장할 때 반영됩니다.`
              : `이 도착점은 공략 ${shared.count + 1}개가 함께 씁니다. 옮기면 모두 같이 바뀝니다.`}
          </p>
          <Button
            size="md"
            variant="secondary"
            onClick={() => {
              shared.onToggle();
              setMode(shared.editing ? "start" : "target");
            }}
          >
            {shared.editing ? "도착점 수정 취소" : "도착점 수정"}
          </Button>
        </div>
      )}

      <div ref={mapRef} role="group" aria-label="공략 지도 편집" className="relative mx-auto aspect-square w-full max-w-[512px] touch-none select-none">
        <button
          type="button"
          aria-label={`지도 위치 지정 (${MODE_LABEL[activeMode]})`}
          aria-describedby={`${ids}-keyboard`}
          className="absolute inset-0 z-0 cursor-crosshair rounded-lg"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            place({ x: ((event.clientX - rect.left) / rect.width) * MAP_SIZE, y: ((event.clientY - rect.top) / rect.height) * MAP_SIZE });
          }}
          onKeyDown={(event) => {
            const delta = keyMovement(event.key, event.shiftKey);
            if (delta) {
              event.preventDefault();
              setCursor((point) => clampPoint({ x: point.x + delta.x, y: point.y + delta.y }));
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              place(cursor);
            }
          }}
        >
          <img src={mapMiniPath(entry.mapId)} alt="" className="pointer-events-none size-full object-contain" draggable={false} />
        </button>
        <svg aria-hidden viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 z-[1] size-full">
          {entry.kind === "smoke" && entry.destination.point && (
            <circle cx={entry.destination.point.x} cy={entry.destination.point.y} r="18" fill="var(--color-primary)" fillOpacity={0.2} stroke="var(--color-primary)" />
          )}
          {route.length > 1 && (
            <polyline points={polylinePoints(route)} fill="none" stroke="var(--color-caution)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          )}
        </svg>
        {entry.path.map((point, index) => (
          <PointMarker
            key={index}
            point={point}
            label={`${index + 1}번 중간 지점`}
            mapRef={mapRef}
            describedBy={`${ids}-move`}
            onMove={(next) => onChange(movePoint(entry, { kind: "path", index }, next))}
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-page bg-main text-11 font-bold text-on-primary">
              {index + 1}
            </span>
          </PointMarker>
        ))}
        {pins.map(({ point, label, mark, tone, selection, locked }) => {
          if (!point) return null;
          const badge = (
            <span className={cx("flex size-7 items-center justify-center rounded-full border-2 border-page text-13 font-bold text-on-primary", tone, locked && "opacity-80")}>
              {mark}
            </span>
          );
          return locked ? (
            <span
              key={label}
              title="함께 쓰는 도착점 · '도착점 수정'을 누른 뒤 옮기세요"
              className="pointer-events-none absolute z-[2] -translate-1/2"
              style={at(point)}
            >
              {badge}
            </span>
          ) : (
            <PointMarker
              key={label}
              point={point}
              label={`${label} 위치`}
              mapRef={mapRef}
              describedBy={`${ids}-move`}
              onMove={(next) => onChange(movePoint(entry, selection, next, destinationLocked))}
            >
              {badge}
            </PointMarker>
          );
        })}
        <span aria-hidden className="pointer-events-none absolute z-[1] -translate-1/2 text-16 font-bold text-primary" style={at(cursor)}>
          +
        </span>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-13 text-sub" aria-label="지정 현황">
        {pins.map((pin) => (
          <li key={pin.label} className="flex items-center gap-1.5">
            <span aria-hidden className={cx("size-2.5 rounded-full", pin.tone)} />
            {pin.label} <b className={pin.point ? "text-main" : "text-sub-weak"}>{pin.point ? "지정됨" : "미지정"}</b>
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-main" />
          중간 지점 <b className="text-main">{entry.path.length}</b>
        </li>
      </ul>
      {pathError && <p className="text-13 text-loss">{pathError}</p>}

      <div className="flex flex-col gap-1 text-13 text-sub-weak">
        <p id={`${ids}-move`}>찍은 점은 끌어서 옮길 수 있습니다. 점을 고른 뒤 방향키로 미세 조정하고, 끄는 중에는 Esc로 취소합니다.</p>
        <p id={`${ids}-keyboard`}>빈 지도: 방향키로 + 커서 이동, Enter 또는 Space로 지정. Shift + 방향키는 크게 이동합니다.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-13 text-sub">
          중간 지점 {entry.path.length} / {MAX_PATH_POINTS}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button size="md" variant="secondary" disabled={!entry.path.length} onClick={() => onChange({ ...entry, path: entry.path.slice(0, -1) })}>
            마지막 지점 취소
          </Button>
          <Button
            size="md"
            variant="secondary"
            disabled={!entry.start && !entry.path.length}
            onClick={() => {
              onChange({ ...entry, start: null, path: [] });
              setMode(entry.destination.point || destinationLocked ? "start" : "target");
            }}
          >
            출발·경로 초기화
          </Button>
        </div>
      </div>
    </section>
  );
}

type PointMarkerProps = {
  point: Point;
  label: string;
  mapRef: RefObject<HTMLDivElement | null>;
  describedBy: string;
  onMove: (point: Point) => void;
  children: ReactNode;
};

type DragState = { id: number; before: Point; initial: Point; offset: Point; moved: boolean };

/** 찍은 점. 끌기(3px 이상 움직여야 시작)·방향키로 옮기고, Esc·포인터 취소면 원래 자리로 돌린다. */
function PointMarker({ point, label, mapRef, describedBy, onMove, children }: PointMarkerProps) {
  const drag = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  const toMap = (event: ReactPointerEvent, offset: Point) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return null;
    return {
      x: ((event.clientX - rect.left - offset.x) / rect.width) * MAP_SIZE,
      y: ((event.clientY - rect.top - offset.y) / rect.height) * MAP_SIZE,
    };
  };

  function update(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.moved && Math.hypot(event.clientX - current.initial.x, event.clientY - current.initial.y) < 3) return;
    current.moved = true;
    const next = toMap(event, current.offset);
    if (next) onMove(clampPoint(next));
  }

  function finish(button: HTMLButtonElement, cancel: boolean) {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    if (cancel && current.moved) onMove(current.before);
    setDragging(false);
    if (button.hasPointerCapture(current.id)) button.releasePointerCapture(current.id);
  }

  return (
    <button
      type="button"
      aria-label={`${label} 이동`}
      aria-describedby={describedBy}
      title={`${label} · 끌어서 이동`}
      className={cx("absolute z-[3] -translate-1/2 rounded-full", dragging ? "cursor-grabbing" : "cursor-grab")}
      style={at(point)}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary || drag.current) return;
        const rect = mapRef.current?.getBoundingClientRect();
        if (!rect?.width || !rect.height) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.focus({ preventScroll: true });
        drag.current = {
          id: event.pointerId,
          before: { ...point },
          initial: { x: event.clientX, y: event.clientY },
          offset: {
            x: event.clientX - rect.left - (point.x / MAP_SIZE) * rect.width,
            y: event.clientY - rect.top - (point.y / MAP_SIZE) * rect.height,
          },
          moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (drag.current?.id === event.pointerId) {
          event.preventDefault();
          update(event);
        }
      }}
      onPointerUp={(event) => {
        if (drag.current?.id !== event.pointerId) return;
        event.preventDefault();
        event.stopPropagation();
        update(event);
        finish(event.currentTarget, false);
      }}
      onPointerCancel={(event) => drag.current?.id === event.pointerId && finish(event.currentTarget, true)}
      onLostPointerCapture={(event) => drag.current?.id === event.pointerId && finish(event.currentTarget, true)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onBlur={(event) => finish(event.currentTarget, true)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          finish(event.currentTarget, true);
          return;
        }
        if (drag.current) return;
        const delta = keyMovement(event.key, event.shiftKey);
        if (delta) {
          event.preventDefault();
          event.stopPropagation();
          onMove(clampPoint({ x: point.x + delta.x, y: point.y + delta.y }));
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {children}
    </button>
  );
}
