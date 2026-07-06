import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <Section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
        {t("heroTitle")}
      </h1>
      <p className="mt-4 text-xl text-fg-muted">{t("heroSubtitle")}</p>
    </Section>
  );
}
