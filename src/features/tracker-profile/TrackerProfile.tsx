"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
// 홈과 공유하는 브랜드·테마 설정. 프로필 배치와 동작은 아래 전용 모듈에 유지한다.
import { branding } from "../stats-shell/branding";
import { useLocale } from "../stats-shell/locale";
import { StatsShell } from "../stats-shell/StatsShell";
import { StatsHeader } from "../stats-shell/StatsHeader";
import { createProfileNavigation } from "../stats-shell/navigation";
import { StatsFooter } from "../stats-shell/StatsFooter";
import { profile, type Mode } from "./mock";
import { createProfileView, filterViewMatches as filterMatches, type ViewMatch } from "./data/viewModel";
import { demoProfile, demoSeason, type DemoScenario } from "./data/provider";
import { useProfileData } from "./hooks/useProfileData";
import { getAgentAssetPath, getWeaponAssetPath, getTierAssetPath, getMapListViewAssetPath, getMapSplashAssetPath } from "../../lib/asset-map";
// 카드·제목·필터·그래프 기본형은 표시 컴포넌트와 같은 공통 CSS를 사용한다.
import shared from "./ProfileShared.module.css";
import s from "./TrackerProfile.module.css";
import { number, signed, percent } from "./format";
import { SeasonOverview, type PrimaryStat, type SecondaryStat } from "./summary/SeasonOverview";
import { ProbeScoreCard } from "./summary/ProbeScoreCard";
import { AgentStatsTable } from "./summary/AgentStatsTable";
import { ProfileHeader } from "./header/ProfileHeader";
import { ProfilePromotion } from "./header/ProfilePromotion";
import { ProfileFilters } from "./header/ProfileFilters";
import { ProfileSidebar } from "./sidebar/ProfileSidebar";
import { MatchHistory } from "./match-history/MatchHistory";
import { matchDetailPresentation } from "./match-history/detail/presentation";
import type { MatchHistoryEntry, MatchMetric } from "./match-history/types";
import m from "./match-history/MatchHistory.module.css";
import { profileTabs as tabs, useProfileViewState } from "./hooks/useProfileViewState";
import { useProfileBrowserActions } from "./hooks/useProfileBrowserActions";

const modes: Mode[] = ["Competitive", "Premier", "Unrated", "Deathmatch", "Swiftplay"];
// 데모 상태 선택값은 그대로 두고 사용자에게 보이는 설명만 번역한다.
const demoScenarioLabels: Record<DemoScenario, string> = { ready: "기본 기록", partial: "일부 기록", empty: "기록 없음", error: "불러오기 오류" };
const demoScenarioLabelsEn: Record<DemoScenario, string> = { ready: "Complete sample", partial: "Partial records", empty: "No records", error: "Loading error" };
const image = (kind: string, name: string) => {
  const id = name.toLowerCase();
  if (kind === "agents") return getAgentAssetPath(id);
  if (kind === "weapons") return getWeaponAssetPath(id);
  if (kind === "tiers") return getTierAssetPath(name);
  return id.endsWith("_listview") ? getMapListViewAssetPath(id.replace("_listview", "")) : getMapSplashAssetPath(id.replace("_splash", ""));
};
const dateLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function Icon({ name, size = 18 }: { name: "search" | "share" | "refresh" | "arrow" | "star" | "close" | "chevron" | "target" | "menu"; size?: number }) {
  const paths = { search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0", share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 11l7-5M8 13l7 5", refresh: "M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 14-1l1 6M4 12l1 6a8 8 0 0 0 14-1", arrow: "M4 12h16M14 5l7 7-7 7", star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z", close: "m5 5 14 14M19 5 5 19", chevron: "m6 9 6 6 6-6", target: "M12 2v5M12 17v5M2 12h5M17 12h5M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0", menu: "M3 6h18M3 12h18M3 18h18" };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
function Asset({ kind, name, className = "" }: { kind: string; name: string; className?: string }) {
  // The repository already contains these Riot content assets; no remote dependency.
  return <Image width={200} height={200} className={className} src={image(kind, name)} alt={name} loading="lazy" />;
}
function Sparkline({ values: rawValues, label, className = "" }: { values: (number | null)[]; label: string; className?: string }) {
  const { t } = useLocale();
  const values = rawValues.filter((value): value is number => value != null);
  if (!values.length) return <p className={s.helper}>{t("표시할 그래프 데이터가 없습니다.", "No chart data available.")}</p>;
  const min = Math.min(...values, 0), max = Math.max(...values, 1);
  const points = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 400},${80 - ((v - min) / (max - min)) * 64}`).join(" ");
  return <svg className={`${shared.sparkline} ${className}`} viewBox="0 0 400 90" preserveAspectRatio="none" role="img" aria-label={label}><path d="M0 24H400M0 50H400M0 80H400" stroke="currentColor" strokeOpacity=".09" /><polygon points={`0,90 ${points} 400,90`} fill="currentColor" opacity=".09" /><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}
function Select({ label, value, onChange, options, className = "" }: { label: string; value: string; onChange: (value: string) => void; options: (string | { value: string; label: string })[]; className?: string }) {
  // M01에서는 전용 marker를 함께 받아 필터 색상·순서별 CSS 우선순위를 유지한다.
  return <label className={className ? `${shared.selectWrap} ${className}` : shared.selectWrap}><span className={shared.srOnly}>{label}</span><select aria-label={label} value={value} onChange={e => onChange(e.target.value)}>{options.map(option => typeof option === "string" ? <option key={option}>{option}</option> : <option key={option.value} value={option.value}>{option.label}</option>)}</select><Icon name="chevron" size={13} /></label>;
}

export function TrackerProfile({ playerId, playerName, playerTag, synthetic = false, scenario = "ready" }: { playerId: string; playerName: string; playerTag: string; synthetic?: boolean; scenario?: DemoScenario }) {
  const { t, copy } = useLocale();
  // P01/P03/P05/P06 및 M01~M05: 화면 선택과 초기화는 이 훅에서 관리한다.
  const {
    tab, platform, mode, act, agent, map, weapon, result, date,
    showFilters, showMore, expanded, detailTab, pageSize,
    setPlatform, setMode, setAct, setAgent, setMap, setWeapon, setResult, setDate, setDetailTab,
    resetFilters, resetAll, navigate, viewAgentMatches, viewMapMatches, viewWeaponMatches,
    toggleMatch, selectMatch, closeMatch, toggleFilters, toggleMore, loadMoreMatches, viewAllMatches,
  } = useProfileViewState(synthetic ? demoSeason.label : "V26: A5");
  const demoIdentity = playerId === "ied-agent-allen";
  const displayName = demoIdentity ? profile.name : playerName, displayTag = demoIdentity ? profile.tag : playerTag;
  // P01/P02/P10·M01: 저장·공유·검색 안내와 메뉴/배너 상태는 브라우저 동작 훅이 맡는다.
  const {
    notice, banner, saved, toast, refreshed, menu, search, setSearch,
    favorite, share, submitSearch, refresh, toggleMenu, dismissNotice, dismissBanner, dismissToast,
  } = useProfileBrowserActions({ playerId, displayName });

  const query = synthetic ? {
    puuid: playerId, platform: platform === "PC" ? "pc" as const : "console" as const,
    queueId: mode.toLowerCase(), seasonId: act === "All Acts" ? undefined : demoSeason.id,
  } : null;
  const data = useProfileData(query, scenario);
  const view = useMemo(() => createProfileView(data.result, synthetic), [data.result, synthetic]);
  const { summarize, agentStats, mapStats } = view;
  const seasonMatches = filterMatches(view.matches, { platform, mode, act: act === "All Acts" ? "all" : act });
  const filtered = filterMatches(seasonMatches, { agent: agent === "All Agents" ? "all" : agent, map: map === "All Maps" ? "all" : map, weapon: weapon === "All Weapons" ? "all" : weapon, result: result === "Wins" ? "win" : result === "Losses" ? "loss" : "all", date: date === "Last 7 days" ? "week" : date === "Last 30 days" ? "month" : "all" });
  const stats = summarize(seasonMatches), recent = summarize(filtered.slice(0, 20));
  const agents = agentStats(seasonMatches), maps = mapStats(seasonMatches);
  const visible = filtered.slice(0, pageSize);
  const groups = Array.from(new Set(visible.map(match => match.date))).map(day => ({ day, rows: visible.filter(match => match.date === day) }));
  const weapons = view.weaponStats(seasonMatches);
  const unavailableRank = { rank: copy.unavailable, rr: null, regionRank: null, peakRank: copy.unavailable, peakRR: null, views: null, level: demoProfile.level };
  const playerProfile = synthetic ? unavailableRank : profile;
  const dataReady = !synthetic || data.status === "success" && data.result?.state !== "error";
  const isFiltered = agent !== "All Agents" || map !== "All Maps" || weapon !== "All Weapons" || result !== "All Results" || date !== "All Dates";
  const primary: PrimaryStat[] = [ [mode === "Deathmatch" ? "Damage (Avg)" : "Damage/Round", number(stats.adr), t("평균 피해량", "Average damage")], ["K/D Ratio", number(stats.kd, 2), "Kills / Deaths"], ["Headshot %", percent(stats.hs), t("헤드샷 명중률", "Headshot accuracy")], ["Win %", percent(stats.winRate), `${stats.wins} W · ${stats.losses} L`] ];
  const roundWin = mode === "Deathmatch" ? stats.winRate : stats.rounds ? seasonMatches.reduce((sum, match) => sum + match.teamScore, 0) / stats.rounds * 100 : synthetic ? null : 0;
  const scoreMetrics = [
    { label: mode === "Deathmatch" ? "Match Win %" : "Round Win %", value: percent(roundWin), quality: (roundWin ?? 0) * 1.6 },
    { label: mode === "Deathmatch" ? "Headshot %" : "KAST", value: percent(mode === "Deathmatch" ? stats.hs : stats.kast), quality: mode === "Deathmatch" ? (stats.hs ?? 0) * 2 : ((stats.kast ?? 0) - 45) * 2 },
    { label: t("성과점수", "ACS"), value: number(stats.acs), quality: (stats.acs ?? 0) / 3.5 },
    { label: mode === "Deathmatch" ? "Damage Delta" : "DDΔ/Round", value: signed(stats.dd), quality: 55 + (stats.dd ?? 0) },
  ].map(metric => ({ ...metric, quality: !synthetic && stats.matches ? Math.max(0, Math.min(100, metric.quality)) : 0,
    grade: synthetic || !stats.matches ? "—" : metric.quality >= 85 ? "S" : metric.quality >= 70 ? "A" : metric.quality >= 55 ? "B" : "C" }));
  const rankMatches = seasonMatches.slice(0, 12).reverse();
  let rankRating = profile.rr - rankMatches.reduce((sum, match) => sum + (match.rr ?? 0), 0);
  const rankValues = rankMatches.map(match => (rankRating += (match.rr ?? 0)));
  const secondary = ([["Wins", stats.wins], [mode === "Deathmatch" ? "Matches" : "KAST", mode === "Deathmatch" ? stats.matches : percent(stats.kast)], [mode === "Deathmatch" ? "Damage Delta" : "DDΔ/Round", signed(stats.dd)], ["Kills", stats.kills], ["Deaths", stats.deaths], ["Assists", stats.assists], [t("성과점수", "ACS"), number(stats.acs)], ["KAD Ratio", number(stats.kad, 2)], [mode === "Deathmatch" ? "Kills/Match" : "Kills/Round", number(mode === "Deathmatch" ? (synthetic && !stats.matches ? null : stats.kills / Math.max(stats.matches, 1)) : stats.kpr, 2)], ["First Bloods", stats.firstBloods ?? "—"], ["Flawless Rounds", stats.flawless ?? "—"], ["Aces", stats.aces ?? "—"]] satisfies SecondaryStat[]).filter(([label]) => mode !== "Deathmatch" || !["First Bloods", "Flawless Rounds", "Aces"].includes(String(label)));
  // M03/M04: 원래 경기 행의 표시 계산·이미지·상세 지표 선택을 부모에서 준비한다.
  // 새 데이터의 null을 유지해 미제공을 0으로 표시하지 않는다.
  function matchHistoryEntry(match: ViewMatch): MatchHistoryEntry {
    return {
      ...match,
      dateLabel: dateLabel(match.date),
      victory: match.teamScore > match.enemyScore,
      kd: synthetic && !match.deaths ? null : match.kills / Math.max(match.deaths, 1),
      highlightKd: match.kills >= match.deaths,
      detailMetrics: ([
        [match.mode === "Deathmatch" ? "Damage (Avg)" : "Damage / Round", number(match.adr)],
        ["Combat Score", number(match.acs)], ["KAST", percent(match.kast)], ["Headshot %", percent(match.hs)],
        ["Damage Delta", signed(match.dd)], [branding.scoreName, number(match.score, 0)],
      ] satisfies MatchMetric[]).filter(([label]) => match.mode !== "Deathmatch" || label !== "KAST"),
      portrait: <Asset kind="agents" name={match.agent} />,
      renderRank: className => synthetic ? <span className={className} title={t("경기 당시 랭크는 제공되지 않습니다.", "Rank at the time of this match is not provided.")}>—</span> : <Asset kind="tiers" name="Immortal 1" className={className} />,
      onToggle: () => toggleMatch(match.id),
    };
  }
  // P08: 표시 행과 기존 초상화는 부모가 준비하고, 표의 배치만 자식 컴포넌트가 맡는다.
  function agentTable(all = false) {
    return <AgentStatsTable
      rows={agents.slice(0, all ? undefined : 3).map(item => ({ ...item, portrait: <Asset kind="agents" name={item.agent} /> }))}
      onSelectAgent={viewAgentMatches}
    />;
  }

  return <StatsShell className={s.page}>
    <StatsHeader
      mode="profile"
      items={createProfileNavigation(tabs.map(item => ({ label: item, current: tab === item, onSelect: () => navigate(item) })))}
      menu={{ open: menu, onToggle: toggleMenu }}
      search={{
        value: search,
        onChange: setSearch,
        onSubmit: submitSearch,
      }}
    />
    {notice && <div className={s.notice}><span className={s.noticeIcon}>!</span><div><strong>{copy.demoPreview}</strong><p>{copy.liveDataNotice}</p></div><button onClick={dismissNotice}>{t("닫기", "Dismiss")}</button></div>}
    <div className={s.container}>
      {/* P02~P05: 선택·브라우저 동작은 두 훅에서 받고, 표시 데이터와 이미지 요소는 부모가 제공한다. */}
      <ProfileHeader
        displayName={displayName} displayTag={displayTag} views={playerProfile.views}
        saved={saved} refreshed={refreshed}
        onFavorite={favorite} onShare={share}
        onRefresh={() => { if (synthetic) data.reload(); else refresh(); }}
        tabs={tabs.map(item => ({ label: item, active: tab === item, onSelect: () => navigate(item) }))}
        icons={{ star: <Icon name="star" size={15} />, refresh: <Icon name="refresh" />, share: <Icon name="share" size={23} />, arrow: <Icon name="arrow" size={14} /> }}
        renderHero={className => <Image width={820} height={770} priority className={className} src="/assets/agents/jett_full.png" alt="" />}
        renderAvatar={className => <Asset kind="agents" name="Jett" className={className} />}
      />
      <ProfilePromotion onExplore={() => navigate("Performance")} arrowIcon={<Icon name="arrow" size={16} />} />
      <ProfileFilters
        platforms={["PC", "Console"].map(item => ({ label: item, selected: platform === item, onSelect: () => setPlatform(item) }))}
        modes={modes.map(item => ({ label: item, selected: mode === item, onSelect: () => setMode(item) }))}
        allActsSelected={act === "All Acts"} onAllActs={() => setAct("All Acts")}
        actSelect={<Select label="Act" value={act} onChange={setAct} options={synthetic ? ["All Acts", demoSeason.label] : ["All Acts", "V26: A5", "V26: A4"]} />}
      />
      {synthetic && <section className={s.dataStatus} role="status" aria-live="polite">
        <strong>{data.status === "loading" ? t("예시 경기를 불러오는 중입니다…", "Loading sample matches…") : data.status === "error" || data.result?.state === "error" ? t("예시 경기를 불러오지 못했습니다.", "Could not load sample matches.") : data.result?.state === "partial" ? t("일부 예시 기록만 표시됩니다.", "Only partial sample records are available.") : data.result?.state === "unavailable" ? t("이 데모는 PC Competitive 기록만 제공합니다.", "This demo supports PC Competitive only.") : data.result?.state === "empty" ? t("선택한 조건에 해당하는 예시 경기가 없습니다.", "No sample matches in this selection.") : t("새 데이터 데모", "New data demo")}</strong>
        <p>{data.status === "success" && data.result ? t(`${data.result.coverage.unique}개 예시 경기 중 ${data.result.coverage.included}개를 표시합니다. `, `Showing ${data.result.coverage.included} of ${data.result.coverage.unique} sample matches. `) : ""}{t(`조회된 예시 경기만 포함하며 전체 시즌 기록이 아닙니다. —는 미제공 값이며 0이 아닙니다. 현재 랭크·RR, KAST, ${branding.scoreName}는 제공되지 않습니다.`, `Only the fetched sample matches are included, not a complete season. — means unavailable, not zero. Current rank/RR, KAST and ${branding.scoreName} are not provided.`)}</p>
        <p>{t("DemoPlayer01#DEMO · 시간 기준: UTC · 무기 필터는 해당 무기로 처치한 기록이 있는 경기를 선택합니다.", "DemoPlayer01#DEMO · Times in UTC · Weapon filters select matches containing kills with that weapon.")}</p>
        {(data.status === "error" || data.result?.state === "error" || data.result?.state === "partial") && <button onClick={data.reload}>{t("예시 기록 다시 불러오기", "Reload sample records")}</button>}
        {scenario !== "ready" && <p>{t("데모 상태", "Demo state")}: {t(demoScenarioLabels[scenario], demoScenarioLabelsEn[scenario])}. <Link href={demoProfile.href}>{t("기본 데모로 돌아가기", "Return to the default demo")}</Link></p>}
      </section>}
      {dataReady && <div className={s.columns}>
        {/* S01~S06: 수치·표본은 부모가 계산하고 필터/탭 전환은 상태 훅의 동작을 전달한다. */}
        <ProfileSidebar
          // 세부 통계 탭은 랭크만 유지한다. 전체 통계 복귀 시 현재 선택 조건은 보존한다.
          compact={tab === "Agents" || tab === "Maps" || tab === "Weapons"}
          onViewOverview={() => navigate("Overview")}
          rank={{
            rank: playerProfile.rank, rr: playerProfile.rr, regionRank: playerProfile.regionRank,
            peakRank: playerProfile.peakRank, peakRR: playerProfile.peakRR,
            currentIcon: synthetic ? null : <Asset kind="tiers" name="Immortal 1" />,
            peakIcon: synthetic ? null : <Asset kind="tiers" name="Immortal 3" />,
          }}
          onViewPerformance={() => navigate("Performance")}
          targetIcon={<Icon name="target" size={30} />} performanceArrow={<Icon name="arrow" size={15} />}
          accuracy={{
            distribution: [
              { label: "Head", value: stats.hs },
              { label: "Body", value: synthetic ? stats.body ?? null : stats.matches ? Math.max(0, 93 - (stats.hs ?? 0)) : 0 },
              { label: "Legs", value: synthetic ? stats.legs ?? null : stats.matches ? 7 : 0 },
            ],
            graph: <Sparkline values={seasonMatches.slice(0, 20).reverse().map(match => match.hs)} label={t("최근 예시 경기의 Headshot %", "Headshot percentage in recent sample matches")} />,
          }}
          roles={{ rows: ["Controller", "Duelist", "Initiator"].map((role, i) => {
            // 새 데이터는 원본 ID로 같은 역할을 모두 합산한다. legacy의 기존 선택은 유지한다.
            const row = synthetic ? summarize(seasonMatches.filter(match => agents.some(item => item.id === match.agentId && item.role === role))) : agents.find(item => item.role === role);
            return {
              role, icon: ["⌃", "✕", "↗"][i], winRate: row?.winRate ?? (synthetic ? null : 0),
              wins: row?.wins ?? 0, losses: row?.losses ?? 0, kad: row?.kad ?? (synthetic ? null : 0),
              kills: row?.kills ?? 0, deaths: row?.deaths ?? 0, assists: row?.assists ?? 0,
            };
          }) }}
          weapons={{
            rows: weapons.map(item => ({ ...item,
              category: item.name === "Operator" ? "Sniper Rifles" : item.name === "Ghost" ? "Sidearms" : "Assault Rifles",
              image: <Asset kind="weapons" name={item.name} />,
            })),
            onSelectWeapon: viewWeaponMatches,
            onViewAll: () => navigate("Weapons"), arrowIcon: <Icon name="arrow" size={14} />,
          }}
          maps={{
            rows: maps.map(item => ({ ...item,
              backgroundImage: `linear-gradient(90deg,#111c25ee,#111c2577),url(${image("maps", `${item.map}_listview`)})`,
            })),
            onSelectMap: viewMapMatches,
            onViewAll: () => navigate("Maps"), arrowIcon: <Icon name="arrow" size={14} />,
          }}
        />
        {/* content marker는 경기 영역이 첫 자식인 Matches 탭의 기존 여백에 사용한다. */}
        <div className={`${s.content} ${m.content}`}>
          {(tab === "Overview" || tab === "Performance") && <>
            {/* P06/P07: 시즌 통계·그래프·등급은 부모에서 계산하고 Show More는 상태 훅이 관리한다. */}
            <SeasonOverview
              act={act} mode={mode} tab={tab} synthetic={synthetic}
              hours={stats.hours} matches={stats.matches}
              rank={playerProfile.rank} rr={playerProfile.rr} regionRank={playerProfile.regionRank} level={playerProfile.level}
              wins={stats.wins} losses={stats.losses} winRate={stats.winRate}
              primary={primary} secondary={secondary}
              rankIcon={synthetic ? null : <Asset kind="tiers" name="Immortal 1" />}
              rankGraph={synthetic ? <p className={s.helper}>{t("랭크 변화 기록 미제공", "Rank history not provided")}</p> : <Sparkline values={rankValues} label={t("랭크 변화 예시", "Sample rank history")} />}
              showMore={showMore} onToggleMore={toggleMore}
            />
            <ProbeScoreCard score={stats.score} metrics={scoreMetrics} />
            {tab === "Performance" && <section className={`${shared.card} ${s.performance}`}><h2>Performance over time</h2><p>{t(`Average Combat Score · 예시 ${seasonMatches.length}경기`, `Average Combat Score · ${seasonMatches.length} sample matches`)}</p><Sparkline values={[...seasonMatches].reverse().map(match => match.acs)} label={t("경기별 Average Combat Score 변화", "Average combat score over time")} className={s.performanceGraph} /><div><span>{t("가장 오래된 경기", "Oldest match")}</span><span>{t("가장 최근 경기", "Most recent match")}</span></div></section>}
            <div className={shared.sectionHeading}><h2>TOP AGENTS</h2><button onClick={() => navigate("Agents")}>View All Agents <Icon name="arrow" size={15} /></button></div>{agentTable()}
          </>}
          {tab === "Agents" && <><div className={shared.sectionHeading}><h2>AGENTS · {act}</h2><small>{stats.matches} Matches</small></div>{agentTable(true)}<p className={s.helper}>{t("요원을 선택하면 해당 요원의 경기를 볼 수 있습니다.", "Select an agent to view their matches.")}</p></>}
          {tab === "Maps" && <><div className={shared.sectionHeading}><h2>MAP PERFORMANCE</h2><small>{stats.matches} Matches</small></div><div className={s.mapGrid}>{maps.map(item => <button key={item.id ?? item.map} className={shared.card} onClick={() => viewMapMatches(item.id ?? item.map)}><Asset kind="maps" name={`${item.map}_splash`} /><div><h3>{item.map}</h3><strong>{number(item.winRate)}% <small>Win rate</small></strong><p>{item.wins}W - {item.losses}L · {item.matches} Matches</p><span>{number(item.kd, 2)} K/D <Icon name="arrow" size={15} /></span></div></button>)}</div>{!maps.length && <Empty reset={resetAll} />}</>}
          {tab === "Weapons" && <><div className={shared.sectionHeading}><h2>WEAPON PERFORMANCE</h2><small>{synthetic ? t("무기 처치 기록만 집계 · 스킬 처치 제외 · 무기별 HS/KD 미제공", "Weapon kills only · ability kills excluded · weapon HS/KD unavailable") : t("경기별 주 사용 무기 예시", "Sample primary weapon per match")}</small></div><div className={`${shared.card} ${shared.tableScroll}`} tabIndex={0} role="region" aria-label={t("무기 통계, 가로 스크롤 가능", "Weapon statistics, scroll horizontally")}><table className={s.weaponTable}><thead><tr><th>Weapon</th><th>Kills</th><th>Headshot %</th><th>K/D</th><th>Matches</th></tr></thead><tbody>{weapons.map(item => <tr key={item.id ?? item.name}><td><button onClick={() => viewWeaponMatches(item.id ?? item.name)}><Asset kind="weapons" name={item.name} />{item.name}</button></td><td>{item.kills}</td><td>{percent(item.hs)}</td><td>{number(item.kd, 2)}</td><td>{item.matches}</td></tr>)}</tbody></table></div></>}
          {/* M01~M05: 상태 훅의 동작과 부모의 표시 데이터를 연결한다. DOM 스크롤은 부모에 둔다. */}
          {(tab === "Overview" || tab === "Matches") && <MatchHistory
            title={tab === "Matches" ? "MATCH HISTORY" : "LAST 20 MATCHES"}
            showBanner={banner} onDismissBanner={dismissBanner}
            onAllMatches={() => viewAllMatches(filtered.length)}
            filters={{
              controls: <>
                <Select className={m.selectWrap} label="Agent" value={agent} onChange={setAgent} options={synthetic ? ["All Agents", ...agentStats(view.matches).map(row => ({ value: row.id ?? row.agent, label: row.agent }))] : ["All Agents", "Jett", "Omen", "Sova"]} />
                <Select className={m.selectWrap} label="Map" value={map} onChange={setMap} options={synthetic ? ["All Maps", ...mapStats(view.matches).map(row => ({ value: row.id ?? row.map, label: row.map }))] : ["All Maps", "Ascent", "Haven", "Split"]} />
                <Select className={m.selectWrap} label="Weapon" value={weapon} onChange={setWeapon} options={synthetic ? ["All Weapons", ...view.weaponStats(view.matches).map(row => ({ value: row.id ?? row.name, label: row.name }))] : ["All Weapons", "Phantom", "Vandal", "Operator"]} />
                <Select className={m.selectWrap} label="Date range" value={date} onChange={setDate} options={["All Dates", "Last 7 days", "Last 30 days"]} />
              </>,
              resultControl: <Select className={m.selectWrap} label="Result" value={result} onChange={setResult} options={["All Results", "Wins", "Losses"]} />,
              showMore: showFilters, onToggleMore: toggleFilters,
              isFiltered, onReset: resetFilters,
              dateEnd: date !== "All Dates" ? seasonMatches[0]?.date ?? t("가장 최근 예시 경기", "the latest sample match") : null,
            }}
            recent={{
              summary: recent, matchingCount: filtered.length,
              agents: agentStats(filtered.slice(0, 20)).slice(0, 3).map(item => ({ ...item, portrait: <Asset kind="agents" name={item.agent} /> })),
              matches: filtered.slice(0, 8).map(match => ({
                id: match.id, dateLabel: dateLabel(match.date), teamScore: match.teamScore, enemyScore: match.enemyScore,
                victory: match.teamScore > match.enemyScore, kd: synthetic && !match.deaths ? null : match.kills / Math.max(match.deaths, 1),
                onSelect: () => {
                  selectMatch(match.id);
                  // 모달에서는 목록 위치를 보존하고, 인라인 방식일 때만 기존 행으로 이동한다.
                  if (matchDetailPresentation === "inline") document.getElementById(`match-${match.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                },
              })),
            }}
            groups={groups.map(({ day, rows }) => ({ day, dateLabel: dateLabel(day), summary: summarize(rows), rows: rows.map(matchHistoryEntry) }))}
            expandedId={expanded}
            detail={{ viewerPuuid: playerId, displayName, displayTag, detailTab, onDetailTabChange: setDetailTab, onDetailClose: closeMatch }}
            empty={!filtered.length && <Empty reset={seasonMatches.length ? resetFilters : resetAll} />}
            canLoadMore={filtered.length > visible.length} onLoadMore={loadMoreMatches}
            icons={{ target: <Icon name="target" size={29} />, close: <Icon name="close" />, arrow: <Icon name="arrow" size={17} />, chevron: <Icon name="chevron" size={15} /> }}
          />}
        </div>
      </div>}
      <StatsFooter mode="profile" />
    </div>
    {toast && <div className={s.toast} role="status">{toast}<button aria-label={t("알림 닫기", "Dismiss notification")} onClick={dismissToast}><Icon name="close" size={16} /></button></div>}
  </StatsShell>;
}
function Empty({ reset }: { reset: () => void }) {
  const { t } = useLocale();
  return <div className={`${shared.card} ${shared.empty}`}><Icon name="search" size={28} /><h3>{t("조건에 맞는 경기가 없습니다.", "No matches found.")}</h3><p>{t("다른 필터 조합을 선택해 보세요.", "Try a different combination of filters.")}</p><button onClick={reset}>Reset filters</button></div>;
}
