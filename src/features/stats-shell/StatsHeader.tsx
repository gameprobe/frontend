"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEventHandler, type RefObject } from "react";
import { branding } from "./branding";
import { supportedLanguages, useLocale } from "./locale";
import s from "./StatsShell.module.css";

/** 홈의 이동 링크와 프로필의 화면 내부 탭 버튼을 구분한다. */
export type StatsNavItem = { label: string; current?: boolean } & (
  | { href: string }
  | { onSelect: () => void }
);

type HeaderProps = {
  items: StatsNavItem[];
  /** 열림 상태는 부모가 유지한다. 별도 키보드 정책이 없으면 공통 Escape/초점 복원을 사용한다. */
  menu: {
    open: boolean;
    onToggle: () => void;
    buttonRef?: RefObject<HTMLButtonElement>;
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
    controlsId?: string;
  };
} & (
  | { mode: "home"; /** 보조 페이지는 홈 검색으로 이동하며, 홈 자체는 기존 앵커를 유지한다. */ searchHref?: string }
  | {
      mode: "profile";
      /** 입력 상태와 Mock 안내 판단은 TrackerProfile에 남긴다. */
      search: { value: string; onChange: (value: string) => void; onSubmit: () => void };
    }
);

/** 기존 홈/프로필 UI 아이콘의 경로와 선 끝 모양을 보존한다. 게임 자산과는 별개다. */
function HeaderIcon({ name, mode, size = 18 }: { name: "search" | "menu" | "arrow"; mode: HeaderProps["mode"]; size?: number }) {
  const rounded = mode === "profile" || name === "arrow";
  const paths = {
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    menu: "M3 6h18M3 12h18M3 18h18",
    arrow: "M4 12h16M14 5l7 7-7 7",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap={rounded ? "round" : undefined} strokeLinejoin={rounded ? "round" : undefined} aria-hidden="true">
      {name === "search" && mode === "home"
        ? <><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6" /></>
        : <path d={paths[name]} />}
    </svg>
  );
}

/** H01/P01: 표시 언어만 바꾸는 메뉴. 마우스 hover와 터치/키보드 조작을 함께 지원한다. */
function LanguageMenu() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openMode = useRef<"hover" | "click" | "keyboard" | null>(null);
  const id = useId();
  const options = () => Array.from(wrapperRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);

  function close(restoreFocus = false) {
    openMode.current = null;
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }

  function show(mode: "hover" | "click" | "keyboard", index?: number) {
    openMode.current = mode;
    setOpen(true);
    if (index !== undefined) requestAnimationFrame(() => {
      if (openMode.current === mode) options()[index]?.focus();
    });
  }

  useEffect(() => {
    if (!open) return;
    function onOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
        openMode.current = null;
        setOpen(false);
      }
    }
    // hover는 초점을 옮기지 않으므로 본문에 초점이 있어도 Escape로 닫을 수 있어야 한다.
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        openMode.current = null;
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointer);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return <div ref={wrapperRef} className={s.languageWrap}
    onPointerEnter={event => { if (event.pointerType === "mouse" && !open) show("hover"); }}
    onPointerLeave={() => {
      if (openMode.current === "hover" && !wrapperRef.current?.contains(document.activeElement)) close();
    }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    onKeyDown={event => {
      if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(true); }
    }}>
    <button ref={buttonRef} id={id} type="button" className={s.languageButton} lang="en"
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined}
      onClick={() => {
        if (open && openMode.current !== "hover") close();
        else show("click", supportedLanguages.findIndex(language => language.code === locale));
      }}
      onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          show("keyboard", event.key === "ArrowDown" ? 0 : supportedLanguages.length - 1);
        }
      }}>
      Language
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 6 5 5 5-5" /></svg>
    </button>
    {open && <div className={s.languageDropdown}>
      <div id={`${id}-menu`} role="menu" aria-labelledby={id} className={s.languageList}
        onKeyDown={event => {
          const items = options();
          const current = items.indexOf(document.activeElement as HTMLButtonElement);
          const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1
            : event.key === "ArrowDown" ? (current + 1) % items.length
            : event.key === "ArrowUp" ? (current - 1 + items.length) % items.length : null;
          if (next !== null) { event.preventDefault(); items[next]?.focus(); }
        }}>
        {supportedLanguages.map(language => <button key={language.code} type="button" role="menuitemradio"
          tabIndex={-1} aria-checked={locale === language.code} lang={language.code} className={s.languageOption}
          onClick={() => { setLocale(language.code); close(true); }}>
          {language.label}<span aria-hidden="true">{locale === language.code ? "✓" : ""}</span>
        </button>)}
      </div>
    </div>}
  </div>;
}

/** H01/P01: 공통 브랜드 바와 계정 연결 메뉴. mode는 기존 헤더 배치를 유지한다. */
function BrandBar({ mode }: { mode: HeaderProps["mode"] }) {
  const { copy } = useLocale();
  return (
    <div className={`${s.networkBar} ${mode === "home" ? s.homeHeader : ""}`}>
      <Link href="/" className={s.wordmark}>
        <span className={s.logo}>{branding.logoText}</span>{branding.name.toUpperCase()}
      </Link>
      <div className={s.networkGames}>
        <span className={s.networkActive}>VALORANT</span><span>PLAYER STATS</span><span>LINEUPS</span><span>{copy.demoPreview}</span>
      </div>
      <LanguageMenu />
      <Link className={s.accountLink} href="/connect" aria-label="Connect account">
        <span className={s.accountFull}>Connect account</span><span className={s.accountShort}>Connect</span>
        <HeaderIcon name="arrow" mode={mode} size={15} />
      </Link>
    </div>
  );
}

/** H02/P01: 같은 외형을 공유하지만 홈은 본문 검색 앵커, 프로필은 입력 폼이다. */
function SearchControl(props: HeaderProps) {
  const { t } = useLocale();
  const mark = <span className={s.gameMark}>V</span>;
  if (props.mode === "home") {
    return (
      <a className={`${s.search} ${s.searchShortcut}`} href={props.searchHref ?? "#riot-id"} aria-label={t("Riot ID 검색으로 이동", "Go to Riot ID search")}>
        {mark}<HeaderIcon name="search" mode="home" /><span>Search</span>
      </a>
    );
  }
  return (
    <form className={s.search} onSubmit={event => { event.preventDefault(); props.search.onSubmit(); }}>
      {mark}<HeaderIcon name="search" mode="profile" />
      <input aria-label="Search Riot ID" placeholder="Search" value={props.search.value} onChange={event => props.search.onChange(event.target.value)} />
    </form>
  );
}

/** H01~02/P01: 홈과 프로필의 모든 탭이 공유한다. nav를 감싸지 않아 기존 sticky 범위를 유지한다. */
export function StatsHeader(props: HeaderProps) {
  const { mode, items, menu } = props;
  const fallbackMenuButtonRef = useRef<HTMLButtonElement>(null);
  const fallbackMenuId = useId();
  const menuButtonRef = menu.buttonRef ?? fallbackMenuButtonRef;
  const menuId = menu.controlsId ?? fallbackMenuId;

  return <>
    <BrandBar mode={mode} />
    <nav className={`${s.nav} ${mode === "home" ? s.homeHeader : ""}`} aria-label="Valorant navigation">
      <SearchControl {...props} />
      <div className={s.navLinks}>
        {items.map(item => "href" in item
          ? <Link key={item.label} href={item.href} aria-current={item.current ? "page" : undefined} className={item.current ? s.activeLink : undefined}>{item.label}</Link>
          : <button key={item.label} type="button" onClick={item.onSelect} aria-current={item.current ? "page" : undefined} className={item.current ? s.activeLink : undefined}>{item.label}</button>)}
      </div>
      <div className={s.menuWrap} onKeyDown={menu.onKeyDown ?? (event => {
        if (event.key === "Escape" && menu.open) {
          event.preventDefault();
          menu.onToggle();
          menuButtonRef.current?.focus();
        }
      })}>
        <button ref={menuButtonRef} type="button" className={s.menuButton} onClick={menu.onToggle} aria-expanded={menu.open} aria-controls={menuId} aria-label="More navigation">
          <HeaderIcon name="menu" mode={mode} /><span>More</span>
        </button>
        {menu.open && <div className={s.dropdown} id={menuId}>
          <Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms of service</Link><Link href="/connect">Connect account</Link>
        </div>}
      </div>
    </nav>
  </>;
}
