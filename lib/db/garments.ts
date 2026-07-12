import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { garments as garmentsTable } from "@/lib/db/schema";
import type { Garment, GarmentImageSet, PrintAreaRect, ConfiguratorView } from "@/types/configurator";
import type { GarmentColorId } from "@/lib/theme";
import type { GarmentStyle } from "@/types/product";

function toGarment(row: typeof garmentsTable.$inferSelect): Garment {
  return {
    id: row.id as GarmentStyle,
    basePrice: { THB: row.basePriceThb, USD: row.basePriceUsd },
    images: row.images as Record<GarmentColorId, GarmentImageSet>,
    printArea: row.printArea as Record<ConfiguratorView, PrintAreaRect>,
  };
}

export const getAllGarments = cache(async (): Promise<Garment[]> => {
  const rows = await db.select().from(garmentsTable);
  return rows.map(toGarment);
});

export const getGarment = cache(async (style: GarmentStyle): Promise<Garment | undefined> => {
  const rows = await db.select().from(garmentsTable).where(eq(garmentsTable.id, style)).limit(1);
  return rows[0] ? toGarment(rows[0]) : undefined;
});
