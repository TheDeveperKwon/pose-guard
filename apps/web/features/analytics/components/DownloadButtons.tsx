"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  macUrl: string;
  winUrl: string;
  macLabel: string;
  winLabel: string;
  locale: string;
};

export function DownloadButtons({ macUrl, winUrl, macLabel, winLabel, locale }: Props) {
  return (
    <div className="cta-row">
      <a
        className="btn btn-primary"
        href={macUrl}
        onClick={() => {
          trackEvent("download_click", { platform: "macos", locale });
        }}
      >
        {macLabel}
      </a>
      <a
        className="btn"
        href={winUrl}
        onClick={() => {
          trackEvent("download_click", { platform: "windows", locale });
        }}
      >
        {winLabel}
      </a>
    </div>
  );
}
