import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";

export function ConfiguratorBanner() {
  const t = useTranslations("home");

  return (
    <Section className="max-w-none border-y border-border bg-bg-raised py-0 md:py-0">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <Reveal>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("configuratorBannerTitle")}
          </h2>
          <p className="mt-5 max-w-md text-lg text-fg-muted">
            {t("configuratorBannerBody")}
          </p>
          <Link
            href="/configure"
            className={buttonVariants({ size: "lg", className: "mt-8" })}
          >
            {t("configuratorBannerCta")}
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="aspect-square overflow-hidden rounded-2xl">
          <PlaceholderArt seed="configurator-banner" shape="tshirt" />
        </Reveal>
      </div>
    </Section>
  );
}
