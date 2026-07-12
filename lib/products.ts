import type { GarmentColorId } from "@/lib/theme";
import type { Product, ProductCategory } from "@/types/product";

export interface ProductFilters {
  category: ProductCategory | "all";
  colors: GarmentColorId[];
  sizes: string[];
  maxPrice: number;
}

export function filterProducts(
  list: Product[],
  filters: ProductFilters,
  priceOf: (product: Product) => number,
): Product[] {
  return list.filter((p) => {
    if (filters.category !== "all" && p.category !== filters.category) return false;
    if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c))) {
      return false;
    }
    if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) {
      return false;
    }
    if (priceOf(p) > filters.maxPrice) return false;
    return true;
  });
}

export function getPriceBounds(
  list: Product[],
  priceOf: (product: Product) => number,
): { min: number; max: number } {
  const values = list.map(priceOf);
  return { min: Math.min(...values), max: Math.max(...values) };
}
