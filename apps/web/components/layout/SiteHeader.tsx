"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, getCopy } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

function normalizePath(pathname: string) {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function SiteHeader({ locale }: Props) {
  const copy = getCopy(locale);
  const pathname = normalizePath(usePathname() || "");

  const navItems = [
    { href: `/${locale}`, label: copy.nav.home },
    { href: `/${locale}/demo`, label: copy.nav.demo },
    { href: `/${locale}/download`, label: copy.nav.download },
    { href: `/${locale}/how-it-works`, label: copy.nav.howItWorks },
    { href: `/${locale}/faq`, label: copy.nav.faq }
  ];

  const withLocale = (target: Locale) => {
    if (pathname === "/" || !pathname) {
      return `/${target}`;
    }

    if (pathname.startsWith("/ko") || pathname.startsWith("/en")) {
      return pathname.replace(/^\/(ko|en)(?=\/|$)/, `/${target}`);
    }

    return `/${target}${pathname}`;
  };

  const koPath = withLocale("ko");
  const enPath = withLocale("en");

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand">{copy.brand}</div>
        <div className="nav-wrap">
          <nav className="nav">
            {navItems.map((item) => {
              const current = normalizePath(item.href);
              const isActive =
                pathname === current ||
                (current !== `/${locale}` && pathname.startsWith(`${current}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="locale-links" role="group" aria-label={copy.nav.localeLabel}>
              <Link
                href={koPath}
                className={`locale-link${locale === "ko" ? " is-active" : ""}`}
                aria-current={locale === "ko" ? "page" : undefined}
              >
                KOR
              </Link>
              <span className="locale-separator">|</span>
              <Link
                href={enPath}
                className={`locale-link${locale === "en" ? " is-active" : ""}`}
                aria-current={locale === "en" ? "page" : undefined}
              >
                ENG
              </Link>
            </span>
          </nav>
        </div>
      </div>
    </header>
  );
}
