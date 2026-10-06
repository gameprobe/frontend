"use client";

import { SmokeSearchFilter } from "../../components/SmokeSearchFilter";
import { StrategyExplorerShell } from "../../features/strategy-explorer/StrategyExplorerShell";
import { SMOKE_NOTICE } from "../../features/strategy-explorer/status";

export default function SmokesPage() {
  return (
    <StrategyExplorerShell
      current="smokes"
      eyebrow="GameProbe Smoke Library"
      title="스모크 가이드 센터"
      description="맵과 진영을 선택해 어디에 연막을 설치하면 좋은지 확인하세요. 바이퍼를 제외한 공통 원형 연막과 하버 일자 연막을 안내합니다. 바이퍼 라인업은 라인업 페이지에서 확인할 수 있습니다."
      notice={SMOKE_NOTICE}
    >
      <SmokeSearchFilter />
    </StrategyExplorerShell>
  );
}
