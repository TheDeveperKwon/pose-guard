import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <div className="page-wrap">
      <SiteHeader locale={locale} />
      {children}
      <footer>{copy.footer}</footer>
    </div>
  );
}
