"use server";

import { createOrder as createOrderRecord } from "@/lib/db/orders";
import type { OrderItemSnapshot } from "@/types/order";

export interface CreateOrderActionInput {
  locale: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  subtotal: { THB: number; USD: number };
  items: OrderItemSnapshot[];
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Re-validates the shipping fields server-side (defense in depth against the
 * client-side checks in CheckoutForm) and persists the order. Deliberately
 * never receives card fields — payment stays mock/client-side-only.
 */
export async function createOrder(input: CreateOrderActionInput): Promise<{ orderNumber: string }> {
  if (
    !isNonEmpty(input.fullName) ||
    !isNonEmpty(input.address) ||
    !isNonEmpty(input.city) ||
    !isNonEmpty(input.postalCode) ||
    !isNonEmpty(input.country) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
    input.items.length === 0
  ) {
    throw new Error("Invalid order payload");
  }

  const order = await createOrderRecord({
    locale: input.locale,
    fullName: input.fullName,
    email: input.email,
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    country: input.country,
    subtotal: input.subtotal,
    items: input.items,
  });

  return { orderNumber: order.orderNumber };
}
