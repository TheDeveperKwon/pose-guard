import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function FaqPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.faq.title}</h1>
        {copy.pages.faq.questions.map((item) => (
          <article className="feature-card" key={item.q}>
            <h3>{item.q}</h3>
            <p className="muted">{item.a}</p>
          </article>
        ))}
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
    title: copy.pages.faq.title,
    description: copy.pages.faq.questions.map((q) => q.q).join(" | ")
  };
}
