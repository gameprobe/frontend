"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildLineupRoute, orientLineupPoint } from "../features/lineup-explorer/model";
import { getMediaPresentation, type MediaPresentation } from "../features/lineup-explorer/media";
import { ContentPageShell } from "../features/stats-shell/ContentPageShell";
import { previewLineups } from "../features/lineup-explorer/preview-data";
import { getAbilityAssetPath, getAgentAssetPath, getMapAssetPath } from "../lib/asset-map";
import {
  fetchLineup,
  getAbilityLabel,
  getLineupApiErrorMessage,
  normalizeMockLineup,
} from "../lib/lineup-api";
import type { LineupDetailModel, LineupDifficulty } from "../types/lineup";
import s from "./LineupDetail.module.css";

const difficultyLabel: Record<LineupDifficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

const sideLabel = { attack: "공격", defense: "수비" } as const;

function MediaViewer({ media }: { media: MediaPresentation }) {
  const [failed, setFailed] = useState(false);
  return <div className={s.mediaContent}>
    {!failed && media.kind === "youtube" && <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen className="lineup-video-frame" src={media.embedUrl}
      title="라인업 YouTube 영상" referrerPolicy="strict-origin-when-cross-origin" />}
    {!failed && media.kind === "image" && <>
      {/* 등록 이미지 주소는 동적이므로 원본을 브라우저에서 표시한다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.mediaImage} src={media.url} alt="라인업 위치와 사용 방법 안내 이미지"
        loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    </>}
    {!failed && media.kind === "video" && <video className={s.mediaVideo} src={media.url}
      controls preload="metadata" onError={() => setFailed(true)} aria-label="라인업 영상 가이드" />}
    {(failed || media.kind === "link") && <p className="lineup-video-empty">{failed
      ? "자료를 불러오지 못했습니다. 원본 주소에서 확인해 주세요."
      : "이 영상은 원본 사이트에서 확인할 수 있습니다."}</p>}
    <a className={s.mediaLink} href={media.url} target="_blank" rel="noopener noreferrer">원본 자료 새 탭에서 보기 ↗</a>
  </div>;
}

function markerPosition(point: { x: number; y: number }) {
  return { left: `${point.x * 100}%`, top: `${point.y * 100}%` };
}

/** 독립 라인업 상세의 세 상태를 같은 공통 셸에 표시하고 지도·영상 상태는 이 화면에서 관리한다. */
export function LineupDetail({ lineupId }: { lineupId: string }) {
  const [lineup, setLineup] = useState<LineupDetailModel | null>(null);
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    setLineup(null);
    setSelectedSkill(0);
    fetchLineup(lineupId)
      .catch((reason: unknown) => {
        const mock = previewLineups.find((item) => item.id === lineupId);
        // 예시 ID만 대체하고, 실제 자료의 조회 실패 원인은 그대로 전달한다.
        if (!mock) throw reason;
        return normalizeMockLineup(mock);
      })
      .then((result) => {
        if (active) setLineup(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(getLineupApiErrorMessage(reason));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [lineupId]);

  const selectedMedia = useMemo(() => {
    if (!lineup) return null;
    if (lineup.registration) {
      return getMediaPresentation(lineup.registration.media.type, lineup.registration.media.url);
    }
    // 여러 스킬 중 자료가 없는 스킬에 다른 스킬의 영상을 대신 보여주지 않는다.
    if (lineup.skillMarkers.length > 0) {
      return getMediaPresentation("VIDEO", lineup.skillMarkers[selectedSkill]?.youtubeUrl);
    }
    return getMediaPresentation("VIDEO", lineup.youtubeUrl);
  }, [lineup, selectedSkill]);

  const route = useMemo(() => {
    if (!lineup) return [];
    // 여러 마커가 있는 구형 자료는 어느 출발점의 경로인지 임의로 연결하지 않는다.
    if (lineup.agentMarkers.length !== 1 || lineup.skillMarkers.length !== 1) return lineup.pathPoints;
    return buildLineupRoute(lineup.agentMarkers[0].position, lineup.skillMarkers[0].position, lineup.pathPoints);
  }, [lineup]);

  if (isLoading) return (
    <ContentPageShell current="lineups" className={s.root}>
      <section className="lineup-detail-state" role="status" aria-live="polite">
        <p className="eyebrow">라인업 가이드</p>
        <h1>라인업을 불러오는 중입니다…</h1>
        <p>잠시만 기다려 주세요.</p>
      </section>
    </ContentPageShell>
  );
  if (error || !lineup) return (
    <ContentPageShell current="lineups" className={s.root}>
      <section className="lineup-detail-state lineup-detail-state-error" role="alert">
        <p className="eyebrow">라인업 가이드</p>
        <h1>라인업을 불러오지 못했습니다.</h1>
        <p>{error ?? "데이터가 없습니다."}</p>
        <Link href="/lineups">라인업 목록으로 돌아가기</Link>
      </section>
    </ContentPageShell>
  );

  // 저장 좌표는 원본 기준으로 유지하고, 목록과 같은 진영 방향으로 화면만 변환한다.
  const displayPoint = (point: { x: number; y: number }) => orientLineupPoint(point, lineup.side);
  // 구형 다중 스킬 자료는 슬롯을 추정하지 않고 기존 번호 선택을 유지한다.
  const abilityIcon = lineup.registration && lineup.skillMarkers.length === 1
    ? getAbilityAssetPath(lineup.agentId, lineup.registration.abilitySlot) : null;
  let emptyMediaMessage = "이 공략에는 표시할 수 있는 자료가 없습니다.";
  if (lineup.isExample) {
    emptyMediaMessage = "이 예시에는 실제 영상이 연결되어 있지 않습니다.";
  } else if (!lineup.registration && lineup.skillMarkers.length > 0) {
    emptyMediaMessage = "선택한 스킬에는 등록된 영상이 없습니다.";
  }

  return (
    <ContentPageShell current="lineups" className={s.root}>
      <div className={s.content}>
        <header className="lineup-detail-header">
          <div>
            <Link className="lineup-back-link" href="/lineups">← 라인업 목록</Link>
            <p className="eyebrow">라인업 가이드</p>
            <h1>{lineup.title}</h1>
            <p>{lineup.description}</p>
            {lineup.isExample ? <p role="note">탐색 체험용 예시입니다. 위치와 경로는 합성이며 실제 플레이용으로 검증된 공략이 아닙니다.</p> : null}
          </div>
          <div className="lineup-detail-meta">
            <span>{lineup.mapName}</span>
            <span>{sideLabel[lineup.side]}</span>
            <span className={`lineup-difficulty lineup-difficulty-${lineup.difficulty}`}>
              {difficultyLabel[lineup.difficulty]}
            </span>
          </div>
        </header>

        <div className="lineup-detail-layout">
          <section className="lineup-map-panel" aria-label="라인업 인터랙티브 맵">
            <div className="lineup-map-stage">
              <div className="lineup-map-canvas">
                <Image alt={`${lineup.mapName} 맵`} className={`strats-map-image-rotated strats-map-image-${lineup.side}`} fill priority sizes="(max-width: 700px) 100vw, 640px" src={getMapAssetPath(lineup.mapId)} />
                <svg className="lineup-path-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {route.length > 1 ? (
                    <polyline points={route.map(displayPoint).map((point) => `${point.x * 100},${point.y * 100}`).join(" ")} />
                  ) : null}
                </svg>
                {lineup.agentMarkers.map((marker, index) => (
                  <div
                    className="lineup-agent-marker"
                    key={`agent-${index}`}
                    style={markerPosition(displayPoint(marker.position))}
                    title={`${lineup.agentName} · 출발 위치 ${index + 1}`}
                  >
                    <Image alt={`${lineup.agentName} 요원`} height={34} src={getAgentAssetPath(lineup.agentId)} width={34} />
                    <span className={s.markerBadge}>{index + 1}</span>
                  </div>
                ))}
                {lineup.skillMarkers.map((marker, index) => (
                  <button
                    aria-label={`${lineup.skillMarkers.length > 1 ? `스킬 ${index + 1} · ` : ""}${getAbilityLabel(marker.abilityId)} 자료 보기`}
                    aria-pressed={selectedSkill === index}
                    aria-controls="lineup-media-panel"
                    className={`lineup-skill-marker ${selectedSkill === index ? "is-selected" : ""}`}
                    key={`${marker.abilityId}-${index}`}
                    onClick={() => setSelectedSkill(index)}
                    style={markerPosition(displayPoint(marker.position))}
                    title={`${getAbilityLabel(marker.abilityId)} · 도착 위치 ${index + 1}`}
                    type="button"
                  >
                    {abilityIcon
                      ? <><Image alt="" height={34} src={abilityIcon} width={34} /><span className={s.markerBadge}>{index + 1}</span></>
                      : <span className={s.markerNumber}>{index + 1}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="lineup-map-legend">
              <span><i className="legend-agent" /> 요원 위치</span>
              <span><i className="legend-skill" /> 스킬 도착 위치</span>
              <span><i className="legend-path" /> 투사 경로</span>
              {lineup.skillMarkers[selectedSkill] ? (
                <span className="lineup-selected-ability" aria-live="polite">
                  선택한 스킬 {selectedSkill + 1} · {getAbilityLabel(lineup.skillMarkers[selectedSkill].abilityId)}
                </span>
              ) : null}
            </div>

          </section>

          <aside className="lineup-detail-sidebar">
            {lineup.skillMarkers.length > 1 && (
              <section className={s.skillSelection} aria-label="스킬 자료 선택">
                <h2>스킬 자료 선택</h2>
                <p>번호는 지도 위 스킬과 같아요. 마커가 겹치면 아래에서 선택하세요.</p>
                <div className={s.skillChoices}>
                  {lineup.skillMarkers.map((marker, index) => {
                    const media = lineup.registration
                      ? getMediaPresentation(lineup.registration.media.type, lineup.registration.media.url)
                      : getMediaPresentation("VIDEO", marker.youtubeUrl);
                    return <button
                      className={s.skillChoice}
                      key={`${marker.abilityId}-${index}`}
                      type="button"
                      aria-label={`스킬 ${index + 1} · ${getAbilityLabel(marker.abilityId)} 자료 보기`}
                      aria-pressed={selectedSkill === index}
                      aria-controls="lineup-media-panel"
                      aria-describedby={!media ? `lineup-skill-${index}-no-media` : undefined}
                      onClick={() => setSelectedSkill(index)}
                    >
                      <span className={s.skillChoiceNumber} aria-hidden="true">{index + 1}</span>
                      <span className={s.skillChoiceName}>
                        {getAbilityLabel(marker.abilityId)}
                        {!media && <span className={s.missingMedia} id={`lineup-skill-${index}-no-media`}>자료 없음</span>}
                      </span>
                      {selectedSkill === index && <span className={s.skillChoiceSelected}>선택됨</span>}
                    </button>;
                  })}
                </div>
              </section>
            )}
            <section className="lineup-video-panel" id="lineup-media-panel">
              <div className={`lineup-panel-heading ${lineup.skillMarkers.length > 1 ? s.mediaHeading : ""}`}>
                <span>선택한 라인업</span>
                <h2>{lineup.skillMarkers.length > 1
                  ? `스킬 ${selectedSkill + 1} · ${getAbilityLabel(lineup.skillMarkers[selectedSkill].abilityId)}`
                  : "자료 가이드"}</h2>
              </div>
              {selectedMedia ? <MediaViewer key={selectedMedia.url} media={selectedMedia} /> : (
                <div className="lineup-video-empty">{emptyMediaMessage}</div>
              )}
            </section>

            <section className="lineup-guide-panel">
              <div className="lineup-panel-heading"><span>요원 배치</span><h2>{lineup.agentName}</h2></div>
              <p>맵 위 요원 아이콘은 출발 위치, 스킬 아이콘은 도착 위치입니다. 선은 등록한 중간 지점을 순서대로 연결합니다. 실제 사용 방법은 자료를 확인해 주세요.</p>
              {lineup.registration && <dl className={s.registrationMeta}>
                <div><dt>도착점</dt><dd>{lineup.registration.destination.name}</dd></div>
                <div><dt>구역</dt><dd>{lineup.registration.site}</dd></div>
                <div><dt>스킬 슬롯</dt><dd>{lineup.registration.abilitySlot}</dd></div>
              </dl>}
            </section>
          </aside>
        </div>
      </div>
    </ContentPageShell>
  );
}
