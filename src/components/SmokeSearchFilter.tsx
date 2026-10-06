"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  getAgentAssetPath,
  getAbilityAssetPath,
  getMapAssetPath,
  getMapSplashAssetPath,
  LINEUP_MAP_OPTIONS,
} from "../lib/asset-map";
import { SMOKE_AGENT_STATS, SMOKE_GUIDES, SMOKE_TYPE_OPTIONS } from "../lib/smoke-data";
import type { SmokeGuide, SmokeSide, SmokeVariant } from "../types/smoke";
import { SMOKE_HINTS } from "../features/strategy-explorer/status";

function orientPoint(point: { x: number; y: number }, side: SmokeSide) {
  return side === "attack"
    ? { x: 1 - point.y, y: point.x }
    : { x: point.y, y: 1 - point.x };
}

export function SmokeSearchFilter() {
  const [mapId, setMapId] = useState<string | null>(null);
  const [side, setSide] = useState<SmokeSide>("attack");
  const [site, setSite] = useState("all");
  const [smokeType, setSmokeType] = useState<SmokeVariant>("common-circle");
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  const filteredGuides = useMemo(() => SMOKE_GUIDES.filter((guide) => (
    guide.mapId === mapId
      && guide.side === side
      && (site === "all" || guide.site === site)
      && guide.variant === smokeType
  )), [mapId, side, site, smokeType]);
  const selectedGuide = filteredGuides.find((guide) => guide.id === selectedGuideId) ?? null;
  const selectedMap = LINEUP_MAP_OPTIONS.find((map) => map.id === mapId);

  function selectMap(nextMapId: string) {
    setMapId(nextMapId);
    setSite("all");
    setSmokeType("common-circle");
    setSelectedGuideId(null);
    setMapPickerOpen(false);
  }

  function changeSide(nextSide: SmokeSide) {
    setSide(nextSide);
    setSelectedGuideId(null);
  }

  function selectGuide(guide: SmokeGuide) {
    setSelectedGuideId(guide.id);
  }

  if (!mapId || !selectedMap) {
    return (
      <section className="strats-map-column strats-map-picker" aria-label="스모크 맵 선택">
        <div className="strats-map-picker-heading">
          <span>Smoke library</span>
          <h2>MAPS</h2>
          <p>연막 가이드를 확인할 맵을 선택하세요.</p>
        </div>
        <div className="strats-map-card-grid">
          {LINEUP_MAP_OPTIONS.map((map) => (
            <button aria-label={`${map.name} 스모크 보기`} className="strats-map-card" key={map.id} onClick={() => selectMap(map.id)} type="button">
              <Image alt="" fill sizes="(max-width: 700px) 50vw, 30vw" src={getMapSplashAssetPath(map.id)} />
              <span>{map.name}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="lineup-search strats-layout smoke-explorer">
      <aside className="lineup-filter-panel strats-filter-panel smoke-filter-panel" aria-label="스모크 검색 필터">
        <div className="lineup-filter-heading">
          <div className="strats-selected-map-control">
            <span>Smoke database</span>
            <button
              aria-controls="smoke-map-choice-list"
              aria-expanded={mapPickerOpen}
              aria-label={`${selectedMap.name} 맵 변경`}
              className="strats-selected-map"
              onClick={() => setMapPickerOpen((open) => !open)}
              type="button"
            >
              <Image alt={`${selectedMap.name} 맵 아트`} height={34} src={getMapSplashAssetPath(selectedMap.id)} width={54} />
              <span>{selectedMap.name}</span>
              <small>{mapPickerOpen ? "닫기" : "맵 변경"}</small>
            </button>
          </div>
        </div>

        {mapPickerOpen ? <div aria-label="다른 맵 선택" className="strats-map-choices" id="smoke-map-choice-list">
          {LINEUP_MAP_OPTIONS.map((map) => <button aria-label={`${map.name} 맵 선택`} className={`strats-map-choice ${selectedMap.id === map.id ? "is-selected" : ""}`} key={map.id} onClick={() => selectMap(map.id)} type="button">
            <Image alt="" height={30} loading="eager" src={getMapSplashAssetPath(map.id)} width={42} />
            <small>{map.name}</small>
          </button>)}
        </div> : null}

        <div className="strats-filter-stack">
          <div className="strats-choice-section">
            <span className="strats-choice-label">진영</span>
            <div className="strats-side-toggle smoke-side-toggle" role="group" aria-label="공수 전환">
              <button className={side === "attack" ? "is-selected" : ""} onClick={() => changeSide("attack")} type="button">공격</button>
              <button className={side === "defense" ? "is-selected" : ""} onClick={() => changeSide("defense")} type="button">수비</button>
            </div>
          </div>

          <div className="smoke-agent-table-section">
            <div className="smoke-comparison-heading">
              <span className="strats-choice-label">요원별 연막 비교</span>
              <small>예시 · 검증 전</small>
            </div>
            <div className="smoke-agent-table" role="table" aria-label="요원별 연막 크기와 지속시간 비교">
              <div className="smoke-agent-table-row smoke-agent-table-header" role="row">
                <span role="columnheader">요원</span><span role="columnheader">크기</span><span role="columnheader">지속</span>
              </div>
              {SMOKE_AGENT_STATS.map((agent) => (
                <div className="smoke-agent-table-row" key={agent.id} role="row">
                  <span className="smoke-agent-table-agent" role="cell"><Image alt="" height={22} src={getAgentAssetPath(agent.id)} width={22} />{agent.name}</span>
                  <span role="cell">{agent.sizeLabel}</span>
                  <span role="cell">{agent.durationLabel}</span>
                </div>
              ))}
            </div>
            <p className="smoke-table-note">Viper 전용 연막 라인업은 라인업 페이지에서 확인하고, Smoke에서는 나머지 공통 연막과 Harbor 일자 연막을 안내합니다.</p>
          </div>

          <div className="strats-choice-section">
            <span className="strats-choice-label">사이트</span>
            <div className="smoke-pill-grid">
              {[
                ["all", "전체"],
                ["A", "A"],
                ["B", "B"],
                ["C", "C"],
                ["Mid", "Mid"],
              ].map(([id, label]) => (
                <button className={site === id ? "is-selected" : ""} key={id} onClick={() => { setSite(id); setSelectedGuideId(null); }} type="button">{label}</button>
              ))}
            </div>
          </div>

          <div className="strats-choice-section">
            <span className="strats-choice-label">연막 유형</span>
            <div className="smoke-pill-grid smoke-type-grid">
              {SMOKE_TYPE_OPTIONS.map((option) => (
              <button className={smokeType === option.id ? "is-selected" : ""} key={option.id} onClick={() => { setSmokeType(option.id); setSelectedGuideId(null); }} type="button">{option.label}</button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="strats-map-column smoke-map-column" aria-label="스모크 전술 지도">
        <div className="strats-map-toolbar">
          <div><span>Smoke explorer</span><h2>{selectedMap.name}</h2></div>
          <strong>{filteredGuides.length}개 가이드 · {side === "attack" ? "공격" : "수비"}</strong>
        </div>
        <div className={`strats-map-stage strats-map-stage-${side} smoke-map-stage`}>
          <Image alt={`${selectedMap.name} 맵`} className={`strats-map-image-rotated strats-map-image-${side}`} fill priority sizes="(max-width: 900px) 100vw, 60vw" src={getMapAssetPath(selectedMap.id)} />
          {selectedGuide ? (
            <svg className="strats-path-overlay smoke-path-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={selectedGuide.pathPoints.map((point) => { const oriented = orientPoint(point, side); return `${oriented.x * 100},${oriented.y * 100}`; }).join(" ")} />
              {selectedGuide.wallEndPosition ? <line className="smoke-wall-line" x1={orientPoint(selectedGuide.targetPosition, side).x * 100} x2={orientPoint(selectedGuide.wallEndPosition, side).x * 100} y1={orientPoint(selectedGuide.targetPosition, side).y * 100} y2={orientPoint(selectedGuide.wallEndPosition, side).y * 100} /> : null}
            </svg>
          ) : null}
          {filteredGuides.map((guide) => {
            const position = orientPoint(guide.targetPosition, side);
            return (
              <button aria-label={`${guide.title} 선택`} className={`strats-map-pin ${guide.shape === "wall" ? "smoke-wall-pin" : "smoke-common-pin"} ${selectedGuide?.id === guide.id ? "is-active" : ""}`} key={guide.id} onClick={() => selectGuide(guide)} style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }} type="button">
                {guide.agentId && guide.abilitySlot ? <Image alt={`${guide.agentName} 연막`} height={30} src={getAbilityAssetPath(guide.agentId, guide.abilitySlot)} width={30} /> : <span aria-hidden="true">●</span>}
              </button>
            );
          })}
          {selectedGuide ? (() => {
            const position = orientPoint(selectedGuide.throwerPosition, side);
            return <button aria-label={`${selectedGuide.title} 시작 위치`} className="strats-map-pin smoke-thrower-pin" onClick={() => selectGuide(selectedGuide)} style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }} type="button">{selectedGuide.agentId ? <Image alt={`${selectedGuide.agentName} 시작 위치`} height={30} src={getAgentAssetPath(selectedGuide.agentId)} width={30} /> : <span aria-hidden="true">●</span>}</button>;
          })() : null}
          {!filteredGuides.length ? <div className="strats-map-empty" role="status" aria-label="스모크 탐색 안내" aria-atomic="true"><div><strong>{SMOKE_HINTS.emptyTitle}</strong><p>{SMOKE_HINTS.emptyMessage}</p></div></div> : null}
        </div>
        <div className="strats-map-legend smoke-map-legend"><span><i className="smoke-legend-target" /> 연막 도착 위치</span><span><i className="strats-legend-start" /> 투척 위치</span><span><i className="strats-legend-path" /> 투사 경로</span></div>

        <div className="smoke-guide-list" aria-label="스모크 가이드 목록">
          <div className="smoke-guide-list-heading"><span>연막 예시 목록</span><strong>{filteredGuides.length}개</strong></div>
          {filteredGuides.map((guide) => (
            <button className={`smoke-guide-card ${selectedGuide?.id === guide.id ? "is-selected" : ""}`} key={guide.id} onClick={() => selectGuide(guide)} type="button">
              {guide.agentId ? <Image alt="" height={34} src={getAgentAssetPath(guide.agentId)} width={34} /> : <span className="smoke-common-card-icon">●</span>}
              <span><strong>{guide.title}</strong><small>{guide.agentName} · {guide.shape === "wall" ? "일자 연막" : "공통 원형"}</small></span>
              {/* 패치 검증 고지와 원본 값은 유지하고 Preview 표시만 한국어로 읽는다. */}
              <em>{guide.patchLabel.replace(/^Preview\b/, "예시")}</em>
            </button>
          ))}
        </div>

        {selectedGuide ? <article className="smoke-guide-detail"><div><span>{selectedGuide.site} site · {selectedGuide.agentName}</span><h3>{selectedGuide.title}</h3></div><div className="smoke-detail-stats"><span>형태<strong>{selectedGuide.shape === "wall" ? "일자" : "원형"}</strong></span><span>크기<strong>{selectedGuide.sizeLabel}</strong></span><span>지속<strong>{selectedGuide.durationLabel}</strong></span></div><p>{selectedGuide.description}</p><ol>{selectedGuide.steps.map((step) => <li key={step}>{step}</li>)}</ol></article> : filteredGuides.length > 0 ? <div className="smoke-selection-hint" role="status" aria-label="스모크 선택 안내">{SMOKE_HINTS.select}</div> : null}
      </section>
    </div>
  );
}
