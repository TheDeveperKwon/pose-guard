import Link from "next/link";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

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
        <h2>{copy.sections.privacyTitle}</h2>
        <p className="muted">{copy.sections.privacyBody}</p>
      </section>
    </main>
  );
}
