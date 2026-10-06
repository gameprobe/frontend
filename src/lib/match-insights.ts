import { matchInsights } from "../data/match-insights";
import { getMatchDetail } from "./mock-data";
import type {
  DailyMatchGroup,
  MatchHighlightTag,
  MatchInsight,
} from "../types/match-insight";
import type { MatchSummary } from "../types/match";

export const MATCH_HIGHLIGHT_THRESHOLDS = {
  highAcs: 260,
  lowAcs: 180,
  highHeadshotPercentage: 30,
  lowHeadshotPercentage: 20,
  highKast: 75,
  lowKast: 65,
  highDdDeltaPerRound: 15,
  lowDdDeltaPerRound: -10,
} as const;

export function getMatchInsight(matchId: string): MatchInsight | null {
  return matchInsights.find((insight) => insight.matchId === matchId) ?? null;
}

export function getDdDeltaPerRoundForInsight(insight: MatchInsight | null): number | null {
  if (
    !insight ||
    typeof insight.damageDealt !== "number" ||
    typeof insight.damageReceived !== "number" ||
    typeof insight.roundsPlayed !== "number" ||
    insight.roundsPlayed <= 0
  ) {
    return null;
  }

  // DDΔ/R = (damage dealt - damage received) / rounds played.
  // These inputs are mock aggregated fields until Backend aggregation exists.
  return (insight.damageDealt - insight.damageReceived) / insight.roundsPlayed;
}

export function matchDdDeltaTone(
  value: number | null,
): "positive" | "negative" | "neutral" {
  if (value === null || value === 0) {
    return "neutral";
  }

  return value > 0 ? "positive" : "negative";
}

function kdRatio(match: MatchSummary): number {
  if (match.stats.deaths === 0) {
    return match.stats.kills;
  }

  return match.stats.kills / match.stats.deaths;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dateKey(startedAt: string): string {
  return startedAt.length >= 10 ? startedAt.slice(0, 10) : "unknown-date";
}

function dateLabel(key: string): string {
  const timestamp = Date.parse(`${key}T00:00:00.000Z`);

  if (!Number.isFinite(timestamp)) {
    return key;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(timestamp));
}

function safeStartedAtTimestamp(startedAt: string): number {
  const timestamp = Date.parse(startedAt);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function safeDateKeyTimestamp(key: string): number {
  const timestamp = Date.parse(`${key}T00:00:00.000Z`);
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function compareTimestampDesc(left: number, right: number): number {
  if (left === right) {
    return 0;
  }

  return right > left ? 1 : -1;
}

export function groupMatchesByDate(matches: MatchSummary[]): DailyMatchGroup[] {
  const grouped = matches.reduce<Map<string, MatchSummary[]>>((groups, match) => {
    const key = dateKey(match.startedAt);
    groups.set(key, [...(groups.get(key) ?? []), match]);
    return groups;
  }, new Map<string, MatchSummary[]>());

  return Array.from(grouped.entries())
    .sort(([leftKey], [rightKey]) => (
      compareTimestampDesc(safeDateKeyTimestamp(leftKey), safeDateKeyTimestamp(rightKey))
    ))
    .map(([key, groupMatches]) => {
      const sortedMatches = [...groupMatches].sort((left, right) => (
        compareTimestampDesc(
          safeStartedAtTimestamp(left.startedAt),
          safeStartedAtTimestamp(right.startedAt),
        )
      ));
      const insights = sortedMatches.map((match) => getMatchInsight(match.matchId));
      const ddDeltas = insights
        .map((insight) => getDdDeltaPerRoundForInsight(insight))
        .filter((value): value is number => value !== null);

      return {
        dateKey: key,
        dateLabel: dateLabel(key),
        matches: sortedMatches,
        count: sortedMatches.length,
        wins: sortedMatches.filter((match) => match.result === "win").length,
        losses: sortedMatches.filter((match) => match.result === "loss").length,
        avgKd: average(sortedMatches.map(kdRatio)),
        avgDdDeltaPerRound: average(ddDeltas),
        avgHeadshotPercentage: average(
          sortedMatches.map((match) => match.stats.headshotPercentage),
        ),
        avgAcs: average(sortedMatches.map((match) => match.stats.averageCombatScore)),
      };
    });
}

function isViewerTeamAcsLeader(match: MatchSummary, viewerPuuid: string): boolean {
  const matchDetail = getMatchDetail(match.matchId);

  if (!matchDetail) {
    return false;
  }

  const viewer = matchDetail.participants.find(
    (participant) => participant.puuid === viewerPuuid,
  );

  if (!viewer) {
    return false;
  }

  const viewerTeamParticipants = matchDetail.participants.filter(
    (participant) => participant.team === viewer.team,
  );
  const topAcs = Math.max(
    ...viewerTeamParticipants.map(
      (participant) => participant.stats.averageCombatScore,
    ),
  );

  return viewer.stats.averageCombatScore === topAcs;
}

function tag(
  kind: MatchHighlightTag["kind"],
  label: string,
  code: string,
  evidence: string,
): MatchHighlightTag {
  return {
    kind,
    label,
    code,
    evidence,
    source: "derived",
  };
}

export function deriveMatchHighlightTags(
  match: MatchSummary,
  insight: MatchInsight | null,
  viewerPuuid: string,
): MatchHighlightTag[] {
  const tags: MatchHighlightTag[] = [];
  const ddDeltaPerRound = getDdDeltaPerRoundForInsight(insight);

  if (match.stats.averageCombatScore >= MATCH_HIGHLIGHT_THRESHOLDS.highAcs) {
    tags.push(tag("positive", "High ACS", "HIGH_ACS", "ACS >= 260"));
  } else if (match.stats.averageCombatScore < MATCH_HIGHLIGHT_THRESHOLDS.lowAcs) {
    tags.push(tag("negative", "Low ACS", "LOW_ACS", "ACS < 180"));
  }

  if (match.stats.headshotPercentage >= MATCH_HIGHLIGHT_THRESHOLDS.highHeadshotPercentage) {
    tags.push(tag("positive", "High HS", "HIGH_HS", "HS% >= 30"));
  } else if (match.stats.headshotPercentage < MATCH_HIGHLIGHT_THRESHOLDS.lowHeadshotPercentage) {
    tags.push(tag("negative", "Low HS", "LOW_HS", "HS% < 20"));
  }

  if (insight?.kast !== null && insight?.kast !== undefined) {
    if (insight.kast >= MATCH_HIGHLIGHT_THRESHOLDS.highKast) {
      tags.push(tag("positive", "High KAST", "HIGH_KAST", "KAST >= 75"));
    } else if (insight.kast < MATCH_HIGHLIGHT_THRESHOLDS.lowKast) {
      tags.push(tag("negative", "Low KAST", "LOW_KAST", "KAST < 65"));
    }
  }

  if (ddDeltaPerRound !== null) {
    if (ddDeltaPerRound >= MATCH_HIGHLIGHT_THRESHOLDS.highDdDeltaPerRound) {
      tags.push(tag("positive", "High DDΔ/R", "HIGH_DD_DELTA", "DDΔ/R >= 15"));
    } else if (ddDeltaPerRound <= MATCH_HIGHLIGHT_THRESHOLDS.lowDdDeltaPerRound) {
      tags.push(tag("negative", "Low DDΔ/R", "LOW_DD_DELTA", "DDΔ/R <= -10"));
    }
  }

  if (isViewerTeamAcsLeader(match, viewerPuuid)) {
    tags.push(tag("positive", "MVP", "TEAM_ACS_LEADER", "viewer has team-high ACS"));
  }

  return [...tags, ...(insight?.highlightTags ?? [])];
}
