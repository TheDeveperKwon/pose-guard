import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function HowItWorksPage({
  params
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.how.title}</h1>
        <p className="muted">{copy.pages.how.body}</p>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>1. Landmark Extraction</h3>
            <p className="muted">
              MediaPipe Pose extracts head and upper body landmarks from each frame.
            </p>
          </article>
          <article className="feature-card">
            <h3>2. Relative Metric Evaluation</h3>
            <p className="muted">
              Eye distance, torso height, and nose-ear delta are compared to your baseline.
            </p>
          </article>
          <article className="feature-card">
            <h3>3. Low-power Loop</h3>
            <p className="muted">
              A throttled processing interval keeps CPU usage stable while preserving feedback quality.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
