import { Fragment } from "react";
import { cx } from "@/lib/cx";

const LINEUP_STEPS = ["맵 선택", "요원 선택", "라인업 보기"];

/** 08 라인업 단계 표시 (Figma 73:2). current는 1부터. 스모크 페이지는 steps·label을 바꿔 쓴다(TASK-FE-057). */
export function LineupSteps({
  current,
  steps = LINEUP_STEPS,
  label = "라인업 단계",
}: {
  current: number;
  steps?: string[];
  label?: string;
}) {
  return (
    <ol aria-label={label} className="flex flex-wrap items-center gap-3">
      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        return (
          <Fragment key={label}>
            {index > 0 && <li aria-hidden className="h-px w-6 bg-line" />}
            <li aria-current={active ? "step" : undefined} className="flex items-center gap-2">
              <span
                lang="en"
                className={cx(
                  "flex size-6 items-center justify-center rounded-full text-12 font-semibold",
                  active ? "bg-primary text-on-primary" : "bg-elevated text-disabled",
                )}
              >
                {step}
              </span>
              <span className={cx("text-14", active ? "font-semibold text-main" : "font-medium text-sub-weak")}>{label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

export function LineupHeading({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-14 font-medium text-sub">{label}</p>
        <h1 className="text-24 font-semibold md:text-28">{title}</h1>
      </div>
      <p className="text-15 text-sub">{description}</p>
    </div>
  );
}
