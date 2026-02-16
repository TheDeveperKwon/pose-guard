import Link from "next/link";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { DOWNLOAD_URLS } from "@/lib/downloads";
import { DownloadButtons } from "@/features/analytics/components/DownloadButtons";

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
    title: copy.hero.title,
    description: copy.hero.subtitle
  };
}

export default function LandingPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="hero">
        <h1>{copy.hero.title}</h1>
        <p>{copy.hero.subtitle}</p>
        <div className="chips">
          {copy.hero.chips.map((chip) => (
            <span className="chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>
        <div className="cta-row">
          <Link className="btn btn-primary" href={`/${locale}/download`}>
            {copy.hero.ctaDownload}
          </Link>
          <Link className="btn" href={`/${locale}/demo`}>
            {copy.hero.ctaDemo}
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>{copy.sections.quickDownloadTitle}</h2>
        <p className="muted">{copy.sections.quickDownloadBody}</p>
        <DownloadButtons
          macUrl={DOWNLOAD_URLS.mac}
          winUrl={DOWNLOAD_URLS.win}
          macLabel={copy.pages.download.mac}
          winLabel={copy.pages.download.win}
          locale={locale}
          source="landing-hero"
        />
      </section>

      <section className="section">
        <h2>{copy.sections.whyTitle}</h2>
        <p className="muted">{copy.sections.whyBody}</p>
      </section>

      <section className="section">
        <h2>{copy.sections.featuresTitle}</h2>
        <div className="feature-grid">
          {copy.sections.features.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{copy.sections.usageTitle}</h2>
        <div className="feature-grid">
          {copy.sections.usageSteps.map((step) => (
            <article className="feature-card" key={step.title}>
              <h3>{step.title}</h3>
              <p className="muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{copy.sections.privacyTitle}</h2>
        <p className="muted">{copy.sections.privacyBody}</p>
      </section>
    </main>
  );
}
