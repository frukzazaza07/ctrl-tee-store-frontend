"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useConfiguratorStore } from "@/features/configurator/store";
import { cn } from "@/lib/utils";
import type { GarmentStyle } from "@/types/product";

const STYLES: { id: GarmentStyle; labelKey: "styleCrew" | "styleVneck" | "styleLongSleeve" }[] = [
  { id: "crew", labelKey: "styleCrew" },
  { id: "vneck", labelKey: "styleVneck" },
  { id: "long-sleeve", labelKey: "styleLongSleeve" },
];

export function StepStyle() {
  const t = useTranslations("configurator");
  const router = useRouter();
  const garmentStyle = useConfiguratorStore((s) => s.garmentStyle);
  const setGarmentStyle = useConfiguratorStore((s) => s.setGarmentStyle);

  function handleSelect(style: GarmentStyle) {
    setGarmentStyle(style);
    router.replace(`/configure/${style}`, { scroll: false });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => handleSelect(s.id)}
          aria-pressed={garmentStyle === s.id}
          className={cn(
            "rounded-xl border px-4 py-6 text-sm font-medium transition-colors",
            garmentStyle === s.id
              ? "border-accent bg-accent/10 text-fg"
              : "border-border text-fg-muted hover:border-fg/40 hover:text-fg",
          )}
        >
          {t(s.labelKey)}
        </button>
      ))}
    </div>
  );
}
