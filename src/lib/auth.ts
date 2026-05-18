import { auth } from "@clerk/nextjs/server";
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
  if (existing) return existing;

  const slug = await uniqueSlug(userId.slice(-6));
  const [created] = await db
    .insert(users)
    .values({ clerkId: userId, slug })
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
