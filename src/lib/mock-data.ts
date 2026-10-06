import mockDataJson from "../data/mock-data.json";
import type { MatchDetail, MatchSummary, Player, RiotId } from "../types";

interface MockData {
  players: Player[];
  matchDetails: MatchDetail[];
}

const mockData: MockData = mockDataJson;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function splitRiotId(riotId: string): RiotId | null {
  const [gameName, tagLine, ...extra] = riotId.split("#");
  if (!gameName || !tagLine || extra.length > 0) {
    return null;
  }

  return { gameName, tagLine };
}

function riotIdEquals(left: RiotId, right: RiotId): boolean {
  return (
    normalize(left.gameName) === normalize(right.gameName) &&
    normalize(left.tagLine) === normalize(right.tagLine)
  );
}

export function getDemoPlayers(): Player[] {
  return mockData.players;
}

export function getDemoPlayerByPuuid(puuid: string): Player | null {
  return mockData.players.find((player) => player.puuid === puuid) ?? null;
}

export function getDemoPlayerByRiotId(riotId: string | RiotId): Player | null {
  const parsedRiotId = typeof riotId === "string" ? splitRiotId(riotId) : riotId;
  if (!parsedRiotId) {
    return null;
  }

  return (
    mockData.players.find((player) => riotIdEquals(player.riotId, parsedRiotId)) ??
    null
  );
}

export function getRecentMatchesForPlayer(puuid: string): MatchSummary[] {
  return getDemoPlayerByPuuid(puuid)?.recentMatches ?? [];
}

export function getMatchDetail(matchId: string): MatchDetail | null {
  return (
    mockData.matchDetails.find((matchDetail) => matchDetail.matchId === matchId) ??
    null
  );
}
