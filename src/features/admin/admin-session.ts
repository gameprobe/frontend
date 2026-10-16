import { useSyncExternalStore } from "react";

export const DEMO_CODE = "DEMO1234";
const DEMO_KEY = "gameprobe-admin-demo";
const TOKEN_KEY = "gameprobe-admin-token";
const MODE_KEY = "gameprobe-admin-mode";
export type AdminMode = "demo" | "real" | null;
const listeners = new Set<() => void>();
let sessionVersion = 0;

function read(key: string): string | null {
  try { return window.sessionStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch { /* 저장소를 사용할 수 없으면 이번 페이지 동안 메모리에서만 유지한다. */ }
}
let token = read(TOKEN_KEY) ?? "";
let mode: AdminMode = read(MODE_KEY) === "real" ? "real" : read(DEMO_KEY) === "1" ? "demo" : null;
function notify() { listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }

export function useAdminMode() { return useSyncExternalStore(subscribe, () => mode); }
export function useAdminToken() { return useSyncExternalStore(subscribe, () => token); }
export function getAdminToken() { return token; }
export function getAdminSessionVersion() { return sessionVersion; }
export function isDemoCode(value: string) { return value.trim().toUpperCase() === DEMO_CODE; }
export function hasDemoSession() { return mode === "demo"; }
export function startDemoSession() {
  sessionVersion += 1;
  token = "";
  mode = "demo";
  write(TOKEN_KEY, null);
  write(MODE_KEY, null);
  write(DEMO_KEY, "1");
  notify();
}
export function startAdminSession(value: string) {
  sessionVersion += 1;
  token = value;
  mode = "real";
  write(TOKEN_KEY, value);
  write(MODE_KEY, "real");
  write(DEMO_KEY, null);
  notify();
}
/** 폼은 유지하고 토큰만 지운다. 레이아웃에서 다시 인증받는다. */
export function expireAdminToken() {
  sessionVersion += 1;
  token = "";
  write(TOKEN_KEY, null);
  notify();
}
export function endDemoSession() {
  sessionVersion += 1;
  token = "";
  mode = null;
  write(TOKEN_KEY, null);
  write(MODE_KEY, null);
  write(DEMO_KEY, null);
  notify();
}
