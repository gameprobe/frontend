"use client";

import { useState } from "react";
import type { MatchFilterOptions, MatchFilterState } from "../types";

interface ProfileFilterBarProps {
  defaultFilter: MatchFilterState;
  options: MatchFilterOptions;
}

export function ProfileFilterBar({ defaultFilter, options }: ProfileFilterBarProps) {
  const [filter, setFilter] = useState<MatchFilterState>(defaultFilter);

  return (
    <section className="profile-filter-bar" aria-label="전적 필터">
      <div className="section-kicker">
        <p className="eyebrow">Filters</p>
        <span className="data-badge badge-preview-status">Preview / available after API connection</span>
      </div>
      <div className="filter-groups">
        <label className="disabled-label">
          <span>매칭 종류</span>
          <select
            disabled
            value={filter.queueType}
            onChange={(event) => setFilter({ ...filter, queueType: event.target.value as MatchFilterState["queueType"] })}
          >
            {options.queueTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="disabled-label">
          <span>시즌</span>
          <select
            disabled
            value={filter.season}
            onChange={(event) => setFilter({ ...filter, season: event.target.value })}
          >
            {options.seasons.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="disabled-label">
          <span>조회 기간</span>
          <select
            disabled
            value={filter.period}
            onChange={(event) => setFilter({ ...filter, period: event.target.value as MatchFilterState["period"] })}
          >
            {options.periods.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="filter-help-text">
        ※ Preview / available after API connection (필터 기능은 API 연동 완료 후 제공되며, 현재 통계를 실제로 재계산하지 않습니다.)
      </p>
    </section>
  );
}
