import type { ReactNode } from "react";
import type { MatchTabId } from "../../../components/MatchTabs";

// M03/M04 표시용 계약. 실제 API 응답이나 Mock 원본 타입을 정의하는 파일은 아니다.
export type MatchMetric = readonly [label: string, value: string | number];

// TrackerProfile이 수치·표시 날짜·이미지·선택 콜백을 준비해 경기 행과 상세에 전달한다.
export interface MatchHistoryEntry {
  id: string;
  date: string;
  dateLabel: string;
  time: string;
  agent: string;
  map: string;
  mode: string;
  act: string;
  weapon: string;
  duration: number;
  teamScore: number;
  enemyScore: number;
  victory: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kd: number | null;
  highlightKd: boolean;
  score: number | null;
  dd: number | null;
  hs: number | null;
  acs: number | null;
  adr: number | null;
  kast: number | null;
  rr: number | null;
  detailMetrics: readonly MatchMetric[];
  portrait: ReactNode;
  renderRank: (className: string) => ReactNode;
  onToggle: () => void;
}

// M03 날짜별 집계는 부모의 기존 summarize 결과를 받는다.
export interface MatchDay {
  day: string;
  dateLabel: string;
  summary: { wins: number; losses: number; kd: number | null; dd: number | null; hs: number | null; acs: number | null };
  rows: readonly MatchHistoryEntry[];
}

// 펼침 상태와 상세 탭의 수명·초기화는 TrackerProfile에서 관리한다.
export interface MatchDetailContext {
  viewerPuuid: string;
  displayName: string;
  displayTag: string;
  detailTab: MatchTabId;
  onDetailTabChange: (tab: MatchTabId) => void;
  onDetailClose: () => void;
}
