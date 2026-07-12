"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/current-session";
import {
  createCollection,
  updateCollection,
  deleteCollection,
  setCollectionProducts,
  setCollectionActive,
  type CollectionInput,
} from "@/lib/db/collections";

export interface CollectionFormState {
  error?: string;
}

function parseInput(formData: FormData): { collection: CollectionInput; productIds: string[] } {
  return {
    collection: {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      position: Number(formData.get("position") ?? 0),
    },
    productIds: formData.getAll("productIds").map(String),
  };
}

function validate(input: CollectionInput): string | null {
  if (!input.name) return "Name is required.";
  if (!input.slug) return "Slug is required.";
  if (!/^[a-z0-9-]+$/.test(input.slug)) return "Slug must be lowercase letters, numbers, and hyphens only.";
  return null;
}

export async function createCollectionAction(
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requireAdminSession();
  const { collection, productIds } = parseInput(formData);
  const error = validate(collection);
  if (error) return { error };

  const created = await createCollection(collection);
  await setCollectionProducts(created.id, productIds);
  revalidatePath("/", "layout");
  redirect("/admin/collections");
}

export async function updateCollectionAction(
  id: string,
  _prevState: CollectionFormState,
  formData: FormData,
): Promise<CollectionFormState> {
  await requireAdminSession();
  const { collection, productIds } = parseInput(formData);
  const error = validate(collection);
  if (error) return { error };

  await updateCollection(id, collection);
  await setCollectionProducts(id, productIds);
  revalidatePath("/", "layout");
  redirect("/admin/collections");
}

export async function deleteCollectionAction(id: string): Promise<void> {
  await requireAdminSession();
  await deleteCollection(id);
  revalidatePath("/", "layout");
  redirect("/admin/collections");
}

export async function setCollectionActiveAction(id: string, active: boolean): Promise<void> {
  await requireAdminSession();
  await setCollectionActive(id, active);
  revalidatePath("/", "layout");
}
