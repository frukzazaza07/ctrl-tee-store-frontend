import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { PlaceholderArt, type PlaceholderShape } from "@/components/ui/PlaceholderArt";
import type { Product } from "@/types/product";

const shapeByCategory: Record<Product["category"], PlaceholderShape> = {
  tshirts: "tshirt",
  hoodies: "hoodie",
  caps: "cap",
};

export function ProductCard({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const t = useTranslations("common");
  const tProduct = useTranslations(`products.${product.id}`);

  return (
    <Card className="group flex flex-col overflow-hidden">
      <Link
        href={`/product/${product.slug}`}
        className="block aspect-[4/5] overflow-hidden bg-bg"
      >
        <PlaceholderArt
          seed={product.id}
          shape={shapeByCategory[product.category]}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-medium">{tProduct("name")}</h3>
          <p className="mt-1 text-sm text-fg-muted">{tProduct("description")}</p>
        </div>

        <PriceTag price={product.price} locale={locale} from className="mt-auto text-sm" />

        <div className="flex gap-2 pt-1">
          {product.configurable && product.garmentStyle ? (
            <Link
              href={`/configure/${product.garmentStyle}`}
              className={buttonVariants({ variant: "primary", size: "sm", className: "flex-1" })}
            >
              {t("customize")}
            </Link>
          ) : null}
          <Link
            href={`/product/${product.slug}`}
            className={buttonVariants({
              variant: product.configurable ? "secondary" : "primary",
              size: "sm",
              className: "flex-1",
            })}
          >
            {t("shopNow")}
          </Link>
        </div>
      </div>
    </Card>
  );
}
