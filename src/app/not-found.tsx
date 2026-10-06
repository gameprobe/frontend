import Link from "next/link";
import { SupportPage } from "../features/stats-shell/SupportPage";
import s from "../features/stats-shell/SupportPage.module.css";

/** 존재하지 않는 주소에서도 동일한 메뉴와 복귀 동선을 제공한다. */
export default function NotFound() {
  return (
    <SupportPage compact>
      <section lang="ko" aria-labelledby="page-not-found-heading">
        <p className="eyebrow">404 · Page not found</p>
        <h1 id="page-not-found-heading">페이지를 찾을 수 없어요</h1>
        <p>주소가 올바른지 확인하거나 아래 메뉴에서 다시 시작해 주세요.</p>
        <div className={s.actions}>
          <Link href="/">홈으로 돌아가기</Link>
          <Link href="/lineups">라인업 둘러보기</Link>
        </div>
      </section>
    </SupportPage>
  );
}
