import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function HowItWorksPage({
  params
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);
  const usageGuide = copy.sections.usageGuide;

  return (
    <main className="content-main">
      <section className="section">
        <h1>{copy.pages.how.title}</h1>
        <p className="muted">{copy.pages.how.body}</p>
        <p className="section-subhead">
          {locale === "ko"
            ? "사용 전에 알아둘 핵심 판단 기준"
            : "Core decision rules before use"}
        </p>
        <div className="feature-grid how-detail-grid">
          <article className="feature-card">
            <h3>{usageGuide.alertTitle}</h3>
            <ul className="text-list">
              {usageGuide.alertItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="feature-card">
            <h3>{usageGuide.statusTitle}</h3>
            <ul className="text-list">
              {usageGuide.statusItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
        <p className="section-subhead">
          {locale === "ko" ? "감지 동작 흐름(상세)" : "Detection flow (detailed)"}
        </p>
        <div className="feature-grid how-steps-grid">
          {copy.pages.how.steps.map((step) => (
            <article className="feature-card" key={step.title}>
              <h3>{step.title}</h3>
              <p className="muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
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
    title: copy.pages.how.title,
    description: copy.pages.how.body
  };
}
