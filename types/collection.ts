import type { Product } from "@/types/product";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  position: number;
}

export interface CollectionWithProducts extends Collection {
  products: Product[];
}
