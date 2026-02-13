import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function FaqPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  const qa =
    locale === "ko"
      ? [
          {
            q: "웹캠 영상이 서버로 전송되나요?",
            a: "아니요. 데모 분석은 브라우저 내에서 처리됩니다."
          },
          {
            q: "데모가 느릴 때는 어떻게 하나요?",
            a: "다른 탭/앱을 정리하고 밝은 환경에서 테스트하세요."
          },
          {
            q: "다운로드 파일은 어디서 받나요?",
            a: "Download 페이지에서 macOS/Windows 설치 파일 링크를 제공합니다."
          }
        ]
      : [
          {
            q: "Are webcam frames uploaded to servers?",
            a: "No. Demo analysis is performed in-browser."
          },
          {
            q: "What if the demo feels slow?",
            a: "Close heavy tabs/apps and test in a brighter environment."
          },
          {
            q: "Where can I get installers?",
            a: "Use the Download page for macOS and Windows package links."
          }
        ];

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.faq.title}</h1>
        {qa.map((item) => (
          <article className="feature-card" key={item.q}>
            <h3>{item.q}</h3>
            <p className="muted">{item.a}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
