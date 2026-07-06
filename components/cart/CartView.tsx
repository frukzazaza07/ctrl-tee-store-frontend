"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/store";
import { cartSubtotal } from "@/features/cart/totals";
import { formatPrice } from "@/lib/format";
import { buttonVariants } from "@/components/ui/Button";
import { CartItemRow } from "@/components/cart/CartItemRow";

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
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            locale={locale}
            onRemove={removeItem}
            onQuantityChange={setQuantity}
          />
        ))}
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
