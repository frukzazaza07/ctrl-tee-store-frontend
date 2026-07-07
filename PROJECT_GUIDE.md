# Project Guide (for maintainers)

This is the "how it fits together and what to watch out for" doc. For how to
run the app, add a product, edit translations, or wire up real payment, see
[README.md](README.md) instead — this file doesn't repeat that.

## Mental model

Everything is client-rendered mock-data e-commerce: there is no database and
no API layer. Pages are Next.js Server Components that read local JSON/TS
data and pass it to Client Components, which own all interactivity via two
Zustand stores (cart, configurator). Nothing here calls `fetch` against
anything of ours.

Data flow for anything with a price or a translated label follows the same
shape everywhere: a typed accessor in `lib/` (e.g. `getProductBySlug`,
`getGarment`) → a pure calculation in `features/*/pricing.ts` or
`features/*/totals.ts` → `lib/format.ts`'s `formatPrice`/`formatNumber` for
display. If you're about to compute a price or format a number by hand
somewhere, stop — there's almost certainly already a function for it, and
duplicating the logic is how the two currencies drift out of sync.

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
encoding uses only `node:zlib`). Re-run it after adding a color/style to
`lib/theme.ts`/`data/garments.json`. Swapping in real product photography
later is a data change (replace the files, update the URLs in
`data/garments.json`), not a code change.

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

1. Typecheck, lint, and build must stay clean.
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
