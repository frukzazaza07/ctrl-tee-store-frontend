"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlaceholderArt, type PlaceholderShape } from "@/components/ui/PlaceholderArt";
import { cn } from "@/lib/utils";

const VIEW_COUNT = 3;

export function Gallery({ seed, shape }: { seed: string; shape: PlaceholderShape }) {
  const t = useTranslations("product");
  const [active, setActive] = useState(0);
  const views = Array.from({ length: VIEW_COUNT }, (_, i) => `${seed}-${i}`);

  return (
    <div role="group" aria-label={t("gallery")}>
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-bg">
        <PlaceholderArt seed={views[active]} shape={shape} />
      </div>
      <div className="mt-4 flex gap-3">
        {views.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => setActive(i)}
            aria-current={active === i}
            className={cn(
              "h-20 w-16 overflow-hidden rounded-lg border-2 transition-colors",
              active === i ? "border-accent" : "border-border hover:border-fg/40",
            )}
          >
            <PlaceholderArt seed={v} shape={shape} />
          </button>
        ))}
      </div>
    </div>
  );
}
