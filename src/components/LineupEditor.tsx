"use client";

import { LineupWorkspace } from "../features/admin/LineupWorkspace";
import type { LineupDetailModel } from "../types/lineup";

export function LineupEditor({ initialLineup }: { initialLineup?: LineupDetailModel }) {
  return <LineupWorkspace initialMode={initialLineup ? "edit" : "new"} initialId={initialLineup?.id} />;
}
