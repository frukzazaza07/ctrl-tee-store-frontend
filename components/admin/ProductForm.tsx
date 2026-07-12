"use client";

import { useActionState } from "react";
import { garmentColors } from "@/lib/theme";
import { Input } from "@/components/ui/Input";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory, GarmentStyle } from "@/types/product";
import type { ProductFormState } from "@/features/admin/products/actions";

const CATEGORIES: ProductCategory[] = ["tshirts", "hoodies", "caps"];
const GARMENT_STYLES: GarmentStyle[] = ["crew", "vneck", "long-sleeve"];

interface ProductFormProps {
  product?: Product;
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
}

export function ProductForm({ product, action }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Slug" name="slug" defaultValue={product?.slug} placeholder="classic-crew" required />
        <label className="block">
          <span className="text-sm text-fg-muted">Category</span>
          <select
            name="category"
            defaultValue={product?.category ?? CATEGORIES[0]}
            className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg focus:border-accent focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (THB)"
          name="priceThb"
          type="number"
          min={0}
          defaultValue={product?.price.THB}
          required
        />
        <Input
          label="Price (USD)"
          name="priceUsd"
          type="number"
          min={0}
          defaultValue={product?.price.USD}
          required
        />
      </div>

      <div>
        <span className="text-sm text-fg-muted">Colors</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {garmentColors.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="colors"
                value={c.id}
                defaultChecked={product?.colors.includes(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Sizes (comma-separated)"
        name="sizes"
        defaultValue={product?.sizes.join(", ")}
        placeholder="S, M, L, XL"
        required
      />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="configurable" defaultChecked={product?.configurable} />
          Configurable
        </label>
      </div>

      <label className="block">
        <span className="text-sm text-fg-muted">Garment style (for configurable products)</span>
        <select
          name="garmentStyle"
          defaultValue={product?.garmentStyle ?? ""}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg focus:border-accent focus:outline-none"
        >
          <option value="">None</option>
          {GARMENT_STYLES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Name (English)" name="nameEn" defaultValue={product?.name.en} required />
        <Input label="Name (Thai)" name="nameTh" defaultValue={product?.name.th} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-fg-muted">Description (English)</span>
          <textarea
            name="descriptionEn"
            defaultValue={product?.description.en}
            rows={3}
            required
            className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-fg-muted">Description (Thai)</span>
          <textarea
            name="descriptionTh"
            defaultValue={product?.description.th}
            rows={3}
            required
            className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      {state.error ? <p className="text-sm text-accent">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg", className: "disabled:opacity-70" }))}
      >
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
