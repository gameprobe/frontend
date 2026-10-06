"use client";

import { useEffect, useState } from "react";
import { previewLineups } from "../../features/lineup-explorer/preview-data";
import { LineupSearchFilter } from "../../components/LineupSearchFilter";
import { StrategyExplorerShell } from "../../features/strategy-explorer/StrategyExplorerShell";
import { getLineupNotice, type LineupDataState } from "../../features/strategy-explorer/status";
import { fetchPublicLineups } from "../../lib/lineup-api";
import type { Lineup } from "../../types/lineup";

export default function LineupsPage() {
  const [lineups, setLineups] = useState<Lineup[]>(previewLineups);
  const [dataState, setDataState] = useState<LineupDataState>("loading");

  useEffect(() => {
    let active = true;
    fetchPublicLineups()
      .then((items) => {
        if (!active) return;
        setLineups(items);
        setDataState("api");
      })
      .catch(() => {
        if (!active) return;
        setLineups(previewLineups);
        setDataState("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <StrategyExplorerShell
      current="lineups"
      eyebrow="GameProbe Tactical Library"
      title="라인업 검색 센터"
      description="맵, 요원, 스킬 슬롯을 조합해 필요한 전술 라인업을 빠르게 찾으세요. 승인된 라인업의 위치, 경로, 영상 가이드를 한 곳에서 확인하세요."
      notice={getLineupNotice(dataState, lineups.length)}
    >
      <LineupSearchFilter lineups={lineups} dataState={dataState} />
    </StrategyExplorerShell>
  );
}
