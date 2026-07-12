import type { GarmentColorId } from "@/lib/theme";
import type { GarmentStyle } from "@/types/product";

/**
 * A slimmed-down snapshot of a cart item for order storage. Deliberately
 * drops ConfiguratorCartItem's `config` (which embeds the raw uploaded
 * design as a full-size base64 data URL — up to 10MB per side, redundant
 * once flattened) and `printFiles` (also large) — keeping only the small
 * flattened `thumbnail` for order history/display. A production system
 * would upload the print-ready files to object storage and store URLs here
 * instead of inlining any of it.
 */
export interface OrderItemSnapshot {
  id: string;
  kind: "product" | "configurator";
  quantity: number;
  unitPrice: { THB: number; USD: number };
  size: string;
  color: GarmentColorId;
  productId?: string;
  garmentStyle?: GarmentStyle;
  thumbnail?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  locale: string;
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  subtotal: { THB: number; USD: number };
  items: OrderItemSnapshot[];
  createdAt: string;
}
