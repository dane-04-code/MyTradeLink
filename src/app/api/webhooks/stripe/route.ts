import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: "not configured" }, { status: 500 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "no secret" }, { status: 500 });

  const sig = (await headers()).get("stripe-signature") ?? "";
  const payload = await req.text();

  let evt: Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    console.error("[stripe webhook] verify failed", err);
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case "checkout.session.completed": {
        const session = evt.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        if (customerId) {
          await db
            .update(users)
            .set({ plan: "paid", stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId })
            .where(eq(users.stripeCustomerId, customerId));
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = evt.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const isActive = sub.status === "active" || sub.status === "trialing";
        await db
          .update(users)
          .set({
            plan: isActive ? "paid" : "free",
            stripeSubscriptionId: sub.id,
          })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = evt.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await db
          .update(users)
          .set({ plan: "free", stripeSubscriptionId: null })
          .where(eq(users.stripeCustomerId, customerId));
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
