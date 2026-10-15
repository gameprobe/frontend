import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { ReviewShell } from "@/features/review/ReviewShell";
import { useReviewLanguage, CONTACT_EMAIL, DEMO_MATCH_PATH, DEMO_PROFILE_PATH, reviewLink } from "@/features/review/review-content";

export function ReviewPage() {
  const [language] = useReviewLanguage();
  const en = language === "en";
  const steps = [
    { number: "01", title: en ? "Explore a player" : "플레이어 전적 살펴보기", text: en ? "Open the fictional 프로브#KR1 profile. Review match history and agent, map and weapon tabs." : "가상 플레이어 프로브#KR1의 전적과 요원·맵·무기별 통계를 살펴보세요.", to: DEMO_PROFILE_PATH, action: en ? "Open sample profile" : "예시 프로필 보기" },
    { number: "02", title: en ? "Review a completed match" : "끝난 경기를 라운드별로 복기하기", text: en ? "Explore the sample Sunset match: scoreboard, rounds, economy and player comparison. These are illustrative records." : "선셋 예시 경기의 스코어보드, 라운드, 경제와 플레이어 비교를 확인하세요. 실제 경기 기록은 아니에요.", to: DEMO_MATCH_PATH, action: en ? "Open sample match" : "예시 경기 보기" },
    { number: "03", title: en ? "Try the consent flow" : "동의부터 연결 해제까지 체험하기", text: en ? "Select the two required checkboxes, then preview the account screen. Use ‘예시 연결 해제’ to remove the browser-only session. This does not sign in to Riot." : "기본 해제된 필수 항목을 선택하고 예시 계정 화면으로 이동해 보세요. ‘예시 연결 해제’로 브라우저의 체험 상태를 지울 수 있어요.", to: "/my/consent", action: en ? "Open consent demo" : "연결 과정 체험" },
    { number: "04", title: en ? "Preview coaching feedback" : "내 플레이를 돌아보는 분석 예시", text: en ? "Read an illustrative report on engagement position, timing and repeated habits. No trained model or real elite-player dataset is used." : "교전 위치·타이밍·반복 습관에 대한 리포트 형식을 확인하세요. 학습된 AI나 실제 최상위권 데이터의 분석 결과는 아니에요.", to: reviewLink("/insights", language), action: en ? "Open example report" : "예시 분석 리포트" },
  ];
  return (
    <ReviewShell eyebrow="PUBLIC DEMO" title={en ? "A better review after every match." : "한 경기의 기록을, 다음 경기의 성장으로."} intro={en ? "GameProbe is a free VALORANT website for post-match learning, initially focused on Korean players. Explore this public prototype without an account or download. Main product screens are currently in Korean; this guide, report and policy pages also support English." : "GameProbe는 한국 이용자를 중심으로 준비 중인 무료 VALORANT 경기 복기 서비스예요. 계정 생성이나 설치 없이 공개 예시를 둘러보고, 앞으로 제공할 피드백을 확인할 수 있어요."}>
      <Card as="section" className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-18 font-semibold text-win">{en ? "Available in this demo" : "지금 체험할 수 있어요"}</h2>
          <p className="text-15 leading-relaxed text-sub">{en ? "Fictional profiles and statistics, one detailed sample match, ranking and meta mockups, manually browsed lineups and smoke guides, browser-only favorites and account flow, and an illustrative coaching report." : "가상 전적·통계, 상세 예시 경기 1개, 랭킹·메타 화면, 직접 찾아보는 라인업·스모크 가이드, 브라우저 즐겨찾기·연결 체험, 분석 리포트 예시를 제공해요."}</p>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-18 font-semibold text-primary">{en ? "Planned after approval" : "승인 후 구현할 예정이에요"}</h2>
          <p className="text-15 leading-relaxed text-sub">{en ? "Riot Sign On, server-side consent and access controls, consenting players’ completed-match data, unlinking and deletion. AI coaching requires permitted reference data and Riot confirmation before any training use." : "Riot Sign On, 서버 동의 기록·접근 제어, 동의한 이용자의 종료된 경기 데이터, 연결 해제·삭제 처리를 구현할 예정이에요. AI 학습은 허용된 비교 데이터와 Riot의 사용 범위 확인이 먼저 필요해요."}</p>
        </div>
      </Card>
      <section aria-labelledby="walkthrough-title" className="flex flex-col gap-5">
        <h2 id="walkthrough-title" className="text-24 font-semibold">{en ? "Walk through the experience" : "이 순서로 둘러보세요"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {steps.map((step) => <Card key={step.number} as="article" className="flex flex-col items-start gap-4 p-6 md:p-8">
            <span lang="en" className="text-24 font-semibold text-primary">{step.number}</span>
            <h3 className="text-20 font-semibold">{step.title}</h3>
            <p className="flex-1 text-15 leading-relaxed text-sub">{step.text}</p>
            <ButtonLink to={step.to} variant="secondary" className="mt-2">{step.action}</ButtonLink>
          </Card>)}
        </div>
      </section>
      <Card as="section" className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
        <div className="flex max-w-[680px] flex-col gap-2">
          <h2 className="text-20 font-semibold">{en ? "Learn between matches" : "경기 사이, 필요한 가이드를 찾아보세요"}</h2>
          <p className="text-15 text-sub">{en ? "Browse maps, agents, lineup positions and smoke examples manually. GameProbe does not read an active game, scout opponents or issue live tactical directions." : "맵과 요원을 직접 선택해 라인업과 스모크 예시를 찾아보세요. 진행 중인 게임을 읽거나 상대를 정찰하고 실시간 전술을 지시하는 기능은 제공하지 않아요."}</p>
        </div>
        <div className="flex flex-wrap gap-2"><ButtonLink to="/lineups">{en ? "Lineups" : "라인업"}</ButtonLink><ButtonLink to="/smokes" variant="secondary">{en ? "Smoke guides" : "스모크"}</ButtonLink></div>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-14 text-sub">
        <p>{en ? "Operator & privacy contact" : "운영·개인정보 담당"}: ShinJungho · <a className="text-primary hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        <div className="flex gap-5"><Link to={reviewLink("/privacy", language)} className="hover:text-main">{en ? "Privacy" : "개인정보 안내"}</Link><Link to={reviewLink("/terms", language)} className="hover:text-main">{en ? "Terms" : "이용약관"}</Link></div>
      </div>
    </ReviewShell>
  );
}
