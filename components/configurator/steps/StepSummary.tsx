"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import {
  useConfiguratorStore,
  configFromState,
} from "@/features/configurator/store";
import { calculatePrice } from "@/features/configurator/pricing";
import { buildCartExport } from "@/features/configurator/export";
import { useCatalog } from "@/features/catalog/useCatalog";
import { formatPrice } from "@/lib/format";
import { garmentColors } from "@/lib/theme";
import { COLOR_LABEL_KEY, STYLE_LABEL_KEY, FIT_LABEL_KEY } from "@/lib/labels";
import { useCartStore } from "@/features/cart/store";
import { buttonVariants } from "@/components/ui/Button";
import { ShareLinkButton } from "@/components/configurator/ShareLinkButton";
import { SizeSelector } from "@/components/product/SizeSelector";
import { cn } from "@/lib/utils";

const SIZES = ["S", "M", "L", "XL"];

export function StepSummary() {
  const t = useTranslations("configurator");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const state = useConfiguratorStore((s) => s);
  const config = configFromState(state);
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const { garments } = useCatalog();
  const garment = garments.find((g) => g.id === config.garmentStyle);
  const price = calculatePrice(config, garment);
  const colorHex = garmentColors.find((c) => c.id === config.color)?.hex;

  const graphicSides = [
    config.front.graphic ? t("viewFront") : null,
    config.back.graphic ? t("viewBack") : null,
  ].filter((v): v is string => Boolean(v));

  const textSides = [
    config.front.text?.content ? `${t("viewFront")}: "${config.front.text.content}"` : null,
    config.back.text?.content ? `${t("viewBack")}: "${config.back.text.content}"` : null,
  ].filter((v): v is string => Boolean(v));

  async function handleAddToCart() {
    setAdding(true);
    const { thumbnail, printFiles } = await buildCartExport(config, garment);
    addItem({
      id: crypto.randomUUID(),
      kind: "configurator",
      config,
      quantity: 1,
      unitPrice: price,
      size,
      color: config.color,
      thumbnail,
      printFiles,
    });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{t("summaryTitle")}</h3>

      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <dt className="text-fg-muted">{t("summaryStyle")}</dt>
        <dd>{t(STYLE_LABEL_KEY[config.garmentStyle])}</dd>

        <dt className="text-fg-muted">{t("summaryFit")}</dt>
        <dd>{t(FIT_LABEL_KEY[config.fit])}</dd>

        <dt className="text-fg-muted">{t("summaryColor")}</dt>
        <dd className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-border"
            style={{ backgroundColor: colorHex }}
          />
          {t(COLOR_LABEL_KEY[config.color])}
        </dd>

        <dt className="text-fg-muted">{t("summaryGraphic")}</dt>
        <dd>{graphicSides.length ? graphicSides.join(", ") : t("summaryNone")}</dd>

        <dt className="text-fg-muted">{t("summaryText")}</dt>
        <dd>{textSides.length ? textSides.join(", ") : t("summaryNone")}</dd>
      </dl>

      <div>
        <span className="text-sm text-fg-muted">{tCommon("size")}</span>
        <div className="mt-2">
          <SizeSelector sizes={SIZES} value={size} onChange={setSize} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <span className="text-sm text-fg-muted">{t("summaryTotal")}</span>
        <span className="text-2xl font-semibold">{formatPrice(price, locale)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className={cn(buttonVariants({ size: "lg" }), adding && "opacity-70")}
        >
          {added ? t("summaryAdded") : adding ? t("summaryAdding") : tCommon("addToCart")}
        </button>
        <ShareLinkButton />
      </div>
    </div>
  );
}
