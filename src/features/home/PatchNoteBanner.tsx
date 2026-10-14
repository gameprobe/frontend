import { Link } from "react-router-dom";
import chevronRightIcon from "@/assets/icons/chevron-right.svg";
import { agentIconPath } from "@/lib/assets";
import { LATEST_PATCH } from "@/mocks/home";

/** 최신 패치 노트 배너 (53:238) */
export function PatchNoteBanner() {
  return (
    <Link
      to="/game-info/patch-notes"
      className="group flex items-center gap-4 rounded-card border border-line bg-surface p-6 hover:border-sub-weak md:gap-6"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-14 font-medium text-sub">최신 패치 노트 · {LATEST_PATCH.date}</span>
        <span className="text-18 font-semibold md:text-20">{LATEST_PATCH.title}</span>
      </span>
      <span className="hidden shrink-0 gap-2 sm:flex">
        {LATEST_PATCH.agentIds.map((agentId) => (
          <img key={agentId} src={agentIconPath(agentId)} alt="" className="size-11 rounded-lg object-cover" />
        ))}
      </span>
      <img src={chevronRightIcon} alt="" width={20} height={20} className="shrink-0" />
    </Link>
  );
}
