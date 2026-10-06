"use client";

import { useSyncExternalStore } from "react";
import { statsCopies } from "./copy";

/** 공통 헤더의 언어 목록과 저장값 검증이 함께 사용한다. 새 언어에는 문구 번역도 필요하다. */
export const supportedLanguages = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
] as const;
export type Locale = typeof supportedLanguages[number]["code"];
const storageKey = "gameprobe:locale";
let current: Locale = "ko";
let initialized = false;
let sessionOnly = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());
const validLocale = (value: string | null): Locale => supportedLanguages.find(language => language.code === value)?.code ?? "ko";

// 서버와 최초 hydration 출력은 한국어로 일치시킨 뒤 브라우저의 저장된 선택을 읽는다.
function getBrowserSnapshot(): Locale {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try { current = validLocale(window.localStorage.getItem(storageKey)); }
    catch { /* 저장소가 차단돼도 현재 탭에서는 언어 전환을 사용할 수 있다. */ }
  }
  return current;
}

function onStorage(event: StorageEvent) {
  if (event.key !== storageKey && event.key !== null) return;
  try { if (event.storageArea !== window.localStorage) return; }
  catch { return; }
  current = validLocale(event.newValue);
  sessionOnly = false;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    window.addEventListener("storage", onStorage);
    // 라인업처럼 공통 셸 밖에 머무는 동안 다른 탭에서 바꾼 선택도 복귀 시 읽는다.
    // 저장 실패로 메모리에만 남긴 현재 방문의 선택은 오래된 저장값으로 덮지 않는다.
    if (!sessionOnly) {
      try {
        const stored = validLocale(window.localStorage.getItem(storageKey));
        initialized = true;
        if (stored !== current) { current = stored; notify(); }
      } catch { /* 저장소 읽기가 제한되면 마지막 메모리 선택을 유지한다. */ }
    }
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

function setLocale(locale: Locale) {
  initialized = true;
  current = locale;
  try { window.localStorage.setItem(storageKey, locale); sessionOnly = false; }
  catch { sessionOnly = true; }
  notify();
}

// 현재 화면 문구는 한국어/영어 쌍이다. 언어 추가 시 copy와 화면별 번역까지 확장한다.
const choose = {
  ko: <T,>(korean: T, _english: T): T => korean,
  en: <T,>(_korean: T, english: T): T => english,
} satisfies Record<Locale, <T>(korean: T, english: T) => T>;
const getServerSnapshot = (): Locale => "ko";

/** 공통 헤더·홈·프로필·보조 페이지의 표시 언어. 데이터/탭/필터 상태와 독립적이다. */
export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  return { locale, setLocale, t: choose[locale], copy: statsCopies[locale] };
}
