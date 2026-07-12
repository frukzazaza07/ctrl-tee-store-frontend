import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/features/admin/products/actions";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New product</h1>
      <ProductForm action={createProductAction} />
    </div>
  );
}
