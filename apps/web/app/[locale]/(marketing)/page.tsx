import Link from "next/link";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { DOWNLOAD_URLS } from "@/lib/downloads";
import { DownloadButtons } from "@/features/analytics/components/DownloadButtons";
import { ScrollDownCue } from "@/components/marketing/ScrollDownCue";

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
  const usageGuide = copy.sections.usageGuide;

  return (
    <main className="landing-main">
      <ScrollDownCue
        targetId="quick-start"
        ariaLabel={locale === "ko" ? "다음 섹션으로 스크롤" : "Scroll to next section"}
      />
      <section className="hero hero--spotlight">
        <div className="hero-clean">
          <p className="hero-kicker">POSTURE OS</p>
          <h1>{copy.hero.title}</h1>
          <p>{copy.hero.subtitle}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href={`/${locale}/download`}>
              {copy.hero.ctaDownload}
            </Link>
            <Link className="btn" href={`/${locale}/demo`}>
              {copy.hero.ctaDemo}
            </Link>
          </div>
        </div>
      </section>

      <section id="quick-start" className="section section--download">
        <div className="section-head">
          <p className="section-kicker">01</p>
          <h2>{copy.sections.quickDownloadTitle}</h2>
        </div>
        <p className="muted">{copy.sections.quickDownloadBody}</p>
        <div className="download-panel">
          <DownloadButtons
            macUrl={DOWNLOAD_URLS.mac}
            winUrl={DOWNLOAD_URLS.win}
            macLabel={copy.pages.download.mac}
            winLabel={copy.pages.download.win}
            locale={locale}
            source="landing-hero"
          />
        </div>
        <article className="setup-notice" aria-label={usageGuide.setupNoticeTitle}>
          <p className="setup-notice-kicker">SETUP</p>
          <h3>{usageGuide.setupNoticeTitle}</h3>
          <p className="setup-notice-body">{usageGuide.setupNoticeBody}</p>
        </article>
        <div className="usage-layout">
          <article className="usage-card">
            <h3>{usageGuide.quickStartTitle}</h3>
            <ol className="usage-step-list">
              {copy.sections.usageSteps.map((step) => (
                <li key={step.title}>
                  <span className="usage-step-title">{step.title}</span>
                  <p className="usage-step-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>
        <p className="muted quickstart-note">
          {locale === "ko" ? "경고가 울리는 조건과 지표 의미는 " : "For detailed alert logic and metric definitions, see "}
          <Link href={`/${locale}/how-it-works`} className="release-link">
            {copy.nav.howItWorks}
          </Link>
          {locale === "ko" ? "에서 확인하세요." : "."}
        </p>
      </section>

      <section className="section section--story">
        <div className="section-head">
          <p className="section-kicker">02</p>
          <h2>{copy.sections.whyTitle}</h2>
        </div>
        <p className="story-body">{copy.sections.whyBody}</p>
      </section>

      <section className="section section--features">
        <div className="section-head">
          <p className="section-kicker">03</p>
          <h2>{copy.sections.featuresTitle}</h2>
        </div>
        <div className="feature-grid">
          {copy.sections.features.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--privacy">
        <div className="section-head">
          <p className="section-kicker">04</p>
          <h2>{copy.sections.privacyTitle}</h2>
        </div>
        <p className="muted">{copy.sections.privacyBody}</p>
      </section>
    </main>
  );
}
