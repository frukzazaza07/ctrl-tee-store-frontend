import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  priceThb: integer("price_thb").notNull(),
  priceUsd: integer("price_usd").notNull(),
  colors: text("colors").array().notNull(),
  sizes: text("sizes").array().notNull(),
  featured: boolean("featured").notNull().default(false),
  configurable: boolean("configurable").notNull().default(false),
  garmentStyle: text("garment_style"),
  nameEn: text("name_en").notNull(),
  nameTh: text("name_th").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionTh: text("description_th").notNull(),
  active: boolean("active").notNull().default(true),
  deletedAt: timestamp("deleted_at"),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
  deletedAt: timestamp("deleted_at"),
});

export const collectionProducts = pgTable(
  "collection_products",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.productId] })],
);

export const garments = pgTable("garments", {
  id: text("id").primaryKey(),
  basePriceThb: integer("base_price_thb").notNull(),
  basePriceUsd: integer("base_price_usd").notNull(),
  images: jsonb("images").notNull(),
  printArea: jsonb("print_area").notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  locale: text("locale").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  subtotalThb: integer("subtotal_thb").notNull(),
  subtotalUsd: integer("subtotal_usd").notNull(),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
