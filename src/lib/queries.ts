import { db } from "@/lib/db";
import {
  users,
  services,
  photos,
  certifications,
  testimonials,
  sections,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SectionKey } from "@/lib/sections";

export async function getProfileBySlug(slug: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.slug, slug),
  });
  if (!user) return null;
  return getFullProfile(user.id);
}

export async function getFullProfile(userId: number) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;

  const [s, p, c, t, sec] = await Promise.all([
    db.query.services.findMany({ where: eq(services.userId, userId) }),
    db.query.photos.findMany({ where: eq(photos.userId, userId) }),
    db.query.certifications.findMany({ where: eq(certifications.userId, userId) }),
    db.query.testimonials.findMany({ where: eq(testimonials.userId, userId) }),
    db.query.sections.findMany({ where: eq(sections.userId, userId) }),
  ]);

  return {
    user,
    services: s.sort((a, b) => a.displayOrder - b.displayOrder),
    photos: p,
    certifications: c.sort((a, b) => a.displayOrder - b.displayOrder),
    testimonials: t.sort((a, b) => a.displayOrder - b.displayOrder),
    sections: sec.sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

export type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

export function isSectionEnabled(profile: FullProfile, key: SectionKey) {
  const s = profile.sections.find((s) => s.sectionKey === key);
  return s?.isEnabled ?? false;
}
