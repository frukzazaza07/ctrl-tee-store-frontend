"use client";

import { logout } from "@/features/auth/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-fg-muted underline hover:text-fg">
        Log out
      </button>
    </form>
  );
}
