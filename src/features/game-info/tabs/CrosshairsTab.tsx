import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { mapImagePath } from "@/lib/assets";
import { CROSSHAIRS, type Crosshair } from "@/mocks/game-info";

/** 미리보기 배율: 게임 값 1 = 2px */
const SCALE = 2;
const LINE = "absolute bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.6)]";

type Arm = "top" | "right" | "bottom" | "left";

/** 가운데(0×0 기준점)에서 간격만큼 떨어진 선 하나의 위치 */
function armStyle(arm: Arm, length: number, thickness: number, offset: number) {
  switch (arm) {
    case "top":
      return { width: thickness, height: length, left: -thickness / 2, bottom: offset };
    case "bottom":
      return { width: thickness, height: length, left: -thickness / 2, top: offset };
    case "left":
      return { width: length, height: thickness, top: -thickness / 2, right: offset };
    case "right":
      return { width: length, height: thickness, top: -thickness / 2, left: offset };
  }
}

/** 시안에는 배경 사진만 있다. 조준점 가이드라서 길이·두께·간격으로 미리보기를 겹쳐 그린다. */
function CrosshairPreview({ crosshair }: { crosshair: Crosshair }) {
  const length = crosshair.length * SCALE;
  const thickness = crosshair.thickness * SCALE;
  const offset = crosshair.gap * SCALE;
  const arms: Arm[] = crosshair.length === 0 ? [] : crosshair.tShape ? ["right", "bottom", "left"] : ["top", "right", "bottom", "left"];
  const dotSize = Math.max(thickness, 4);

  return (
    <span aria-hidden className="absolute top-1/2 left-1/2">
      {arms.map((arm) => (
        <span key={arm} className={LINE} style={armStyle(arm, length, thickness, offset)} />
      ))}
      {crosshair.dot && (
        <span className={LINE} style={{ width: dotSize, height: dotSize, top: -dotSize / 2, left: -dotSize / 2 }} />
      )}
    </span>
  );
}

function CrosshairCard({ crosshair }: { crosshair: Crosshair }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(crosshair.code);
      setCopied(true);
    } catch {
      // 클립보드를 쓸 수 없는 환경: 코드 칸을 직접 선택해서 복사할 수 있다.
    }
  };

  return (
    <Card as="li" className="flex flex-col overflow-hidden">
      <div className="relative h-[180px] overflow-hidden">
        <img src={mapImagePath("haven")} alt="" loading="lazy" className="size-full object-cover" />
        <CrosshairPreview crosshair={crosshair} />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-16 font-semibold">{crosshair.name}</h2>
          <p className="text-12 whitespace-nowrap text-sub-weak">
            길이 {crosshair.length} · 두께 {crosshair.thickness} · 간격 {crosshair.gap}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <code lang="en" className="block h-[30px] min-w-0 truncate leading-[30px] rounded-lg bg-elevated px-3 font-sans text-12 text-sub select-all">
            {crosshair.code}
          </code>
          <button
            type="button"
            onClick={copy}
            aria-label={`${crosshair.name} 코드 복사`}
            className="flex h-9 shrink-0 items-center rounded-lg border border-line bg-elevated px-4 text-13 font-medium hover:border-line-strong"
          >
            <span aria-live="polite">{copied ? "복사됨" : "복사"}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

/** 22 게임 정보 - 조준점 (Figma 57:728) */
export function CrosshairsTab() {
  return (
    <ul aria-label="조준점 목록" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CROSSHAIRS.map((crosshair) => (
        <CrosshairCard key={crosshair.name} crosshair={crosshair} />
      ))}
    </ul>
  );
}
