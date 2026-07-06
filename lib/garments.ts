import garmentsData from "@/data/garments.json";
import type { Garment } from "@/types/configurator";
import type { GarmentStyle } from "@/types/product";

export const garments = garmentsData as Garment[];

export function getGarment(style: GarmentStyle): Garment | undefined {
  return garments.find((g) => g.id === style);
}

export function isGarmentStyle(value: string): value is GarmentStyle {
  return garments.some((g) => g.id === value);
}
