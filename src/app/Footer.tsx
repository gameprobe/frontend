import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "@/features/review/review-content";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-5 py-6 text-12 text-sub">
        <nav aria-label="서비스 안내" className="flex flex-wrap gap-x-6 gap-y-3 text-13">
          <Link to="/review" className="hover:text-main">서비스 안내 / Demo guide</Link>
          <Link to="/insights" className="hover:text-main">분석 리포트 예시</Link>
          <Link to="/privacy" className="hover:text-main">개인정보 안내</Link>
          <Link to="/terms" className="hover:text-main">이용약관</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-main">문의하기</a>
        </nav>
        <div className="flex flex-wrap justify-between gap-3">
          <p>GAMEPROBE는 Riot Games가 보증하거나 후원하지 않는 팬 서비스예요.</p>
          <p>운영·개인정보 담당 ShinJungho · {CONTACT_EMAIL}</p>
        </div>
      </div>
    </footer>
  );
}
