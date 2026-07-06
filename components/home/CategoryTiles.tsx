import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { PlaceholderArt, type PlaceholderShape } from "@/components/ui/PlaceholderArt";
import type { ProductCategory } from "@/types/product";

const categories: { category: ProductCategory; shape: PlaceholderShape }[] = [
  { category: "tshirts", shape: "tshirt" },
  { category: "hoodies", shape: "hoodie" },
  { category: "caps", shape: "cap" },
];

export function CategoryTiles() {
  const t = useTranslations("home");
  const tNav = useTranslations("nav");

  return (
    <Section>
      <Reveal>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("categoriesTitle")}
        </h2>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {categories.map(({ category, shape }, i) => (
          <Reveal key={category} delay={i * 0.08}>
            <Link
              href={`/shop?category=${category}`}
              className="group block overflow-hidden rounded-2xl border border-border"
            >
              <div className="aspect-[4/5]">
                <PlaceholderArt
                  seed={category}
                  shape={shape}
                  className="transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <span className="text-lg font-medium">{tNav(category)}</span>
                <span
                  aria-hidden="true"
                  className="translate-x-0 text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-fg"
                >
                  →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
