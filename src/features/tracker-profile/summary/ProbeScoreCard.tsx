import { branding } from "../../stats-shell/branding";
import { useLocale } from "../../stats-shell/locale";
import { number } from "../format";
import shared from "../ProfileShared.module.css";
import s from "./ProbeScoreCard.module.css";

type ProbeScoreMetric = {
  label: string;
  value: string;
  grade: string;
  quality: number;
};

type ProbeScoreCardProps = {
  score: number | null;
  metrics: readonly ProbeScoreMetric[];
};

/** P07: Overview·Performance의 점수 카드. 등급·막대 비율은 부모가 계산해 전달한다. */
export function ProbeScoreCard({ score, metrics }: ProbeScoreCardProps) {
  const { t } = useLocale();
  return (
    <section className={`${shared.card} ${s.scoreCard}`} aria-label={branding.scoreName}>
      <div className={s.totalScore}>
        <span className={s.scoreMark}>◈</span>
        <div>
          <span>{branding.scoreName}</span>
          <strong>{number(score, 0)}<small> / 1,000</small></strong>
          <small>{score == null ? t("미제공 · 기준 미정", "Not available · definition pending") : t("플레이 분석 예시 점수", "Sample performance score")}</small>
        </div>
      </div>
      <div
        className={s.scoreMetrics}
        title={score == null ? t(`이 데모에는 등급과 ${branding.scoreName}의 산정 기준이 정해지지 않았습니다.`, `Grades and ${branding.scoreName} are not defined for this demo.`) : t(`예시 지표로 계산한 ${branding.name} 등급이며, 전체 이용자 대비 백분위가 아닙니다.`, `Illustrative ${branding.name} grades calculated from sample metrics, not population percentiles.`)}
      >
        {metrics.map(({ label, value, grade, quality }) => (
          <div key={label}>
            <span>{label}</span>
            <strong>
              {value}
              <em className={grade === "S" || grade === "A" ? shared.green : grade === "C" ? shared.red : shared.yellow}>
                {grade}
              </em>
            </strong>
            <span className={s.scoreBar}><i style={{ width: `${quality}%` }} /></span>
          </div>
        ))}
      </div>
    </section>
  );
}
