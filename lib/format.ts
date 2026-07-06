import type { Locale } from "@/i18n/routing";

const CURRENCY_BY_LOCALE: Record<Locale, string> = {
  th: "THB",
  en: "USD",
};

export function currencyForLocale(locale: Locale): string {
  return CURRENCY_BY_LOCALE[locale];
}

export function formatPrice(
  amount: { THB: number; USD: number },
  locale: Locale,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyForLocale(locale),
    maximumFractionDigits: 0,
  }).format(locale === "th" ? amount.THB : amount.USD);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}
