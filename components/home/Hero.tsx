import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(228,0,43,0.18),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,#0e1418_92%)]"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start px-6 md:px-10">
        <h1 className="max-w-3xl text-6xl font-bold leading-[0.95] tracking-tight md:text-8xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 max-w-xl text-xl text-fg-muted md:text-2xl">
          {t("heroSubtitle")}
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/configure" className={buttonVariants({ size: "lg" })}>
            {t("heroCta")}
          </Link>
          <Link
            href="/shop"
            className={buttonVariants({ variant: "secondary", size: "lg" })}
          >
            {t("heroCtaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
