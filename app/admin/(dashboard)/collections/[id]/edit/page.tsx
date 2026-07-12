import { notFound } from "next/navigation";
import { getCollectionByIdAdmin } from "@/lib/db/collections";
import { getAllProductsAdmin } from "@/lib/db/products";
import { updateCollectionAction } from "@/features/admin/collections/actions";
import { CollectionForm } from "@/components/admin/CollectionForm";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [collection, allProducts] = await Promise.all([getCollectionByIdAdmin(id), getAllProductsAdmin()]);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit collection</h1>
      <CollectionForm
        collection={collection}
        allProducts={allProducts}
        action={updateCollectionAction.bind(null, id)}
      />
    </div>
  );
}
