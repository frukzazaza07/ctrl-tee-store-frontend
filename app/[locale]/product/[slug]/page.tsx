import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug } from "@/lib/products";
import { Section } from "@/components/ui/Section";
import { Gallery } from "@/components/product/Gallery";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import type { PlaceholderShape } from "@/components/ui/PlaceholderArt";

const CATEGORY_SHAPE: Record<string, PlaceholderShape> = {
  tshirts: "tshirt",
  hoodies: "hoodie",
  caps: "cap",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "products" });

  return (
    <Section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <Gallery seed={product.id} shape={CATEGORY_SHAPE[product.category]} />
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t(`${product.id}.name`)}
        </h1>
        <p className="mt-3 text-fg-muted">{t(`${product.id}.description`)}</p>
        <div className="mt-8">
          <AddToCartPanel product={product} />
        </div>
      </div>
    </Section>
  );
}
