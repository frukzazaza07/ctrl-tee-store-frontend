"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Slider } from "@/components/ui/Slider";
import { garmentColors, type GarmentColorId } from "@/lib/theme";
import { COLOR_LABEL_KEY } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types/product";

interface FilterSidebarProps {
  locale: Locale;
  category: ProductCategory | "all";
  onCategoryChange: (category: ProductCategory | "all") => void;
  availableColors: GarmentColorId[];
  selectedColors: GarmentColorId[];
  onToggleColor: (color: GarmentColorId) => void;
  availableSizes: string[];
  selectedSizes: string[];
  onToggleSize: (size: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  priceBounds: { min: number; max: number };
}

const CATEGORIES: (ProductCategory | "all")[] = ["all", "tshirts", "hoodies", "caps"];

export function FilterSidebar({
  locale,
  category,
  onCategoryChange,
  availableColors,
  selectedColors,
  onToggleColor,
  availableSizes,
  selectedSizes,
  onToggleSize,
  maxPrice,
  onMaxPriceChange,
  priceBounds,
}: FilterSidebarProps) {
  const t = useTranslations("shop");
  const tNav = useTranslations("nav");
  const tConfigurator = useTranslations("configurator");
  const colors = garmentColors.filter((c) => availableColors.includes(c.id));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-fg-muted">{t("filterCategory")}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                category === c
                  ? "border-fg bg-fg text-bg"
                  : "border-border text-fg-muted hover:text-fg",
              )}
            >
              {c === "all" ? t("allCategories") : tNav(c)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-fg-muted">{t("filterColor")}</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onToggleColor(c.id)}
              aria-pressed={selectedColors.includes(c.id)}
              aria-label={tConfigurator(COLOR_LABEL_KEY[c.id])}
              title={tConfigurator(COLOR_LABEL_KEY[c.id])}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-transform",
                selectedColors.includes(c.id)
                  ? "scale-110 border-accent"
                  : "border-border hover:scale-105",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-fg-muted">{t("filterSize")}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onToggleSize(s)}
              aria-pressed={selectedSizes.includes(s)}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm transition-colors",
                selectedSizes.includes(s)
                  ? "border-accent bg-accent/10 text-fg"
                  : "border-border text-fg-muted hover:border-fg/40 hover:text-fg",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Slider
          label={t("filterPrice")}
          value={maxPrice}
          min={priceBounds.min}
          max={priceBounds.max}
          onChange={onMaxPriceChange}
          formatValue={(v) => t("upTo", { price: formatPrice({ THB: v, USD: v }, locale) })}
        />
      </div>
    </div>
  );
}
