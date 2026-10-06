'use client';

import { useState } from "react";
import Image from "next/image";
import {
  getMapAssetPath,
  getTierAssetPath,
  getWeaponAssetPath,
} from "../lib/asset-map";
import type { Player, ProfileOverview, ProfileSidebarStats } from "../types";

interface ProfileSidebarProps {
  player: Player;
  overview: ProfileOverview | null;
  stats: ProfileSidebarStats | null;
}

function PanelHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="side-panel-header">
      <div>
        <h2>{title}</h2>
        {caption ? <span>{caption}</span> : null}
      </div>
    </div>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <section className="side-panel">
      <PanelHeader title={title} />
      <p className="sidebar-empty">—</p>
    </section>
  );
}

function WinRateMeter({ value }: { value: number }) {
  return (
    <span className="sidebar-meter" aria-label={`승률 ${value}%`}>
      <span style={{ width: `${value}%` }} />
    </span>
  );
}

function formatRecord(wins: number, losses: number): string {
  return `${wins}승 ${losses}패`;
}

export function ProfileSidebar({ player: _player, overview, stats }: ProfileSidebarProps) {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllTeammates, setShowAllTeammates] = useState(false);
  const peak = overview?.careerPeakRank;
  const previousSeasons = overview?.previousSeasonRanks ?? [];
  const maxActivityMatches = stats
    ? Math.max(...stats.activityByTimeSlot.map((slot) => slot.matchesPlayed), 1)
    : 1;

  return (
    <aside className="profile-sidebar" aria-label="보조 통계">
      {stats ? (
        <>
          {/* 1. 정확도 분포 */}
          <section className="side-panel">
            <PanelHeader title="정확도 분포" caption="전체 적중 위치" />
            <div className="accuracy-stack" aria-label="전체 정확도 분포">
              <span className="accuracy-stack-head" style={{ width: `${stats.accuracy.head}%` }} />
              <span className="accuracy-stack-body" style={{ width: `${stats.accuracy.body}%` }} />
              <span className="accuracy-stack-legs" style={{ width: `${stats.accuracy.legs}%` }} />
            </div>
            <div className="accuracy-list">
              <div>
                <span>Head</span>
                <strong>{stats.accuracy.head}%</strong>
              </div>
              <div>
                <span>Body</span>
                <strong>{stats.accuracy.body}%</strong>
              </div>
              <div>
                <span>Legs</span>
                <strong>{stats.accuracy.legs}%</strong>
              </div>
            </div>
          </section>

          {/* 2. 역할별 승률 */}
          <section className="side-panel">
            <PanelHeader title="역할별 승률" caption="아이콘 없이 라벨 기준" />
            <div className="sidebar-stat-list">
              {stats.roleWinRates.map((role) => (
                <div className="sidebar-stat-row" key={role.role}>
                  <div>
                    <strong>{role.role}</strong>
                    <WinRateMeter value={role.winRate} />
                  </div>
                  <span>
                    {formatRecord(role.wins, role.losses)} · {role.matchesPlayed}경기
                  </span>
                  <em>{role.winRate}%</em>
                </div>
              ))}
            </div>
          </section>

          {/* 3. 주 무기 */}
          <section className="side-panel">
            <PanelHeader title="주 무기" caption="무기별 분포 없음" />
            <div className="sidebar-media-list">
              {stats.topWeapons.map((weapon) => (
                <article key={weapon.weaponId}>
                  <Image
                    alt={`${weapon.displayName} 무기 이미지`}
                    height="28"
                    src={getWeaponAssetPath(weapon.weaponId)}
                    width="48"
                  />
                  <div>
                    <strong>{weapon.displayName}</strong>
                    <span>
                      {weapon.kills}킬
                    </span>
                  </div>
                  <em>HS {weapon.headshotPercentage}%</em>
                </article>
              ))}
            </div>
          </section>

          {/* 4. 맵별 승률 */}
          <section className="side-panel">
            <PanelHeader title="맵별 승률" caption="게임수 · 승률" />
            <div className="sidebar-media-list">
              {stats.mapWinRates.map((map) => (
                <article key={map.mapId}>
                  <Image
                    alt={`${map.displayName} 맵 이미지`}
                    height="34"
                    src={getMapAssetPath(map.mapId)}
                    width="52"
                  />
                  <div>
                    <strong>{map.displayName}</strong>
                    <span>
                      {formatRecord(map.wins, map.losses)} · {map.matchesPlayed}경기
                    </span>
                  </div>
                  <em>{map.winRate}%</em>
                </article>
              ))}
            </div>
          </section>

          {/* 5. 전체 시즌 최고 기록 (압축됨) */}
          <section className="side-panel side-panel-peak">
            <PanelHeader title="전체 시즌 최고 기록" caption="Career peak" />
            {peak ? (
              <div className="career-peak-card">
                <Image
                  alt={`${peak.tier} 티어 이미지`}
                  height="48"
                  src={getTierAssetPath(peak.tier)}
                  width="48"
                />
                <div>
                  <strong>{peak.tier}</strong>
                  <span>{peak.rr} RR · {peak.season}</span>
                  <em>
                    {peak.wins}승 {peak.losses}패 · 승률 {peak.winRate}%
                  </em>
                </div>
              </div>
            ) : (
              <p className="sidebar-empty">—</p>
            )}
          </section>

          {/* 6. 이전 시즌 티어 (압축됨) */}
          <section className="side-panel">
            <PanelHeader title="이전 시즌 티어" caption="Rank history" />
            <div className="previous-season-list">
              {previousSeasons.map((season) => (
                <article key={season.season}>
                  <Image
                    alt={`${season.tier} 티어 이미지`}
                    height="24"
                    src={getTierAssetPath(season.tier)}
                    width="24"
                  />
                  <div>
                    <strong>{season.season}</strong>
                    <span>
                      {season.tier} · {season.rr} RR · {season.wins}승 {season.losses}패
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 7. 활동 시간대 (더보기 토글) */}
          <section className="side-panel">
            <PanelHeader title="활동 시간대" caption="최근 경기 분포" />
            <div className="sidebar-activity-list">
              {(showAllActivity ? stats.activityByTimeSlot : stats.activityByTimeSlot.slice(0, 3)).map((slot) => (
                <div className="sidebar-activity-row" key={slot.label}>
                  <div>
                    <strong>{slot.label}</strong>
                    <span>{slot.matchesPlayed}경기</span>
                  </div>
                  <span className="sidebar-meter" aria-label={`${slot.label} ${slot.matchesPlayed}경기`}>
                    <span style={{ width: `${(slot.matchesPlayed / maxActivityMatches) * 100}%` }} />
                  </span>
                </div>
              ))}
            </div>
            {stats.activityByTimeSlot.length > 3 && (
              <button
                className="sidebar-toggle-btn"
                onClick={() => setShowAllActivity(!showAllActivity)}
              >
                {showAllActivity ? "접기" : "더보기"}
              </button>
            )}
          </section>

          {/* 8. 자주 함께한 팀원 (더보기 토글) */}
          <section className="side-panel">
            <PanelHeader title="자주 함께한 팀원" caption="같이 플레이한 경기" />
            <div className="sidebar-teammate-list">
              {(showAllTeammates ? stats.frequentTeammates : stats.frequentTeammates.slice(0, 3)).map((teammate) => (
                <article key={teammate.riotId}>
                  <div>
                    <strong>{teammate.riotId}</strong>
                    <span>
                      {formatRecord(teammate.wins, teammate.losses)} · {teammate.matchesPlayed}경기
                    </span>
                  </div>
                  <em>{teammate.winRate}%</em>
                </article>
              ))}
            </div>
            {stats.frequentTeammates.length > 3 && (
              <button
                className="sidebar-toggle-btn"
                onClick={() => setShowAllTeammates(!showAllTeammates)}
              >
                {showAllTeammates ? "접기" : "더보기"}
              </button>
            )}
          </section>
        </>
      ) : (
        <>
          <EmptyPanel title="정확도 분포" />
          <EmptyPanel title="역할별 승률" />
          <EmptyPanel title="주 무기" />
          <EmptyPanel title="맵별 승률" />
          <EmptyPanel title="전체 시즌 최고 기록" />
          <EmptyPanel title="이전 시즌 티어" />
          <EmptyPanel title="활동 시간대" />
          <EmptyPanel title="자주 함께한 팀원" />
        </>
      )}
    </aside>
  );
}
