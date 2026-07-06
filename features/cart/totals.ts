import type { CartItem } from "@/types/cart";

export function cartSubtotal(items: CartItem[]): { THB: number; USD: number } {
  return items.reduce(
    (acc, item) => ({
      THB: acc.THB + item.unitPrice.THB * item.quantity,
      USD: acc.USD + item.unitPrice.USD * item.quantity,
    }),
    { THB: 0, USD: 0 },
  );
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
