"use client";

import { createContext, type ReactNode } from "react";
import type { Product } from "@/types/product";
import type { Garment } from "@/types/configurator";

export interface CatalogValue {
  products: Product[];
  garments: Garment[];
}

export const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({
  products,
  garments,
  children,
}: CatalogValue & { children: ReactNode }) {
  return (
    <CatalogContext.Provider value={{ products, garments }}>{children}</CatalogContext.Provider>
  );
}
