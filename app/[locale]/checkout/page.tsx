import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <Section>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("title")}</h1>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </Section>
  );
}
