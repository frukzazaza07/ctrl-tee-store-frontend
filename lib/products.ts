import productsData from "@/data/products.json";
import type { Product } from "@/types/product";

export const products = productsData as Product[];

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
