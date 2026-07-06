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
}

export type CartItem = ProductCartItem | ConfiguratorCartItem;
