import { useSyncExternalStore } from "react";
import { createSmokeApi, SmokeApiError, smokeErrorMessage } from "../smokes/smoke-api";
import { toSmokePayload } from "../smokes/smoke-model";
import type { SmokePayload, SmokeRecord } from "../smokes/smoke-model";
import { expireAdminToken, getAdminSessionVersion, getAdminToken } from "./admin-session";

export const smokeApi = createSmokeApi(import.meta.env.VITE_BACKEND_URL);
export { smokeErrorMessage } from "../smokes/smoke-api";

type State = { entries: SmokeRecord[]; loading: boolean; loaded: boolean; error: string };
const emptyState = (): State => ({ entries: [], loading: false, loaded: false, error: "" });
let state = emptyState();
let revision = 0;
let generation = 0;
const listeners = new Set<() => void>();
function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function useAdminSmokes() {
  return useSyncExternalStore(subscribe, () => state);
}
export function clearAdminSmokes() {
  generation += 1;
  revision += 1;
  setState(emptyState());
}

/** 로그아웃·재인증 전에 시작한 요청은 현재 인증과 캐시를 바꿀 수 없다. */
function requestSession() {
  const version = getAdminSessionVersion();
  const currentGeneration = generation;
  const isCurrent = () => version === getAdminSessionVersion() && currentGeneration === generation;
  const check = () => {
    if (!isCurrent()) throw new Error("관리자 인증이 변경되었습니다. 다시 시도해 주세요.");
  };
  return {
    token: getAdminToken(),
    isCurrent,
    check,
    failure(error: unknown) {
      check();
      if (error instanceof SmokeApiError && error.status === 401) {
        clearAdminSmokes();
        expireAdminToken();
      }
      return error;
    },
  };
}

/** 페이지를 모두 모은 뒤 목록을 교체한다. 읽는 도중 저장된 최신 캐시를 덮어쓰지 않는다. */
export async function loadAdminSmokes() {
  const currentRevision = ++revision;
  const session = requestSession();
  const isCurrent = () => currentRevision === revision && session.isCurrent();
  setState({ ...state, loading: true, error: "" });
  try {
    const entries: SmokeRecord[] = [];
    let offset = 0;
    while (true) {
      if (!isCurrent()) return;
      const page = await smokeApi.list(session.token, offset);
      if (!isCurrent()) return;
      entries.push(...page.items);
      offset += page.items.length;
      if (offset >= page.total) break;
      if (page.items.length === 0) throw new Error("목록을 모두 읽지 못했습니다. 새로고침해 주세요.");
    }
    setState({ entries, loading: false, loaded: true, error: "" });
  } catch (error) {
    if (!isCurrent()) return;
    session.failure(error);
    setState({ ...state, loading: false, error: smokeErrorMessage(error) });
  }
}

export async function fetchAdminSmoke(id: string): Promise<SmokeRecord> {
  const session = requestSession();
  try {
    const record = await smokeApi.get(session.token, id);
    session.check();
    return record;
  } catch (error) {
    throw session.failure(error);
  }
}

export async function saveAdminSmoke(payload: SmokePayload, id?: string): Promise<SmokeRecord> {
  const session = requestSession();
  try {
    const saved = id
      ? await smokeApi.update(session.token, id, payload)
      : await smokeApi.create(session.token, payload);
    session.check();
    revision += 1;
    setState({ ...state, entries: [saved, ...state.entries.filter((entry) => entry.id !== saved.id)], loading: false, error: "" });
    // 첫 목록을 읽기 전에 저장했다면 이 한 건만으로 전체 목록이 완성되지는 않는다.
    // 저장 성공은 즉시 반환하고, 중단된 목록 조회만 다시 시작한다.
    if (!state.loaded) void loadAdminSmokes();
    return saved;
  } catch (error) {
    throw session.failure(error);
  }
}

export async function deleteAdminSmoke(id: string): Promise<void> {
  const session = requestSession();
  try {
    await smokeApi.remove(session.token, id);
    session.check();
    revision += 1;
    setState({ ...state, entries: state.entries.filter((entry) => entry.id !== id), loading: false, error: "" });
    if (!state.loaded) void loadAdminSmokes();
  } catch (error) {
    throw session.failure(error);
  }
}

// 체험 자료는 별도 메모리에만 둔다. 새로고침이나 체험 종료 후에는 남지 않는다.
let demoEntries: SmokeRecord[] = [];
const demoListeners = new Set<() => void>();
function setDemoEntries(entries: SmokeRecord[]) {
  demoEntries = entries;
  demoListeners.forEach((listener) => listener());
}
function subscribeDemo(listener: () => void) {
  demoListeners.add(listener);
  return () => demoListeners.delete(listener);
}
export function useDemoSmokes() {
  return useSyncExternalStore(subscribeDemo, () => demoEntries);
}
export function clearDemoSmokes() {
  setDemoEntries([]);
}
export function saveDemoSmoke(payload: SmokePayload, id?: string): SmokeRecord {
  const previous = id ? demoEntries.find((entry) => entry.id === id) : undefined;
  if (id && !previous) throw new Error("체험 자료를 찾을 수 없습니다. 새 스모크를 등록해 주세요.");
  const now = new Date().toISOString();
  const record = {
    ...toSmokePayload(payload),
    id: previous?.id ?? crypto.randomUUID(),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };
  setDemoEntries([record, ...demoEntries.filter((entry) => entry.id !== record.id)]);
  return record;
}
export function deleteDemoSmoke(id: string) {
  setDemoEntries(demoEntries.filter((entry) => entry.id !== id));
}
