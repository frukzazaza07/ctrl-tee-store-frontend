import "server-only";
import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collections as collectionsTable,
  collectionProducts as collectionProductsTable,
  products as productsTable,
} from "@/lib/db/schema";
import { toProduct } from "@/lib/db/products";
import type { Collection, CollectionWithProducts } from "@/types/collection";

export interface AdminCollectionWithProducts extends CollectionWithProducts {
  active: boolean;
}

function toCollection(row: typeof collectionsTable.$inferSelect): Collection {
  return { id: row.id, name: row.name, slug: row.slug, position: row.position };
}

export const getAllCollections = cache(async (): Promise<Collection[]> => {
  const rows = await db
    .select()
    .from(collectionsTable)
    .where(and(eq(collectionsTable.active, true), isNull(collectionsTable.deletedAt)))
    .orderBy(asc(collectionsTable.position));
  return rows.map(toCollection);
});

/** Storefront-facing: only active, non-deleted collections and member products. */
export const getCollectionsWithProducts = cache(async (): Promise<CollectionWithProducts[]> => {
  const rows = await db
    .select({ collection: collectionsTable, product: productsTable })
    .from(collectionsTable)
    .leftJoin(collectionProductsTable, eq(collectionProductsTable.collectionId, collectionsTable.id))
    .leftJoin(
      productsTable,
      and(
        eq(productsTable.id, collectionProductsTable.productId),
        eq(productsTable.active, true),
        isNull(productsTable.deletedAt),
      ),
    )
    .where(and(eq(collectionsTable.active, true), isNull(collectionsTable.deletedAt)))
    .orderBy(asc(collectionsTable.position), asc(collectionProductsTable.position));

  const byId = new Map<string, CollectionWithProducts>();
  for (const row of rows) {
    let entry = byId.get(row.collection.id);
    if (!entry) {
      entry = { ...toCollection(row.collection), products: [] };
      byId.set(row.collection.id, entry);
    }
    if (row.product) entry.products.push(toProduct(row.product));
  }
  return Array.from(byId.values());
});

/** Admin-facing: every non-deleted collection (incl. inactive) with its non-deleted member products. */
export const getCollectionsWithProductsAdmin = cache(async (): Promise<AdminCollectionWithProducts[]> => {
  const rows = await db
    .select({ collection: collectionsTable, product: productsTable })
    .from(collectionsTable)
    .leftJoin(collectionProductsTable, eq(collectionProductsTable.collectionId, collectionsTable.id))
    .leftJoin(
      productsTable,
      and(eq(productsTable.id, collectionProductsTable.productId), isNull(productsTable.deletedAt)),
    )
    .where(isNull(collectionsTable.deletedAt))
    .orderBy(asc(collectionsTable.position), asc(collectionProductsTable.position));

  const byId = new Map<string, AdminCollectionWithProducts>();
  for (const row of rows) {
    let entry = byId.get(row.collection.id);
    if (!entry) {
      entry = { ...toCollection(row.collection), active: row.collection.active, products: [] };
      byId.set(row.collection.id, entry);
    }
    if (row.product) entry.products.push(toProduct(row.product));
  }
  return Array.from(byId.values());
});

export const getCollectionByIdAdmin = cache(async (id: string): Promise<AdminCollectionWithProducts | undefined> => {
  const all = await getCollectionsWithProductsAdmin();
  return all.find((c) => c.id === id);
});

export interface CollectionInput {
  name: string;
  slug: string;
  position: number;
}

export async function createCollection(input: CollectionInput): Promise<Collection> {
  const [row] = await db.insert(collectionsTable).values(input).returning();
  return toCollection(row);
}

export async function updateCollection(id: string, input: CollectionInput): Promise<Collection> {
  const [row] = await db
    .update(collectionsTable)
    .set(input)
    .where(eq(collectionsTable.id, id))
    .returning();
  return toCollection(row);
}

/** Soft delete: keeps the row (and its product-membership history) but hides it everywhere. */
export async function deleteCollection(id: string): Promise<void> {
  await db
    .update(collectionsTable)
    .set({ active: false, deletedAt: new Date() })
    .where(eq(collectionsTable.id, id));
}

export async function setCollectionActive(id: string, active: boolean): Promise<void> {
  await db.update(collectionsTable).set({ active }).where(eq(collectionsTable.id, id));
}

/** Replaces a collection's product membership + order in one go. */
export async function setCollectionProducts(collectionId: string, productIds: string[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(collectionProductsTable).where(eq(collectionProductsTable.collectionId, collectionId));
    if (productIds.length === 0) return;
    await tx.insert(collectionProductsTable).values(
      productIds.map((productId, position) => ({ collectionId, productId, position })),
    );
  });
}
