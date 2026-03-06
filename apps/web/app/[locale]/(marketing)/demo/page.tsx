import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { WebcamDemo } from "@/features/demo/components/WebcamDemo";

export default function DemoPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);
  const demoContent =
    locale === "ko"
      ? {
          subtitle: "카메라를 허용하고 30초만 체험해보세요.",
          quickSteps: ["카메라 허용", "바른 자세 유지", "데모 시작"],
          detailsSummary: "실사용에서 데스크톱 앱이 더 좋은 이유 보기",
          detailsTitle: "실사용은 데스크톱 앱이 더 적합합니다",
          details: [
            "백그라운드 작동: 웹은 화면 이탈 시 제한되지만, 데스크톱 앱은 모니터링이 계속됩니다.",
            "무음 화면 알림: 공공장소에서도 소리 없이 시각 알림으로 자세를 바로 교정할 수 있습니다.",
            "리소스 최적화: 장시간 사용 기준으로 CPU/GPU 사용을 더 안정적으로 관리합니다."
          ]
        }
      : {
          subtitle: "Allow camera access and try it in 30 seconds.",
          quickSteps: ["Allow camera", "Keep upright posture", "Start demo"],
          detailsSummary: "Why desktop app is better for daily use",
          detailsTitle: "Desktop app is better for practical daily monitoring",
          details: [
            "Background operation: the web demo is limited when you leave the tab, while desktop monitoring keeps running.",
            "Silent visual alerts: use it in public spaces without sound, with on-screen warnings.",
            "Resource optimization: more stable CPU/GPU usage for longer sessions."
          ]
        };

  return (
    <main className="content-main">
      <section className="section">
        <header className="demo-page-hero">
          <h1>{copy.pages.demo.title}</h1>
          <p className="demo-page-subtitle">{demoContent.subtitle}</p>
          <ul className="demo-page-quicksteps">
            {demoContent.quickSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </header>
        <div className="demo-stage-wrap">
          <WebcamDemo locale={locale} />
        </div>
        <details className="demo-page-details">
          <summary>{demoContent.detailsSummary}</summary>
          <h3>{demoContent.detailsTitle}</h3>
          <ul className="demo-page-details-list">
            {demoContent.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
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
