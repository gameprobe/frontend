type FooterProps = {
  showDataNotice: boolean;
};

/** Figma footer(53:324). */
export function Footer({ showDataNotice }: FooterProps) {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-1 py-6 text-12 text-sub-weak md:flex-row md:justify-between md:gap-6">
        <p>GAMEPROBE는 Riot Games가 보증하거나 후원하지 않는 팬 서비스예요.</p>
        {showDataNotice && <p>표시된 전적은 프로토타입용 예시 데이터예요.</p>}
      </div>
    </footer>
  );
}
