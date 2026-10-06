"use client";

import { useEffect, useState } from "react";
import type { Mode } from "../mock";
import type { MatchTabId } from "../../../components/MatchTabs";

// P01/P03 내비게이션과 프로필 본문에서 사용하는 같은 탭 목록이다.
export const profileTabs = ["Overview", "Matches", "Performance", "Agents", "Maps", "Weapons"] as const;
type ProfileTab = (typeof profileTabs)[number];

// TrackerProfile에서 한 번 호출한다. 표시 컴포넌트를 오가도 선택 상태의 수명을 유지한다.
// API 조회·통계 계산·브라우저 저장/공유·DOM 스크롤은 이 훅의 책임이 아니다.
export function useProfileViewState(defaultAct = "V26: A5") {
  const [tab, setTab] = useState<ProfileTab>("Overview");
  // P05: 시즌 통계와 사이드바, 경기 목록에 함께 적용되는 상위 조건.
  const [platform, setPlatform] = useState("PC");
  const [mode, setMode] = useState<Mode>("Competitive");
  const [act, setAct] = useState(defaultAct);
  // M01: 경기 목록/최근 요약에만 적용되는 조건. 시즌 통계 범위를 바꾸지 않는다.
  const [agent, setAgent] = useState("All Agents");
  const [map, setMap] = useState("All Maps");
  const [weapon, setWeapon] = useState("All Weapons");
  const [result, setResult] = useState("All Results");
  const [date, setDate] = useState("All Dates");
  const [showFilters, setShowFilters] = useState(false);
  const [showMore, setShowMore] = useState(false);
  // M02~M05: 열린 경기와 목록 표시량. detailTab은 보존된 인라인 상세의 4탭 전용이다.
  // 기본 모달의 5탭은 기존 TrackerMatchPanel 내부 상태로 유지한다.
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<MatchTabId>("scoreboard");
  const [pageSize, setPageSize] = useState(20);

  // 기존 초기화 시점을 그대로 유지한다. 같은 필터 값을 다시 선택하면 실행하지 않는다.
  useEffect(() => {
    setExpanded(null);
    setPageSize(20);
  }, [platform, mode, act, agent, map, weapon, result, date]);

  function resetFilters() {
    setAgent("All Agents");
    setMap("All Maps");
    setWeapon("All Weapons");
    setResult("All Results");
    setDate("All Dates");
  }

  // 빈 시즌의 Reset: 탭은 유지하고 PC/Competitive/A5 및 경기 조건만 복원한다.
  function resetAll() {
    setPlatform("PC");
    setMode("Competitive");
    setAct(defaultAct);
    resetFilters();
  }

  // P01/P03/P04/S02: 같은 탭을 다시 눌러도 경기는 닫되 필터/표시량은 유지한다.
  function navigate(next: ProfileTab) {
    setTab(next);
    setExpanded(null);
  }

  // P08/S05/S06 및 Agents/Maps/Weapons 본문: 해당 조건만 바꾸고 Matches로 이동한다.
  function viewAgentMatches(name: string) { setAgent(name); navigate("Matches"); }
  function viewMapMatches(name: string) { setMap(name); navigate("Matches"); }
  function viewWeaponMatches(name: string) { setWeapon(name); navigate("Matches"); }

  // M03 경기 행은 같은 경기를 다시 누르면 닫는다. 상세 탭은 항상 초기화한다.
  function toggleMatch(matchId: string) {
    setExpanded(expanded === matchId ? null : matchId);
    setDetailTab("scoreboard");
  }

  // M02 최근 경기 스트립은 같은 경기여도 계속 연다. 인라인 행 스크롤은 부모에서 한다.
  function selectMatch(matchId: string) {
    setExpanded(matchId);
    setDetailTab("scoreboard");
  }

  function closeMatch() { setExpanded(null); }
  function toggleFilters() { setShowFilters(!showFilters); }
  function toggleMore() { setShowMore(!showMore); }
  function loadMoreMatches() { setPageSize(size => size + 20); }
  function viewAllMatches(matchingCount: number) {
    navigate("Matches");
    setPageSize(matchingCount);
  }

  return {
    tab, platform, mode, act, agent, map, weapon, result, date,
    showFilters, showMore, expanded, detailTab, pageSize,
    setPlatform, setMode, setAct, setAgent, setMap, setWeapon, setResult, setDate, setDetailTab,
    resetFilters, resetAll, navigate, viewAgentMatches, viewMapMatches, viewWeaponMatches,
    toggleMatch, selectMatch, closeMatch, toggleFilters, toggleMore, loadMoreMatches, viewAllMatches,
  };
}
