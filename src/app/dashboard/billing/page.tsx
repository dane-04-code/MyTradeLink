import Link from "next/link";
import { requireOnboardedUser } from "@/lib/auth";
import { BillingActions } from "./billing-actions";
import { Check, X, Sparkles, ShieldCheck, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireOnboardedUser();
  const isPaid = user.plan === "paid";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
            Account
          </div>
          <h1 className="mt-1 font-display text-3xl leading-none tracking-tight text-ink-900 md:text-4xl">
            Billing
          </h1>
        </div>
      </div>

      {/* Current plan card */}
      <div
        className={
          "overflow-hidden rounded-2xl border bg-white " +
          (isPaid ? "border-brand shadow-[0_4px_0_0_#F97316]" : "border-line")
        }
      >
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
              Current plan
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-display text-5xl tracking-tight text-ink-900">
                {isPaid ? "Pro" : "Free"}
              </span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-900">
                  <Sparkles className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-700">
                  Forever free
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-ink-500">
              {isPaid
                ? "Thanks for going Pro. Manage your subscription in the Stripe portal — switch monthly/yearly, update card, cancel anytime."
                : "You get the full free plan forever. Upgrade only when you want the Pro features below."}
            </p>
          </div>
          <div className="flex-shrink-0">
            {isPaid ? (
              <BillingActions />
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-ink-900 shadow-[0_4px_0_0_#0F172A] transition active:translate-y-1 active:shadow-[0_0_0_0_#0F172A]"
              >
                <Sparkles className="h-4 w-4" /> Upgrade to Pro
              </Link>
            )}
          </div>
        </div>

        {/* Feature comparison strip */}
        <div className="grid grid-cols-1 divide-y divide-line border-t border-line bg-muted/40 md:grid-cols-2 md:divide-x md:divide-y-0">
          <PlanColumn
            title="On your plan now"
            isHighlighted={!isPaid}
            features={
              isPaid
                ? [
                    "Quote request form (with photo uploads)",
                    "Emergency callout button — 24/7",
                    "Intro video on your page",
                    "No TradeLink badge",
                    "Email alerts on every quote",
                    "Everything from Free",
                  ]
                : [
                    "Public profile page",
                    "Call & WhatsApp buttons",
                    "Photo gallery + before / after",
                    "Banner + 3 social links",
                    "Certifications + Google reviews",
                    "5 theme accent colours",
                  ]
            }
          />
          <PlanColumn
            title={isPaid ? "Also included" : "Pro adds"}
            muted={isPaid}
            features={
              isPaid
                ? [
                    "Theme colour customisation",
                    "Profile photo + banner",
                    "Drag-to-reorder sections",
                  ]
                : [
                    "Quote request form with photo uploads",
                    "Emergency callout — 24/7",
                    "Intro video",
                    "No TradeLink badge",
                  ]
            }
            allMissing={!isPaid}
          />
        </div>
      </div>

      {/* Helpful blocks */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoCard
          icon={<Receipt className="h-4 w-4" />}
          title="Invoices"
          body={
            isPaid
              ? "Find your billing history and download invoices from the Stripe portal."
              : "No invoices yet — you're on the free plan."
          }
        />
        <InfoCard
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Cancel anytime"
          body={
            isPaid
              ? "Cancellation keeps your page live on the free plan. Pro-only sections hide until you re-upgrade."
              : "When you upgrade you can cancel anytime — no questions, no contracts."
          }
        />
      </div>
    </div>
  );
}

function PlanColumn({
  title,
  features,
  isHighlighted,
  muted,
  allMissing,
}: {
  title: string;
  features: string[];
  isHighlighted?: boolean;
  muted?: boolean;
  allMissing?: boolean;
}) {
  return (
    <div className="p-6">
      <div
        className={
          "text-[10px] font-bold uppercase tracking-[0.22em] " +
          (isHighlighted ? "text-brand" : "text-ink-500")
        }
      >
        {title}
      </div>
      <ul className="mt-3 space-y-2">
        {features.map((f) => (
          <li
            key={f}
            className={
              "flex items-start gap-2.5 text-sm " +
              (muted ? "text-ink-500" : "text-ink-900")
            }
          >
            {allMissing ? (
              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-500/50" />
            ) : (
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
            )}
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
        <span className="text-ink-700">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-sm text-ink-700">{body}</p>
    </div>
  );
}
