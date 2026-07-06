"use client";

import { useTranslations } from "next-intl";
import { useConfiguratorStore } from "@/features/configurator/store";
import { cn } from "@/lib/utils";
import type { ConfiguratorView } from "@/types/configurator";

export function ViewToggle() {
  const t = useTranslations("configurator");
  const view = useConfiguratorStore((s) => s.view);
  const setView = useConfiguratorStore((s) => s.setView);

  const views: { id: ConfiguratorView; label: string }[] = [
    { id: "front", label: t("viewFront") },
    { id: "back", label: t("viewBack") },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border p-0.5 text-sm"
      role="group"
    >
      {views.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => setView(v.id)}
          aria-pressed={view === v.id}
          className={cn(
            "rounded-full px-4 py-1.5 transition-colors",
            view === v.id ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
