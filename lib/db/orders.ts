import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders as ordersTable } from "@/lib/db/schema";
import type { Order, OrderItemSnapshot } from "@/types/order";

function toOrder(row: typeof ordersTable.$inferSelect): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    locale: row.locale,
    fullName: row.fullName,
    email: row.email,
    address: row.address,
    city: row.city,
    postalCode: row.postalCode,
    country: row.country,
    subtotal: { THB: row.subtotalThb, USD: row.subtotalUsd },
    items: row.items as OrderItemSnapshot[],
    createdAt: row.createdAt.toISOString(),
  };
}

export interface CreateOrderInput {
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

function generateOrderNumber(): string {
  return `CT-${Date.now().toString(36).toUpperCase()}`;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const [row] = await db
    .insert(ordersTable)
    .values({
      orderNumber: generateOrderNumber(),
      locale: input.locale,
      fullName: input.fullName,
      email: input.email,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      country: input.country,
      subtotalThb: input.subtotal.THB,
      subtotalUsd: input.subtotal.USD,
      items: input.items,
    })
    .returning();
  return toOrder(row);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  const rows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, orderNumber))
    .limit(1);
  return rows[0] ? toOrder(rows[0]) : undefined;
}
