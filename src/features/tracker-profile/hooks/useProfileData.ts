"use client";

import { useEffect, useMemo, useState } from 'react';
import { createMockProvider, type DemoScenario, type ProfileProvider, type ProfileResult } from '../data/provider';
import type { ProfileQuery } from '../data/profile';

type DataState = { key: string; source?: ProfileProvider; status: 'loading' | 'success' | 'error'; result: ProfileResult | null };
/** P05 조회 수명. 필터가 바뀌면 이전 결과를 즉시 숨기고, 취소된 응답은 반영하지 않는다. */
export function useProfileData(query: ProfileQuery | null, scenario: DemoScenario, provider?: ProfileProvider) {
  const source = useMemo(() => provider ?? createMockProvider(scenario), [provider, scenario]);
  const queryKey = JSON.stringify(query);
  const [revision, setRevision] = useState(0);
  const key = `${queryKey}:${scenario}:${revision}`;
  const [state, setState] = useState<DataState>({ key: '', status: 'loading', result: null });
  useEffect(() => {
    if (queryKey === 'null') return;
    const controller = new AbortController();
    setState({ key, source, status: 'loading', result: null });
    source(JSON.parse(queryKey) as ProfileQuery, controller.signal).then(result => {
      if (!controller.signal.aborted) setState({ key, source, status: 'success', result });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ key, source, status: 'error', result: null });
    });
    return () => controller.abort();
  }, [key, queryKey, source]);
  return { ...(state.key === key && state.source === source ? state : { status: 'loading' as const, result: null }), reload: () => setRevision(value => value + 1) };
}
