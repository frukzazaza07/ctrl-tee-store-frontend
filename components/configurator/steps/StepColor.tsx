"use client";

import { useTranslations } from "next-intl";
import { useConfiguratorStore } from "@/features/configurator/store";
import { garmentColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

const COLOR_LABEL_KEY = {
  black: "colorBlack",
  white: "colorWhite",
  red: "colorRed",
  stone: "colorStone",
  navy: "colorNavy",
  olive: "colorOlive",
} as const;

export function StepColor() {
  const t = useTranslations("configurator");
  const color = useConfiguratorStore((s) => s.color);
  const setColor = useConfiguratorStore((s) => s.setColor);

  return (
    <div className="flex flex-wrap gap-3">
      {garmentColors.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setColor(c.id)}
          aria-pressed={color === c.id}
          aria-label={t(COLOR_LABEL_KEY[c.id])}
          title={t(COLOR_LABEL_KEY[c.id])}
          className={cn(
            "h-11 w-11 rounded-full border-2 transition-transform",
            color === c.id
              ? "scale-110 border-accent"
              : "border-border hover:scale-105",
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}
