import type { Locale } from "@/i18n/routing";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCollectionsWithProducts } from "@/lib/db/collections";

export async function CollectionSections({ locale }: { locale: Locale }) {
  const collections = await getCollectionsWithProducts();

  return (
    <>
      {collections
        .filter((collection) => collection.products.length > 0)
        .map((collection) => (
          <Section key={collection.id}>
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{collection.name}</h2>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {collection.products.map((product, i) => (
                <Reveal key={product.id} delay={i * 0.06}>
                  <ProductCard product={product} locale={locale} />
                </Reveal>
              ))}
            </div>
          </Section>
        ))}
    </>
  );
}
