"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getAbilityAssetPath,
  getAgentAssetPath,
  getMapAssetPath,
  getMapSplashAssetPath,
  LINEUP_AGENT_OPTIONS,
  LINEUP_MAP_OPTIONS,
} from "../lib/asset-map";
import type { AbilitySlot, Lineup } from "../types/lineup";
import { groupLineupDestinations, getLineupRoute, isValidPoint, orientLineupPoint } from "../features/lineup-explorer/model";
import s from "./LineupSearchFilter.module.css";
import { LINEUP_HINTS, LINEUP_NOTICES, type LineupDataState } from "../features/strategy-explorer/status";

interface LineupSearchFilterProps {
  lineups: Lineup[];
  /** /lineups에서 전달하며, 로딩·예시를 공개 자료의 빈 결과와 구별할 때만 사용한다. */
  dataState?: LineupDataState;
}

const SKILL_FILTER_OPTIONS: Array<{ id: AbilitySlot; label: string; slot: AbilitySlot }> = [
  { id: "C", label: "C", slot: "C" },
  { id: "Q", label: "Q", slot: "Q" },
  { id: "E", label: "E", slot: "E" },
  { id: "X", label: "궁극기", slot: "X" },
];

export function LineupSearchFilter({ lineups, dataState = "api" }: LineupSearchFilterProps) {
  const [mapId, setMapId] = useState("all");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [abilitySlot, setAbilitySlot] = useState<AbilitySlot | "all">("all");
  const [side, setSide] = useState<"attack" | "defense">("attack");
  const [destinationKey, setDestinationKey] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const filteredLineups = useMemo(
    () => lineups.filter((lineup) => (
      (mapId === "all" || lineup.mapId === mapId)
      && (!agentId || lineup.agentId === agentId)
      && (abilitySlot === "all" || lineup.ability.slot === abilitySlot)
      && lineup.side === side
    )),
    [abilitySlot, agentId, lineups, mapId, side],
  );
  const selectedMapId = mapId === "all" ? LINEUP_MAP_OPTIONS[0].id : mapId;
  const selectedMapName = LINEUP_MAP_OPTIONS.find((map) => map.id === selectedMapId)?.name ?? selectedMapId;
  const mapLineups = agentId ? filteredLineups.filter((lineup) => lineup.mapId === selectedMapId) : [];
  // 명시적으로 공유한 도착점만 묶는다. 기존 API의 자료를 같은 스킬/좌표라는 이유로 합치지 않는다.
  const destinations = groupLineupDestinations(mapLineups);
  const destination = destinations.find((group) => group.key === destinationKey);
  const candidates = destination?.entries ?? [];
  const origins = candidates.filter((lineup) => isValidPoint(lineup.mapPreview?.agentPosition));
  const highlightedId = hoveredId ?? focusedId;
  const highlighted = candidates.find((lineup) => lineup.id === highlightedId);
  const visibleRoutes = highlighted ? [highlighted] : candidates;
  const unplaced = mapLineups.filter((lineup) => !isValidPoint(lineup.mapPreview?.skillPosition));
  const orientPoint = (point: { x: number; y: number }) => orientLineupPoint(point, side);
  const detailHref = (lineup: Lineup) => `/lineups/${encodeURIComponent(lineup.id)}`;
  const resultMessage = (() => {
    if (dataState === "loading") return `${LINEUP_NOTICES.loading.title}. ${LINEUP_NOTICES.loading.message}`;
    if (dataState === "api" && lineups.length === 0) return `${LINEUP_NOTICES.empty.title}. ${LINEUP_NOTICES.empty.message}`;
    if (filteredLineups.length === 0) return dataState === "fallback" ? LINEUP_HINTS.noExamples : LINEUP_HINTS.noResults;
    if (!agentId) return LINEUP_HINTS.chooseAgent;
    if (destinations.length === 0) return LINEUP_HINTS.noPosition;
    if (!destination) return "도착점을 선택하면 그곳을 향하는 출발점과 경로를 볼 수 있어요.";
    if (origins.length === 0) return "출발 위치가 아직 없어요. 아래 공략 목록에서 상세 자료를 확인해 보세요.";
    return "출발점에 커서를 올리면 해당 경로만 보여요. 출발점이나 아래 공략을 누르면 상세 자료로 이동해요.";
  })();

  function resetSelection() {
    setDestinationKey(null);
    setHoveredId(null);
    setFocusedId(null);
  }

  function selectDestination(key: string) {
    setDestinationKey((current) => current === key ? null : key);
    setHoveredId(null);
    setFocusedId(null);
  }

  function guideLink(lineup: Lineup, index: number) {
    return <Link
      className={`${s.guide} ${highlighted?.id === lineup.id ? s.highlighted : ""}`}
      href={detailHref(lineup)} key={lineup.id} prefetch={false}
      onMouseEnter={() => setHoveredId(lineup.id)} onMouseLeave={() => setHoveredId(null)}
      onFocus={() => { setHoveredId(null); setFocusedId(lineup.id); }} onBlur={() => setFocusedId(null)}
    >
      <span className={s.guideNumber}>{index + 1}</span>
      <span><strong>{lineup.title}</strong><small>{lineup.agentName} · {lineup.ability.displayName}{!isValidPoint(lineup.mapPreview?.agentPosition) ? " · 출발 위치 미등록" : getLineupRoute(lineup).length < 2 ? " · 경로 미등록" : ""}</small></span>
      <span className={s.openLabel}>자료 보기 <span aria-hidden="true">→</span></span>
    </Link>;
  }

  function selectMap(nextMapId: string) {
    setMapId(nextMapId);
    setAgentId(null);
    setAbilitySlot("all");
    resetSelection();
    setMapPickerOpen(false);
  }

  function changeSide(nextSide: "attack" | "defense") {
    setSide(nextSide);
    resetSelection();
  }

  return (
    <div className={`lineup-search strats-layout ${s.root}`}>
      <aside className={`lineup-filter-panel strats-filter-panel ${mapId === "all" ? "strats-filter-panel-map-index" : ""}`} aria-label="라인업 검색 필터">
        <div className="lineup-filter-heading">
          <div className="strats-selected-map-control">
            <span>Lineup database</span>
            <button
              aria-controls="lineup-map-choice-list"
              aria-expanded={mapPickerOpen}
              aria-label={`${selectedMapName} 맵 변경`}
              className="strats-selected-map"
              onClick={() => setMapPickerOpen((open) => !open)}
              type="button"
            >
              <Image alt={`${selectedMapName} 맵 아트`} height={34} src={getMapSplashAssetPath(selectedMapId)} width={54} />
              <span>{selectedMapName}</span>
              <small>{mapPickerOpen ? "닫기" : "맵 변경"}</small>
            </button>
          </div>
        </div>

        {mapPickerOpen ? <div aria-label="다른 맵 선택" className="strats-map-choices" id="lineup-map-choice-list">
          {LINEUP_MAP_OPTIONS.map((map) => <button aria-label={`${map.name} 맵 선택`} className={`strats-map-choice ${selectedMapId === map.id ? "is-selected" : ""}`} key={map.id} onClick={() => selectMap(map.id)} type="button">
            <Image alt="" height={30} loading="eager" src={getMapSplashAssetPath(map.id)} width={42} />
            <small>{map.name}</small>
          </button>)}
        </div> : null}

        <div className="strats-filter-stack">
          {mapId !== "all" ? <div className="strats-choice-section"><span className="strats-choice-label">요원 선택</span><div className="strats-agent-choices">
            {LINEUP_AGENT_OPTIONS.map((agent) => (
              <button aria-label={agent.name} className={`strats-agent-choice ${agentId === agent.id ? "is-selected" : ""}`} key={agent.id} onClick={() => { setAgentId(agent.id); setAbilitySlot("all"); resetSelection(); }} type="button"><Image alt="" height={30} loading="eager" src={getAgentAssetPath(agent.id)} unoptimized width={30} /></button>
            ))}
          </div></div> : null}
          {mapId !== "all" && agentId ? <div className="strats-choice-section"><span className="strats-choice-label">스킬 종류</span><div className="strats-skill-choices">
            {SKILL_FILTER_OPTIONS.map((skill) => {
              return <button aria-label={skill.label} className={`strats-skill-choice ${abilitySlot === skill.id ? "is-selected" : ""}`} key={skill.id} onClick={() => { setAbilitySlot(skill.id); resetSelection(); }} type="button"><Image alt={`${agentId} ${skill.label} 스킬`} height={24} src={getAbilityAssetPath(agentId, skill.slot)} width={24} /><small>{skill.label}</small></button>;
            })}
          </div></div> : null}
        </div>
      </aside>

      {mapId === "all" ? <section className="strats-map-column strats-map-picker" aria-label="맵 선택">
        <div className="strats-map-picker-heading"><span>Lineups</span><h2>MAPS</h2><p>라인업을 확인할 맵을 선택하세요.</p></div>
        <div className="strats-map-card-grid">
          {LINEUP_MAP_OPTIONS.map((map) => <button aria-label={map.name} className="strats-map-card" key={map.id} onClick={() => selectMap(map.id)} type="button">
            <Image alt="" fill sizes="(max-width: 700px) 50vw, 30vw" src={getMapSplashAssetPath(map.id)} />
            <span>{map.name}</span>
          </button>)}
        </div>
      </section> : <section className="strats-map-column" aria-label="라인업 맵 탐색">
        <div className="strats-map-toolbar">
          <div><span>Map explorer</span><h2>{selectedMapName}</h2></div>
          <div className="strats-side-toggle" role="group" aria-label="공수 전환"><button className={side === "attack" ? "is-selected" : ""} onClick={() => changeSide("attack")} type="button">공격</button><button className={side === "defense" ? "is-selected" : ""} onClick={() => changeSide("defense")} type="button">수비</button></div>
        </div>
        <div className="strats-result-notice" role="status" aria-label="라인업 탐색 안내" aria-atomic="true">{resultMessage}</div>
        {destinations.length > 0 ? <div className={s.destinations} aria-label="도착점 선택">
          <span className={s.label}>도착점</span>
          {destinations.map((group) => <button key={group.key} type="button"
            aria-pressed={destinationKey === group.key} onClick={() => selectDestination(group.key)}>
            {group.name} <small>{group.entries.length}개</small>
          </button>)}
        </div> : null}
        <div className={`strats-map-stage strats-map-stage-${side} ${s.mapStage}`}>
          <div className={s.mapCanvas}>
            <Image alt={`${selectedMapId} 맵`} className={`strats-map-image-rotated strats-map-image-${side}`} fill priority sizes="(max-width: 700px) 100vw, 640px" src={getMapAssetPath(selectedMapId)} />
            <svg className={s.routes} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {visibleRoutes.map((lineup) => {
                const route = getLineupRoute(lineup);
                return route.length > 1 ? <polyline key={lineup.id} data-lineup-id={lineup.id}
                  className={highlighted ? s.routeActive : undefined}
                  points={route.map((point) => { const oriented = orientPoint(point); return `${oriented.x * 100},${oriented.y * 100}`; }).join(" ")} /> : null;
              })}
            </svg>
            {origins.map((lineup) => {
              const position = orientPoint(lineup.mapPreview!.agentPosition!);
              return <Link aria-label={`${lineup.title} 상세 자료 보기`} prefetch={false}
                className={`strats-map-pin strats-agent-pin ${s.origin} ${highlighted && highlighted.id !== lineup.id ? s.dimmed : ""}`}
                key={lineup.id} href={detailHref(lineup)}
                onMouseEnter={() => setHoveredId(lineup.id)} onMouseLeave={() => setHoveredId(null)}
                onFocus={() => { setHoveredId(null); setFocusedId(lineup.id); }} onBlur={() => setFocusedId(null)}
                style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}>
                <Image alt="" height={34} src={getAgentAssetPath(lineup.agentId)} width={34} />
                <span className={s.badge}>{candidates.indexOf(lineup) + 1}</span>
              </Link>;
            })}
            {destinations.map((group) => {
              const lineup = group.entries[0];
              const position = orientPoint(group.point);
              return <button key={group.key}
                aria-label={`${group.name} · 공략 ${group.entries.length}개`}
                aria-pressed={destinationKey === group.key}
                className={`strats-map-pin strats-skill-pin ${s.destination}`}
                onClick={() => selectDestination(group.key)}
                style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }} type="button">
                <Image alt="" height={34} src={getAbilityAssetPath(lineup.agentId, lineup.ability.slot)} width={34} />
                <span className={s.badge}>{group.entries.length}</span>
              </button>;
            })}
          </div>
        </div>
        <div className="strats-map-legend"><span><i className="strats-legend-start" /> 출발 위치</span><span><i className="strats-legend-end" /> 도착 위치</span><span><i className="strats-legend-path" /> 투사 경로</span></div>
        {destination ? <section className={s.guides} aria-label="선택한 도착점의 공략">
          <div className={s.guideHeading}><h3>{destination.name}</h3><span>공략 {candidates.length}개</span></div>
          <p>번호는 지도 위 출발점과 같아요. 원하는 공략을 선택하세요.</p>
          {candidates.map(guideLink)}
        </section> : null}
        {unplaced.length > 0 ? <section className={s.guides} aria-label="지도 위치 없는 공략">
          <div className={s.guideHeading}><h3>지도 위치 미등록</h3><span>공략 {unplaced.length}개</span></div>
          <p>지도 위치가 없어도 등록된 상세 자료는 확인할 수 있어요.</p>
          {unplaced.map(guideLink)}
        </section> : null}
      </section>}

    </div>
  );
}
