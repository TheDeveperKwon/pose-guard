import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  const details =
    locale === "ko"
      ? [
          "웹 데모의 카메라 프레임은 업로드하지 않으며 브라우저 내부에서 처리됩니다.",
          "분석 결과(상태/FPS)는 화면 표시 용도로만 사용됩니다.",
          "사용자 식별용 개인정보를 본 데모에서 수집하지 않습니다."
        ]
      : [
          "Web demo camera frames are not uploaded and are processed in-browser.",
          "Analysis outputs (status/FPS) are used only for on-screen feedback.",
          "No user-identifying personal data is collected in this demo."
        ];

  return (
    <main className="content-main">
      <section className="section">
        <h1>{copy.pages.privacy.title}</h1>
        <p className="muted">{copy.pages.privacy.body}</p>
        <ul className="text-list">
          {details.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
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
    title: copy.pages.privacy.title,
    description: copy.pages.privacy.body
  };
}
