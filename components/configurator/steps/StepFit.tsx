"use client";

import { useTranslations } from "next-intl";
import { useConfiguratorStore } from "@/features/configurator/store";
import { cn } from "@/lib/utils";
import type { GarmentFit } from "@/types/configurator";

const FITS: { id: GarmentFit; labelKey: "fitSlim" | "fitRegular" | "fitOversized" }[] = [
  { id: "slim", labelKey: "fitSlim" },
  { id: "regular", labelKey: "fitRegular" },
  { id: "oversized", labelKey: "fitOversized" },
];

export function StepFit() {
  const t = useTranslations("configurator");
  const fit = useConfiguratorStore((s) => s.fit);
  const setFit = useConfiguratorStore((s) => s.setFit);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {FITS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => setFit(f.id)}
          aria-pressed={fit === f.id}
          className={cn(
            "rounded-xl border px-4 py-6 text-sm font-medium transition-colors",
            fit === f.id
              ? "border-accent bg-accent/10 text-fg"
              : "border-border text-fg-muted hover:border-fg/40 hover:text-fg",
          )}
        >
          {t(f.labelKey)}
        </button>
      ))}
    </div>
  );
}
