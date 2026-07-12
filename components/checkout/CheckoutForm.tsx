"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { useRouter } from "@/i18n/navigation";
import { useCartStore } from "@/features/cart/store";
import { cartSubtotal } from "@/features/cart/totals";
import { createOrder } from "@/features/orders/actions";
import { toOrderItemSnapshot } from "@/features/orders/snapshot";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/Input";
import { buttonVariants } from "@/components/ui/Button";

type FieldKey =
  | "fullName"
  | "email"
  | "address"
  | "city"
  | "postalCode"
  | "country"
  | "cardNumber"
  | "cardExpiry"
  | "cardCvc";

type Fields = Record<FieldKey, string>;

const initialFields: Fields = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
};

const REQUIRED_FIELDS: FieldKey[] = [
  "fullName",
  "email",
  "address",
  "city",
  "postalCode",
  "country",
];

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = cartSubtotal(items);

  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function setField(key: FieldKey, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<FieldKey, string>> = {};

    for (const key of REQUIRED_FIELDS) {
      if (!fields[key].trim()) next[key] = t("required");
    }
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      next.email = t("invalidEmail");
    }
    if (!/^\d{16}$/.test(fields.cardNumber.replace(/\s+/g, ""))) {
      next.cardNumber = t("invalidCard");
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fields.cardExpiry.trim())) {
      next.cardExpiry = t("invalidExpiry");
    }
    if (!/^\d{3}$/.test(fields.cardCvc.trim())) {
      next.cardCvc = t("invalidCvc");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { orderNumber } = await createOrder({
        locale,
        fullName: fields.fullName,
        email: fields.email,
        address: fields.address,
        city: fields.city,
        postalCode: fields.postalCode,
        country: fields.country,
        subtotal,
        items: items.map(toOrderItemSnapshot),
      });
      clear();
      router.push(`/checkout/success?order=${orderNumber}&email=${encodeURIComponent(fields.email)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="py-16 text-center text-fg-muted">{t("emptyCart")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="mb-2 text-lg font-medium">{t("shippingTitle")}</legend>
          <Input
            label={t("fullName")}
            name="fullName"
            value={fields.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            error={errors.fullName}
          />
          <Input
            label={t("email")}
            name="email"
            type="email"
            value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            error={errors.email}
          />
          <Input
            label={t("address")}
            name="address"
            value={fields.address}
            onChange={(e) => setField("address", e.target.value)}
            error={errors.address}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("city")}
              name="city"
              value={fields.city}
              onChange={(e) => setField("city", e.target.value)}
              error={errors.city}
            />
            <Input
              label={t("postalCode")}
              name="postalCode"
              value={fields.postalCode}
              onChange={(e) => setField("postalCode", e.target.value)}
              error={errors.postalCode}
            />
          </div>
          <Input
            label={t("country")}
            name="country"
            value={fields.country}
            onChange={(e) => setField("country", e.target.value)}
            error={errors.country}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-2 text-lg font-medium">{t("paymentTitle")}</legend>
          <p className="text-sm text-fg-muted">{t("mockPaymentNote")}</p>
          <Input
            label={t("cardNumber")}
            name="cardNumber"
            inputMode="numeric"
            maxLength={19}
            placeholder="4242 4242 4242 4242"
            value={fields.cardNumber}
            onChange={(e) => setField("cardNumber", e.target.value)}
            error={errors.cardNumber}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("cardExpiry")}
              name="cardExpiry"
              placeholder="MM/YY"
              value={fields.cardExpiry}
              onChange={(e) => setField("cardExpiry", e.target.value)}
              error={errors.cardExpiry}
            />
            <Input
              label={t("cardCvc")}
              name="cardCvc"
              inputMode="numeric"
              maxLength={3}
              value={fields.cardCvc}
              onChange={(e) => setField("cardCvc", e.target.value)}
              error={errors.cardCvc}
            />
          </div>
        </fieldset>
      </div>

      <div className="h-fit space-y-4 rounded-2xl border border-border bg-bg-raised p-6">
        <h2 className="font-medium">{t("orderSummary")}</h2>
        <ul className="space-y-2 text-sm text-fg-muted">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>× {item.quantity}</span>
              <span>
                {formatPrice(
                  {
                    THB: item.unitPrice.THB * item.quantity,
                    USD: item.unitPrice.USD * item.quantity,
                  },
                  locale,
                )}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-fg-muted">{tCart("subtotal")}</span>
          <span className="text-xl font-semibold">{formatPrice(subtotal, locale)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={buttonVariants({ size: "lg", className: "w-full disabled:opacity-70" })}
        >
          {submitting ? t("placingOrder") : t("placeOrder")}
        </button>
      </div>
    </form>
  );
}
