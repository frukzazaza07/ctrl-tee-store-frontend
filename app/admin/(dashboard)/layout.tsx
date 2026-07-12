import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/current-session";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-6 text-sm">
            <span className="font-semibold tracking-widest text-fg-muted">CTRL TEE ADMIN</span>
            <Link href="/admin/products" className="text-fg-muted hover:text-fg">
              Products
            </Link>
            <Link href="/admin/collections" className="text-fg-muted hover:text-fg">
              Collections
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm text-fg-muted">
            {session ? <span>{session.email}</span> : null}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </>
  );
}
