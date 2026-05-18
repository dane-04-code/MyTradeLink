import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { quoteRequests, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendNewQuoteEmail } from "@/lib/email";

const schema = z.object({
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(4).max(40),
  jobDescription: z.string().min(1).max(2000),
  postcode: z.string().max(16).optional().nullable(),
  photoUrls: z.array(z.string().url()).max(8).optional().default([]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const data = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.slug, slug) });
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Quote form is a Pro-only section
  if (user.plan !== "paid") {
    return NextResponse.json({ error: "not available" }, { status: 404 });
  }

  await db.insert(quoteRequests).values({
    userId: user.id,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
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
        jobDescription: data.jobDescription,
        postcode: data.postcode ?? null,
      });
    } catch (err) {
      console.error("[quote email] failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
