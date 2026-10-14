import { cx } from "@/lib/cx";

type SegmentedControlProps<T extends string> = {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Figma 설정 화면(57:1445)의 세그먼트 선택: elevated 바탕 위에 고른 칸만 line 색 + primary 글자. */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("flex h-10 rounded-lg bg-elevated p-1", className)}>
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
              "flex items-center rounded-lg px-4 text-14 font-medium whitespace-nowrap transition-colors",
              selected ? "bg-line text-primary" : "text-sub hover:text-main",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
