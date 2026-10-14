import { useState } from "react";
import type { Point } from "@/mocks/lineups";

/** 공개 라인업·스모크가 공통으로 가진 도착지 정보 */
export type Groupable = { id: string; title: string; landing: Point; destinationId?: string; destinationName?: string };

export type DestinationGroup<T extends Groupable> = { key: string; name: string; landing: Point; guides: T[] };

/** destinationId가 같은 공략을 한 도착지로 묶는다. 없으면 공략 하나가 한 도착지다. 순서는 처음 나온 순서 */
export function groupByDestination<T extends Groupable>(guides: T[]): DestinationGroup<T>[] {
  const groups = new Map<string, DestinationGroup<T>>();
  for (const guide of guides) {
    const key = guide.destinationId ?? guide.id;
    const group = groups.get(key);
    if (group) group.guides.push(guide);
    else groups.set(key, { key, name: guide.destinationName ?? guide.title, landing: guide.landing, guides: [guide] });
  }
  return Array.from(groups.values());
}

/**
 * 어느 도착지의 출발지를 펼칠지 정한다.
 * 마우스를 올린(포커스한) 도착지 → 눌러서 고정한 도착지 → 고른 공략의 도착지 순서다.
 * 고정은 터치 화면에서 호버 대신 쓴다.
 */
export function useOpenDestination(selectedKey: string | null) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  return {
    openKey: hovered ?? pinned ?? selectedKey,
    hover: setHovered,
    leave: () => setHovered(null),
    togglePin: (key: string) => setPinned((current) => (current === key ? null : key)),
  };
}
