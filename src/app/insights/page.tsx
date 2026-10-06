"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SupportPage } from "../../features/stats-shell/SupportPage";
import { useLocale } from "../../features/stats-shell/locale";
import s from "./Insights.module.css";

const topics = [
  {
    key: "position", label: ["교전 위치", "Positioning"],
    title: ["지원받기 어려운 첫 교전", "Opening fights without nearby support"],
    observation: ["예시 12라운드 중 5라운드에서 첫 사망 시 가까운 아군이 없었습니다. 가상 비교군에서는 2라운드였습니다.", "In 5 of 12 example rounds, no teammate was nearby at the first death. The fictional comparison group shows 2 of 12."],
    caution: ["처치 시점의 위치만으로 아군의 시야·장애물·지원 가능 여부를 확정할 수 없습니다. 실제 고립 여부는 복기할 질문입니다.", "A kill-event snapshot cannot establish sightlines, obstacles or whether a teammate could help. Isolation is a question to review, not a proven cause."],
    practice: ["다음 경기에서는 첫 교전 전에 아군과 진입 순서를 맞추고, 교환 가능한 간격인지 확인해 보세요.", "Before your opening fight next match, agree on the entry order and check whether a teammate can trade."],
    round: ["R04 · 라운드 시작 18초", "R04 · 18 seconds into the round"],
    event: ["첫 사망 위치 주변의 아군 간격을 확인", "Review teammate spacing around the first death"],
    values: [5, 2], unit: ["지원 간격을 복기할 라운드 / 12", "Rounds to review for spacing / 12"],
  },
  {
    key: "timing", label: ["교전 타이밍", "Timing"],
    title: ["라운드 초반에 반복된 첫 사망", "Repeated first deaths early in the round"],
    observation: ["예시 12라운드 중 시작 20초 안에 먼저 사망한 라운드는 4개입니다. 가상 비교군에서는 1개입니다.", "In 4 of 12 example rounds, the first death occurred within 20 seconds. The fictional comparison group shows 1 of 12."],
    caution: ["초반 교전 자체가 실수는 아닙니다. 진입 역할·팀 전략·장비 차이를 함께 살펴야 하며, 이 예시의 20초는 보편적인 기준이 아닙니다.", "An early fight is not inherently a mistake. Entry role, team strategy and equipment matter; the 20-second threshold is illustrative, not universal."],
    practice: ["첫 교전 전에 아군 스킬과 합류 준비를 확인해 보세요. 늦게 싸우는 것보다 팀의 준비와 교전 시점을 맞추는 것이 목표입니다.", "Check teammate utility and readiness before committing. The goal is coordinated timing, not simply fighting later."],
    round: ["R07 · 라운드 시작 14초", "R07 · 14 seconds into the round"],
    event: ["진입 시점과 팀 준비 상태를 함께 복기", "Review entry timing alongside team readiness"],
    values: [4, 1], unit: ["20초 이내 첫 사망 라운드 / 12", "First-death rounds within 20 seconds / 12"],
  },
  {
    key: "habits", label: ["반복 습관", "Habits"],
    title: ["유사한 상황에서 되풀이된 위험", "A risk that appears in similar situations"],
    observation: ["초반 첫 사망과 아군 간격을 함께 확인할 장면이 예시에서 3회 반복됩니다. 가상 비교군에서는 1회입니다.", "The example contains 3 scenes combining an early first death with spacing worth reviewing. The fictional comparison group contains 1."],
    caution: ["몇 번의 유사 장면만으로 나쁜 습관이라고 단정하지 않습니다. 맵·요원·진영·장비·패치가 비슷한 충분한 경기에서 반복되는지 확인해야 합니다.", "A few similar scenes do not establish a bad habit. Review enough comparable matches, accounting for map, agent, side, equipment and patch."],
    practice: ["다음 3경기는 ‘첫 교전 전 아군과 합류 시점 확인’ 하나에 집중하세요. 경기 후 지원 준비가 된 교전과 그렇지 않은 교전을 직접 비교해 보세요.", "For your next 3 matches, focus on checking teammate readiness before the first fight. Afterwards, compare coordinated fights with those taken before support was ready."],
    round: ["R04 · R07 · R11", "R04 · R07 · R11"],
    event: ["비슷한 장면을 모아 한 가지 연습 목표로 연결", "Group similar scenes into one practice goal"],
    values: [3, 1], unit: ["반복 확인이 필요한 장면 / 12", "Scenes requiring further review / 12"],
  },
] as const;

export default function InsightsPage() {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const topic = topics[active];
  const text = (value: readonly [string, string]) => t(value[0], value[1]);

  return <SupportPage wide><div className={s.report}>
    <header className={s.hero}>
      <p className={s.eyebrow}>GAMEPROBE / POST-MATCH LAB</p>
      <h1>{t("내 플레이, 다음 한 걸음", "Your play. Your next step.")}</h1>
      <p>{t("스타일을 이해하고, 교전의 이유를 돌아보고, 다음 경기에서 바꿀 한 가지를 찾으세요.", "Understand your style, revisit your fights, and find one thing to practice next match.")}</p>
      <div className={s.tags}><span>{t("경기 종료 후 복기", "Post-match review")}</span><span>{t("예시 분석 리포트", "Example analysis report")}</span></div>
    </header>

    <aside className={s.notice} aria-label={t("데모 데이터 안내", "Demo data notice")}>
      <strong>{t("실제 AI 분석 결과가 아닌 화면 예시입니다.", "An interface example, not a live AI result.")}</strong>
      <p>{t("아래 수치·장면·상위권 가상 비교군은 설명을 위해 만든 별도 예시입니다. DemoPlayer01의 실제 통계에서 계산하지 않았으며, 학습 모델이나 실제 상위권 데이터셋은 아직 연결하지 않았습니다.", "All values, scenes and the fictional comparison group representing top-tier play are illustrative. They are separate from DemoPlayer01’s statistics. No trained model or real top-tier dataset is connected.")}</p>
    </aside>

    <section className={s.styleCard} aria-labelledby="style-title">
      <div><p className={s.eyebrow}>01 / PLAY STYLE</p><h2 id="style-title">{t("주도적으로 먼저 싸우는 스타일", "A proactive opening style")}</h2><p>{t("먼저 공간을 만드는 시도는 강점이 될 수 있습니다. 이번 예시에서 돌아볼 부분은 공격성 자체보다 아군과의 간격과 합류 시점입니다.", "Taking space can be a strength. This example focuses on spacing and coordination rather than treating aggression itself as a flaw.")}</p></div>
      <div className={s.context}><strong>ASCENT / JETT</strong><span>{t("공격 진영 · 예시 12라운드", "Attack side · 12 example rounds")}</span><span>{t("같은 맵·요원·진영으로 비교", "Compare the same map, agent and side")}</span></div>
    </section>

    <section aria-labelledby="review-title">
      <p className={s.eyebrow}>02 / REVIEW THE EVIDENCE</p><h2 id="review-title">{t("차이를 보고, 이유를 질문하세요", "Notice the difference. Question the cause.")}</h2>
      <div className={s.tabs} role="tablist" aria-label={t("분석 항목", "Analysis topics")}>
        {topics.map((item, index) => <button key={item.key} ref={el => { tabRefs.current[index] = el; }} type="button" role="tab" id={`insight-tab-${item.key}`} aria-selected={active === index} aria-controls={`insight-panel-${item.key}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
          const next = event.key === "ArrowRight" ? (index + 1) % topics.length : event.key === "ArrowLeft" ? (index + topics.length - 1) % topics.length : event.key === "Home" ? 0 : event.key === "End" ? topics.length - 1 : null;
          if (next !== null) { event.preventDefault(); setActive(next); tabRefs.current[next]?.focus(); }
        }}>{text(item.label)}</button>)}
      </div>
      <div className={s.panel} role="tabpanel" id={`insight-panel-${topic.key}`} aria-labelledby={`insight-tab-${topic.key}`} tabIndex={0}>
        <h3>{text(topic.title)}</h3><p>{text(topic.observation)}</p>
        <div className={s.comparison} aria-label={text(topic.unit)}>
          {[t("내 플레이 예시", "Player example"), t("상위권 가상 비교군", "Fictional top-tier group")].map((label, index) => <div key={label} className={s.barRow}><span>{label}</span><div className={s.track}><div style={{width: `${topic.values[index] / 12 * 100}%`}} className={index === 0 ? s.playerBar : s.referenceBar} /></div><strong>{topic.values[index]} / 12</strong></div>)}
          <small>{text(topic.unit)} · {t("실측 통계가 아닙니다", "Not measured statistics")}</small>
        </div>
        <div className={s.evidence}><span>{text(topic.round)}</span><strong>{text(topic.event)}</strong><p>{text(topic.caution)}</p></div>
        <div className={s.practice}><span>{t("다음 경기의 연습 목표", "Practice goal for your next match")}</span><p>{text(topic.practice)}</p></div>
      </div>
    </section>

    <section className={s.method} aria-labelledby="method-title"><p className={s.eyebrow}>03 / WHAT COMES NEXT</p><h2 id="method-title">{t("실제 분석으로 이어지는 과정", "The path to real analysis")}</h2>
      <ol><li><strong>{t("동의한 경기 데이터", "Consented match data")}</strong><p>{t("RSO 연결 후 종료된 경기만 사용하고, 자신의 복기와 비교·모델 학습의 목적을 구분해 안내할 계획입니다.", "Use completed matches after RSO verification, with clear distinctions between personal review, reference comparisons and model training.")}</p></li>
      <li><strong>{t("비교 가능한 상위권 사례", "Comparable top-tier examples")}</strong><p>{t("적법하게 확보하고 사용이 허용된 데이터에서 맵·요원·진영·패치·장비 조건을 맞춥니다. 비교 가능한 표본이 부족하면 분석을 보류합니다.", "Use lawfully obtained, permitted data matched by map, agent, side, patch and equipment. Withhold conclusions when comparable samples are insufficient.")}</p></li>
      <li><strong>{t("근거가 보이는 학습 모델", "Evidence-led models")}</strong><p>{t("위치·처치 시각 등 관측 정보로 패턴을 학습하는 것이 목표입니다. 결론과 근거 장면·표본 수·한계를 함께 보여주며, 실시간 지시나 숨은 MMR 예측은 제공하지 않습니다.", "The goal is to learn patterns from observed positions and kill-event timing, showing evidence, sample sizes and limitations. No live-game instructions or hidden-MMR predictions.")}</p></li></ol>
      <p className={s.limit}>{t("API 이벤트는 연속 리플레이가 아닙니다. 조준 움직임·모든 이동 경로·음성 소통·판단 의도는 이 정보만으로 확정할 수 없습니다. 실제 학습은 Riot 허용 범위, 데이터 출처·동의 및 삭제 방침을 확인한 후 진행합니다.", "API events are not a continuous replay. They cannot establish aim motion, every movement path, voice communications or intent. Actual training will follow confirmation of Riot’s permitted use, data provenance, consent and deletion policies.")}</p>
    </section>
    <div className={s.actions}><Link href="/connect">{t("계정 공개 동의 체험", "Try sharing consent")}</Link><Link href="/players/demo-player-01">{t("예시 전적 보기", "View example match history")}</Link></div>
  </div></SupportPage>;
}
