"use server";

import { db } from "@/lib/db";
import { users, type AccountGoal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import { reseedSectionsForGoal } from "@/lib/sections-server";

export async function saveStep1(data: { name: string; trade: string }) {
  const user = await requireUser();
  const newSlug =
    user.slug.match(/^[a-z0-9]{1,8}$/) || user.slug.length < 4
      ? await uniqueSlug(data.name || user.slug, user.id)
      : user.slug;
  await db
    .update(users)
    .set({ name: data.name, trade: data.trade, slug: newSlug, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/onboarding");
  return { ok: true, slug: newSlug };
}

export async function saveStep2(data: {
  phone: string;
  whatsappNumber: string;
  location: string;
}) {
  const user = await requireUser();
  await db
    .update(users)
    .set({
      phone: data.phone,
      whatsappNumber: data.whatsappNumber,
      location: data.location,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  return { ok: true };
}

export async function saveStep3(data: { profilePhotoUrl: string }) {
  const user = await requireUser();
  await db
    .update(users)
    .set({ profilePhotoUrl: data.profilePhotoUrl, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return { ok: true };
}

export async function saveStep4(data: { about: string }) {
  const user = await requireUser();
  await db
    .update(users)
    .set({ about: data.about.slice(0, 280), onboardingComplete: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return { ok: true };
}

export async function saveGoal(goal: AccountGoal) {
  const user = await requireUser();
  await reseedSectionsForGoal(user.id, goal);
  revalidatePath("/onboarding");
  return { ok: true };
}

export async function saveLfwBasics(data: {
  name: string;
  trade: string;
  location: string;
}) {
  const user = await requireUser();
  // Same slug logic as saveStep1 — generate a real slug if the user still has
  // the auto-generated stub, otherwise keep their existing one.
  const newSlug =
    user.slug.match(/^[a-z0-9]{1,8}$/) || user.slug.length < 4
      ? await uniqueSlug(data.name || user.slug, user.id)
      : user.slug;
  await db
    .update(users)
    .set({
      name: data.name,
      trade: data.trade,
      location: data.location,
      slug: newSlug,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
  revalidatePath("/onboarding");
  return { ok: true, slug: newSlug };
}

export async function finishLfwOnboarding() {
  const user = await requireUser();
  await db
    .update(users)
    .set({ onboardingComplete: true, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function regenerateSlug(name: string) {
  const user = await requireUser();
  const slug = await uniqueSlug(name, user.id);
  await db.update(users).set({ slug }).where(eq(users.id, user.id));
  return { slug };
}
