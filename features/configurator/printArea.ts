import type { Garment, PrintAreaRect, ConfiguratorView } from "@/types/configurator";

export function getPrintArea(garment: Garment, view: ConfiguratorView): PrintAreaRect {
  return garment.printArea[view];
}

/** CSS clip-path (inset from each edge, in %) that hard-clips content to the print area. */
export function printAreaClipPath(rect: PrintAreaRect): string {
  const top = rect.y;
  const left = rect.x;
  const right = 100 - (rect.x + rect.width);
  const bottom = 100 - (rect.y + rect.height);
  return `inset(${top}% ${right}% ${bottom}% ${left}%)`;
}

/** Bounds for a layer's center offset (percent from frame center) that keep it within the print area. */
export function printAreaOffsetBounds(rect: PrintAreaRect): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  return {
    minX: rect.x - 80,
    maxX: rect.x + rect.width - 20,
    minY: rect.y - 150,
    maxY: rect.y + rect.height - 20,
  };
}

/**
 * Clamps a layer's center offset (percent from frame center, as stored on
 * GraphicLayer/TextLayer) so the layer's center stays within the print area.
 * This is a soft bound on drag — the hard visual guarantee is the clip-path.
 */
export function clampToPrintArea(rect: PrintAreaRect, x: number, y: number): { x: number; y: number } {
  const { minX, maxX, minY, maxY } = printAreaOffsetBounds(rect);
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
}
