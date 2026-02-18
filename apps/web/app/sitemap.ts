import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

const siteUrl = getSiteUrl();

const pages = [
  "/ko",
  "/en",
  "/ko/download",
  "/en/download",
  "/ko/how-it-works",
  "/en/how-it-works",
  "/ko/faq",
  "/en/faq",
  "/ko/changelog",
  "/en/changelog",
  "/ko/privacy",
  "/en/privacy",
  "/ko/demo",
  "/en/demo"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: path === "/ko" || path === "/en" ? 1 : 0.8
  }));
}
