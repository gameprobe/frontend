import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function NotFoundPage() {
  return (
    <div className="container-page pt-8 pb-20 md:pt-10">
      <Card as="section" className="flex flex-col items-start gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <p lang="en" className="text-14 font-medium text-sub">404</p>
          <h1 className="text-24 font-semibold">페이지를 찾을 수 없어요</h1>
          <p className="mt-2 text-15 text-sub">주소가 바뀌었거나 없는 페이지예요.</p>
        </div>
        <ButtonLink to="/">메인으로</ButtonLink>
      </Card>
    </div>
  );
}
