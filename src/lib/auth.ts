import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, sections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uniqueSlug } from "@/lib/slug";
import { DEFAULT_ENABLED, SECTION_DEFS } from "@/lib/sections";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (existing) {
    await topUpSections(existing.id);
    // Backfill: if an earlier visit created the row without an email
    // (pre-this-fix), pull it from Clerk now so quote/welcome alerts can fire.
    if (!existing.email) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
      const firstName = clerkUser?.firstName ?? "";
      const lastName = clerkUser?.lastName ?? "";
      const name =
        existing.name ||
        `${firstName} ${lastName}`.trim() ||
        null;
      if (email) {
        const [updated] = await db
          .update(users)
          .set({ email, name })
          .where(eq(users.id, existing.id))
          .returning();
        return updated;
      }
    }
    return existing;
  }

  // First-time lazy creation — pull email + name from Clerk so the
  // local-dev path stays in sync with the webhook path in prod.
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const firstName = clerkUser?.firstName ?? "";
  const lastName = clerkUser?.lastName ?? "";
  const name = `${firstName} ${lastName}`.trim() || null;

  const slug = await uniqueSlug(name || userId.slice(-6));
  const [created] = await db
    .insert(users)
    .values({ clerkId: userId, email, name, slug })
    .returning();

  // Seed default sections
  await db.insert(sections).values(
    SECTION_DEFS.map((def, idx) => ({
      userId: created.id,
      sectionKey: def.key,
      isEnabled: DEFAULT_ENABLED.includes(def.key),
      displayOrder: idx,
    }))
  );

  return created;
}

// Idempotent: when SECTION_DEFS grows, existing users gain rows for the
// new keys on their next visit. onConflictDoNothing makes this a no-op
// once the rows exist.
async function topUpSections(userId: number) {
  const existing = await db.query.sections.findMany({
    where: eq(sections.userId, userId),
    columns: { sectionKey: true },
  });
  const have = new Set(existing.map((r) => r.sectionKey));
  const missing = SECTION_DEFS.filter((d) => !have.has(d.key));
  if (missing.length === 0) return;
  const baseOrder = existing.length;
  await db
    .insert(sections)
    .values(
      missing.map((def, idx) => ({
        userId,
        sectionKey: def.key,
        isEnabled: DEFAULT_ENABLED.includes(def.key),
        displayOrder: baseOrder + idx,
      }))
    )
    .onConflictDoNothing();
}

export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireOnboardedUser() {
  const user = await requireUser();
  if (!user.onboardingComplete) redirect("/onboarding");
  return user;
}
