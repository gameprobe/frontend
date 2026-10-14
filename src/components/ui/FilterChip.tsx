import { cx } from "@/lib/cx";

type FilterChipGroupProps<T extends string> = {
  label: string;
  /** icon: 글자 앞 16px 아이콘(역할군 칩) */
  options: readonly { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (value: T) => void;
  /** sm 29px·13px(정렬 칩) · md 30px(기본) · lg 34px(업적·역할군 칩) · xl 38px·라운드 16(맵 칩) */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-[29px] rounded-full text-13",
  md: "h-[30px] rounded-full text-14",
  lg: "h-[34px] rounded-full text-14",
  xl: "h-[38px] rounded-card text-14",
};

/** Figma Chip / Screen(100:1336) 선택형. 한 개만 고르는 필터(전체·승리·패배 등). */
export function FilterChipGroup<T extends string>({ label, options, value, onChange, size = "md", className }: FilterChipGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cx(
              "flex items-center gap-1.5 border px-4 font-medium whitespace-nowrap transition-colors",
              SIZE_CLASS[size],
              selected
                ? "border-primary bg-primary-soft text-primary"
                : "border-line bg-surface text-sub hover:text-main",
            )}
          >
            {option.icon && <img src={option.icon} alt="" width={16} height={16} className="size-4 object-cover" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
