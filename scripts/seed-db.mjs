// Seeds products/garments/collections from the repo's data/*.json files
// (product copy is pulled from messages/en.json + messages/th.json for the
// original seed products — new, admin-created products store their own
// copy directly in the DB and don't touch the message files at all).
// Run after migrations: pnpm db:migrate && pnpm db:seed

import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

config({ path: path.join(root, ".env.local") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

const products = JSON.parse(readFileSync(path.join(root, "data/products.json"), "utf8"));
const garments = JSON.parse(readFileSync(path.join(root, "data/garments.json"), "utf8"));
const messagesEn = JSON.parse(readFileSync(path.join(root, "messages/en.json"), "utf8"));
const messagesTh = JSON.parse(readFileSync(path.join(root, "messages/th.json"), "utf8"));

const COLLECTIONS = [
  { slug: "new-arrivals", name: "New Arrivals", position: 0, productIds: ["classic-crew", "essential-long-sleeve", "heavyweight-hoodie"] },
  { slug: "configurable-favorites", name: "Configurable Favorites", position: 1, productIds: ["classic-crew", "classic-vneck", "essential-long-sleeve"] },
];

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  for (const p of products) {
    const copyEn = messagesEn.products?.[p.id];
    const copyTh = messagesTh.products?.[p.id];
    if (!copyEn || !copyTh) {
      throw new Error(`Missing messages.products.${p.id} in en/th message files`);
    }

    await sql`
      insert into products (id, slug, category, price_thb, price_usd, colors, sizes, featured, configurable, garment_style, name_en, name_th, description_en, description_th)
      values (${p.id}, ${p.slug}, ${p.category}, ${p.price.THB}, ${p.price.USD}, ${p.colors}, ${p.sizes}, ${p.featured}, ${p.configurable}, ${p.garmentStyle ?? null}, ${copyEn.name}, ${copyTh.name}, ${copyEn.description}, ${copyTh.description})
      on conflict (id) do update set
        slug = excluded.slug,
        category = excluded.category,
        price_thb = excluded.price_thb,
        price_usd = excluded.price_usd,
        colors = excluded.colors,
        sizes = excluded.sizes,
        featured = excluded.featured,
        configurable = excluded.configurable,
        garment_style = excluded.garment_style,
        name_en = excluded.name_en,
        name_th = excluded.name_th,
        description_en = excluded.description_en,
        description_th = excluded.description_th
    `;
  }

  for (const g of garments) {
    await sql`
      insert into garments (id, base_price_thb, base_price_usd, images, print_area)
      values (${g.id}, ${g.basePrice.THB}, ${g.basePrice.USD}, ${sql.json(g.images)}, ${sql.json(g.printArea)})
      on conflict (id) do update set
        base_price_thb = excluded.base_price_thb,
        base_price_usd = excluded.base_price_usd,
        images = excluded.images,
        print_area = excluded.print_area
    `;
  }

  for (const c of COLLECTIONS) {
    const [{ id: collectionId }] = await sql`
      insert into collections (name, slug, position)
      values (${c.name}, ${c.slug}, ${c.position})
      on conflict (slug) do update set
        name = excluded.name,
        position = excluded.position
      returning id
    `;

    await sql`delete from collection_products where collection_id = ${collectionId}`;
    for (let i = 0; i < c.productIds.length; i++) {
      await sql`
        insert into collection_products (collection_id, product_id, position)
        values (${collectionId}, ${c.productIds[i]}, ${i})
      `;
    }
  }

  console.log(`Seeded ${products.length} products, ${garments.length} garments, ${COLLECTIONS.length} collections.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
