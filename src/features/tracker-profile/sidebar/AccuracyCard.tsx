import type { ReactNode } from "react";
import { number, percent } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./ProfileSidebar.module.css";

type AccuracyCardProps = {
  distribution: readonly { label: string; value: number | null }[];
  graph: ReactNode;
};

/**
 * S03: 명중 부위 인체 그림·비율·AVG HS% 그래프.
 * Head/Body/Legs 수치와 그래프는 부모가 제공한다. 현재 임시 산식은 여기서 재해석하지 않는다.
 * 아래 SVG 숫자는 기존 인체 윤곽 좌표이며 통계 수치가 아니다. 형상·속성을 그대로 옮겼다.
 */
export function AccuracyCard({ distribution, graph }: AccuracyCardProps) {
  return (
    <section>
      <h2 className={`${shared.sectionHeading} ${s.sectionHeading}`}>ACCURACY <small>Selected act</small></h2>
      <div className={`${shared.card} ${s.accuracy}`}>
        <div className={s.hitDistribution}>
          <svg viewBox="0 0 96 200" aria-hidden="true" focusable="false">
            <path className={s.bodyHead} d="M48 6C41 6 37 12 37 20C37 26 40 30 43 33H53C56 30 59 26 59 20C59 12 55 6 48 6Z" />
            <path className={s.bodyLegs} d="M32 112Q31 132 33 146Q30 157 33 171L35 186L29 191Q27 193 28 196H44L46 191L43 185V165Q45 158 44 151L48 127L52 151Q51 158 53 165V185L50 191L52 196H68Q69 193 67 191L61 186L63 171Q66 157 63 146Q65 132 64 112Z" />
            <g className={s.bodyTorso}>
              <path d="M42 34V40L32 44Q27 46 25 54L29 75L33 89L34 101Q31 108 32 116L46 122H50L64 116Q65 108 62 101L63 89L67 75L71 54Q69 47 64 44L54 40V34Z" />
              <path d="M30 45Q24 44 21 53L16 78Q15 83 17 89L13 113L11 119Q10 123 13 126Q16 128 19 124L23 116L27 91Q30 84 29 79L34 58Z" />
              <path d="M66 45Q72 44 75 53L80 78Q81 83 79 89L83 113L85 119Q86 123 83 126Q80 128 77 124L73 116L69 91Q66 84 67 79L62 58Z" />
            </g>
            <g className={s.bodyDetail}>
              <path d="M35 49Q42 48 48 53Q54 48 61 49M33 68Q40 73 48 70Q56 73 63 68M36 102Q48 106 60 102" />
              <path d="M19 83L26 85M70 85L77 83M34 150Q39 153 43 150M53 150Q57 153 62 150" />
            </g>
          </svg>
          <div>
            {distribution.map(({ label, value }) => (
              <p key={label}><span>{label}</span><strong>{percent(value)}</strong></p>
            ))}
          </div>
        </div>
        <strong className={s.smallHeading}>AVG HS%</strong>
        {graph}
      </div>
    </section>
  );
}
