"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { CollectionWithProducts } from "@/types/collection";
import type { CollectionFormState } from "@/features/admin/collections/actions";

interface CollectionFormProps {
  collection?: CollectionWithProducts;
  allProducts: Product[];
  action: (state: CollectionFormState, formData: FormData) => Promise<CollectionFormState>;
}

export function CollectionForm({ collection, allProducts, action }: CollectionFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const memberIds = new Set(collection?.products.map((p) => p.id));

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" name="name" defaultValue={collection?.name} placeholder="New Arrivals" required />
        <Input label="Slug" name="slug" defaultValue={collection?.slug} placeholder="new-arrivals" required />
      </div>

      <Input
        label="Position (lower shows first on the homepage)"
        name="position"
        type="number"
        defaultValue={collection?.position ?? 0}
        required
      />

      <div>
        <span className="text-sm text-fg-muted">Products in this collection</span>
        <div className="mt-2 max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
          {allProducts.map((product) => (
            <label key={product.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="productIds"
                value={product.id}
                defaultChecked={memberIds.has(product.id)}
              />
              {product.name.en}
              <span className="text-fg-muted">({product.slug})</span>
            </label>
          ))}
        </div>
      </div>

      {state.error ? <p className="text-sm text-accent">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ size: "lg", className: "disabled:opacity-70" }))}
      >
        {pending ? "Saving…" : collection ? "Save changes" : "Create collection"}
      </button>
    </form>
  );
}
