import "server-only";
import { cache } from "react";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { products as productsTable } from "@/lib/db/schema";
import type { Product } from "@/types/product";
import type { GarmentColorId } from "@/lib/theme";

export interface AdminProduct extends Product {
  active: boolean;
}

export function toProduct(row: typeof productsTable.$inferSelect): Product {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as Product["category"],
    price: { THB: row.priceThb, USD: row.priceUsd },
    colors: row.colors as GarmentColorId[],
    sizes: row.sizes,
    featured: row.featured,
    configurable: row.configurable,
    garmentStyle: (row.garmentStyle ?? undefined) as Product["garmentStyle"],
    name: { en: row.nameEn, th: row.nameTh },
    description: { en: row.descriptionEn, th: row.descriptionTh },
  };
}

function toAdminProduct(row: typeof productsTable.$inferSelect): AdminProduct {
  return { ...toProduct(row), active: row.active };
}

export interface ProductInput {
  slug: string;
  category: Product["category"];
  price: { THB: number; USD: number };
  colors: GarmentColorId[];
  sizes: string[];
  featured: boolean;
  configurable: boolean;
  garmentStyle?: Product["garmentStyle"];
  name: { en: string; th: string };
  description: { en: string; th: string };
}

function toRowValues(input: ProductInput) {
  return {
    slug: input.slug,
    category: input.category,
    priceThb: input.price.THB,
    priceUsd: input.price.USD,
    colors: input.colors,
    sizes: input.sizes,
    featured: input.featured,
    configurable: input.configurable,
    garmentStyle: input.garmentStyle ?? null,
    nameEn: input.name.en,
    nameTh: input.name.th,
    descriptionEn: input.description.en,
    descriptionTh: input.description.th,
  };
}

/** Product ids follow the slug (matches the seeded convention where id === slug). */
export async function createProduct(input: ProductInput): Promise<Product> {
  const [row] = await db
    .insert(productsTable)
    .values({ id: input.slug, ...toRowValues(input) })
    .returning();
  return toProduct(row);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const [row] = await db
    .update(productsTable)
    .set(toRowValues(input))
    .where(eq(productsTable.id, id))
    .returning();
  return toProduct(row);
}

/** Soft delete: keeps the row (and its order/collection history) but hides it everywhere. */
export async function deleteProduct(id: string): Promise<void> {
  await db
    .update(productsTable)
    .set({ active: false, deletedAt: new Date() })
    .where(eq(productsTable.id, id));
}

export async function setProductActive(id: string, active: boolean): Promise<void> {
  await db.update(productsTable).set({ active }).where(eq(productsTable.id, id));
}

/** Storefront-facing: only products that are active and not soft-deleted. */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.active, true), isNull(productsTable.deletedAt)));
  return rows.map(toProduct);
});

/** Admin-facing: every non-deleted product, including inactive ones. */
export const getAllProductsAdmin = cache(async (): Promise<AdminProduct[]> => {
  const rows = await db.select().from(productsTable).where(isNull(productsTable.deletedAt));
  return rows.map(toAdminProduct);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.slug, slug), eq(productsTable.active, true), isNull(productsTable.deletedAt)))
    .limit(1);
  return rows[0] ? toProduct(rows[0]) : undefined;
});

export const getProductById = cache(async (id: string): Promise<AdminProduct | undefined> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.id, id), isNull(productsTable.deletedAt)))
    .limit(1);
  return rows[0] ? toAdminProduct(rows[0]) : undefined;
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const all = await getAllProducts();
  return all.filter((p) => p.featured);
});
