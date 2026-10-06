"use client";

import { useLocale } from "../features/stats-shell/locale";

// 홈 분석 예시의 이름만 전환한다. 예시 점수와 카드 순서는 언어에 무관하다.
const analysisExamples = [
  { ko: "위치 선정", en: "Positioning", score: 87 },
  { ko: "팀 교전", en: "Team fights", score: 74 },
  { ko: "첫 교전", en: "Opening duels", score: 68 },
  { ko: "사이트 방어", en: "Site defense", score: 91 },
];

export function AnalysisExampleCards() {
  const { t } = useLocale();
  return (
    <section className="analysis-grid" aria-label={t("분석 예시", "Analysis examples")}>
      {analysisExamples.map((example) => (
        <article className="analysis-card" key={example.en}>
          <h2>{t(example.ko, example.en)}</h2>
          <strong>{example.score}</strong>
        </article>
      ))}
    </section>
  );
}
