"use server";

import { db } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireOnboardedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markQuoteStatus(id: number, status: "new" | "contacted" | "closed") {
  const user = await requireOnboardedUser();
  await db
    .update(quoteRequests)
    .set({ status })
    .where(and(eq(quoteRequests.id, id), eq(quoteRequests.userId, user.id)));
  revalidatePath("/dashboard/quotes");
  return { ok: true };
}
