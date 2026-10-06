"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatsShell } from '../stats-shell/StatsShell';
import { StatsHeader } from '../stats-shell/StatsHeader';
import { StatsFooter } from '../stats-shell/StatsFooter';
import { createMainNavigation } from '../stats-shell/navigation';
import { MissingRecordPage } from '../stats-shell/SupportPage';
import { useLocale } from '../stats-shell/locale';
import { TrackerMatchPanel } from './match-history/detail/TrackerMatchPanel';
import { getSyntheticMatchDetail } from './data/matchDetail';
import { demoProfile, demoSeason } from './data/provider';
import type { MatchHistoryEntry } from './match-history/types';
import s from './TrackerProfile.module.css';

/** 경기 공유/새 탭용 입구. 모달과 같은 어댑터·패널을 사용하고 별도 상세 UI를 만들지 않는다. */
export function SyntheticMatchPage({ matchId, viewerPuuid }: { matchId: string; viewerPuuid: string }) {
  const router = useRouter();
  const { copy } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const data = useMemo(() => getSyntheticMatchDetail(matchId, viewerPuuid), [matchId, viewerPuuid]);
  if (!data) return <MissingRecordPage
    eyebrow="Match detail"
    title={{ ko: "경기를 찾을 수 없음", en: "Match not found" }}
    description={{ ko: "이 경기 또는 선수의 데모 기록이 없습니다.", en: "No demo record is available for this match or player." }}
    backHref={demoProfile.href}
  />;
  const { summary, detail } = data;
  const stats = summary.stats;
  const player = detail.participants.find(item => item.puuid === viewerPuuid)!;
  const rounds = detail.rounds.length;
  const match: MatchHistoryEntry = {
    id: matchId, date: summary.startedAt.slice(0, 10), dateLabel: summary.startedAt.slice(0, 10), time: `${summary.startedAt.slice(11, 16)} UTC`,
    agent: summary.agent, map: summary.map, mode: summary.mode, act: demoSeason.label, weapon: summary.primaryWeapon.displayName,
    duration: detail.durationSeconds / 60, teamScore: summary.score.roundsWon, enemyScore: summary.score.roundsLost,
    victory: summary.result === 'win', kills: stats.kills, deaths: stats.deaths, assists: stats.assists,
    kd: stats.deaths ? stats.kills / stats.deaths : null, highlightKd: stats.kills >= stats.deaths,
    score: null, dd: stats.damageDealt != null && stats.damageReceived != null && rounds ? (stats.damageDealt - stats.damageReceived) / rounds : null,
    hs: stats.headshotPercentage, acs: stats.averageCombatScore, adr: stats.adr, kast: null, rr: null,
    detailMetrics: [], portrait: null, renderRank: () => null, onToggle: () => {},
  };
  return <StatsShell className={s.page}>
    {/* 새 탭 화면의 사이트 이동 메뉴만 담당한다. 공유 경기 패널과 프로필 모달에는 포함하지 않는다. */}
    <StatsHeader mode="home" searchHref="/#riot-id" items={createMainNavigation()}
      menu={{ open: menuOpen, onToggle: () => setMenuOpen(open => !open) }} />
    <div className={s.standaloneMatch}>
      <Link href={demoProfile.href}>← {copy.returnDemoProfile}</Link>
      <TrackerMatchPanel key={`${matchId}:${viewerPuuid}`} match={match} data={data} displayName={player.riotId.gameName} displayTag={player.riotId.tagLine} onClose={() => router.push(demoProfile.href)} />
      <StatsFooter mode="profile" />
    </div>
  </StatsShell>;
}
