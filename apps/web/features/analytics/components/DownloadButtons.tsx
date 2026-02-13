"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  releaseUrl: string;
  macLabel: string;
  winLabel: string;
  locale: string;
};

export function DownloadButtons({ releaseUrl, macLabel, winLabel, locale }: Props) {
  return (
    <div className="cta-row">
      <a
        className="btn btn-primary"
        href={releaseUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackEvent("download_click", { platform: "macos", locale });
        }}
      >
        {macLabel}
      </a>
      <a
        className="btn"
        href={releaseUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackEvent("download_click", { platform: "windows", locale });
        }}
      >
        {winLabel}
      </a>
    </div>
  );
}
