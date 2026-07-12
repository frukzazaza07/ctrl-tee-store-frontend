# Project Guide (for maintainers)

This is the "how it fits together and what to watch out for" doc. For how to
run the app, add a product, edit translations, or wire up real payment, see
[README.md](README.md) instead — this file doesn't repeat that.

## Mental model

Products, garments, and orders are backed by a real Postgres database
(Drizzle ORM, `lib/db/`) — this used to be a 100% client-rendered mock-data
app with no backend at all; that's no longer true. Server Components fetch
catalog data straight from the DB with `await`. The **cart** and the
**in-progress configurator build** are still pure client state (two Zustand
stores) — those were never backend concerns and still aren't; only the
catalog (products/garments) and orders moved server-side.

Data flow for anything with a price or a translated label follows the same
shape everywhere: a typed accessor (`lib/db/products.ts`, `lib/db/garments.ts`
for Server Components; `useCatalog()` for Client Components — see below) →
a pure calculation in `features/*/pricing.ts` or `features/*/totals.ts` →
`lib/format.ts`'s `formatPrice`/`formatNumber` for display. If you're about
to compute a price or format a number by hand somewhere, stop — there's
almost certainly already a function for it, and duplicating the logic is how
the two currencies drift out of sync.

## Local Postgres setup

`docker compose up -d` starts a local Postgres (`postgres:16-alpine`, no
external account needed). Then:

```
pnpm db:migrate       # applies drizzle/*.sql to the local DB
pnpm db:seed          # upserts data/products.json + data/garments.json + 2 example collections
pnpm db:create-admin  # creates/updates the one admin user from ADMIN_EMAIL/ADMIN_PASSWORD in .env.local
```

`DATABASE_URL` comes from `.env.local` (gitignored — copy `.env.example` and
fill it in; the default matches the Docker Compose service). `app/[locale]/
layout.tsx` fetches the catalog once per request and sets
`export const dynamic = "force-dynamic"` — without that, Next would
statically prerender pages at build time and freeze the catalog until the
next deploy, defeating the point of a real DB. In production (Vercel), set
`DATABASE_URL` to your real Postgres connection string as an environment
variable — never commit it.

`data/products.json` / `data/garments.json` are **seed data**, not the
runtime source of truth anymore — `scripts/generate-garment-photos.mjs` (see
below) still writes into `data/garments.json`, and `pnpm db:seed` reads both
files into Postgres. If you edit product/garment data, edit the JSON and
re-run `pnpm db:seed` (it's an upsert, safe to re-run).

## `CatalogProvider` / `useCatalog()` — how Client Components get catalog data

Client Components can't query Postgres directly (no DB driver in the
browser), so a handful of interactive components that used to `import`
`products`/`garments` as static arrays (`ShopClient`, `CartItemRow`, and the
configurator's `ConfiguratorPreview`/`GarmentPhoto`/`StepGraphic`/`StepText`)
now call `useCatalog()` (`features/catalog/useCatalog.ts`) instead, which
reads from a `CatalogContext` populated **once, at the root layout**
(`app/[locale]/layout.tsx` fetches `getAllProducts()`/`getAllGarments()` and
wraps everything in `<CatalogProvider>`). This is plain React Context, not
Zustand — it's server-provided, read-only-per-request data, not client-owned
mutable state.

If you add a new Client Component that needs product/garment data, use
`useCatalog()` — don't add a new `fetch`/API round trip for it, and don't
import `lib/db/*` from a Client Component (it's guarded with `server-only`
and will fail the build if you try). Pure, non-component modules that need
garment data (`features/configurator/pricing.ts`'s `calculatePrice`,
`features/configurator/export.ts`'s `buildCartExport`) take the `Garment` as
a parameter instead of looking it up internally — the calling component
pulls it from `useCatalog()` and passes it in.

Server Components (the product detail page, the two `/configure` pages, the
shop page, `FeaturedProducts`) just `await` the `lib/db/products.ts` /
`lib/db/garments.ts` accessors directly — no context involved there, and no
need to thread data down as props if a descendant is a Client Component that
can read `useCatalog()` itself.

## Orders: a real Server Action, mock payment stays mock

`CheckoutForm.tsx`'s submit handler calls `createOrder`
(`features/orders/actions.ts`, a `"use server"` Server Action) with the
shipping fields + cart item snapshot — **never** the card fields, which stay
client-side-only validation exactly as before (this is still a fake
payment flow; nothing charges a card). The action re-validates server-side
(defense in depth) and inserts a row via `lib/db/orders.ts`'s `createOrder`,
returning a real `orderNumber` that replaces the old
`` `CT-${Date.now()...}` `` client-only fake one. `OrderSuccess.tsx` and its
Suspense wrapper are unchanged (see the `useSearchParams` note below) — the
order is now durably persisted, but how the success page displays it didn't
need to change.

## Product copy lives in the DB, not the message files

`nameEn`/`nameTh`/`descriptionEn`/`descriptionTh` are columns on `products`
(`types/product.ts`'s `Product.name`/`Product.description` are
`{ en, th }`), not `messages/en.json`/`th.json` keys anymore. This changed
specifically because products are now admin-creatable — a product added
through `/admin` has no corresponding translation-file entry, and next-intl
has no fallback for a missing key, so keeping copy in the message files would
break any admin-created product. `ProductCard.tsx`, `product/[slug]/page.tsx`,
and `CartItemRow.tsx`'s `ItemName` read `product.name[locale]`/
`product.description[locale]` directly. The 7 original seed products' copy
was migrated out of the message files into the DB via `scripts/seed-db.mjs`
(which still reads the *old* message-file shape once, at seed time, as its
source — the message files themselves no longer have a `products` key).
Category/color/size labels are still enums translated via `lib/labels.ts` +
the message files, same as before — only free-text product copy moved.

## Admin panel (`app/admin/**`) and auth

Unlocalized (no `/th`/`/en` prefix — it's an internal tool, English-only),
lives outside the `[locale]` route tree with its own root layout
(`app/admin/layout.tsx`, imports `globals.css` itself since it doesn't
inherit from `app/[locale]/layout.tsx`). Structure: `app/admin/login/page.tsx`
(no nav), `app/admin/(dashboard)/**` (products + collections CRUD, wrapped in
`app/admin/(dashboard)/layout.tsx` for the nav/logout bar) — the route group
keeps the nav off the login page without needing a path check.

Auth is hand-rolled, not a library: `bcryptjs` for password hashing
(`lib/auth/password.ts`), `jose` for signed JWT session cookies
(`lib/auth/session.ts`) — deliberately not NextAuth/Auth.js, whose stable
release targets Next 14/15 and carries real compatibility risk against this
app's Next.js 16. `jose` was picked specifically because `proxy.ts`
(middleware) runs on the **Edge runtime**, which can't use `bcryptjs` or
Node's `crypto` — only the login Server Action and
`scripts/create-admin.mjs` (both Node runtime) touch password hashing;
`proxy.ts` only ever *verifies* a JWT, which `jose` supports on Edge.
`lib/auth/current-session.ts`'s `requireAdminSession()` is called at the top
of every admin Server Action too, as defense in depth — `proxy.ts` gates the
routes, but a Server Action can in principle be invoked directly.

There is **no public sign-up**. The only admin account is created via
`pnpm db:create-admin` (reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from
`.env.local`, upserts one `role: "admin"` row) — run it again with a new
password to rotate credentials, locally or in production (same script,
pointed at the prod `DATABASE_URL`).

**Mutations must call `revalidatePath("/", "layout")` before `redirect()`**
(see `features/admin/products/actions.ts` / `features/admin/collections/actions.ts`)
— hit this once already. The root layout being `force-dynamic` only
guarantees the *server* recomputes fresh data per request; Next's separate
*client* Router Cache can still serve a stale cached copy of a route you're
redirected back to after a mutation unless you explicitly revalidate it.
Without this, deleting a product and getting redirected to the list still
showed the deleted row until a hard refresh.

## Collections

`collections` + `collection_products` (join table, carries a `position` for
per-collection product order) are separate from `products.featured` — a
product can be featured, in zero collections, or in several. Homepage
rendering: `components/home/CollectionSections.tsx` (Server Component) calls
`getCollectionsWithProducts()` and renders one section per non-empty
collection, in `collections.position` order, reusing `ProductCard` — same
shape as the pre-existing `FeaturedProducts` section, just data-driven and
admin-manageable instead of a single hardcoded `featured` flag. Collection
names are admin-entered free text, not translated (same reasoning as product
copy above — no static key to translate against).

## State: the two Zustand stores

- **`features/cart/store.ts`** — `items`, plus `isDrawerOpen` for the header
  drawer. Wrapped in `persist` with `partialize: (state) => ({ items: state.items })`
  — only `items` goes to `localStorage`; the drawer's open/closed state is
  intentionally NOT persisted (a reload shouldn't leave the drawer open).
- **`features/configurator/store.ts`** — the in-progress shirt build
  (`garmentStyle`, `fit`, `color`, `view`, and independent `front`/`back`
  layer state). **Not** persisted to `localStorage` by design — the
  supported "save your progress" mechanism is the share link
  (`features/configurator/share.ts`), not silent local persistence. If you
  add `persist` here, you also need to decide what happens when the user
  navigates to a different garment slug (see `ConfiguratorClient`'s reset
  logic below) — don't add it without thinking that through.

### Zustand selector gotcha (hit this once already)

Never write a selector that allocates a new object/array on every call, e.g.
`useStore((s) => ({ ...s.thing }))` or `useStore((s) => deriveSomething(s))`.
`useSyncExternalStore` compares snapshots with `Object.is`, so a new object
every render trips React's "getServerSnapshot should be cached" warning and
can loop. Either select primitive fields individually (`useStore((s) => s.x)`),
select the whole store with no selector (`useStore()` — stable reference,
fine for a store this small), or compute derived values in the render body
*after* pulling raw state out, not inside the selector itself. See
`PriceSummaryBar.tsx` / `ShareLinkButton.tsx` for the fixed pattern.

## The configurator's reset-vs-preserve logic

`ConfiguratorClient.tsx` decides, on mount/prop-change, whether to reset the
store to defaults for the new garment or leave it alone:

- If a `?c=` share param is present and decodes successfully → hydrate fully
  from it (overrides everything, including garment style).
- Else, if the store's current `garmentStyle` already matches the route's
  slug → do nothing (this is what makes switching styles *from inside* the
  wizard via `StepStyle` preserve the user's color/fit/graphics instead of
  wiping them — `StepStyle` calls `setGarmentStyle` then `router.replace`,
  so by the time this effect runs the store already matches).
  - Else (first load, or arriving at a different garment than what's in the
  store) → reset to that garment's defaults.

If you add a new entry point into the configurator, make sure it goes
through the `/configure/[slug]` route (not a client-side store mutation from
elsewhere) so this logic stays the single place that decides reset-vs-keep.

## Garment photos are generated placeholder assets

The configurator's garment images (`public/garments/**`) and each garment's
`images`/`printArea` fields in `data/garments.json` were produced by
`scripts/generate-garment-photos.mjs` (plain Node, zero dependencies — PNG
encoding uses only `node:zlib`). Re-run it after adding a color/style, then
`pnpm db:seed` to push the updated `data/garments.json` into Postgres (the
app reads garments from the DB now, not the JSON file directly — see "Local
Postgres setup" above). Swapping in real product photography later is a data
change (replace the files, update the URLs, reseed), not a code change.

## Pricing is one function

`features/configurator/pricing.ts`'s `calculatePrice` is the *only* place
that turns a `ConfiguratorConfig` into a price. It's used by the live price
bar, the summary step, and the cart item created on "Add to cart" — all three
call the same function so they can't drift. If you add a new configurable
dimension (e.g. a fabric weight upcharge), add the surcharge constant here,
not in a component.

## Translation-key maps: `lib/labels.ts`

`STYLE_LABEL_KEY`, `FIT_LABEL_KEY`, `COLOR_LABEL_KEY` map a data value
(`"crew"`, `"oversized"`, `"navy"`) to the translation key that displays it
(`"styleCrew"`, `"fitOversized"`, `"colorNavy"`). These are imported in five
different places (configurator steps, cart view, configurator chooser, shop
filters, product detail). If you add a new garment style, fit, or color,
update the union type it's keyed on (in `types/product.ts` /
`types/configurator.ts` / `lib/theme.ts`) and this file, and TypeScript will
tell you everywhere else that needs a matching translation key.

## Shared selectors live in `components/product/`

`ColorSelector` and `SizeSelector` are used by both the product detail page
*and* the configurator's summary step (different features, same UI need).
They're single-value selectors (`value` + `onChange`), not multi-select —
the shop's filter sidebar needed multi-select and intentionally does **not**
reuse them (different selection model, would've forced an awkward API).
Don't "DRY" those two together; they're different enough to stay separate.

## CSS containing-block trap (hit this once already)

`Header` uses `backdrop-blur` for the frosted sticky-nav effect. Per the CSS
spec, `backdrop-filter` (like `transform`, `filter`, `perspective`,
`will-change: transform`) establishes a new containing block for descendant
`position: fixed` elements — so a `fixed` element nested *inside* the header
positions itself relative to the header's own box, not the viewport. This
bit `MobileNav`'s slide-down panel (it only covered the header's ~64px
height). Fixed by rendering the panel through a `createPortal` into
`document.body`. **If you nest a new `fixed`-positioned overlay anywhere
inside `Header` (or any other element with blur/transform/filter), portal it
out** — don't assume `fixed` means "relative to viewport" inside this tree.

`CartDrawer` doesn't have this problem because it's mounted as a sibling of
`Header`/`Footer` in `app/[locale]/layout.tsx`, not nested inside the header.

## `useSearchParams` + Suspense on the success page

`OrderSuccess.tsx` reads `?order=` / `?email=` via `useSearchParams()`, which
requires a `<Suspense>` boundary in the App Router (see
`app/[locale]/checkout/success/page.tsx`). During the client-side transition
from `/checkout`, the URL updates slightly before the new route's content
finishes streaming in, so the Suspense fallback can show briefly — it's a
translated "Loading…" string, not `null`, specifically so that gap doesn't
read as a blank/broken page. Don't change that fallback back to `null`.

## Testing approach (no automated suite yet)

There's no Jest/Playwright test suite committed to the repo. Verification
during development was: `pnpm exec tsc --noEmit` + `pnpm lint` + `pnpm build`
after every change, plus manually driving the app with a scratch Playwright
script (not committed — it lived outside the repo) to click through real
flows and check `console` for errors. If you're making a non-trivial change:

1. Typecheck, lint, and build must stay clean. `pnpm build` itself doesn't
   need Postgres running (every route is `force-dynamic`, so nothing is
   fetched at build time) — but `pnpm dev`/`pnpm start` do, since catalog
   data and orders are real per-request DB calls now (`docker compose up -d`
   first if it's not already running).
2. Actually run `pnpm dev` (or `pnpm build && pnpm start` for a more
   production-realistic check) and click through the affected flow —
   especially anything involving client-side navigation, Suspense, or
   `position: fixed`, which is where the real bugs above were hiding. A
   passing build does not mean the feature works.
3. When judging *whether a control's visual state is correct* (a button
   looking "selected", a panel looking full-width), don't trust a casual
   look at a screenshot — check the actual DOM state (`aria-pressed`,
   `getAttribute("class")`, `boundingBox()`). Several apparent bugs during
   development turned out to be nothing more than misreading small UI
   elements in a screenshot; the ones that were real (listed above) only
   showed up once checked programmatically.

## Adding a new locale (beyond TH/EN)

1. Add the locale to `routing.locales` in `i18n/routing.ts`.
2. Add `messages/<locale>.json` with every key present in `messages/en.json`
   (same namespaces/keys — next-intl doesn't partially fall back per-key).
3. Add a currency mapping in `lib/format.ts`'s `CURRENCY_BY_LOCALE`, and a
   corresponding price field on `Product`/`Garment` if it needs its own
   currency (right now every product hardcodes `THB`/`USD` — a third
   currency means either adding a third field everywhere or switching to a
   real FX-rate-based conversion instead of stored per-currency prices).
4. If the new locale needs a font with different glyph coverage than IBM
   Plex Sans Thai + Latin, add it as another `next/font/google` import in
   `app/[locale]/layout.tsx` and extend the `--font-body` variable logic.
