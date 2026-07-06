"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/store";
import { cartSubtotal } from "@/features/cart/totals";
import { formatPrice } from "@/lib/format";
import { buttonVariants } from "@/components/ui/Button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { motionTokens } from "@/lib/theme";

export function CartDrawer() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const subtotal = cartSubtotal(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.fast }}
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: motionTokens.base, ease: motionTokens.easeOut }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col bg-bg-raised p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{t("title")}</h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label={tCommon("close")}
                className="text-fg-muted hover:text-fg"
              >
                ✕
              </button>
            </div>

            {items.length === 0 ? (
              <p className="mt-10 text-center text-fg-muted">{t("empty")}</p>
            ) : (
              <>
                <ul className="mt-6 flex-1 space-y-4 overflow-y-auto">
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
                <div className="mt-6 space-y-3 border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">{t("subtotal")}</span>
                    <span className="text-xl font-semibold">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/cart"
                      onClick={closeDrawer}
                      className={buttonVariants({ variant: "secondary", className: "flex-1" })}
                    >
                      {tCommon("viewCart")}
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={closeDrawer}
                      className={buttonVariants({ className: "flex-1" })}
                    >
                      {t("checkout")}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
