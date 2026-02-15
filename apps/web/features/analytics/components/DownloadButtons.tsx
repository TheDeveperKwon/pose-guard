"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  macUrl: string;
  winUrl: string;
  macLabel: string;
  winLabel: string;
  locale: string;
  source?: string;
};

export function DownloadButtons({ macUrl, winUrl, macLabel, winLabel, locale, source = "download-page" }: Props) {
  return (
    <div className="cta-row">
      <a
        className="btn btn-primary"
        href={macUrl}
        onClick={() => {
          trackEvent("download_click", {
            platform: "macos",
            locale,
            source
          });
        }}
      >
        {macLabel}
      </a>
      <a
        className="btn"
        href={winUrl}
        onClick={() => {
          trackEvent("download_click", {
            platform: "windows",
            locale,
            source
          });
        }}
      >
        {winLabel}
      </a>
    </div>
  );
}
