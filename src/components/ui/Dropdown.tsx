import { useEffect, useId, useRef, useState } from "react";
import chevronDownSmIcon from "@/assets/icons/chevron-down-sm.svg";
import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { cx } from "@/lib/cx";

type DropdownProps<T extends string> = {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** compact = 필터 버튼(Dropdown / Screen), field = 폭을 채우는 선택 입력칸(매치 비교 select) */
  appearance?: "compact" | "field";
  /** 버튼 글자 앞 14px 아이콘 (메타 통계 티어 필터의 티어 보석) */
  icon?: string;
  className?: string;
};

const BUTTON_CLASS = {
  compact:
    "flex items-center gap-2 rounded-lg border border-line bg-surface py-2 pr-2.5 pl-3.5 text-14 font-medium whitespace-nowrap hover:border-sub-weak",
  field:
    "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-elevated pr-3 pl-4 text-15 font-semibold whitespace-nowrap",
};

/** Figma Dropdown / Screen(118:2031): surface 배경 + line 테두리 버튼, 아래로 펼치는 목록. */
export function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  appearance = "compact",
  icon,
  className,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cx("relative", className)}>
      <button
        type="button"
        aria-label={`${label}: ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={cx(
          BUTTON_CLASS[appearance],
          appearance === "field" && (open ? "border-primary" : "border-line hover:border-sub-weak"),
        )}
      >
        {icon && <img src={icon} alt="" width={14} height={14} className="shrink-0" />}
        <span className="truncate">{current.label}</span>
        <img
          src={appearance === "field" ? chevronDownSmIcon : chevronDownIcon}
          alt=""
          width={appearance === "field" ? 14 : 16}
          height={appearance === "field" ? 14 : 16}
          className={cx("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full right-0 z-20 mt-1 max-h-72 min-w-full overflow-y-auto rounded-lg border border-line bg-surface p-1"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex h-9 w-full items-center rounded-md px-3 text-14 whitespace-nowrap hover:bg-elevated",
                    selected ? "font-semibold text-primary" : "text-main",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
