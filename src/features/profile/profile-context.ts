import { useOutletContext } from "react-router-dom";
import type { PlayerProfile } from "@/mocks/profile";

export type ProfileOutletContext = {
  profile: PlayerProfile;
  /** 탭 사이를 오갈 때 큐 필터(?queue=)를 유지하는 쿼리 문자열 */
  search: string;
  basePath: string;
};

export function useProfileContext() {
  return useOutletContext<ProfileOutletContext>();
}

export const QUEUE_OPTIONS = [
  { value: "all", label: "큐 전체" },
  { value: "competitive", label: "경쟁전" },
  { value: "unrated", label: "일반전" },
  { value: "swiftplay", label: "신속플레이" },
] as const;

export type QueueFilter = (typeof QUEUE_OPTIONS)[number]["value"];

export function parseQueue(value: string | null): QueueFilter {
  return QUEUE_OPTIONS.some((option) => option.value === value) ? (value as QueueFilter) : "all";
}

/** 예시 데이터는 모두 경쟁전이다. 다른 큐를 고르면 기록이 없는 상태를 보여준다. */
export function queueHasData(queue: QueueFilter): boolean {
  return queue === "all" || queue === "competitive";
}
