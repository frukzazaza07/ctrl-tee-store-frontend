import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users as usersTable } from "@/lib/db/schema";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
}

function toUser(row: typeof usersTable.$inferSelect): User {
  return { id: row.id, email: row.email, passwordHash: row.passwordHash, role: row.role };
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  return rows[0] ? toUser(rows[0]) : undefined;
}

export async function upsertAdminUser(email: string, passwordHash: string): Promise<User> {
  const [row] = await db
    .insert(usersTable)
    .values({ email, passwordHash, role: "admin" })
    .onConflictDoUpdate({ target: usersTable.email, set: { passwordHash, role: "admin" } })
    .returning();
  return toUser(row);
}
