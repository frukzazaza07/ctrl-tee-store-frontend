import type { ConfiguratorConfig } from "@/types/configurator";
import type { GarmentColorId } from "@/lib/theme";

interface BaseCartItem {
  id: string;
  quantity: number;
  unitPrice: { THB: number; USD: number };
  size: string;
  color: GarmentColorId;
}

export interface ProductCartItem extends BaseCartItem {
  kind: "product";
  productId: string;
}

export interface ConfiguratorCartItem extends BaseCartItem {
  kind: "configurator";
  config: ConfiguratorConfig;
  /** Flattened garment+design PNG (data URL) used for the cart thumbnail. */
  thumbnail: string;
  /** Flattened, print-ready PNGs (data URLs) per view that has content. */
  printFiles: { front?: string; back?: string };
}

export type CartItem = ProductCartItem | ConfiguratorCartItem;
