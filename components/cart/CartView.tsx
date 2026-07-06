"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/store";
import { cartSubtotal } from "@/features/cart/totals";
import { formatPrice } from "@/lib/format";
import { getProductById } from "@/lib/products";
import { garmentColors } from "@/lib/theme";
import { PlaceholderArt, type PlaceholderShape } from "@/components/ui/PlaceholderArt";
import { buttonVariants } from "@/components/ui/Button";
import type { CartItem } from "@/types/cart";

const STYLE_LABEL_KEY = {
  crew: "styleCrew",
  vneck: "styleVneck",
  "long-sleeve": "styleLongSleeve",
} as const;

const CATEGORY_SHAPE: Record<string, PlaceholderShape> = {
  tshirts: "tshirt",
  hoodies: "hoodie",
  caps: "cap",
};

function ItemThumbnail({ item }: { item: CartItem }) {
  if (item.kind === "product") {
    const product = getProductById(item.productId);
    return (
      <PlaceholderArt
        seed={item.productId}
        shape={product ? CATEGORY_SHAPE[product.category] : "tshirt"}
      />
    );
  }
  return <PlaceholderArt seed={item.id} shape="tshirt" />;
}

function ItemName({ item }: { item: CartItem }) {
  const t = useTranslations("cart");
  const tProducts = useTranslations("products");
  const tConfigurator = useTranslations("configurator");

  if (item.kind === "product") {
    const product = getProductById(item.productId);
    return <>{product ? tProducts(`${product.id}.name`) : item.productId}</>;
  }

  return (
    <>{t("configuratorItem", { style: tConfigurator(STYLE_LABEL_KEY[item.config.garmentStyle]) })}</>
  );
}

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  const subtotal = cartSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-fg-muted">{t("empty")}</p>
        <Link href="/shop" className={buttonVariants({ variant: "secondary" })}>
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map((item) => {
          const colorHex = garmentColors.find((c) => c.id === item.color)?.hex;
          return (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border p-4"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-bg">
                <ItemThumbnail item={item} />
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="font-medium">
                    <ItemName item={item} />
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-fg-muted">
                    <span
                      className="h-3 w-3 rounded-full border border-border"
                      style={{ backgroundColor: colorHex }}
                    />
                    {item.size}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-fg-muted">
                    {t("quantity")}
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                      className="w-14 rounded border border-border bg-bg px-2 py-1 text-fg"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-fg-muted underline hover:text-fg"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>

              <p className="whitespace-nowrap font-medium">
                {formatPrice(
                  {
                    THB: item.unitPrice.THB * item.quantity,
                    USD: item.unitPrice.USD * item.quantity,
                  },
                  locale,
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="h-fit space-y-4 rounded-2xl border border-border bg-bg-raised p-6">
        <div className="flex items-center justify-between">
          <span className="text-fg-muted">{t("subtotal")}</span>
          <span className="text-xl font-semibold">{formatPrice(subtotal, locale)}</span>
        </div>
        <Link
          href="/checkout"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          {t("checkout")}
        </Link>
      </div>
    </div>
  );
}
