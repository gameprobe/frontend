import Link from "next/link";

const navigationItems = [
  { href: "/lineups", label: "Lineups" },
  { href: "/smokes", label: "Smokes" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/connect", label: "Connect" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" href="/">
        GameProbe
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
