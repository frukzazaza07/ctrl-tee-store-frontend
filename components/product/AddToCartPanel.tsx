"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { ColorSelector } from "@/components/product/ColorSelector";
import { SizeSelector } from "@/components/product/SizeSelector";
import { PriceTag } from "@/components/ui/PriceTag";
import { buttonVariants } from "@/components/ui/Button";
import { useCartStore } from "@/features/cart/store";
import type { Product } from "@/types/product";

export function AddToCartPanel({ product }: { product: Product }) {
  const t = useTranslations("common");
  const tProduct = useTranslations("product");
  const locale = useLocale() as Locale;
  const addItem = useCartStore((s) => s.addItem);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: crypto.randomUUID(),
      kind: "product",
      productId: product.id,
      quantity: 1,
      unitPrice: product.price,
      size,
      color,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-6">
      <PriceTag price={product.price} locale={locale} className="text-2xl" />

      <div>
        <span className="text-sm text-fg-muted">{t("color")}</span>
        <div className="mt-2">
          <ColorSelector colorIds={product.colors} value={color} onChange={setColor} />
        </div>
      </div>

      <div>
        <span className="text-sm text-fg-muted">{t("size")}</span>
        <div className="mt-2">
          <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        {added ? tProduct("addedToCart") : t("addToCart")}
      </button>

      {product.configurable && product.garmentStyle ? (
        <p className="text-sm text-fg-muted">
          {tProduct("customizeInstead")}{" "}
          <Link
            href={`/configure/${product.garmentStyle}`}
            className="underline hover:text-fg"
          >
            {t("customize")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
