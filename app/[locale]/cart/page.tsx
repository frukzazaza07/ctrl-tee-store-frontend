import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { CartView } from "@/components/cart/CartView";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "cart" });

  return (
    <Section>
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        {t("title")}
      </h1>
      <div className="mt-10">
        <CartView />
      </div>
    </Section>
  );
}
