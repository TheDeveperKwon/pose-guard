import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { DOWNLOAD_URLS } from "@/lib/downloads";
import { DownloadButtons } from "@/features/analytics/components/DownloadButtons";

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
          macUrl={DOWNLOAD_URLS.mac}
          winUrl={DOWNLOAD_URLS.win}
          macLabel={copy.pages.download.mac}
          winLabel={copy.pages.download.win}
          locale={locale}
        />
      </section>
    </main>
  );
}
