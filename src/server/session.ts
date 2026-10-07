import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asUserId, type User } from "@/domain/model";
import { sessionCookie } from "@/lib/session-cookie";
import { readDb } from "@/server/db";

export { sessionCookie };

// Local stand-in for Supabase Auth. The cookie stores the user id, and every
// action loads that user again. A missing or unknown id fails closed.
export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const raw = jar.get(sessionCookie)?.value;
  if (!raw) return null;
  let userId: ReturnType<typeof asUserId>;
  try {
    userId = asUserId(raw);
  } catch {
    return null;
  }
  return readDb().users.find((user) => user.id === userId) ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
