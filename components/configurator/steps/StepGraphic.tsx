"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import {
  useConfiguratorStore,
  defaultGraphicLayer,
} from "@/features/configurator/store";
import { getGarment } from "@/lib/garments";
import { getPrintArea, printAreaOffsetBounds } from "@/features/configurator/printArea";
import { validateDesignFile, readDesignFileAsDataUrl } from "@/features/configurator/upload";
import { graphicsLibrary } from "@/lib/graphics-library";
import { Slider } from "@/components/ui/Slider";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function StepGraphic() {
  const t = useTranslations("configurator");
  const view = useConfiguratorStore((s) => s.view);
  const front = useConfiguratorStore((s) => s.front);
  const back = useConfiguratorStore((s) => s.back);
  const garmentStyle = useConfiguratorStore((s) => s.garmentStyle);
  const setGraphic = useConfiguratorStore((s) => s.setGraphic);
  const updateGraphic = useConfiguratorStore((s) => s.updateGraphic);

  const side = view === "front" ? front : back;
  const graphic = side.graphic;
  const [tab, setTab] = useState<"upload" | "library">(
    graphic?.source ?? "library",
  );
  const [error, setError] = useState<"type" | "size" | null>(null);

  const garment = getGarment(garmentStyle);
  const bounds = garment
    ? printAreaOffsetBounds(getPrintArea(garment, view))
    : { minX: -45, maxX: 45, minY: -45, maxY: 45 };

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = validateDesignFile(file);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    const dataUrl = await readDesignFileAsDataUrl(file);
    setGraphic(view, defaultGraphicLayer("upload", dataUrl));
  }

  function handlePickLibrary(id: string) {
    setGraphic(view, defaultGraphicLayer("library", id));
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex gap-1 rounded-full border border-border p-0.5 text-sm">
        <button
          type="button"
          onClick={() => setTab("library")}
          aria-pressed={tab === "library"}
          className={cn(
            "rounded-full px-4 py-1.5 transition-colors",
            tab === "library" ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
          )}
        >
          {t("graphicLibraryTab")}
        </button>
        <button
          type="button"
          onClick={() => setTab("upload")}
          aria-pressed={tab === "upload"}
          className={cn(
            "rounded-full px-4 py-1.5 transition-colors",
            tab === "upload" ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
          )}
        >
          {t("graphicUploadTab")}
        </button>
      </div>

      {tab === "library" ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {graphicsLibrary.map((g) => {
            const active = graphic?.source === "library" && graphic.value === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handlePickLibrary(g.id)}
                aria-pressed={active}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl border p-3 text-fg",
                  active
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-fg/40",
                )}
              >
                <svg viewBox={g.viewBox} className="h-full w-full">
                  <path d={g.path} fillRule={g.fillRule} fill="currentColor" />
                </svg>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          <label
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "cursor-pointer",
            )}
          >
            {t("graphicUploadCta")}
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-accent">
              {error === "type" ? t("graphicUploadErrorType") : t("graphicUploadErrorSize")}
            </p>
          )}
        </div>
      )}

      {graphic ? (
        <div className="space-y-4 border-t border-border pt-5">
          <Slider
            label={t("graphicPositionX")}
            value={graphic.x}
            min={bounds.minX}
            max={bounds.maxX}
            onChange={(v) => updateGraphic(view, { x: v })}
          />
          <Slider
            label={t("graphicPositionY")}
            value={graphic.y}
            min={bounds.minY}
            max={bounds.maxY}
            onChange={(v) => updateGraphic(view, { y: v })}
          />
          <Slider
            label={t("graphicScale")}
            value={graphic.scale}
            min={0.3}
            max={2.5}
            step={0.05}
            onChange={(v) => updateGraphic(view, { scale: v })}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label={t("graphicRotation")}
            value={graphic.rotation}
            min={-180}
            max={180}
            onChange={(v) => updateGraphic(view, { rotation: v })}
            formatValue={(v) => `${v}°`}
          />
          <button
            type="button"
            onClick={() => setGraphic(view, null)}
            className="text-sm text-fg-muted underline hover:text-fg"
          >
            {t("graphicRemove")}
          </button>
        </div>
      ) : (
        <p className="text-sm text-fg-muted">{t("graphicNone")}</p>
      )}
    </div>
  );
}
