import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types/product";

export function ProductGrid({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const t = useTranslations("shop");

  if (products.length === 0) {
    return <p className="py-16 text-center text-fg-muted">{t("noResults")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
