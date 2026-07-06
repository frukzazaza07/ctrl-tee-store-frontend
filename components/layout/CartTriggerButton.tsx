"use client";

import { useTranslations } from "next-intl";
import { useCartStore } from "@/features/cart/store";
import { cartItemCount } from "@/features/cart/totals";

export function CartTriggerButton() {
  const t = useTranslations("nav");
  const items = useCartStore((s) => s.items);
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const count = cartItemCount(items);

  return (
    <button
      type="button"
      onClick={toggleDrawer}
      aria-label={t("cart")}
      className="relative text-sm text-fg-muted transition-colors hover:text-fg"
    >
      {t("cart")}
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg">
          {count}
        </span>
      )}
    </button>
  );
}
