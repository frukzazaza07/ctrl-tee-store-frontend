"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { useConfiguratorStore, configFromState } from "@/features/configurator/store";
import { calculatePrice } from "@/features/configurator/pricing";
import { useCatalog } from "@/features/catalog/useCatalog";
import { formatPrice } from "@/lib/format";

export function PriceSummaryBar() {
  const locale = useLocale() as Locale;
  const t = useTranslations("configurator");
  const state = useConfiguratorStore();
  const { garments } = useCatalog();
  const garment = garments.find((g) => g.id === state.garmentStyle);
  const price = calculatePrice(configFromState(state), garment);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-bg-raised px-6 py-4">
      <span className="text-sm text-fg-muted">{t("summaryTotal")}</span>
      <span className="text-2xl font-semibold">{formatPrice(price, locale)}</span>
    </div>
  );
}
