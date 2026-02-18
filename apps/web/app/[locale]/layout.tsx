import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
    <>
      <SiteHeader locale={locale} />
      <div className="page-wrap">
        {children}
        <footer>{copy.footer}</footer>
      </div>
    </>
  );
}

export function generateMetadata({
  params
}: {
  params: { locale: string };
}): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }

  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return {
    description: copy.hero.subtitle,
    openGraph: {
      title: copy.brand,
      description: copy.hero.subtitle,
      locale: locale === "ko" ? "ko_KR" : "en_US",
      alternateLocale: locale === "ko" ? ["en_US"] : ["ko_KR"],
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "PoseGuard posture monitoring"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: copy.brand,
      description: copy.hero.subtitle,
      images: ["/twitter-image"]
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "en-US": "/en",
        "ko-KR": "/ko"
      }
    }
  };
}
