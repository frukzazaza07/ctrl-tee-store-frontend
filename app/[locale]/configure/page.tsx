import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { getAllGarments } from "@/lib/db/garments";
import { STYLE_LABEL_KEY } from "@/lib/labels";

export default async function ConfigureIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "configurator" });
  const garments = await getAllGarments();

  return (
    <Section>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {t("chooseTitle")}
      </h1>
      <p className="mt-3 text-fg-muted">{t("chooseSubtitle")}</p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {garments.map((g) => (
          <Link
            key={g.id}
            href={`/configure/${g.id}`}
            className="group block overflow-hidden rounded-2xl border border-border"
          >
            <div className="aspect-[4/5]">
              <PlaceholderArt
                seed={g.id}
                shape="tshirt"
                className="transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div className="p-5 text-lg font-medium">
              {t(STYLE_LABEL_KEY[g.id])}
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
