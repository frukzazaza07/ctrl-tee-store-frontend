# CTRL TEE

A Porsche-inspired e-commerce site for a clothing brand, built around a
"build your own shirt" configurator. Next.js (App Router) + TypeScript +
Tailwind CSS + Zustand, fully bilingual (Thai default / English), with mock
product data and a mock checkout — no backend required to run it.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript (strict)
- **Tailwind CSS v4** (CSS-variable theme, see `app/globals.css`)
- **next-intl** for i18n routing (`/th`, `/en`)
- **Zustand** for cart + configurator state (cart persists to `localStorage`)
- **Framer Motion** for scroll-reveal and the cart drawer transition
- Mock data in `data/*.json` — no database, no external image hosting
  (product/mockup art is generated as inline SVG, seeded by product id)

## Running it

```bash
pnpm install
pnpm dev       # http://localhost:3000 (redirects to /th)
```

Other scripts:

```bash
pnpm build     # production build
pnpm start     # serve the production build
pnpm lint      # eslint
pnpm exec tsc --noEmit   # typecheck
```

Requires Node 18.18+ and pnpm. `pnpm install` may prompt to approve native
build scripts (`sharp`, `@swc/core`, `@parcel/watcher`, `unrs-resolver`) —
these are standard Next.js/image-optimization/toolchain dependencies.

## Project structure

```
app/[locale]/          Routes (App Router), one folder per page
  configure/[slug]/    Shirt configurator (slug = crew | vneck | long-sleeve)
  product/[slug]/      Product detail
  shop/                 Catalog with filters
  cart/, checkout/      Cart page, checkout + order success
components/
  ui/                   Generic primitives: Button, Card, Input, Slider, ...
  layout/               Header, Footer, LocaleSwitcher, MobileNav, cart trigger
  home/                 Hero, CategoryTiles, FeaturedProducts, ...
  shop/, product/        Catalog grid/filters, gallery, size/color selectors
  configurator/          Live preview + the 6-step wizard (components/configurator/steps/)
  cart/, checkout/        Drawer, cart row, checkout form, order success
features/
  cart/                 Zustand cart store + total/price helpers
  configurator/          Zustand configurator store, pricing, share-link codec
lib/                     Mock-data accessors, formatting, theme tokens, labels
data/                    products.json, garments.json, graphics-library.json
messages/                en.json, th.json — all UI copy lives here
types/                    Shared TypeScript types
```

## Adding a product

Products are mock data — no CMS. To add one:

1. Add an entry to `data/products.json` (id, slug, category, price in both
   THB and USD, colors, sizes, `featured`, `configurable`, and — only for
   configurable t-shirts — `garmentStyle`: `"crew" | "vneck" | "long-sleeve"`).
2. Add a matching `products.<id>.name` / `products.<id>.description` entry
   to **both** `messages/en.json` and `messages/th.json` (product copy is
   translation-driven, not stored in the JSON data file).

Product imagery is generated automatically (a seeded gradient + silhouette
via `components/ui/PlaceholderArt.tsx`) — no image files to manage. Swap in
real photography by replacing that component's usage with an `<Image>`.

To add a new configurable base garment (a new shirt style), add it to
`data/garments.json`, add a silhouette to
`components/configurator/GarmentMockup.tsx`, and add the label keys to
`lib/labels.ts` + both message files.

## Adding / editing translations

All user-facing copy lives in `messages/en.json` and `messages/th.json`,
grouped by namespace (`common`, `nav`, `home`, `shop`, `product`,
`configurator`, `cart`, `checkout`, `products`). Keep both files in sync —
next-intl will throw if a component requests a key that's missing for a
locale. There's no hardcoded UI copy in components; if you find any, that's
a bug.

The default locale is Thai (`th`); English (`en`) is the fallback. Currency
follows locale (฿ THB for `th`, $ USD for `en`) via `lib/format.ts` —
products carry both `THB` and `USD` prices in mock data rather than doing
live FX conversion.

## The shirt configurator

`app/[locale]/configure/[slug]/page.tsx` renders
`components/configurator/ConfiguratorClient.tsx`, which combines:

- `ConfiguratorPreview` — an inline SVG garment silhouette
  (`GarmentMockup.tsx`) with absolutely-positioned graphic/text layers on
  top, draggable and slider-controlled (position, scale, rotation),
  independent per front/back view.
- `StepPanel` — the 6-step wizard (style, fit, color, graphic, text, summary).
- Live pricing (`features/configurator/pricing.ts`) — base price + fit/
  graphic/text surcharges, shared by the price bar, the summary step, and
  the cart.
- Share links: the config is serialized to base64 in the `?c=` query param
  (`features/configurator/share.ts`). **Uploaded images are not included in
  share links** (data URLs are too large for a URL) — only library graphics
  round-trip; this is called out in the plan and is a known v1 limitation.

## Cart & checkout

- `features/cart/store.ts` — Zustand store, persisted to `localStorage`
  (cart contents survive a refresh; the drawer's open/closed state does not).
- The header cart button opens a slide-over drawer
  (`components/cart/CartDrawer.tsx`); `/cart` is the full page view with
  editable quantities.
- `/checkout` (`components/checkout/CheckoutForm.tsx`) collects shipping
  details and card-shaped fields with client-side validation, then clears
  the cart and redirects to `/checkout/success` with a generated order
  number.

## Where to plug in real payment

Nothing here talks to a payment processor — `CheckoutForm.tsx`'s
`handleSubmit` validates the form, generates a fake order number, and
redirects. To wire up real payment:

1. Replace the mock card fields with your provider's client SDK (e.g.
   Stripe Elements or Omise's tokenization) in `CheckoutForm.tsx`.
2. Replace `handleSubmit`'s local order-number generation with a call to a
   server route (Next.js Route Handler or Server Action) that creates a
   real order and charges the payment method.
3. Pass the real order id/email to `/checkout/success` (already reads them
   from the query string) or switch that page to fetch the order server-side
   instead.

## Known v1 limitations

- No backend — all product/garment/graphics data is local JSON.
- Uploaded configurator graphics are per-device only (see share links above).
- Checkout is fully mocked; no real payment is processed.
- Product photography is generated placeholder SVG art, not real photos.
