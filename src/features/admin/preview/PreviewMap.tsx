"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { getMapAssetPath } from "../../../lib/asset-map";
import { getRoutePoints, movePoint, placePoint, type Point, type PointMode, type PointSelection, type PreviewDraft } from "./model";
import s from "./AdminPreview.module.css";

const position = (point: Point) => ({ left: `${point.x * 100}%`, top: `${point.y * 100}%` });
const isOptionalMode = (mode: PointMode) => mode === "path" || mode === "bounce";

/** 공략 한 건의 위치를 지정한다. 공유 도착점은 영향 범위를 확인한 뒤 수정한다. */
export function PreviewMap({ draft, onChange, destinationLocked = false, destinationEdit, live = false }: {
  draft: PreviewDraft;
  onChange?: (draft: PreviewDraft) => void;
  destinationLocked?: boolean;
  live?: boolean;
  destinationEdit?: { count: number; active: boolean; onStart: () => void; onCancel: () => void };
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<PointMode>(() => destinationLocked || draft.destination.point ? "start" : "target");
  const [cursor, setCursor] = useState<Point>({ x: .5, y: .5 });
  const [optionsOpen, setOptionsOpen] = useState(false);
  const hasWall = draft.kind === "smoke" && draft.shape === "wall";
  const primaryMode: PointMode = !draft.destination.point && !destinationLocked ? "target" : "start";
  // 선택 항목을 닫거나 도착점이 잠기면 숨겨진 모드로 좌표를 수정하지 않도록 한다.
  const activeMode = (mode === "target" && destinationLocked)
    || (mode === "wallEnd" && !hasWall)
    || (isOptionalMode(mode) && !optionsOpen) ? primaryMode : mode;
  const route = getRoutePoints(draft);
  const lineup = draft.kind === "lineup";
  const bounceCount = draft.path.filter(point => point.kind === "bounce").length;
  const pins: { point: Point | null; label: string; mark: string; className: string; selection: PointSelection }[] = [
    { point: draft.destination.point, label: "도착", mark: "1", className: s.targetPin, selection: { kind: "target" } },
    { point: draft.start, label: "시작", mark: "2", className: s.startPin, selection: { kind: "start" } },
    ...(hasWall ? [{ point: draft.wallEnd, label: "벽 끝", mark: "3", className: s.wallPin, selection: { kind: "wallEnd" as const } }] : []),
  ];
  const guidance = activeMode === "target" ? "① 먼저 지도에서 스킬이 도착할 위치를 클릭하세요."
    : activeMode === "start" ? "② 지도에서 공략을 시작할 출발 위치를 클릭하세요."
    : activeMode === "wallEnd" ? "③ 지도에서 벽형 스모크가 끝나는 위치를 클릭하세요."
    : draft.path.length >= 30 ? "중간 지점은 최대 30개입니다. 마지막 지점을 취소하면 다시 추가할 수 있습니다."
    : activeMode === "bounce" ? `벽에 맞고 튕기는 위치를 순서대로 클릭하세요. 현재 튕김 ${bounceCount}회입니다.`
    : `경로가 꺾이는 위치를 순서대로 클릭하세요. 현재 중간 지점 ${draft.path.length}개입니다.`;

  function place(point: Point) {
    if (!onChange || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    const normalized = { x: Math.max(0, Math.min(1, point.x)), y: Math.max(0, Math.min(1, point.y)) };
    onChange(placePoint(draft, activeMode, normalized));
    setCursor(normalized);
    if (activeMode === "target") setMode("start");
    else if (activeMode === "start" && hasWall) setMode("wallEnd");
  }

  return <section className={s.mapPanel} aria-label="지도 위치">
    <div className={s.sectionHeading}><div><span className={s.eyebrow}>MAP POSITIONS</span><h3>지도에 위치 지정</h3></div><span className={s.subtle}>원본 지도 방향</span></div>
    {onChange && <>
      <div className={s.mapModes} aria-label="위치 지정 단계">
        <button type="button" aria-label="도착 위치" aria-pressed={activeMode === "target"} disabled={destinationLocked} onClick={() => setMode("target")}>1. 도착 위치{destinationLocked ? " · 고정" : ""}</button>
        <button type="button" aria-label="출발 위치" aria-pressed={activeMode === "start"} onClick={() => setMode("start")}>2. 출발 위치</button>
        {hasWall && <button type="button" aria-label="벽 끝 위치" aria-pressed={activeMode === "wallEnd"} onClick={() => setMode("wallEnd")}>3. 벽 끝 위치</button>}
      </div>
      <p className={s.mapGuidance} role="status" id="preview-map-help">{guidance}</p>
      {destinationEdit && <div className={s.destinationEdit}>
        <p>{destinationEdit.active ? `공략 ${destinationEdit.count}개의 도착 위치를 함께 수정 중입니다. 예시 목록에 저장할 때 반영됩니다.` : `이 도착점을 옮기면 현재 공략을 포함한 ${destinationEdit.count}개 공략의 도착 위치가 함께 바뀝니다.`}</p>
        <button type="button" className={s.smallButton} onClick={() => {
          if (destinationEdit.active) { destinationEdit.onCancel(); setMode("start"); }
          else { destinationEdit.onStart(); setMode("target"); }
        }}>{destinationEdit.active ? "도착점 수정 취소" : "도착점 수정"}</button>
      </div>}
    </>}
    <div ref={mapRef} className={s.mapCanvas} role={onChange ? "group" : "img"}
      aria-label={onChange ? "공략 지도 편집" : "공략 출발·도착 경로 미리보기"}>
      {onChange && <button type="button" className={s.mapPlacement} aria-label="지도 위치 지정"
        aria-describedby="preview-map-help preview-map-keyboard"
        onClick={event => {
          const rect = event.currentTarget.getBoundingClientRect();
          place({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
        }}
        onKeyDown={event => {
          const delta = keyMovement(event.key, event.shiftKey);
          if (delta) {
            event.preventDefault();
            setCursor(point => clampPoint({ x: point.x + delta.x, y: point.y + delta.y }));
          } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); place(cursor); }
        }} />}
      <Image src={getMapAssetPath(draft.mapId)} alt="" width={1024} height={1024} priority draggable={false} />
      <svg viewBox="0 0 1000 1000" className={s.mapOverlay} aria-hidden="true">
        {route.length > 1 && <polyline data-route="trajectory" points={route.map(point => `${point.x * 1000},${point.y * 1000}`).join(" ")} fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinejoin="round" />}
        {hasWall && draft.destination.point && draft.wallEnd && <line data-wall-route="guide" x1={draft.destination.point.x * 1000} y1={draft.destination.point.y * 1000} x2={draft.wallEnd.x * 1000} y2={draft.wallEnd.y * 1000} stroke="var(--green)" strokeWidth="18" opacity=".6" />}
        {draft.kind === "smoke" && !hasWall && draft.destination.point && <circle cx={draft.destination.point.x * 1000} cy={draft.destination.point.y * 1000} r="65" fill="var(--green)" fillOpacity=".18" stroke="var(--green)" strokeWidth="3" />}
      </svg>
      {draft.path.map((point, index) => {
        const label = `${index + 1}번 ${lineup ? "중간 지점" : point.kind === "bounce" ? "벽 튕김" : "경유점"}`;
        const className = `${s.routePin} ${!lineup && point.kind === "bounce" ? s.bouncePin : ""}`;
        return onChange ? <PointMarker key={index} point={point} label={label} className={className} mark={String(index + 1)}
          mapRef={mapRef} routeKind={lineup ? "path" : point.kind} pointIndex={index}
          onMove={next => onChange(movePoint(draft, { kind: "path", index }, next, destinationLocked))} />
          : <span key={index} data-route-point={lineup ? "path" : point.kind} data-point-index={index} title={label} className={className} style={position(point)}><span>{index + 1}</span></span>;
      })}
      {pins.map(({ point, label, mark, className, selection }) => {
        if (!point) return null;
        const locked = selection.kind === "target" && destinationLocked;
        const title = label === "시작" ? "출발 위치" : `${label} 위치`;
        return onChange && !locked ? <PointMarker key={label} point={point} label={title} className={`${s.pin} ${className}`} mark={mark}
          mapRef={mapRef} pinLabel={label} onMove={next => onChange(movePoint(draft, selection, next, destinationLocked))} />
          : <span key={label} title={locked && onChange ? (live ? "공유 도착점 · 새 도착점을 지정하면 이 공략만 다른 위치로 옮길 수 있습니다" : "공유 도착점 · 도착점 수정을 선택한 뒤 옮기세요") : title}
            data-pin={label} className={`${s.pin} ${className} ${locked && onChange ? s.lockedPin : ""}`} style={position(point)}>{mark}</span>;
      })}
      {onChange && <span className={s.mapCursor} style={position(cursor)} aria-hidden="true">+</span>}
    </div>
    <div className={s.mapLegend}>{pins.map(pin => <span key={pin.label}><i className={pin.className}>{pin.mark}</i>{pin.label === "시작" ? "출발" : pin.label} <b>{pin.point ? "지정됨" : "미지정"}</b></span>)}</div>
    {onChange ? <>
      <p className={s.help} id="preview-map-move">이미 찍은 점은 끌어서 옮길 수 있습니다. 점을 선택한 뒤 방향키로 미세 조정하고, 드래그 중 Esc로 취소하세요.</p>
      <p className={s.help} id="preview-map-keyboard">빈 지도: 방향키로 이동, Enter 또는 Space로 지정. 점 이동: Shift + 방향키로 크게 이동.</p>
      <details className={s.pathOptions} open={optionsOpen} onToggle={event => {
        const open = event.currentTarget.open;
        setOptionsOpen(open);
        if (!open && isOptionalMode(mode)) setMode(primaryMode);
      }}>
        <summary>{lineup ? "중간 지점 추가 (선택)" : "경유·벽 튕김 추가 (선택)"}</summary>
        <p className={s.help}>직선 경로만 필요하면 생략하세요. 출발 → 중간 지점 → 도착 순서로 연결합니다.{!lineup && " 벽 튕김은 직접 표시하며 실제 물리 계산은 하지 않습니다."}</p>
        <div className={s.mapModes} aria-label="선택 경로 도구">
          <button type="button" aria-pressed={activeMode === "path"} onClick={() => setMode("path")}>{lineup ? "중간 지점" : "경유점"}</button>
          {!lineup && <button type="button" aria-pressed={activeMode === "bounce"} onClick={() => setMode("bounce")}>벽 튕김</button>}
        </div>
        <div className={s.mapLegend}><span><i className={s.waypointLegend}>●</i>{lineup ? "중간 지점" : "경유점"} {lineup ? draft.path.length : draft.path.length - bounceCount}</span>{!lineup && <span><i className={s.bounceLegend}>◆</i>벽 튕김 {bounceCount}</span>}</div>
        <div className={s.mapFooter}><span className={s.subtle}>중간 지점 {draft.path.length} / 30</span><div className={s.actions}>
          <button type="button" className={s.smallButton} disabled={!draft.path.length} onClick={() => onChange({ ...draft, path: draft.path.slice(0, -1) })}>마지막 지점 취소</button>
          <button type="button" className={s.smallButton} disabled={!draft.path.length} onClick={() => onChange({ ...draft, path: [] })}>중간 지점 비우기</button>
        </div></div>
      </details>
      <div className={s.mapFooter}><span className={s.subtle}>도착점은 유지됩니다.</span><button type="button" className={s.smallButton} disabled={!draft.start && !draft.wallEnd && !draft.path.length} onClick={() => {
        onChange({ ...draft, start: null, wallEnd: null, path: [] });
        setMode(primaryMode); setCursor({ x: .5, y: .5 }); setOptionsOpen(false);
      }}>출발·경로 초기화</button></div>
    </> : <>
      {draft.path.length > 0 && <div className={s.mapLegend}><span><i className={s.waypointLegend}>●</i>{lineup ? "중간 지점" : "경유점"} {lineup ? draft.path.length : draft.path.length - bounceCount}</span>{!lineup && <span><i className={s.bounceLegend}>◆</i>벽 튕김 {bounceCount}</span>}</div>}
      <p className={s.help}>{live ? "출발 → 중간 지점 → 도착 순서로 저장한 경로입니다." : lineup ? "출발 → 중간 지점 → 도착 순서의 입력 예시입니다." : "출발 → 경유·튕김 지점 → 도착 순서의 입력 예시입니다. 실제 연막 범위를 검증한 결과가 아닙니다."}</p>
    </>}
  </section>;
}

function clampPoint(point: Point): Point {
  return { x: Math.max(0, Math.min(1, point.x)), y: Math.max(0, Math.min(1, point.y)) };
}

function keyMovement(key: string, shift: boolean): Point | undefined {
  const step = shift ? .1 : .01;
  return ({ ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } } as Record<string, Point>)[key];
}

/** 배치용 버튼과 분리된 마커. 드래그는 기존 점만 바꾸며 다음 점을 새로 만들지 않는다. */
function PointMarker({ point, label, mark, className, mapRef, onMove, pinLabel, routeKind, pointIndex }: {
  point: Point; label: string; mark: string; className: string;
  mapRef: RefObject<HTMLDivElement>; onMove: (point: Point) => void;
  pinLabel?: string; routeKind?: "waypoint" | "bounce" | "path"; pointIndex?: number;
}) {
  const drag = useRef<{ id: number; before: Point; offset: Point; initial: Point; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  function update(event: ReactPointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    const rect = mapRef.current?.getBoundingClientRect();
    if (!current || current.id !== event.pointerId || !rect?.width || !rect.height) return;
    if (!current.moved && Math.hypot(event.clientX - current.initial.x, event.clientY - current.initial.y) < 3) return;
    current.moved = true;
    onMove(clampPoint({ x: (event.clientX - rect.left - current.offset.x) / rect.width, y: (event.clientY - rect.top - current.offset.y) / rect.height }));
  }
  function finish(button: HTMLButtonElement, cancel: boolean) {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    if (cancel && current.moved) onMove(current.before);
    setDragging(false);
    if (button.hasPointerCapture(current.id)) button.releasePointerCapture(current.id);
  }

  return <button type="button" className={`${s.pointButton} ${dragging ? s.draggingPoint : ""}`} style={position(point)}
    data-pin={pinLabel} data-route-point={routeKind} data-point-index={pointIndex}
    aria-label={`${label} 이동`} aria-describedby="preview-map-move" title={`${label} · 끌어서 이동`}
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary || drag.current) return;
      const rect = mapRef.current?.getBoundingClientRect();
      if (!rect?.width || !rect.height) return;
      event.preventDefault(); event.stopPropagation();
      event.currentTarget.focus({ preventScroll: true });
      drag.current = { id: event.pointerId, before: { ...point }, initial: { x: event.clientX, y: event.clientY },
        offset: { x: event.clientX - rect.left - point.x * rect.width, y: event.clientY - rect.top - point.y * rect.height }, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }}
    onPointerMove={event => { if (drag.current?.id === event.pointerId) { event.preventDefault(); update(event); } }}
    onPointerUp={event => {
      if (drag.current?.id !== event.pointerId) return;
      event.preventDefault(); event.stopPropagation(); update(event); finish(event.currentTarget, false);
    }}
    onPointerCancel={event => { if (drag.current?.id === event.pointerId) finish(event.currentTarget, true); }}
    onLostPointerCapture={event => { if (drag.current?.id === event.pointerId) finish(event.currentTarget, true); }}
    onClick={event => { event.preventDefault(); event.stopPropagation(); }}
    onBlur={event => finish(event.currentTarget, true)}
    onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finish(event.currentTarget, true); return; }
      if (drag.current) return;
      const delta = keyMovement(event.key, event.shiftKey);
      if (delta) { event.preventDefault(); event.stopPropagation(); onMove(clampPoint({ x: point.x + delta.x, y: point.y + delta.y })); }
      else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); }
    }}>
    <span aria-hidden="true" className={className}><span>{mark}</span></span>
  </button>;
}
