"use client";

import { useEffect, useState } from "react";
import { useLocale } from "../../stats-shell/locale";

interface ProfileBrowserActionsOptions {
  playerId: string;
  displayName: string;
}

type ToastCode = "saved" | "removed" | "storageUnavailable" | "shared" | "shareUnavailable" | "demoCurrent" | "demoOnly" | "refreshed";

// TrackerProfile에서 한 번 호출한다. P01/P02/P10·M01의 브라우저 동작과 안내를 관리한다.
// 탭/필터 상태·통계 계산·실제 Riot 조회는 담당하지 않는다.
export function useProfileBrowserActions({ playerId, displayName }: ProfileBrowserActionsOptions) {
  const { t, copy } = useLocale();
  const [notice, setNotice] = useState(true);
  const [banner, setBanner] = useState(true);
  const [saved, setSaved] = useState(false);
  // 문장 대신 동작 코드를 보관해 열린 알림도 현재 언어로 표시한다.
  const [toastCode, setToastCode] = useState<ToastCode | null>(null);
  const [refreshed, setRefreshed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const storageKey = `gameprobe:profile:${playerId}:saved`;
  const toastMessages: Record<ToastCode, string> = {
    saved: t("이 브라우저에 프로필을 저장했습니다.", "Profile saved to this browser."),
    removed: t("저장한 프로필에서 삭제했습니다.", "Profile removed from saved profiles."),
    storageUnavailable: t("이 방문 중에만 반영됩니다. 브라우저에 저장할 수 없습니다.", "Applied for this visit only. Browser storage is unavailable."),
    shared: t("프로필 링크를 복사했습니다.", "Profile link copied."),
    shareUnavailable: t("링크를 복사하지 못했습니다. 브라우저 주소창에서 프로필 주소를 복사해 주세요.", "Could not copy the link. Copy the profile URL from your browser’s address bar."),
    demoCurrent: `${t("현재 데모 프로필을 보고 있습니다.", "You’re viewing the demo profile.")} ${copy.searchUnavailable}`,
    demoOnly: `${t("데모 프로필만 볼 수 있습니다.", "This preview includes demo profiles only.")} ${copy.searchUnavailable}`,
    refreshed: t("데모 화면을 새로 확인했습니다. 예시 데이터는 변경되지 않습니다.", "Demo view refreshed. Sample data is unchanged."),
  };
  const toast = toastCode ? toastMessages[toastCode] : "";

  // P02 저장 버튼: 기존 선수별 키를 유지한다. 읽기 실패 시 현재 방문 상태를 보존한다.
  useEffect(() => {
    try { setSaved(localStorage.getItem(storageKey) === "true"); }
    catch { /* 브라우저 저장이 제한되어도 나머지 화면은 계속 사용할 수 있다. */ }
  }, [storageKey]);

  // P10 안내: 동작 코드가 바뀌면 3.2초를 다시 센다. 닫기·교체·화면 종료 시 정리한다.
  // 같은 동작의 반복이나 언어 전환은 기존 알림의 남은 시간을 바꾸지 않는다.
  useEffect(() => {
    if (!toastCode) return;
    const timer = setTimeout(() => setToastCode(null), 3200);
    return () => clearTimeout(timer);
  }, [toastCode]);

  function favorite() {
    const next = !saved;
    setSaved(next);
    try {
      localStorage.setItem(storageKey, String(next));
      setToastCode(next ? "saved" : "removed");
    } catch {
      setToastCode("storageUnavailable");
    }
  }

  // P02 공유: 현재 주소만 복사한다. 탭/필터를 URL에 추가하는 동작은 포함하지 않는다.
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastCode("shared");
    } catch {
      setToastCode("shareUnavailable");
    }
  }

  // P01 검색: 기존 데모 안내만 표시한다. 실제 플레이어 검색/API 호출이 아니다.
  function submitSearch() {
    if (!search.trim()) return;
    setToastCode(search.toLowerCase().includes(displayName.toLowerCase()) || search.toLowerCase().includes("ied")
      ? "demoCurrent"
      : "demoOnly");
  }

  // P02 Mock 갱신: 표시 상태와 안내만 갱신하고 표본 데이터는 바꾸지 않는다.
  function refresh() {
    setRefreshed(true);
    setToastCode("refreshed");
  }

  function toggleMenu() { setMenu(!menu); }
  function dismissNotice() { setNotice(false); }
  function dismissBanner() { setBanner(false); }
  function dismissToast() { setToastCode(null); }

  return {
    notice, banner, saved, toast, refreshed, menu, search, setSearch,
    favorite, share, submitSearch, refresh, toggleMenu, dismissNotice, dismissBanner, dismissToast,
  };
}
