import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { DownloadButtons } from "@/features/analytics/components/DownloadButtons";

const MAC_DOWNLOAD_URL =
  "https://github.com/TheDeveperKwon/pose-guard/releases/latest/download/PoseGuard-Lite-mac-arm64-dmg.dmg";
const WIN_DOWNLOAD_URL =
  "https://github.com/TheDeveperKwon/pose-guard/releases/latest/download/PoseGuard-Lite-win-x64-nsis.exe";

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
          macUrl={MAC_DOWNLOAD_URL}
          winUrl={WIN_DOWNLOAD_URL}
          macLabel={copy.pages.download.mac}
          winLabel={copy.pages.download.win}
          locale={locale}
        />
      </section>
    </main>
  );
}
