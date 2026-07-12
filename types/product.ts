import type { GarmentColorId } from "@/lib/theme";

export type ProductCategory = "tshirts" | "hoodies" | "caps";
export type GarmentStyle = "crew" | "vneck" | "long-sleeve";

export interface Product {
  id: string;
  slug: string;
  category: ProductCategory;
  price: { THB: number; USD: number };
  colors: GarmentColorId[];
  sizes: string[];
  featured: boolean;
  configurable: boolean;
  garmentStyle?: GarmentStyle;
  name: { en: string; th: string };
  description: { en: string; th: string };
}
