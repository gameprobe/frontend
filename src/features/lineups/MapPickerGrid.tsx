import checkCircleIcon from "@/assets/icons/check-circle.svg";
import { mapEnglishName } from "@/data/game-names";
import { mapImagePath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { LINEUP_MAPS } from "@/mocks/lineups";

/** Figma dropdown/맵선택(183:6750)의 map-card(175:2841) 2열 그리드. 라인업·스모크 선택 카드 안에서 펼친다. */
export function MapPickerGrid({ id, current, onPick }: { id?: string; current: string; onPick: (mapId: string) => void }) {
  return (
    <ul id={id} aria-label="맵 선택" className="grid grid-cols-2 gap-2.5">
      {LINEUP_MAPS.map((map) => {
        const selected = map.mapId === current;
        return (
          <li key={map.mapId}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onPick(map.mapId)}
              className={cx(
                "relative flex h-[68px] w-full flex-col items-start justify-end overflow-hidden rounded-thumb px-2.5 pt-3 pb-2 text-left",
                selected ? "border-2 border-primary" : "border border-line hover:border-line-strong",
              )}
            >
              <img src={mapImagePath(map.mapId)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-[rgba(13,18,26,0.05)] to-[rgba(13,18,26,0.92)]" />
              {selected && <span aria-hidden className="absolute inset-0 bg-primary opacity-16" />}
              <span className="relative text-13 font-semibold tracking-normal">{map.name}</span>
              <span lang="en" className="relative text-[10px] leading-[1.4] font-medium tracking-[0.8px] text-sub uppercase">
                {mapEnglishName(map.mapId)}
              </span>
              {selected && <img src={checkCircleIcon} alt="" width={22} height={22} className="absolute top-2 right-2" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
