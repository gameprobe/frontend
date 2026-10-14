import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { isNavItemActive, NAV_ITEMS } from "@/app/navigation";
import gpBoxLogo from "@/assets/logo/gp-box.svg";
import wordmarkLogo from "@/assets/logo/wordmark.svg";
import menuCloseIcon from "@/assets/icons/menu-close.svg";
import menuIcon from "@/assets/icons/menu.svg";
import searchIcon from "@/assets/icons/search.svg";
import { ButtonLink } from "@/components/ui/Button";
import { useMockSession } from "@/features/my/my-store";
import { usePlayerSearch } from "@/features/search/usePlayerSearch";
import { agentIconPath } from "@/lib/assets";
import { cx } from "@/lib/cx";
import { formatRiotId } from "@/lib/riot-id";
import { PROBE_PROFILE } from "@/mocks/profile";

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return NAV_ITEMS.map((item) => {
    const active = isNavItemActive(item, pathname);
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cx(
          "flex items-center rounded-lg px-3 py-2 text-15 font-medium transition-colors",
          active ? "bg-primary-soft text-primary" : "text-sub hover:text-main",
        )}
      >
        {item.label}
      </Link>
    );
  });
}

/** 헤더 검색창 (Header / PC Search=On). 메인·전적 검색 화면에는 본문에 큰 검색창이 있어 숨긴다. */
function HeaderSearch() {
  const search = usePlayerSearch();
  const [value, setValue] = useState("");
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    search(value);
    setValue("");
  };
  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="hidden h-10 w-[300px] items-center gap-2 rounded-lg border border-line bg-elevated px-3 focus-within:border-primary xl:flex"
    >
      <img src={searchIcon} alt="" width={16} height={16} />
      <label className="flex min-w-0 flex-1 px-1">
        <span className="sr-only">Riot ID 검색</span>
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="이름#태그 검색"
          autoComplete="off"
          enterKeyHint="search"
          className="w-full min-w-0 bg-transparent text-14 text-main outline-none placeholder:text-disabled [&::-webkit-search-cancel-button]:hidden"
        />
      </label>
    </form>
  );
}

/** Figma Header / PC(98:8105). lg 미만은 메뉴가 6개라 햄버거로 접는다. */
/** Figma Header / PC의 Auth: Guest = '라이엇 로그인' 버튼, User = 아바타 + Riot ID (98:8100) */
function AuthButton({ fullWidth, onNavigate }: { fullWidth?: boolean; onNavigate?: () => void }) {
  const { session } = useMockSession();
  if (!session) {
    return (
      <ButtonLink to="/my" size="md" className={fullWidth ? "w-full" : undefined} onClick={onNavigate}>
        라이엇 로그인
      </ButtonLink>
    );
  }
  return (
    <Link
      to="/my"
      onClick={onNavigate}
      className={cx(
        "flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 text-14 font-medium whitespace-nowrap hover:border-line-strong",
        fullWidth && "w-full",
      )}
    >
      <img src={agentIconPath(PROBE_PROFILE.agentId)} alt="" className="size-8 rounded-full object-cover" />
      {formatRiotId(session)}
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const showSearch = pathname !== "/" && pathname !== "/search";

  // 뒤로 가기 등 메뉴 밖에서 경로가 바뀌어도 닫는다
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-page">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Figma Logo / Simple C · GP Box (163:32) */}
          <Link to="/" aria-label="GAMEPROBE 홈" className="flex shrink-0 items-center gap-2.5">
            <img src={gpBoxLogo} alt="" width={40} height={40} />
            <span className="flex flex-col gap-[3px]">
              <img src={wordmarkLogo} alt="" width={135.737} height={21.48} />
              <span aria-hidden className="h-0.5 rounded-[1px] bg-primary" />
            </span>
          </Link>
          <nav aria-label="주요 메뉴" className="hidden gap-1 lg:flex">
            <NavItems pathname={pathname} />
          </nav>
        </div>
        <div className="flex items-center gap-2 xl:gap-6">
          {showSearch && <HeaderSearch />}
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg hover:bg-elevated lg:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img src={menuOpen ? menuCloseIcon : menuIcon} alt="" width={24} height={24} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="주요 메뉴"
          className="container-page flex flex-col gap-1 border-t border-line pt-3 pb-4 lg:hidden"
        >
          <NavItems pathname={pathname} onNavigate={closeMenu} />
          <div className="mt-2 sm:hidden">
            <AuthButton fullWidth onNavigate={closeMenu} />
          </div>
        </nav>
      )}
    </header>
  );
}
