"use client";

import { useCatalog } from "@/features/catalog/useCatalog";
import type { ConfiguratorView } from "@/types/configurator";
import type { GarmentStyle } from "@/types/product";
import type { GarmentColorId } from "@/lib/theme";

interface GarmentPhotoProps {
  style: GarmentStyle;
  view: ConfiguratorView;
  color: GarmentColorId;
}

export function GarmentPhoto({ style, view, color }: GarmentPhotoProps) {
  const { garments } = useCatalog();
  const garment = garments.find((g) => g.id === style);
  const src = garment?.images[color][view];
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static asset, no next/image usage elsewhere in this codebase
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
