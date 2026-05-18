import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireOnboardedUser } from "@/lib/auth";

export async function POST() {
  if (!stripe) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const user = await requireOnboardedUser();
  if (!user.stripeCustomerId) return NextResponse.json({ error: "no customer" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
