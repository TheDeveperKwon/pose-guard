import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { DOWNLOAD_META, DOWNLOAD_URLS } from "@/lib/downloads";
import { DownloadButtons } from "@/features/analytics/components/DownloadButtons";

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
    title: copy.pages.download.title,
    description: copy.pages.download.body
  };
}

export default function DownloadPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);
  const guide =
    locale === "ko"
      ? {
          title: "macOS 설치 차단 시 실행 방법",
          body: "인증서가 없는 빌드에서는 macOS 보안 정책으로 앱 실행이 차단될 수 있습니다. 아래 순서로 실행하세요.",
          steps: [
            "앱 아이콘을 눌러 실행하고 안내 창이 뜨면 확인을 누릅니다.",
            "시스템 설정 > 개인정보 보호 및 보안으로 이동합니다.",
            "보안 항목에서 '그래도 열기'를 눌러 앱을 실행합니다."
          ],
          imageAlt: "macOS 보안 설정에서 그래도 열기 버튼 위치 안내"
        }
      : {
          title: "If macOS blocks the app on first launch",
          body: "Unsigned builds can be blocked by macOS Gatekeeper. Follow these steps to run the app.",
          steps: [
            "Launch the app from its icon and confirm the first warning dialog.",
            "Open System Settings > Privacy & Security.",
            "In Security, click 'Open Anyway' for PoseGuard Lite."
          ],
          imageAlt: "macOS Privacy & Security Open Anyway guide"
        };

  return (
    <main className="content-main">
      <section className="section">
        <h1>{copy.pages.download.title}</h1>
        <p className="muted">{copy.pages.download.body}</p>
        <div className="download-actions">
          <DownloadButtons
            macUrl={DOWNLOAD_URLS.mac}
            winUrl={DOWNLOAD_URLS.win}
            macLabel={copy.pages.download.mac}
            winLabel={copy.pages.download.win}
            locale={locale}
            source="download-page"
          />
        </div>
        <article className="feature-card release-meta">
          <h3>{copy.pages.download.meta.title}</h3>
          <ul>
            <li>
              <span>{copy.pages.download.meta.versionLabel}:</span> {DOWNLOAD_META.version}
            </li>
            <li>
              <span>{copy.pages.download.meta.publishedLabel}:</span> {DOWNLOAD_META.releasedAt}
            </li>
            <li>
              <span>macOS:</span> {DOWNLOAD_META.macFileName}
            </li>
            <li>
              <span>{copy.pages.download.meta.windowsLabel}:</span>{" "}
              {DOWNLOAD_META.winFileName}
            </li>
            <li>
              <span>{copy.pages.download.meta.releaseNotesLabel}:</span>{" "}
              <a href={DOWNLOAD_META.releaseNotesUrl} className="release-link" target="_blank" rel="noopener noreferrer">
                GitHub Releases
              </a>
            </li>
          </ul>
        </article>
        <article className="feature-card install-guide">
          <h3>{guide.title}</h3>
          <p className="muted">{guide.body}</p>
          <ol className="install-steps">
            {guide.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <img
            className="install-guide-image"
            src="/mac_block_msg.png"
            alt={guide.imageAlt}
            loading="lazy"
          />
        </article>
      </section>
    </main>
  );
}
