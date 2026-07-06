import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <Section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Suspense fallback={<p className="text-fg-muted">{t("loading")}</p>}>
        <OrderSuccess />
      </Suspense>
    </Section>
  );
}
