import { notFound } from "next/navigation";
import { Locale, getCopy, isLocale } from "@/lib/i18n";

export default function QnaPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  notFound();

  return null;
}
