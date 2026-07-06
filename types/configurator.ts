import type { GarmentColorId } from "@/lib/theme";
import type { GarmentStyle } from "@/types/product";

export type GarmentFit = "slim" | "regular" | "oversized";
export type ConfiguratorView = "front" | "back";
export type TextFont = "sans" | "serif" | "mono";

export interface GraphicLayer {
  source: "upload" | "library";
  /** Data URL for uploads, library graphic id for library source. */
  value: string;
  /** Offset from frame center, in percent of frame width/height. */
  x: number;
  y: number;
  scale: number;
  /** Degrees. */
  rotation: number;
}

export interface TextLayer {
  content: string;
  font: TextFont;
  color: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface ViewLayers {
  graphic: GraphicLayer | null;
  text: TextLayer | null;
}

export interface ConfiguratorConfig {
  garmentStyle: GarmentStyle;
  fit: GarmentFit;
  color: GarmentColorId;
  view: ConfiguratorView;
  front: ViewLayers;
  back: ViewLayers;
}

export interface LibraryGraphic {
  id: string;
  viewBox: string;
  path: string;
  fillRule?: "evenodd" | "nonzero";
}

export interface Garment {
  id: GarmentStyle;
  basePrice: { THB: number; USD: number };
}
