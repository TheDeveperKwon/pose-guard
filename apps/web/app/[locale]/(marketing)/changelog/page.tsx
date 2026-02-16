import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { CHANGELOG_ENTRIES } from "@/lib/downloads";

export default function ChangelogPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.changelog.title}</h1>
        {CHANGELOG_ENTRIES.map((entry) => (
          <article className="feature-card" key={entry.version}>
            <h3>
              {entry.version} - {entry.date}
            </h3>
            {entry.items.map((item) => (
              <p className="muted" key={item}>
                - {item}
              </p>
            ))}
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
    title: copy.pages.changelog.title,
    description: `${copy.pages.changelog.title} for PoseGuard`
  };
}
