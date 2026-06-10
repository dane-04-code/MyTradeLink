import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sections, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uniqueSlug } from "@/lib/slug";
import { sectionDefsForGoal, defaultEnabledForGoal } from "@/lib/sections";

export const runtime = "nodejs";

type ClerkEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "missing secret" }, { status: 500 });

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTimestamp = h.get("svix-timestamp");
  const svixSignature = h.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(secret);
  let evt: ClerkEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk webhook] verify failed", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const clerkId = evt.data.id;
    const email = evt.data.email_addresses?.[0]?.email_address;
    const firstName = evt.data.first_name ?? "";
    const lastName = evt.data.last_name ?? "";
    const name = `${firstName} ${lastName}`.trim();

    const existing = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
    if (!existing) {
      const slug = await uniqueSlug(name || clerkId.slice(-6));
      const [created] = await db
        .insert(users)
        .values({ clerkId, email, name: name || null, slug })
        .returning();

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

      // Welcome email (best effort)
      if (email && process.env.RESEND_API_KEY) {
        try {
          const { sendWelcomeEmail } = await import("@/lib/email");
          await sendWelcomeEmail(email, name || "there");
        } catch (e) {
          console.error("[welcome email] failed", e);
        }
      }
    }
  }

  if (evt.type === "user.deleted") {
    await db.delete(users).where(eq(users.clerkId, evt.data.id));
  }

  return NextResponse.json({ ok: true });
}
