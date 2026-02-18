import "./globals.css";
import type { Metadata } from "next";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PoseGuard",
    template: "%s | PoseGuard"
  },
  description:
    "PoseGuard is a lightweight posture monitoring app powered by MediaPipe Pose and on-device analysis.",
  keywords: [
    "posture",
    "posture monitoring",
    "bad posture correction",
    "webcam posture",
    "pose estimation",
    "MediaPipe",
    "PoseGuard"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PoseGuard",
    description:
      "PoseGuard is a lightweight posture monitoring app powered by MediaPipe Pose and on-device analysis.",
    siteName: "PoseGuard",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "PoseGuard"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PoseGuard",
    description:
      "PoseGuard is a lightweight posture monitoring app powered by MediaPipe Pose and on-device analysis.",
    images: ["/icon.png"]
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "ko-KR": "/ko"
    }
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
