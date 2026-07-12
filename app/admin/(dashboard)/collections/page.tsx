import Link from "next/link";
import { getCollectionsWithProductsAdmin } from "@/lib/db/collections";
import { deleteCollectionAction, setCollectionActiveAction } from "@/features/admin/collections/actions";
import { buttonVariants } from "@/components/ui/Button";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { cn } from "@/lib/utils";

export default async function AdminCollectionsPage() {
  const collections = await getCollectionsWithProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Link href="/admin/collections/new" className={buttonVariants({ size: "sm" })}>
          New collection
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-bg-raised text-fg-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr
                key={collection.id}
                className={cn("border-b border-border last:border-0", !collection.active && "opacity-60")}
              >
                <td className="px-4 py-3">{collection.name}</td>
                <td className="px-4 py-3 text-fg-muted">{collection.slug}</td>
                <td className="px-4 py-3 text-fg-muted">{collection.position}</td>
                <td className="px-4 py-3 text-fg-muted">{collection.products.length}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-medium",
                      collection.active ? "bg-accent/15 text-accent" : "bg-fg/10 text-fg-muted",
                    )}
                  >
                    {collection.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/collections/${collection.id}/edit`}
                      className="text-fg-muted underline hover:text-fg"
                    >
                      Edit
                    </Link>
                    <ConfirmForm
                      action={setCollectionActiveAction.bind(null, collection.id, !collection.active)}
                      confirmMessage={
                        collection.active
                          ? `Deactivate "${collection.name}"? It will be hidden from the storefront.`
                          : `Activate "${collection.name}"? It will become visible on the storefront.`
                      }
                    >
                      <button type="submit" className="text-fg-muted underline hover:text-fg">
                        {collection.active ? "Deactivate" : "Activate"}
                      </button>
                    </ConfirmForm>
                    <ConfirmForm
                      action={deleteCollectionAction.bind(null, collection.id)}
                      confirmMessage={`Delete "${collection.name}"? It will be removed from the store and admin list.`}
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
