"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { getProductById } from "@/lib/products";
import { garmentColors } from "@/lib/theme";
import { STYLE_LABEL_KEY } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { PlaceholderArt, type PlaceholderShape } from "@/components/ui/PlaceholderArt";
import type { CartItem } from "@/types/cart";

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

interface CartItemRowProps {
  item: CartItem;
  locale: Locale;
  onRemove: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

export function CartItemRow({ item, locale, onRemove, onQuantityChange }: CartItemRowProps) {
  const t = useTranslations("cart");
  const colorHex = garmentColors.find((c) => c.id === item.color)?.hex;

  return (
    <li className="flex gap-4 rounded-2xl border border-border p-4">
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
              onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
              className="w-14 rounded border border-border bg-bg px-2 py-1 text-fg"
            />
          </label>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-sm text-fg-muted underline hover:text-fg"
          >
            {t("remove")}
          </button>
        </div>
      </div>

      <p className="whitespace-nowrap font-medium">
        {formatPrice(
          { THB: item.unitPrice.THB * item.quantity, USD: item.unitPrice.USD * item.quantity },
          locale,
        )}
      </p>
    </li>
  );
}
