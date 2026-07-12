import type { CartItem } from "@/types/cart";
import type { OrderItemSnapshot } from "@/types/order";

export function toOrderItemSnapshot(item: CartItem): OrderItemSnapshot {
  const base = {
    id: item.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    size: item.size,
    color: item.color,
  };

  if (item.kind === "product") {
    return { ...base, kind: "product", productId: item.productId };
  }

  return {
    ...base,
    kind: "configurator",
    garmentStyle: item.config.garmentStyle,
    thumbnail: item.thumbnail,
  };
}
