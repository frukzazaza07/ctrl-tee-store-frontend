"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-fg/20 p-0.5 text-xs font-medium"
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-pressed={locale === loc}
          className={cn(
            "rounded-full px-3 py-1 uppercase tracking-wide transition-colors",
            locale === loc
              ? "bg-fg text-bg"
              : "text-fg-muted hover:text-fg",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
