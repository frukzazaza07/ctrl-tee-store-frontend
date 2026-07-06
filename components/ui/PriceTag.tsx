import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  price: { THB: number; USD: number };
  locale: Locale;
  from?: boolean;
  className?: string;
}

export function PriceTag({ price, locale, from, className }: PriceTagProps) {
  const t = useTranslations("common");
  const formatted = formatPrice(price, locale);

  return (
    <span className={cn("font-medium", className)}>
      {from ? t("fromPrice", { price: formatted }) : formatted}
    </span>
  );
}
