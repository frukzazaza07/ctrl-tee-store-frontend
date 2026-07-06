import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function BrandStory() {
  const t = useTranslations("home");

  return (
    <Section id="story" className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <Reveal>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("storyTitle")}
        </h2>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="text-lg text-fg-muted">{t("storyBody")}</p>
      </Reveal>
    </Section>
  );
}
