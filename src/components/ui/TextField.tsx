import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type FieldProps = {
  label: string;
  /** 칸 아래 빨간 안내. 있으면 테두리도 빨갛게 바뀐다. */
  error?: string;
  hint?: string;
  className?: string;
};

const FIELD_CLASS =
  "w-full rounded-lg border bg-elevated px-4 text-15 text-main placeholder:text-sub-weak focus:border-primary focus:outline-none";

function Field({ id, label, error, hint, className, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-14 font-medium text-sub">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-13 text-loss">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-13 text-sub-weak">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

/** 라벨 + 한 줄 입력칸. Dropdown field 모양(높이 44, elevated 배경, line 테두리)에 맞춘다. */
export function TextField({ label, error, hint, className, ...props }: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={cx(FIELD_CLASS, "h-11", error ? "border-loss" : "border-line")}
        {...props}
      />
    </Field>
  );
}

/** 라벨 + 여러 줄 입력칸 */
export function TextAreaField({ label, error, hint, className, ...props }: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={cx(FIELD_CLASS, "py-3", error ? "border-loss" : "border-line")}
        {...props}
      />
    </Field>
  );
}
