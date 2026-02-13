import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

const RELEASE_BASE = "https://github.com/your-org/pose-guard/releases/latest";

export default function DownloadPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.download.title}</h1>
        <p className="muted">{copy.pages.download.body}</p>
        <div className="cta-row">
          <a className="btn btn-primary" href={RELEASE_BASE} target="_blank" rel="noreferrer">
            {copy.pages.download.mac}
          </a>
          <a className="btn" href={RELEASE_BASE} target="_blank" rel="noreferrer">
            {copy.pages.download.win}
          </a>
        </div>
      </section>
    </main>
  );
}
