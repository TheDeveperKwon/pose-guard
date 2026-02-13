import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function QnaPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.qna.title}</h1>
        <p className="muted">{copy.pages.qna.body}</p>
        <article className="feature-card">
          <h3>{locale === "ko" ? "권장 확장 순서" : "Recommended extension order"}</h3>
          <p className="muted">1. Auth</p>
          <p className="muted">2. DB schema for posts/comments</p>
          <p className="muted">3. Moderation workflow</p>
        </article>
      </section>
    </main>
  );
}
