import { useState } from "react";
import chevronIcon from "@/assets/icons/chevron-down-lg.svg";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { PATCH_NOTES } from "@/mocks/game-info";
import { metaAgentName } from "@/mocks/meta";

/** 24 게임 정보 - 패치 노트 (Figma 57:975). 최신 패치만 펼친 채로 시작하고, 제목 줄을 눌러 접고 편다. */
export function PatchNotesTab() {
  const [open, setOpen] = useState<string[]>([PATCH_NOTES[0].version]);
  const toggle = (version: string) =>
    setOpen((current) => (current.includes(version) ? current.filter((item) => item !== version) : [...current, version]));

  return (
    <ul aria-label="패치 노트" className="flex flex-col gap-3 lg:max-w-[880px]">
      {PATCH_NOTES.map((patch) => {
        const expanded = open.includes(patch.version);
        const panelId = `patch-${patch.version}`;
        return (
          <li key={patch.version} className="overflow-hidden rounded-card border border-line bg-surface">
            <button
              type="button"
              onClick={() => toggle(patch.version)}
              aria-expanded={expanded}
              aria-controls={panelId}
              className="flex w-full items-center gap-5 px-5 py-5 text-left md:px-6"
            >
              <span lang="en" className="text-20 font-semibold">
                {patch.version}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-16 font-semibold">{patch.title}</span>
                <span lang="en" className="text-12 text-sub-weak">
                  {patch.date}
                </span>
              </span>
              <img
                src={chevronIcon}
                alt=""
                width={18}
                height={18}
                className={cx("shrink-0 transition-transform", expanded && "rotate-180")}
              />
            </button>
            {expanded && (
              <ul id={panelId} className="px-5 pb-5 md:px-6">
                {patch.changes.map((change) => (
                  <li key={change.text} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-light py-3">
                    <img src={agentIconPath(change.agentId)} alt="" className="size-10 rounded-lg object-cover" />
                    <span className="text-15 font-semibold">{metaAgentName(change.agentId)}</span>
                    <span className="flex h-5 items-center rounded-md border border-line px-2 text-12 font-semibold">
                      {change.kind}
                    </span>
                    <span className="text-15 text-sub">{change.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
