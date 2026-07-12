CREATE TABLE "garments" (
	"id" text PRIMARY KEY NOT NULL,
	"base_price_thb" integer NOT NULL,
	"base_price_usd" integer NOT NULL,
	"images" jsonb NOT NULL,
	"print_area" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"locale" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"subtotal_thb" integer NOT NULL,
	"subtotal_usd" integer NOT NULL,
	"items" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"price_thb" integer NOT NULL,
	"price_usd" integer NOT NULL,
	"colors" text[] NOT NULL,
	"sizes" text[] NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"configurable" boolean DEFAULT false NOT NULL,
	"garment_style" text,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
