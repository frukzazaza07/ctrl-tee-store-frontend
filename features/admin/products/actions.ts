"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/current-session";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductActive,
  type ProductInput,
} from "@/lib/db/products";
import type { GarmentColorId } from "@/lib/theme";
import type { ProductCategory, GarmentStyle } from "@/types/product";

export interface ProductFormState {
  error?: string;
}

function parseInput(formData: FormData): ProductInput {
  const colors = formData.getAll("colors").map(String) as GarmentColorId[];
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const garmentStyleRaw = String(formData.get("garmentStyle") ?? "");

  return {
    slug: String(formData.get("slug") ?? "").trim(),
    category: String(formData.get("category") ?? "") as ProductCategory,
    price: {
      THB: Number(formData.get("priceThb") ?? 0),
      USD: Number(formData.get("priceUsd") ?? 0),
    },
    colors,
    sizes,
    featured: formData.get("featured") === "on",
    configurable: formData.get("configurable") === "on",
    garmentStyle: garmentStyleRaw ? (garmentStyleRaw as GarmentStyle) : undefined,
    name: {
      en: String(formData.get("nameEn") ?? "").trim(),
      th: String(formData.get("nameTh") ?? "").trim(),
    },
    description: {
      en: String(formData.get("descriptionEn") ?? "").trim(),
      th: String(formData.get("descriptionTh") ?? "").trim(),
    },
  };
}

function validate(input: ProductInput): string | null {
  if (!input.slug) return "Slug is required.";
  if (!/^[a-z0-9-]+$/.test(input.slug)) return "Slug must be lowercase letters, numbers, and hyphens only.";
  if (!input.category) return "Category is required.";
  if (input.price.THB <= 0 || input.price.USD <= 0) return "Prices must be greater than zero.";
  if (input.colors.length === 0) return "Pick at least one color.";
  if (input.sizes.length === 0) return "Add at least one size.";
  if (!input.name.en || !input.name.th) return "Name is required in both languages.";
  if (!input.description.en || !input.description.th) return "Description is required in both languages.";
  if (input.configurable && !input.garmentStyle) return "Configurable products need a garment style.";
  return null;
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminSession();
  const input = parseInput(formData);
  const error = validate(input);
  if (error) return { error };
  await createProduct(input);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminSession();
  const input = parseInput(formData);
  const error = validate(input);
  if (error) return { error };
  await updateProduct(id, input);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdminSession();
  await deleteProduct(id);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function setProductActiveAction(id: string, active: boolean): Promise<void> {
  await requireAdminSession();
  await setProductActive(id, active);
  revalidatePath("/", "layout");
}
