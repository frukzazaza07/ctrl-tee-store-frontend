import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const columns = [
    {
      title: t("shop"),
      links: [
        { href: "/shop?category=tshirts", label: tNav("tshirts") },
        { href: "/shop?category=hoodies", label: tNav("hoodies") },
        { href: "/shop?category=caps", label: tNav("caps") },
        { href: "/configure", label: tNav("configurator") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/#story", label: t("about") },
        { href: "/#contact", label: t("contact") },
      ],
    },
    {
      title: t("help"),
      links: [
        { href: "/#shipping", label: t("shipping") },
        { href: "/#returns", label: t("returns") },
        { href: "/#faq", label: t("faq") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm font-bold tracking-[0.2em]">
              {tCommon("brand")}
            </p>
            <p className="mt-3 max-w-[24ch] text-sm text-fg-muted">
              {t("tagline")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs text-fg-muted">
          © {new Date().getFullYear()} {tCommon("brand")}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
