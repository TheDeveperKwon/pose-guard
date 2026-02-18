import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { WebcamDemo } from "@/features/demo/components/WebcamDemo";

export default function DemoPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);
  const demoNotice =
    locale === "ko"
      ? {
          title: "웹 데모는 일부 기능만 제공합니다",
          body:
            "이 페이지는 카메라 기반 자세 추정 흐름을 빠르게 확인하는 용도입니다. 실제 운영 기능을 사용하려면 데스크톱 앱 설치를 권장합니다.",
          cta: "설치 페이지 보기",
          demoTitle: "웹 데모"
        }
      : {
          title: "Web demo includes only a limited feature set",
          body:
            "This page is for quickly testing camera-based posture estimation. For full functionality, install the desktop app.",
          cta: "View download page",
          demoTitle: "Live web demo"
        };

  return (
    <main className="content-main">
      <section className="section">
        <h1>{copy.pages.demo.title}</h1>
        <p className="muted">{copy.pages.demo.body}</p>
        <article className="feature-card demo-notice">
          <h3>{demoNotice.title}</h3>
          <p className="muted">{demoNotice.body}</p>
          <div className="cta-row demo-notice-actions">
            <Link className="btn demo-notice-link" href={`/${locale}/download`}>
              {demoNotice.cta}
            </Link>
          </div>
        </article>
        <p className="section-subhead demo-stage-title">{demoNotice.demoTitle}</p>
        <div className="demo-stage-wrap">
          <WebcamDemo locale={locale} />
        </div>
      </section>
    </main>
  );
}

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
    title: copy.pages.demo.title,
    description: copy.pages.demo.body
  };
}
