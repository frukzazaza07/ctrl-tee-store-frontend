import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

export function FeaturedProducts({ locale }: { locale: Locale }) {
  const t = useTranslations("home");
  const featured = getFeaturedProducts();

  return (
    <Section>
      <Reveal>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("featuredTitle")}
        </h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product, i) => (
          <Reveal key={product.id} delay={i * 0.06}>
            <ProductCard product={product} locale={locale} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
