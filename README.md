# CTRL TEE

A Porsche-inspired e-commerce site for a clothing brand, built around a
"build your own shirt" configurator with real garment photos, a Postgres
catalog, and an admin panel for managing products/collections. Next.js (App
Router) + TypeScript + Tailwind CSS + Zustand, fully bilingual (Thai default
/ English), with a mock (non-charging) checkout.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript (strict)
- **Postgres** via **Drizzle ORM** — products, garments, orders, collections,
  admin users all live in the DB (`lib/db/`), not static files
- **Tailwind CSS v4** (CSS-variable theme, see `app/globals.css`)
- **next-intl** for storefront i18n routing (`/th`, `/en`) — the admin panel
  at `/admin` is unlocalized
- **Zustand** for cart + in-progress configurator state (cart persists to
  `localStorage`; the configurator build does not — see `PROJECT_GUIDE.md`)
- **Framer Motion** for scroll-reveal and the cart drawer transition
- Hand-rolled admin auth: `bcryptjs` (password hashing) + `jose` (signed JWT
  session cookies, Edge-runtime-safe for `proxy.ts` middleware) — no NextAuth

## Running it

```bash
pnpm install
docker compose up -d                 # local Postgres, no account needed
cp .env.example .env.local           # fill in AUTH_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD
pnpm db:migrate && pnpm db:seed       # schema + seed products/garments/collections
pnpm db:create-admin                 # creates the one admin user (no public sign-up)
pnpm dev                             # http://localhost:3000 (redirects to /th)
```

Admin panel: `http://localhost:3000/admin/login`, sign in with the
`ADMIN_EMAIL`/`ADMIN_PASSWORD` you set above.

Other scripts:

```bash
pnpm build              # production build
pnpm start              # serve the production build
pnpm lint                # eslint
pnpm exec tsc --noEmit  # typecheck
pnpm db:generate        # generate a new migration after editing lib/db/schema.ts
```

Requires Node 18.18+, pnpm, and Docker (for local Postgres). `pnpm install`
may prompt to approve native build scripts (`sharp`, `@swc/core`,
`@parcel/watcher`, `unrs-resolver`, `esbuild`) — these are standard Next.js/
image-optimization/toolchain dependencies.

Deploying (e.g. Vercel): set `DATABASE_URL` (your production Postgres),
`AUTH_SECRET` (generate a fresh one — see `.env.example`), then run
`pnpm db:migrate`, `pnpm db:seed`, and `pnpm db:create-admin` once against
that `DATABASE_URL` before first use.

## Project structure

```
app/[locale]/          Storefront routes (App Router), localized
  configure/[slug]/    Shirt configurator (slug = crew | vneck | long-sleeve)
  product/[slug]/      Product detail
  shop/                 Catalog with filters
  cart/, checkout/      Cart page, checkout + order success
app/admin/              Admin panel routes — unlocalized, gated by proxy.ts
  login/                Sign-in form
  (dashboard)/          Products + collections CRUD, behind the nav layout
components/
  ui/                   Generic primitives: Button, Card, Input, Slider, ...
  admin/                 Admin-only forms (ProductForm, CollectionForm, LoginForm)
  layout/               Header, Footer, LocaleSwitcher, MobileNav, cart trigger
  home/                 Hero, CategoryTiles, FeaturedProducts, CollectionSections, ...
  shop/, product/        Catalog grid/filters, gallery, size/color selectors
  configurator/          Live preview + the 6-step wizard (components/configurator/steps/)
  cart/, checkout/        Drawer, cart row, checkout form, order success
features/
  cart/                 Zustand cart store + total/price helpers
  configurator/          Zustand configurator store, pricing, share-link codec, export/print-area
  catalog/                CatalogProvider/useCatalog — how Client Components read DB data
  auth/, orders/          Server Actions: login/logout, order creation
  admin/products/, admin/collections/   Server Actions: create/update/delete
lib/
  db/                   Drizzle schema + typed accessors (products, garments, orders, collections, users)
  auth/                  Password hashing (bcryptjs), session JWTs (jose)
data/                    products.json, garments.json, graphics-library.json — seed data, not runtime
scripts/                 seed-db.mjs, create-admin.mjs, generate-garment-photos.mjs
messages/                en.json, th.json — storefront UI copy (product copy now lives in the DB)
types/                    Shared TypeScript types
```

## Managing products & collections

There's no more "edit a JSON file" step — sign in at `/admin/login` and use
the Products / Collections pages to create, edit, and delete. A product's
name/description are entered per-language (English + Thai) directly in the
admin form; there's no separate translation-file step anymore. See
`PROJECT_GUIDE.md`'s "Product copy lives in the DB" and "Admin panel" sections
for the reasoning and how the pieces fit together.

To add a new *configurable base garment* (a new shirt style, distinct from a
product) — that's still a data + code change, not an admin-UI action: add it
to `data/garments.json`, regenerate/add its photos
(`scripts/generate-garment-photos.mjs`), run `pnpm db:seed`, and add the
label keys to `lib/labels.ts` + both message files.

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
