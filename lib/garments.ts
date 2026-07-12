import type { GarmentStyle } from "@/types/product";

const GARMENT_STYLES: readonly GarmentStyle[] = ["crew", "vneck", "long-sleeve"];

export function isGarmentStyle(value: string): value is GarmentStyle {
  return (GARMENT_STYLES as readonly string[]).includes(value);
}
