export type RiotId = {
  gameName: string;
  tagLine: string;
};

/** 태그는 3~5자의 영문·숫자 (결과 없음 안내 문구와 같은 규칙). */
const TAG_PATTERN = /^[A-Za-z0-9]{3,5}$/;

/** '이름#태그'를 나눈다. 형식이 맞지 않으면 null. */
export function parseRiotId(input: string): RiotId | null {
  const value = input.trim();
  const hashIndex = value.lastIndexOf("#");
  if (hashIndex <= 0) return null;

  const gameName = value.slice(0, hashIndex).trim();
  const tagLine = value.slice(hashIndex + 1).trim();
  if (!gameName || !TAG_PATTERN.test(tagLine)) return null;

  return { gameName, tagLine };
}

export function formatRiotId({ gameName, tagLine }: RiotId): string {
  return `${gameName}#${tagLine}`;
}

export function isSameRiotId(a: RiotId, b: RiotId): boolean {
  return (
    a.gameName.toLowerCase() === b.gameName.toLowerCase() &&
    a.tagLine.toLowerCase() === b.tagLine.toLowerCase()
  );
}

/** 프로필 경로. '#'은 인코딩되어 `/players/이름%23태그`가 된다. */
export function playerPath(id: RiotId): string {
  return `/players/${encodeURIComponent(formatRiotId(id))}`;
}
