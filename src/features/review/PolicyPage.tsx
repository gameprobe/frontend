import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { ReviewShell } from "@/features/review/ReviewShell";
import { PRIVACY, TERMS } from "@/features/review/policy-content";
import { useReviewLanguage, CONTACT_EMAIL, reviewLink } from "@/features/review/review-content";

export function PolicyPage({ kind }: { kind: "privacy" | "terms" }) {
  const [language] = useReviewLanguage();
  const en = language === "en";
  const privacy = kind === "privacy";
  const sections = (privacy ? PRIVACY : TERMS)[language];
  return (
    <ReviewShell eyebrow={privacy ? "PRIVACY NOTICE" : "TERMS OF USE"} title={privacy ? (en ? "Your data, clearly explained." : "정보가 어디에 남는지 알려드릴게요.") : (en ? "Using GameProbe." : "GameProbe 이용 안내")} intro={en ? "Public demo draft · Updated October 15, 2026. This describes the current prototype; real-data processing is not active." : "공개 데모 초안 · 2026년 10월 15일 갱신. 현재 프로토타입의 동작을 설명하며, 실제 전적 데이터 처리는 아직 시작하지 않았어요."}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-4">{sections.map((section) => <Card as="section" key={section.title} className="p-6 md:p-8"><h2 className="mb-3 text-20 font-semibold">{section.title}</h2><p className="text-15 leading-relaxed text-sub">{section.body}</p></Card>)}</div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <Card className="flex flex-col gap-3 p-6">
            <h2 className="text-18 font-semibold">{en ? "Contact" : "문의 및 권리 요청"}</h2>
            <p className="text-14 text-sub">ShinJungho</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-14 text-primary hover:underline">{CONTACT_EMAIL}</a>
            <Link className="mt-3 text-14 text-sub hover:text-main" to={reviewLink(privacy ? "/terms" : "/privacy", language)}>{privacy ? (en ? "Read terms →" : "이용약관 보기 →") : (en ? "Read privacy notice →" : "개인정보 안내 보기 →")}</Link>
          </Card>
          {privacy && <Card className="flex flex-col gap-3 p-6 text-14"><h2 className="text-18 font-semibold">{en ? "Provider notices" : "제공자 안내"}</h2><a className="text-primary hover:underline" href="https://vercel.com/legal/privacy-notice">Vercel Privacy Notice ↗</a><a className="text-primary hover:underline" href="https://policies.google.com/privacy">Google / YouTube Privacy ↗</a><a className="text-primary hover:underline" href="https://policies.google.com/technologies/retention">{en ? "Google retention" : "Google 보관·삭제"} ↗</a></Card>}
        </aside>
      </div>
    </ReviewShell>
  );
}
