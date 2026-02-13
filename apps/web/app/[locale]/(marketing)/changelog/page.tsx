import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

const entries = [
  {
    version: "v0.1.0",
    date: "2026-02-13",
    items: [
      "Initial bilingual landing structure (KR/EN)",
      "Webcam demo with MediaPipe Pose integration",
      "Download, how-it-works, FAQ, privacy pages"
    ]
  }
];

export default function ChangelogPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.changelog.title}</h1>
        {entries.map((entry) => (
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
