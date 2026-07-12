import Link from "next/link";
import { getAllProductsAdmin } from "@/lib/db/products";
import { deleteProductAction, setProductActiveAction } from "@/features/admin/products/actions";
import { buttonVariants } from "@/components/ui/Button";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
          New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg-raised text-fg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={cn("border-b border-border last:border-0", !product.active && "opacity-60")}
              >
                <td className="px-4 py-3">{product.name.en}</td>
                <td className="px-4 py-3 text-fg-muted">{product.slug}</td>
                <td className="px-4 py-3 text-fg-muted">{product.category}</td>
                <td className="px-4 py-3 text-fg-muted">
                  ${product.price.USD} / ฿{product.price.THB}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      product.active ? "bg-accent/15 text-accent" : "bg-fg/10 text-fg-muted",
                    )}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-fg-muted underline hover:text-fg"
                    >
                      Edit
                    </Link>
                    <ConfirmForm
                      action={setProductActiveAction.bind(null, product.id, !product.active)}
                      confirmMessage={
                        product.active
                          ? `Deactivate "${product.name.en}"? It will be hidden from the storefront.`
                          : `Activate "${product.name.en}"? It will become visible on the storefront.`
                      }
                    >
                      <button type="submit" className="text-fg-muted underline hover:text-fg">
                        {product.active ? "Deactivate" : "Activate"}
                      </button>
                    </ConfirmForm>
                    <ConfirmForm
                      action={deleteProductAction.bind(null, product.id)}
                      confirmMessage={`Delete "${product.name.en}"? It will be removed from the store and admin list.`}
                    >
                      <button type="submit" className="text-accent underline hover:brightness-110">
                        Delete
                      </button>
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
