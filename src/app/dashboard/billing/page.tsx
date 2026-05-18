import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { BillingActions } from "./billing-actions";
import { Check, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireOnboardedUser();
  const isPaid = user.plan === "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:py-10">
      <h1 className="mb-1 text-2xl font-bold">Billing</h1>
      <p className="mb-6 text-sm text-neutral-500">Manage your plan.</p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Current plan</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-extrabold">{isPaid ? "Pro" : "Free"}</span>
              {isPaid && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
                  <Sparkles className="h-3 w-3" /> Active
                </span>
              )}
            </div>
          </div>
          {isPaid ? (
            <BillingActions />
          ) : (
            <Link href="/pricing" className="btn-primary">
              Upgrade
            </Link>
          )}
        </div>

        <ul className="mt-6 space-y-2 text-sm text-ink-800">
          {(isPaid
            ? [
                "Quote form with photo uploads",
                "Emergency callout button",
                "Intro video",
                "Unlimited gallery + before/after",
                "No TradeLink footer badge",
              ]
            : [
                "Public profile page",
                "Call, WhatsApp, services, gallery",
                "Quote requests (no photos)",
              ]
          ).map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
