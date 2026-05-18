import { NextResponse } from "next/server";
import { stripe, PRICES } from "@/lib/stripe";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  const user = await requireOnboardedUser();
  const { plan } = (await req.json()) as { plan?: "monthly" | "annual" };
  const price = plan === "annual" ? PRICES.annual : PRICES.monthly;
  if (!price) return NextResponse.json({ error: "missing price id" }, { status: 500 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: String(user.id), clerkId: user.clerkId },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
    metadata: { userId: String(user.id) },
  });

  return NextResponse.json({ url: session.url });
}
