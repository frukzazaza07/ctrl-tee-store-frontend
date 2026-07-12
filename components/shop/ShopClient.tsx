"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { filterProducts, getPriceBounds } from "@/lib/products";
import { useCatalog } from "@/features/catalog/useCatalog";
import type { Product, ProductCategory } from "@/types/product";
import type { GarmentColorId } from "@/lib/theme";

function priceOfFor(locale: Locale) {
  return (product: Product) => (locale === "th" ? product.price.THB : product.price.USD);
}

export function ShopClient({
  initialCategory,
}: {
  initialCategory: ProductCategory | "all";
}) {
  const locale = useLocale() as Locale;
  const { products } = useCatalog();
  const priceOf = useMemo(() => priceOfFor(locale), [locale]);
  const priceBounds = useMemo(() => getPriceBounds(products, priceOf), [products, priceOf]);

  const [category, setCategory] = useState(initialCategory);
  const [colors, setColors] = useState<GarmentColorId[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  // Locale-invariant filter position (1 = no limit) so switching currency
  // (THB <-> USD) never leaves an absolute price threshold stranded outside
  // the new currency's range.
  const [maxPriceFraction, setMaxPriceFraction] = useState(1);
  const maxPrice = priceBounds.min + maxPriceFraction * (priceBounds.max - priceBounds.min);

  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors))),
    [products],
  );
  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products],
  );

  const filtered = filterProducts(products, { category, colors, sizes, maxPrice }, priceOf);

  function toggleColor(color: GarmentColorId) {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }

  function toggleSize(size: string) {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  function handleMaxPriceChange(value: number) {
    const range = priceBounds.max - priceBounds.min;
    setMaxPriceFraction(range === 0 ? 1 : (value - priceBounds.min) / range);
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
      <FilterSidebar
        locale={locale}
        category={category}
        onCategoryChange={setCategory}
        availableColors={availableColors}
        selectedColors={colors}
        onToggleColor={toggleColor}
        availableSizes={availableSizes}
        selectedSizes={sizes}
        onToggleSize={toggleSize}
        maxPrice={maxPrice}
        onMaxPriceChange={handleMaxPriceChange}
        priceBounds={priceBounds}
      />
      <ProductGrid products={filtered} locale={locale} />
    </div>
  );
}
