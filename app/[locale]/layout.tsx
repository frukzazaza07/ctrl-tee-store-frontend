import type { Metadata } from "next";
import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CatalogProvider } from "@/features/catalog/CatalogProvider";
import { getAllProducts } from "@/lib/db/products";
import { getAllGarments } from "@/lib/db/garments";
import "../globals.css";

const bodyFont = IBM_Plex_Sans_Thai({
  variable: "--font-body",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// The catalog (products/garments) now comes from Postgres via this layout's
// fetch, not a static import — force every page under it to render per
// request so DB changes show up immediately instead of only after a
// redeploy (static prerendering would otherwise freeze the catalog at build time).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("brand"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [products, garments] = await Promise.all([getAllProducts(), getAllGarments()]);

  return (
    <html lang={locale} className={`${bodyFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>
          <CatalogProvider products={products} garments={garments}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CatalogProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
