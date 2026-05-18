import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

/**
 * Read ADMIN_EMAIL from env (comma-separated list supported), normalise, and
 * compare to the current Clerk user's primary email. Calls notFound() so
 * unauthorised visitors see a generic 404 — no signal that /admin exists.
 */
export async function requireAdmin() {
  const allow = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allow.length === 0) notFound();

  const u = await currentUser();
  const email = u?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  if (!email || !allow.includes(email)) notFound();

  return { email, clerkUserId: u!.id };
}
