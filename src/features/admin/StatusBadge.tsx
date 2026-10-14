import { STATUS_LABEL, type GuideStatus } from "@/features/admin/model";
import { cx } from "@/lib/cx";

const TONE: Record<GuideStatus, string> = {
  draft: "border-line text-sub",
  review: "border-caution text-caution",
  published: "border-win text-win",
  rejected: "border-loss text-loss",
};

export function StatusBadge({ status }: { status: GuideStatus }) {
  return (
    <span className={cx("shrink-0 rounded-md border px-2 py-0.5 text-12 font-medium whitespace-nowrap", TONE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
