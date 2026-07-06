import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Hero } from "@/components/home/Hero";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ConfiguratorBanner } from "@/components/home/ConfiguratorBanner";
import { BrandStory } from "@/components/home/BrandStory";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <CategoryTiles />
      <FeaturedProducts locale={locale} />
      <ConfiguratorBanner />
      <BrandStory />
    </>
  );
}
