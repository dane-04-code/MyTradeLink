import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, sections, type AccountGoal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uniqueSlug } from "@/lib/slug";
import { sectionDefsForGoal, defaultEnabledForGoal } from "@/lib/sections";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (existing) {
    await topUpSections(existing);
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

  // Seed default sections for a new business account
  const seedDefs = sectionDefsForGoal("business");
  const seedEnabled = defaultEnabledForGoal("business");
  await db.insert(sections).values(
    seedDefs.map((def, idx) => ({
      userId: created.id,
      sectionKey: def.key,
      isEnabled: seedEnabled.includes(def.key),
      displayOrder: idx,
    }))
  );

  return created;
}

// Idempotent: when the section catalog grows for a given goal, existing users
// gain rows for the new keys on their next visit. onConflictDoNothing makes
// this a no-op once the rows exist.
async function topUpSections(user: { id: number; accountGoal: AccountGoal }) {
  const goal = user.accountGoal;
  const defs = sectionDefsForGoal(goal);
  const enabledDefaults = defaultEnabledForGoal(goal);

  const existingRows = await db.query.sections.findMany({
    where: eq(sections.userId, user.id),
    columns: { sectionKey: true },
  });
  const have = new Set(existingRows.map((r) => r.sectionKey));
  const missing = defs.filter((d) => !have.has(d.key));
  if (missing.length === 0) return;
  const baseOrder = existingRows.length;
  await db
    .insert(sections)
    .values(
      missing.map((def, idx) => ({
        userId: user.id,
        sectionKey: def.key,
        isEnabled: enabledDefaults.includes(def.key),
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
