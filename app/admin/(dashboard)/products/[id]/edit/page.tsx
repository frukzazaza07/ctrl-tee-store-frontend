import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";
import { updateProductAction } from "@/features/admin/products/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit product</h1>
      <ProductForm product={product} action={updateProductAction.bind(null, id)} />
    </div>
  );
}
