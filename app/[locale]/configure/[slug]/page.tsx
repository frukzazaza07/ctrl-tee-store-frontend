import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isGarmentStyle } from "@/lib/garments";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";

export default async function ConfigureSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ c?: string }>;
}) {
  const { locale, slug } = await params;
  const { c } = await searchParams;
  setRequestLocale(locale);

  if (!isGarmentStyle(slug)) {
    notFound();
  }

  return <ConfiguratorClient garmentStyle={slug} shareParam={c} />;
}
