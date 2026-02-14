import Link from "next/link";
import { Locale, getCopy } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function SiteHeader({ locale }: Props) {
  const copy = getCopy(locale);
  const altLocale = locale === "ko" ? "en" : "ko";

  return (
    <header className="site-header">
      <div className="brand">{copy.brand}</div>
      <nav className="nav">
        <Link href={`/${locale}`}>{copy.nav.home}</Link>
        <Link href={`/${locale}/demo`}>{copy.nav.demo}</Link>
        <Link href={`/${locale}/download`}>{copy.nav.download}</Link>
        <Link href={`/${locale}/how-it-works`}>{copy.nav.howItWorks}</Link>
        <Link href={`/${locale}/faq`}>{copy.nav.faq}</Link>
        <Link href={`/${altLocale}`} className="locale-switch">
          {altLocale.toUpperCase()}
        </Link>
      </nav>
    </header>
  );
}
