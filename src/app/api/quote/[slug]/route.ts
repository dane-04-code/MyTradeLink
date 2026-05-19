import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quoteRequests, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendNewQuoteEmail } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  // honeypot — bots fill hidden fields, real users don't
  website: z.string().max(0).optional().default(""),
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(4).max(40),
  customerEmail: z
    .union([z.string().email().max(254), z.literal("")])
    .optional()
    .default(""),
  jobDescription: z.string().min(1).max(2000),
  postcode: z.string().max(16).optional().nullable(),
  photoUrls: z.array(z.string().url()).max(8).optional().default([]),
});

// 3 submissions per IP per slug per hour
const QUOTE_LIMIT = 3;
const QUOTE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const ip = clientIp(req);
  const limit = rateLimit(
    `quote:${slug}:${ip}`,
    QUOTE_LIMIT,
    QUOTE_WINDOW_MS
  );
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests — try again in a bit.",
        retryInSeconds: limit.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.resetInSeconds),
        },
      }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const data = parsed.data;

  // Honeypot — silently accept and discard if the hidden field is filled.
  // Bots think they succeeded; real users never trigger this branch.
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const user = await db.query.users.findFirst({ where: eq(users.slug, slug) });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Quote form is a Pro-only section
  if (user.plan !== "paid") {
    return NextResponse.json({ error: "not available" }, { status: 404 });
  }

  const customerEmail = data.customerEmail?.trim() || null;

  await db.insert(quoteRequests).values({
    userId: user.id,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail,
    jobDescription: data.jobDescription,
    postcode: data.postcode ?? null,
    photoUrls: data.photoUrls,
  });

  if (user.email) {
    try {
      await sendNewQuoteEmail({
        to: user.email,
        tradesmanName: user.name ?? "there",
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail,
        jobDescription: data.jobDescription,
        postcode: data.postcode ?? null,
      });
    } catch (err) {
      console.error("[quote email] failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
