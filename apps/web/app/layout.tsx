import "./globals.css";
import type { Metadata } from "next";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";

export const metadata: Metadata = {
  title: "PoseGuard",
  description: "Low-power high-performance posture monitoring"
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
