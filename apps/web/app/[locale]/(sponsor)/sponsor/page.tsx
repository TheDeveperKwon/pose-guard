import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function SponsorPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.sponsor.title}</h1>
        <p className="muted">{copy.pages.sponsor.body}</p>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>{locale === "ko" ? "플래티넘" : "Platinum"}</h3>
            <p className="muted">{locale === "ko" ? "로고 + 링크 + 소개" : "Logo + link + profile"}</p>
          </article>
          <article className="feature-card">
            <h3>{locale === "ko" ? "골드" : "Gold"}</h3>
            <p className="muted">{locale === "ko" ? "로고 + 링크" : "Logo + link"}</p>
          </article>
          <article className="feature-card">
            <h3>{locale === "ko" ? "커뮤니티" : "Community"}</h3>
            <p className="muted">{locale === "ko" ? "이름 표기" : "Name mention"}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
