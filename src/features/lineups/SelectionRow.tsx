import { cx } from "@/lib/cx";

type SelectionRowProps = {
  label: string;
  title: string;
  image: string;
  /** 맵 썸네일은 72×40, 요원 초상은 40×40 */
  wide?: boolean;
  open: boolean;
  /** 펼쳐지는 드롭다운의 id (aria-controls) */
  controls: string;
  onToggle: () => void;
};

/** 선택 카드의 한 줄(맵·요원). '변경'을 누르면 같은 카드 안에서 드롭다운이 펼쳐지고 '닫기'로 바뀐다 (Figma 178:4199 · 183:6750). */
export function SelectionRow({ label, title, image, wide, open, controls, onToggle }: SelectionRowProps) {
  return (
    <div className="flex items-center gap-3">
      <img src={image} alt="" className={cx("h-10 shrink-0 rounded-lg object-cover", wide ? "w-[72px]" : "w-10")} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-12 font-medium text-sub">{label}</span>
        <span className="truncate text-16 font-semibold">{title}</span>
      </span>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={controls}
        aria-label={`${label} ${open ? "닫기" : "변경"}`}
        onClick={onToggle}
        className="text-13 font-semibold text-primary hover:underline"
      >
        {open ? "닫기" : "변경"}
      </button>
    </div>
  );
}
