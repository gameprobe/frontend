import { useSyncExternalStore } from "react";
import { createExamples, saveEntry, type GuideEntry } from "@/features/admin/model";

/**
 * 관리자 예시 모드의 공략 목록. 모듈 메모리에만 두어 새로고침하면 예시로 돌아간다(사용자 결정 2026-10-12).
 * 같은 탭에서 화면을 옮겨 다니는 동안에는 유지된다.
 */
let entries: GuideEntry[] = createExamples();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGuideEntries(): GuideEntry[] {
  return useSyncExternalStore(subscribe, () => entries);
}

/** 저장한 공략 id를 돌려준다. */
export function saveGuideEntry(entry: GuideEntry, allowSharedMove = false): string {
  const result = saveEntry(entries, entry, allowSharedMove);
  entries = result.entries;
  listeners.forEach((listener) => listener());
  return result.id;
}
