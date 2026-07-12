import { getAllProductsAdmin } from "@/lib/db/products";
import { createCollectionAction } from "@/features/admin/collections/actions";
import { CollectionForm } from "@/components/admin/CollectionForm";

export default async function NewCollectionPage() {
  const allProducts = await getAllProductsAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New collection</h1>
      <CollectionForm allProducts={allProducts} action={createCollectionAction} />
    </div>
  );
}
