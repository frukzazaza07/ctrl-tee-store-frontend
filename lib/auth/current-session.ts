import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/session";

/** Reads + verifies the admin session cookie in a Server Component / Server Action. */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Defense-in-depth check for admin Server Actions — middleware already gates the routes, but a Server Action can be invoked directly. */
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }
  return session;
}
