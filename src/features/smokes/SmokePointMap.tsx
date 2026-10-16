import { minimapView, type MinimapSide } from "@/data/minimap-layout";
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { mapMiniPath } from "@/lib/assets";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cx } from "@/lib/cx";

type Point = { x: number; y: number };
type MapPoint = { id: string; title: string; destination: Point };

type SmokePointMapProps = {
  mapId: string;
  side?: MinimapSide;
  onSideChange?: (side: MinimapSide) => void;
  points?: MapPoint[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  value?: Point | null;
  onChange?: (point: Point) => void;
};

type Drag = { pointerId: number; before: Point; initial: Point; offset: Point; moved: boolean };
const clamp = (point: Point): Point => ({ x: Math.max(0, Math.min(1, point.x)), y: Math.max(0, Math.min(1, point.y)) });

function arrowMovement(event: KeyboardEvent): Point | null {
  const step = event.shiftKey ? 0.02 : 0.002;
  const moves: Record<string, Point> = {
    ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 },
    ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step },
  };
  return moves[event.key] ?? null;
}

/** 관리자와 공개 화면은 같은 이미지 전체에 대한 0~1 좌표를 그대로 사용한다. */
export function SmokePointMap(props: SmokePointMapProps) {
  return <PointMapStage key={props.mapId} {...props} />;
}

function PointMapStage({ mapId, points = [], selectedId, onSelect, value, onChange, side: selectedSide, onSideChange }: SmokePointMapProps) {
  const instructionsId = useId();
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [cursor, setCursor] = useState<Point>(value ?? { x: 0.5, y: 0.5 });
  const [dragging, setDragging] = useState(false);
  const [mapFocused, setMapFocused] = useState(false);
  const editing = Boolean(onChange);
  const [localSide, setLocalSide] = useState<MinimapSide>("attack");
  const side = selectedSide ?? localSide;
  const setSide = onSideChange ?? setLocalSide;
  const view = minimapView(mapId, side);
  const position = (point: Point) => {
    const shown = view.project(point, 1);
    return { left: `${shown.x * 100}%`, top: `${shown.y * 100}%` };
  };
  const move = (point: Point, delta: Point) => {
    const canonical = view.unproject(delta, 0);
    return clamp({ x: point.x + canonical.x, y: point.y + canonical.y });
  };

  function toPoint(clientX: number, clientY: number, offset: Point = { x: 0, y: 0 }) {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return null;
    return view.unproject(clamp({ x: (clientX - rect.left - offset.x) / rect.width, y: (clientY - rect.top - offset.y) / rect.height }), 1);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (!active.moved && Math.hypot(event.clientX - active.initial.x, event.clientY - active.initial.y) < 3) return;
    active.moved = true;
    const next = toPoint(event.clientX, event.clientY, active.offset);
    if (next) onChange?.(next);
  }

  function finishDrag(button: HTMLButtonElement, cancel: boolean) {
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    if (cancel && active.moved) onChange?.(active.before);
    setDragging(false);
    if (button.hasPointerCapture(active.pointerId)) button.releasePointerCapture(active.pointerId);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-12 text-sub">지도 기준 진영</span>
        <SegmentedControl label="지도 기준 진영" options={[{ value: "attack", label: "공격 아래" }, { value: "defense", label: "수비 아래" }]} value={side} onChange={setSide} />
      </div>
      {/* 가장자리 좌표에서도 버튼과 포커스 테두리가 잘리지 않도록 지도 밖 여백을 둔다. */}
      <div className="mx-auto w-full max-w-[688px] p-6">
        <div {...view.attributes} ref={stage} role="group" aria-label={editing ? "스모크 위치 편집 지도" : "스모크 위치 지도"} className="relative aspect-square w-full select-none">

          {editing ? (
            <button
              type="button"
              aria-label="스모크 위치 지정"
              aria-describedby={instructionsId}
              className="absolute inset-0 cursor-crosshair rounded-lg"
              onFocus={() => { setMapFocused(true); if (value) setCursor(value); }}
              onBlur={() => setMapFocused(false)}
              onClick={(event) => {
                const next = toPoint(event.clientX, event.clientY);
                if (next) { setCursor(next); onChange?.(next); }
              }}
              onKeyDown={(event) => {
                const delta = arrowMovement(event);
                if (delta) {
                  event.preventDefault();
                  setCursor((current) => move(current, delta));
                } else if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onChange?.(cursor);
                }
              }}
            >
              <img style={view.imageStyle} src={mapMiniPath(mapId)} alt="" draggable={false} className="pointer-events-none size-full object-contain" />
            </button>
          ) : <img style={view.imageStyle} src={mapMiniPath(mapId)} alt="스모크 위치를 표시한 미니맵" draggable={false} className="size-full object-contain" />}
          {points.map((point, index) => {
            const className = cx(
              "absolute flex size-9 -translate-1/2 items-center justify-center rounded-full border-2 text-14 font-semibold shadow-md",
              point.id === selectedId ? "z-20 border-main bg-primary text-on-primary ring-4 ring-primary/25" : "z-10 border-primary bg-surface text-primary hover:bg-primary-soft focus:z-30",
            );
            return onSelect ? (
              <button key={point.id} type="button" aria-label={`${point.title} 위치 보기`} aria-pressed={point.id === selectedId} title={point.title}
                onClick={() => onSelect(point.id)} className={className} style={position(point.destination)}>{index + 1}</button>
            ) : (
              <span key={point.id} role="img" aria-label={`${point.title} 설치 위치`} className={className} style={position(point.destination)}>{index + 1}</span>
            );
          })}
          {editing && value && (
            <button
              type="button"
              aria-label="스모크 위치 이동"
              aria-describedby={instructionsId}
              title="끌어서 위치 이동"
              className={cx("absolute z-20 flex size-9 -translate-1/2 touch-none items-center justify-center rounded-full border-2 border-main bg-primary text-on-primary shadow-md", dragging ? "cursor-grabbing" : "cursor-grab")}
              style={position(value)}
              onPointerDown={(event) => {
                if (event.button !== 0 || !event.isPrimary || drag.current) return;
                const rect = stage.current?.getBoundingClientRect();
                if (!rect?.width || !rect.height) return;
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.focus({ preventScroll: true });
                const shown = view.project(value, 1);
                drag.current = {
                  pointerId: event.pointerId, before: { ...value }, initial: { x: event.clientX, y: event.clientY }, moved: false,
                  offset: { x: event.clientX - rect.left - shown.x * rect.width, y: event.clientY - rect.top - shown.y * rect.height },
                };
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
              }}
              onPointerMove={moveDrag}
              onPointerUp={(event) => {
                if (drag.current?.pointerId !== event.pointerId) return;
                moveDrag(event);
                finishDrag(event.currentTarget, false);
              }}
              onPointerCancel={(event) => finishDrag(event.currentTarget, true)}
              onLostPointerCapture={(event) => finishDrag(event.currentTarget, true)}
              onBlur={(event) => finishDrag(event.currentTarget, true)}
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault(); event.stopPropagation(); finishDrag(event.currentTarget, true); return;
                }
                if (drag.current) return;
                const delta = arrowMovement(event);
                if (delta) {
                  event.preventDefault(); event.stopPropagation();
                  onChange?.(move(value, delta));
                }
              }}
            ><span aria-hidden className="size-3 rounded-full bg-main" /></button>
          )}
          {editing && (!value || mapFocused) && <span aria-hidden className="pointer-events-none absolute -translate-1/2 text-20 font-semibold text-primary" style={position(cursor)}>+</span>}
        </div>
      </div>
      <div id={instructionsId} className="space-y-1 text-12 leading-[1.6] text-sub-weak">
        {editing && <p>지도를 눌러 위치를 지정하세요. 찍은 점을 끌거나 방향키로 옮길 수 있어요. Shift + 방향키는 크게 이동하고, 끄는 중 Esc는 취소해요.</p>}
        {editing && <p>키보드로 처음 지정할 때는 지도에 초점을 두고 방향키로 +를 옮긴 뒤 Enter를 누르세요.</p>}
        <p>원의 크기는 위치 표시용이며 실제 연막 범위를 뜻하지 않아요.</p>
      </div>
    </div>
  );
}
