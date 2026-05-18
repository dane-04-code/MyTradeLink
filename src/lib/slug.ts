import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function uniqueSlug(base: string, excludeUserId?: number): Promise<string> {
  const cleaned = slugify(base) || "trade";
  let candidate = cleaned;
  let suffix = 1;
  // try up to 50 times
  while (suffix < 50) {
    const existing = await db.query.users.findFirst({
      where: eq(users.slug, candidate),
    });
    if (!existing || existing.id === excludeUserId) return candidate;
    suffix += 1;
    candidate = `${cleaned}-${suffix}`;
  }
  return `${cleaned}-${Math.random().toString(36).slice(2, 6)}`;
}
