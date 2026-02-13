import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";
import { WebcamDemo } from "@/features/demo/components/WebcamDemo";

export default function DemoPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const copy = getCopy(locale);

  return (
    <main>
      <section className="section">
        <h1>{copy.pages.demo.title}</h1>
        <p className="muted">{copy.pages.demo.body}</p>
        <WebcamDemo locale={locale} />
      </section>
    </main>
  );
}
