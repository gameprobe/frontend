"use client";

import { type KeyboardEvent, useRef } from "react";

export type MatchTabId = "scoreboard" | "rounds" | "performance" | "analysis";

interface MatchTab {
  id: MatchTabId;
  label: string;
}

interface MatchTabsProps {
  activeTab: MatchTabId;
  panelPrefix: string;
  onTabChange: (tabId: MatchTabId) => void;
}

const tabs: MatchTab[] = [
  { id: "scoreboard", label: "스코어보드" },
  { id: "rounds", label: "라운드" },
  { id: "performance", label: "성과" },
  { id: "analysis", label: "분석" },
];

export function MatchTabs({ activeTab, panelPrefix, onTabChange }: MatchTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  function focusTab(index: number) {
    const nextTab = tabs[index];
    tabRefs.current[index]?.focus();
    onTabChange(nextTab.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + direction + tabs.length) % tabs.length;
    focusTab(nextIndex);
  }

  return (
    <div className="match-tabs" role="tablist" aria-label="경기 상세 탭">
      {tabs.map((tab, index) => (
        <button
          aria-controls={`${panelPrefix}-${tab.id}-panel`}
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "match-tab match-tab-active" : "match-tab"}
          id={`${panelPrefix}-${tab.id}-tab`}
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={handleKeyDown}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
          role="tab"
          tabIndex={activeTab === tab.id ? 0 : -1}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
