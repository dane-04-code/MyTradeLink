"use server";

import { db } from "@/lib/db";
import {
  users,
  sections,
  services,
  photos,
  certifications,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uniqueSlug } from "@/lib/slug";
import type { SectionKey } from "@/lib/sections";

export async function toggleSection(key: SectionKey, isEnabled: boolean) {
  const user = await requireUser();
  await db
    .update(sections)
    .set({ isEnabled })
    .where(and(eq(sections.userId, user.id), eq(sections.sectionKey, key)));
  revalidatePath(`/t/${user.slug}`);
  return { ok: true };
}

export async function reorderSections(order: SectionKey[]) {
  const user = await requireUser();
  await Promise.all(
    order.map((key, idx) =>
      db
        .update(sections)
        .set({ displayOrder: idx })
        .where(and(eq(sections.userId, user.id), eq(sections.sectionKey, key)))
    )
  );
  revalidatePath(`/t/${user.slug}`);
  return { ok: true };
}

export async function updateProfile(data: Partial<{
  name: string;
  trade: string;
  phone: string;
  whatsappNumber: string;
  emergencyNumber: string;
  location: string;
  areasCovered: string;
  about: string;
  yearsExperience: number | null;
  paymentMethods: string;
  googleReviewUrl: string;
  facebookUrl: string;
  introVideoUrl: string;
  profilePhotoUrl: string;
  accentColor: string;
  availabilityStatus: "taking_on_work" | "fully_booked";
}>) {
  const user = await requireUser();
  await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath(`/t/${user.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateSlug(newSlug: string) {
  const user = await requireUser();
  const slug = await uniqueSlug(newSlug, user.id);
  await db.update(users).set({ slug }).where(eq(users.id, user.id));
  revalidatePath("/dashboard");
  return { slug };
}

export async function addService(data: { serviceName: string; description?: string }) {
  const user = await requireUser();
  const [row] = await db
    .insert(services)
    .values({
      userId: user.id,
      serviceName: data.serviceName,
      description: data.description ?? null,
    })
    .returning();
  revalidatePath(`/t/${user.slug}`);
  return row;
}

export async function deleteService(id: number) {
  const user = await requireUser();
  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.userId, user.id)));
  revalidatePath(`/t/${user.slug}`);
  return { ok: true };
}

export async function addPhoto(data: {
  photoUrl: string;
  type: "gallery" | "before" | "after";
  caption?: string;
  pairId?: number | null;
}) {
  const user = await requireUser();
  const [row] = await db
    .insert(photos)
    .values({
      userId: user.id,
      photoUrl: data.photoUrl,
      type: data.type,
      caption: data.caption ?? null,
      pairId: data.pairId ?? null,
    })
    .returning();
  revalidatePath(`/t/${user.slug}`);
  return row;
}

export async function deletePhoto(id: number) {
  const user = await requireUser();
  await db
    .delete(photos)
    .where(and(eq(photos.id, id), eq(photos.userId, user.id)));
  revalidatePath(`/t/${user.slug}`);
  return { ok: true };
}

export async function addCertification(data: { name: string; badgeUrl?: string }) {
  const user = await requireUser();
  const [row] = await db
    .insert(certifications)
    .values({
      userId: user.id,
      name: data.name,
      badgeUrl: data.badgeUrl ?? null,
    })
    .returning();
  revalidatePath(`/t/${user.slug}`);
  return row;
}

export async function deleteCertification(id: number) {
  const user = await requireUser();
  await db
    .delete(certifications)
    .where(and(eq(certifications.id, id), eq(certifications.userId, user.id)));
  revalidatePath(`/t/${user.slug}`);
  return { ok: true };
}
