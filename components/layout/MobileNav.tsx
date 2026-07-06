"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
      >
        <span className="sr-only">Menu</span>
        <span
          className={cn(
            "h-px w-6 bg-fg transition-transform",
            open && "translate-y-[3.5px] rotate-45",
          )}
        />
        <span
          className={cn(
            "h-px w-6 bg-fg transition-transform",
            open && "-translate-y-[3.5px] -rotate-45",
          )}
        />
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col gap-2 overflow-y-auto bg-bg px-6 py-8"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-4 text-lg"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
