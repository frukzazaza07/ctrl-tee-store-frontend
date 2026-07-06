import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { ShopClient } from "@/components/shop/ShopClient";
import type { ProductCategory } from "@/types/product";

const VALID_CATEGORIES: ProductCategory[] = ["tshirts", "hoodies", "caps"];

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "shop" });

  const initialCategory = VALID_CATEGORIES.includes(category as ProductCategory)
    ? (category as ProductCategory)
    : "all";

  return (
    <Section>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("title")}</h1>
      <div className="mt-10">
        <ShopClient key={initialCategory} initialCategory={initialCategory} />
      </div>
    </Section>
  );
}
