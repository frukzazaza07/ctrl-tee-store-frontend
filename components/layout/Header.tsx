import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { MobileNav } from "@/components/layout/MobileNav";

export function Header() {
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");

  const links = [
    { href: "/shop", label: tNav("shop") },
    { href: "/configure", label: tNav("configurator") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="text-sm font-bold tracking-[0.2em]">
          {tCommon("brand")}
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-fg-muted md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Link
            href="/cart"
            aria-label={tNav("cart")}
            className="text-sm text-fg-muted transition-colors hover:text-fg"
          >
            {tNav("cart")}
          </Link>
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
