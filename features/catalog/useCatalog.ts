"use client";

import { useContext } from "react";
import { CatalogContext, type CatalogValue } from "@/features/catalog/CatalogProvider";

export function useCatalog(): CatalogValue {
  const value = useContext(CatalogContext);
  if (!value) {
    throw new Error("useCatalog() must be used within a <CatalogProvider>");
  }
  return value;
}
