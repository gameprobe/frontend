import { useSyncExternalStore } from "react";
import { AdminApiError, createAdminLineupApi, fromLineupRecord, toLineupPayload } from "./admin-lineup-api";
import { expireAdminToken, getAdminSessionVersion, getAdminToken } from "./admin-session";
import type { GuideEntry } from "./model";

export const adminLineupApi = createAdminLineupApi(import.meta.env.VITE_BACKEND_URL);
type State = { entries: GuideEntry[]; loading: boolean; loaded: boolean; error: string; unsupportedCount: number };
const emptyState = (): State => ({ entries: [], loading: false, loaded: false, error: "", unsupportedCount: 0 });
let state = emptyState();
let revision = 0;
const listeners = new Set<() => void>();
function setState(next: State) { state = next; listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
export function useAdminLineups() { return useSyncExternalStore(subscribe, () => state); }
export function clearAdminLineups() { revision += 1; setState(emptyState()); }
export function adminErrorMessage(error: unknown): string {
  if (error instanceof AdminApiError && error.status === 401) expireAdminToken();
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다. 다시 시도해 주세요.";
}

/** 목록을 모두 읽은 뒤 교체한다. 일부 페이지만 받은 상태를 완성된 목록으로 보여주지 않는다. */
export async function loadAdminLineups() {
  const currentRevision = ++revision;
  const token = getAdminToken();
  const sessionVersion = getAdminSessionVersion();
  const isCurrent = () => currentRevision === revision && sessionVersion === getAdminSessionVersion();
  setState({ ...state, loading: true, error: "" });
  try {
    const entries: GuideEntry[] = [];
    let offset = 0;
    let unsupportedCount = 0;
    while (true) {
      if (!isCurrent()) return;
      const page = await adminLineupApi.list(token, offset);
      if (!isCurrent()) return;
      entries.push(...page.items.map(fromLineupRecord));
      unsupportedCount = page.unsupportedCount;
      offset += page.items.length;
      if (offset >= page.total) break;
      if (page.items.length === 0) throw new Error("목록을 모두 읽지 못했습니다. 새로고침해 주세요.");
    }
    if (!isCurrent()) return;
    setState({ entries, loading: false, loaded: true, error: "", unsupportedCount });
  } catch (error) {
    if (!isCurrent()) return;
    setState({ ...state, loading: false, error: adminErrorMessage(error) });
  }
}

/** 늦게 도착한 응답이 로그아웃 이후의 화면이나 새 인증 상태를 덮어쓰지 않게 한다. */
function requestSession() {
  const version = getAdminSessionVersion();
  return {
    token: getAdminToken(),
    check: () => {
      if (version !== getAdminSessionVersion()) throw new Error("관리자 인증이 변경되었습니다. 다시 시도해 주세요.");
    },
  };
}
export async function fetchAdminLineup(id: string) {
  const session = requestSession();
  try {
    const record = await adminLineupApi.get(session.token, id);
    session.check();
    return fromLineupRecord(record);
  } catch (error) {
    session.check();
    throw error;
  }
}
export async function saveAdminLineup(entry: GuideEntry) {
  const session = requestSession();
  try {
    const payload = toLineupPayload(entry);
    const saved = entry.id
      ? await adminLineupApi.update(session.token, entry.id, payload)
      : await adminLineupApi.create(session.token, payload);
    session.check();
    const result = fromLineupRecord(saved);
    revision += 1;
    setState({ ...state, entries: [...state.entries.filter((item) => item.id !== result.id), result], loading: false });
    return result;
  } catch (error) {
    session.check();
    throw error;
  }
}
export async function deleteAdminLineup(id: string) {
  const session = requestSession();
  try {
    await adminLineupApi.remove(session.token, id);
    session.check();
    revision += 1;
    setState({ ...state, entries: state.entries.filter((entry) => entry.id !== id), loading: false });
  } catch (error) {
    session.check();
    throw error;
  }
}
