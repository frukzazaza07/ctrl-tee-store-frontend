// Creates (or updates the password of) the one admin user, from env vars.
// There is no public sign-up route on purpose — this CLI script is the only
// way to create an admin account, locally or in production.
//
// Usage: pnpm db:create-admin   (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env.local)

import { config } from "dotenv";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

config({ path: path.join(root, ".env.local") });

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local before running this script.");
}
if (ADMIN_PASSWORD.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
}

const sql = postgres(DATABASE_URL);

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const email = ADMIN_EMAIL.trim().toLowerCase();

  await sql`
    insert into users (email, password_hash, role)
    values (${email}, ${passwordHash}, 'admin')
    on conflict (email) do update set
      password_hash = excluded.password_hash,
      role = excluded.role
  `;

  console.log(`Admin user ready: ${email}`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
