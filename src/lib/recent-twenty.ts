import type { RecentTwentySummary } from "../types/profile-overview";

export function getDdDeltaPerRound(summary: RecentTwentySummary): number | null {
  if (summary.roundsPlayed <= 0) {
    return null;
  }

  // DDΔ/R = (damage dealt - damage received) / rounds played.
  // These damage inputs are mock aggregated fields until Backend aggregation exists.
  return (summary.damageDealt - summary.damageReceived) / summary.roundsPlayed;
}

export function ddDeltaTone(value: number | null): "positive" | "negative" | "neutral" {
  if (value === null || value === 0) {
    return "neutral";
  }

  return value > 0 ? "positive" : "negative";
}
