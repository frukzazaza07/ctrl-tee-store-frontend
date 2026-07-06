"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export function OrderSuccess() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const searchParams = useSearchParams();
  const order = searchParams.get("order") ?? "";
  const email = searchParams.get("email") ?? "";

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("successTitle")}</h1>
      <p className="mt-4 max-w-md text-fg-muted">{t("successBody", { email })}</p>
      {order ? (
        <p className="mt-6 text-sm text-fg-muted">
          {t("orderNumber")}: <span className="font-medium text-fg">{order}</span>
        </p>
      ) : null}
      <Link href="/shop" className={buttonVariants({ size: "lg", className: "mt-10" })}>
        {tCart("continueShopping")}
      </Link>
    </>
  );
}
