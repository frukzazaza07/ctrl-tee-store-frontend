"use client";

import { useTranslations } from "next-intl";
import {
  useConfiguratorStore,
  defaultTextLayer,
} from "@/features/configurator/store";
import { useCatalog } from "@/features/catalog/useCatalog";
import { getPrintArea, printAreaOffsetBounds } from "@/features/configurator/printArea";
import { Slider } from "@/components/ui/Slider";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { TextFont } from "@/types/configurator";

const FONTS: { id: TextFont; labelKey: "textFontSans" | "textFontSerif" | "textFontMono" }[] = [
  { id: "sans", labelKey: "textFontSans" },
  { id: "serif", labelKey: "textFontSerif" },
  { id: "mono", labelKey: "textFontMono" },
];

export function StepText() {
  const t = useTranslations("configurator");
  const view = useConfiguratorStore((s) => s.view);
  const front = useConfiguratorStore((s) => s.front);
  const back = useConfiguratorStore((s) => s.back);
  const garmentStyle = useConfiguratorStore((s) => s.garmentStyle);
  const setText = useConfiguratorStore((s) => s.setText);
  const updateText = useConfiguratorStore((s) => s.updateText);

  const side = view === "front" ? front : back;
  const text = side.text;
  const { garments } = useCatalog();
  const garment = garments.find((g) => g.id === garmentStyle);
  const bounds = garment
    ? printAreaOffsetBounds(getPrintArea(garment, view))
    : { minX: -45, maxX: 45, minY: -45, maxY: 45 };

  if (!text) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-fg-muted">{t("textNone")}</p>
        <button
          type="button"
          onClick={() => setText(view, defaultTextLayer())}
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          {t("textAdd")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm text-fg-muted">{t("textContent")}</span>
        <input
          type="text"
          value={text.content}
          placeholder={t("textPlaceholder")}
          onChange={(e) => updateText(view, { content: e.target.value })}
          maxLength={40}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg placeholder:text-fg-muted/60 focus:border-accent focus:outline-none"
        />
      </label>

      <div className="flex items-end gap-4">
        <label className="flex-1">
          <span className="text-sm text-fg-muted">{t("textFont")}</span>
          <select
            value={text.font}
            onChange={(e) => updateText(view, { font: e.target.value as TextFont })}
            className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-fg focus:border-accent focus:outline-none"
          >
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {t(f.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col items-center">
          <span className="text-sm text-fg-muted">{t("textColor")}</span>
          <input
            type="color"
            value={text.color}
            onChange={(e) => updateText(view, { color: e.target.value })}
            className="mt-2 h-10 w-14 cursor-pointer rounded border border-border bg-bg"
            aria-label={t("textColor")}
          />
        </label>
      </div>

      <Slider
        label={t("graphicPositionX")}
        value={text.x}
        min={bounds.minX}
        max={bounds.maxX}
        onChange={(v) => updateText(view, { x: v })}
      />
      <Slider
        label={t("graphicPositionY")}
        value={text.y}
        min={bounds.minY}
        max={bounds.maxY}
        onChange={(v) => updateText(view, { y: v })}
      />
      <Slider
        label={t("graphicScale")}
        value={text.size}
        min={14}
        max={72}
        onChange={(v) => updateText(view, { size: v })}
        formatValue={(v) => `${v}px`}
      />
      <Slider
        label={t("graphicRotation")}
        value={text.rotation}
        min={-180}
        max={180}
        onChange={(v) => updateText(view, { rotation: v })}
        formatValue={(v) => `${v}°`}
      />

      <button
        type="button"
        onClick={() => setText(view, null)}
        className={cn("text-sm text-fg-muted underline hover:text-fg")}
      >
        {t("textRemove")}
      </button>
    </div>
  );
}
