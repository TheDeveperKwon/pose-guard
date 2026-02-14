import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { DownloadButtons } from "@/features/analytics/components/DownloadButtons";

const RELEASE_BASE = "https://github.com/TheDeveperKwon/pose-guard/releases/latest";

export default function DownloadPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.download.title}</h1>
        <p className="muted">{copy.pages.download.body}</p>
        <DownloadButtons
          releaseUrl={RELEASE_BASE}
          macLabel={copy.pages.download.mac}
          winLabel={copy.pages.download.win}
          locale={locale}
        />
      </section>
    </main>
  );
}
