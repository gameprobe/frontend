import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ReviewShell } from "@/features/review/ReviewShell";
import { useReviewLanguage, DEMO_MATCH_PATH, DEMO_PROFILE_PATH } from "@/features/review/review-content";

export function InsightsPage() {
  const [language] = useReviewLanguage();
  const en = language === "en";
  const findings = en ? [
    { tag: "POSITION", title: "Leave room to disengage", observation: "Example scenario: a player takes an exposed fight before a teammate can support them.", reference: "Proposed comparison: examine similar completed-round situations in permitted high-tier reference records, with matching map, agent role and side.", action: "Review whether cover and a teammate's line of sight were available before the engagement.", limit: "A kill-event location is only a snapshot. It cannot establish the full movement path or what the player could see." },
    { tag: "TIMING", title: "Look at the gap between engagements", observation: "Example scenario: an initial duel ends before a second teammate can respond.", reference: "Proposed comparison: compare intervals between recorded events in similar rounds; show the events used as evidence.", action: "Review the moment of contact with a teammate and discuss whether the engagement could have been coordinated.", limit: "Event timestamps alone cannot establish intent, voice communication, or every ability activation." },
    { tag: "HABITS", title: "Check repeated early engagements", observation: "Example scenario: a similar exposed first duel appears across multiple completed matches.", reference: "Proposed comparison: check for recurrence across enough comparable rounds, showing sample size and uncertainty.", action: "Choose one habit to review in your next post-match session. Revisit it over several matches before drawing a conclusion.", limit: "One death does not prove a bad habit. This example contains no measured recurrence or real performance prediction." },
  ] : [
    { tag: "POSITION", title: "교전 후 빠져나올 여지를 남기기", observation: "예시 상황: 팀원이 도와주기 전에 엄폐물 밖에서 먼저 교전을 시작했어요.", reference: "비교 계획: 사용 허가를 받은 상위권 기록 중 맵·요원 역할·공수와 라운드 상황이 비슷한 사례를 찾아 비교해요.", action: "교전 전에 엄폐물과 팀원의 지원 시야가 확보됐는지 복기해 보세요.", limit: "킬 이벤트의 위치는 한 시점의 기록이에요. 전체 이동 경로나 플레이어가 본 시야를 재구성할 수는 없어요." },
    { tag: "TIMING", title: "팀원과 교전 간격 맞춰보기", observation: "예시 상황: 첫 교전이 끝난 뒤에야 다른 팀원이 대응할 수 있었어요.", reference: "비교 계획: 비슷한 라운드에서 기록된 이벤트 사이의 시간 간격을 비교하고 근거 이벤트를 함께 보여줘요.", action: "팀원과 접촉 순간을 돌아보며 함께 대응할 수 있었던 시점이 있었는지 이야기해 보세요.", limit: "이벤트 시각만으로 의도·음성 대화·모든 스킬 사용 시점을 단정할 수 없어요." },
    { tag: "HABITS", title: "반복되는 초반 교전 점검하기", observation: "예시 상황: 여러 경기에서 비슷한 위치의 무리한 첫 교전이 반복됐어요.", reference: "비교 계획: 충분한 유사 라운드에서 반복 여부를 확인하고 표본 수와 불확실성을 함께 보여줘요.", action: "다음 복기에서 확인할 습관을 하나만 정하고, 여러 경기의 변화를 관찰해 보세요.", limit: "한 번의 데스만으로 나쁜 습관을 판정하지 않아요. 이 예시는 실제 반복 빈도나 성과 예측을 계산한 결과가 아니에요." },
  ];
  return (
    <ReviewShell eyebrow="INSIGHTS / ILLUSTRATIVE REPORT" title={en ? "Understand the decisions behind a match." : "결과 너머의 플레이 습관을 돌아보세요."} intro={en ? "A preview of the coaching experience we plan to build: your play style, engagement positions, timing and recurring habits, compared with appropriately permitted high-tier reference records." : "내 플레이 스타일을 허용된 최상위권 참고 기록과 비교해 교전 위치·타이밍·반복 습관을 돌아보는 코칭 경험을 준비하고 있어요."}>
      <div role="note" className="rounded-card border border-primary/40 bg-primary-soft p-5 text-15 leading-relaxed">
        <p className="font-semibold text-primary">{en ? "Illustrative only · Not an AI-generated analysis" : "설명용 예시 · 실제 AI 분석 결과가 아니에요"}</p>
        <p className="mt-2 text-sub">{en ? "All scenarios and comparisons below are fictional editorial examples, separate from the sample match statistics. We do not currently collect real Riot player data, hold a real high-tier reference dataset, or run a trained coaching model." : "아래 상황과 비교는 리포트 형식을 설명하기 위해 작성한 가상 예시이며, 예시 경기의 통계에서 도출한 결론이 아니에요. 현재 실제 Riot 플레이어 데이터·최상위권 비교 데이터셋·학습된 코칭 모델은 사용하지 않아요."}</p>
      </div>
      <section aria-labelledby="style-title" className="grid gap-5 md:grid-cols-[1fr_2fr]">
        <Card className="flex flex-col gap-4 p-6 md:p-8">
          <p className="text-13 font-semibold text-sub">{en ? "EXAMPLE STYLE" : "플레이 스타일 예시"}</p>
          <h2 id="style-title" className="text-24 font-semibold">{en ? "Taking the initiative" : "먼저 기회를 만드는 플레이"}</h2>
          <p className="text-15 leading-relaxed text-sub">{en ? "Initiative may create openings. The review asks whether positioning and support made those openings sustainable." : "적극적인 교전으로 기회를 만드는 스타일을 가정했어요. 그 기회를 이어갈 위치와 팀 지원이 있었는지 함께 살펴봐요."}</p>
          <span className="w-fit rounded-lg bg-elevated px-3 py-2 text-13 text-sub">{en ? "Fictional scenario" : "가상 시나리오"}</span>
        </Card>
        <Card className="flex flex-col justify-center gap-4 p-6 md:p-8">
          <h2 className="text-20 font-semibold">{en ? "Evidence first, conclusions second" : "판단보다 근거를 먼저 보여드릴게요"}</h2>
          <p className="text-15 leading-relaxed text-sub">{en ? "Future reports should distinguish recorded facts, comparisons and hypotheses. Missing evidence should remain unknown. Reference players must have permitted the intended use; one player's consent cannot authorize everyone in a match." : "향후 리포트에서는 관찰된 기록·비교·추정을 구분하고, 근거가 없는 부분은 알 수 없다고 표시할 예정이에요. 비교 선수의 데이터도 사용 범위에 맞는 허용이 필요하며, 한 이용자의 동의가 경기 전체 선수의 공개를 허용하지는 않아요."}</p>
          <div className="flex flex-wrap gap-2"><ButtonLink to={DEMO_PROFILE_PATH} variant="secondary">{en ? "Sample profile" : "예시 프로필"}</ButtonLink><ButtonLink to={DEMO_MATCH_PATH} variant="secondary">{en ? "Sample match" : "예시 경기"}</ButtonLink></div>
        </Card>
      </section>
      <section aria-label={en ? "Example observations" : "분석 항목 예시"} className="grid gap-4 lg:grid-cols-3">
        {findings.map((finding, index) => <Card key={finding.tag} as="article" className="flex flex-col gap-5 p-6">
          <p lang="en" className="text-13 font-semibold tracking-widest text-primary">0{index + 1} / {finding.tag}</p>
          <h2 className="text-20 font-semibold">{finding.title}</h2>
          <p className="text-15 leading-relaxed text-sub">{finding.observation}</p>
          <p className="border-t border-line pt-4 text-14 leading-relaxed text-sub">{finding.reference}</p>
          <div className="rounded-thumb bg-elevated p-4"><h3 className="mb-2 text-14 font-semibold">{en ? "Next review focus" : "다음 복기에서 확인할 것"}</h3><p className="text-14 leading-relaxed">{finding.action}</p></div>
          <p className="mt-auto text-13 leading-relaxed text-sub">{finding.limit}</p>
        </Card>)}
      </section>
      <p className="border-t border-line pt-6 text-14 leading-relaxed text-sub">{en ? "Planned scope: completed-match review only. No live tactical directions, opponent scouting, alternate MMR, or esports feed. Production API approval and RSO must precede real player-data access; reference-data and model-training use require confirmation with Riot." : "계획 범위는 종료된 경기의 복기예요. 실시간 전술 지시·상대 정찰·별도 MMR·e스포츠 데이터 제공은 하지 않아요. 실제 데이터 접근 전 Production API 승인과 RSO 구현이 필요하고, 비교 데이터·모델 학습의 사용 범위는 Riot과 확인해야 해요."}</p>
    </ReviewShell>
  );
}
