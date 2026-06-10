"use server";

import { db } from "@/lib/db";
import { certifications, services, education, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/* ------------------------------------------------------------------ */
/* Qualifications & cards — reuse the `certifications` table           */
/* ------------------------------------------------------------------ */
export async function addQualification(data: { name: string; badgeUrl?: string }) {
  const user = await requireUser();
  const name = data.name.trim().slice(0, 120);
  if (!name) throw new Error("Qualification name is required");
  const [row] = await db
    .insert(certifications)
    .values({
      userId: user.id,
      name,
      badgeUrl: data.badgeUrl ?? null,
    })
    .returning();
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return row;
}

export async function deleteQualification(id: number) {
  const user = await requireUser();
  await db
    .delete(certifications)
    .where(and(eq(certifications.id, id), eq(certifications.userId, user.id)));
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Education                                                           */
/* ------------------------------------------------------------------ */
export async function addEducation(data: {
  institution: string;
  qualification?: string;
  startYear?: number | null;
  endYear?: number | null;
}) {
  const user = await requireUser();
  const institution = data.institution.trim().slice(0, 160);
  if (!institution) throw new Error("Institution is required");
  const [row] = await db
    .insert(education)
    .values({
      userId: user.id,
      institution,
      qualification: data.qualification?.trim().slice(0, 160) || null,
      startYear: data.startYear ?? null,
      endYear: data.endYear ?? null,
    })
    .returning();
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return row;
}

export async function updateEducation(
  id: number,
  data: Partial<{
    institution: string;
    qualification: string | null;
    startYear: number | null;
    endYear: number | null;
  }>
) {
  const user = await requireUser();
  const patch: Partial<{
    institution: string;
    qualification: string | null;
    startYear: number | null;
    endYear: number | null;
  }> = {};
  if (typeof data.institution === "string") {
    patch.institution = data.institution.trim().slice(0, 160);
  }
  if (data.qualification !== undefined) {
    patch.qualification = data.qualification?.trim().slice(0, 160) || null;
  }
  if (data.startYear !== undefined) patch.startYear = data.startYear;
  if (data.endYear !== undefined) patch.endYear = data.endYear;
  await db
    .update(education)
    .set(patch)
    .where(and(eq(education.id, id), eq(education.userId, user.id)));
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteEducation(id: number) {
  const user = await requireUser();
  await db
    .delete(education)
    .where(and(eq(education.id, id), eq(education.userId, user.id)));
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Skills — reuse the `services` table (serviceName = skill)           */
/* ------------------------------------------------------------------ */
export async function addSkill(name: string) {
  const user = await requireUser();
  const serviceName = name.trim().slice(0, 80);
  if (!serviceName) throw new Error("Skill is required");
  const [row] = await db
    .insert(services)
    .values({ userId: user.id, serviceName })
    .returning();
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return row;
}

export async function deleteSkill(id: number) {
  const user = await requireUser();
  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.userId, user.id)));
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Training-work photos — reuse the `photos` table (type `gallery`)    */
/* ------------------------------------------------------------------ */
export async function addPhoto(data: { photoUrl: string }) {
  const user = await requireUser();
  const [row] = await db
    .insert(photos)
    .values({ userId: user.id, photoUrl: data.photoUrl, type: "gallery" })
    .returning();
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return row;
}

export async function deletePhoto(id: number) {
  const user = await requireUser();
  await db
    .delete(photos)
    .where(and(eq(photos.id, id), eq(photos.userId, user.id)));
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  return { ok: true };
}
