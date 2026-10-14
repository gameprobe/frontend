import { useLocation } from "react-router-dom";
import { findUpcomingSection } from "@/app/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** 아직 구현하지 않은 Figma 섹션의 자리 표시 화면. */
export function ComingSoonPage() {
  const { pathname } = useLocation();
  const section = findUpcomingSection(pathname);

  return (
    <div className="container-page pt-8 pb-20 md:pt-10">
      <Card as="section" className="flex flex-col items-start gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-14 font-medium text-sub">준비 중 · 섹션 {section?.section}</p>
          <h1 className="text-24 font-semibold">{section?.title ?? "준비 중인 화면"}</h1>
          <p className="mt-2 text-15 text-sub">새 디자인으로 이 화면을 만들고 있어요. 조금만 기다려 주세요.</p>
        </div>
        <ButtonLink to="/">메인으로</ButtonLink>
      </Card>
    </div>
  );
}
