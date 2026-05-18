import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { pageEvents, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  slug: z.string().min(1).max(80),
  eventType: z.enum([
    "view",
    "call_click",
    "whatsapp_click",
    "quote_open",
    "quote_submit",
    "social_click",
  ]),
  referrer: z.string().max(255).optional().nullable(),
});

// 60 events per IP per hour — plenty for a real visitor, kills crawlers
const EVENT_LIMIT = 60;
const EVENT_WINDOW_MS = 60 * 60 * 1000;

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "tradelink";
  return createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex")
    .slice(0, 32);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`event:${ip}`, EVENT_LIMIT, EVENT_WINDOW_MS);
  if (!limit.allowed) {
    return new NextResponse(null, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(null, { status: 400 });
  }
  const { slug, eventType, referrer } = parsed.data;

  // Demo slug doesn't have a DB user — silently accept so the public page
  // tracking code doesn't need a special case.
  if (slug === "demo") return new NextResponse(null, { status: 204 });

  const user = await db.query.users.findFirst({
    where: eq(users.slug, slug),
    columns: { id: true },
  });
  if (!user) return new NextResponse(null, { status: 404 });

  await db.insert(pageEvents).values({
    userId: user.id,
    eventType,
    ipHash: hashIp(ip),
    referrer: referrer?.slice(0, 255) ?? null,
  });

  return new NextResponse(null, { status: 204 });
}
