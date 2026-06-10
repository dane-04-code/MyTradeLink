"use server";

import { db } from "@/lib/db";
import {
  users,
  sections,
  services,
  photos,
  certifications,
  testimonials,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uniqueSlug } from "@/lib/slug";
import type { SectionKey } from "@/lib/sections";
import { isValidHex } from "@/lib/themes";
import { reseedSectionsForGoal } from "@/lib/sections-server";
import type { AccountGoal } from "@/lib/db/schema";

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
  instagramUrl: string;
  tiktokUrl: string;
  googleRating: number | null;
  googleReviewCount: number | null;
  introVideoUrl: string;
  profilePhotoUrl: string;
  bannerImageUrl: string;
  accentColor: string;
  availabilityStatus: "taking_on_work" | "fully_booked";
}>) {
  const user = await requireUser();
  const sanitized = { ...data };
  if (typeof sanitized.about === "string") {
    sanitized.about = sanitized.about.slice(0, 280);
  }
  // accentColor is rendered into a CSS custom property on the public profile.
  // Drop the field if it's not a valid 6-digit hex.
  if (typeof sanitized.accentColor === "string" && !isValidHex(sanitized.accentColor)) {
    delete sanitized.accentColor;
  }
  await db
    .update(users)
    .set({ ...sanitized, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath(`/t/${user.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setAccountGoal(goal: AccountGoal) {
  const user = await requireUser();
  // Additive reseed — never deletes sections, just adds any the new goal
  // needs and flips accountGoal. Idempotent (see sections-server.ts).
  await reseedSectionsForGoal(user.id, goal);
  revalidatePath(`/t/${user.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setPublicEmail(email: string) {
  const user = await requireUser();
  const trimmed = email.trim().slice(0, 254);
  // Allow clearing, or a basic something@something.tld shape.
  if (trimmed !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Enter a valid email address");
  }
  await db
    .update(users)
    .set({ publicEmail: trimmed || null, updatedAt: new Date() })
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

export async function addTestimonial(data: {
  customerName: string;
  quote: string;
  location?: string;
}) {
  const user = await requireUser();
  // Server-side caps to match the UI and stop oversized payloads bloating the row.
  const customerName = data.customerName.trim().slice(0, 120);
  const quote = data.quote.trim().slice(0, 280);
  const location = data.location?.trim().slice(0, 120) || null;
  if (!customerName || !quote) {
    throw new Error("Customer name and quote are required");
  }
  const [row] = await db
    .insert(testimonials)
    .values({
      userId: user.id,
      customerName,
      quote,
      location,
    })
    .returning();
  revalidatePath(`/t/${user.slug}`);
  return row;
}

export async function deleteTestimonial(id: number) {
  const user = await requireUser();
  await db
    .delete(testimonials)
    .where(and(eq(testimonials.id, id), eq(testimonials.userId, user.id)));
  revalidatePath(`/t/${user.slug}`);
  return { ok: true };
}
