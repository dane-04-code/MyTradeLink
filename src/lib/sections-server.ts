import { db } from "@/lib/db";
import { users, sections, type AccountGoal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sectionDefsForGoal, defaultEnabledForGoal } from "@/lib/sections";

/**
 * Set the user's account goal and additively seed any sections that the new
 * goal's catalog needs but the user doesn't have yet.
 *
 * Neon's neon-http driver does NOT support db.transaction(), so this runs as
 * plain sequential awaits. The reseed is additive only (we never delete
 * out-of-catalog sections — they simply won't render for this goal), so a
 * non-transactional run is safe and idempotent: the unique (userId, sectionKey)
 * index plus the missing-only insert means calling this repeatedly is a no-op
 * after the first run.
 */
export async function reseedSectionsForGoal(userId: number, goal: AccountGoal) {
  await db
    .update(users)
    .set({ accountGoal: goal, updatedAt: new Date() })
    .where(eq(users.id, userId));

  const existingRows = await db.query.sections.findMany({
    where: eq(sections.userId, userId),
    columns: { sectionKey: true },
  });
  const have = new Set(existingRows.map((r) => r.sectionKey));

  const defs = sectionDefsForGoal(goal);
  const enabledDefaults = defaultEnabledForGoal(goal);
  const missing = defs.filter((d) => !have.has(d.key));
  if (missing.length === 0) return;

  const baseOrder = existingRows.length;
  await db
    .insert(sections)
    .values(
      missing.map((def, idx) => ({
        userId,
        sectionKey: def.key,
        isEnabled: enabledDefaults.includes(def.key),
        displayOrder: baseOrder + idx,
      }))
    )
    .onConflictDoNothing();
}
