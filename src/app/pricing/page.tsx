import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PricingButtons } from "./pricing-buttons";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-2xl font-extrabold">
          <span className="text-brand">▲</span> TradeLink
        </Link>
        <Link href={isSignedIn ? "/dashboard" : "/sign-in"} className="text-sm text-white/70 hover:text-white">
          {isSignedIn ? "Dashboard" : "Sign in"} →
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 pt-8 pb-20 text-center">
        <h1 className="text-4xl font-extrabold md:text-6xl">
          Simple <span className="text-brand">pricing</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
          Start free. Upgrade when you're winning more jobs than you can handle.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="£0"
            cadence="forever"
            features={[
              "Public profile page",
              "Call, WhatsApp, services, gallery",
              "Quote requests (no photos)",
              "Up to 4 photos",
              "TradeLink badge in footer",
            ]}
            cta={
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="btn-secondary w-full">
                {isSignedIn ? "Go to dashboard" : "Create your free page"}
              </Link>
            }
          />
          <PlanCard
            highlight
            name="Pro"
            price="£9"
            cadence="per month"
            annual="£89/year — save £19"
            features={[
              "Everything in Free",
              "Quote form with photo uploads",
              "Emergency callout button",
              "Intro video",
              "Unlimited gallery + before/after",
              "No TradeLink badge",
              "Priority listing (coming soon)",
            ]}
            cta={<PricingButtons isSignedIn={isSignedIn} />}
          />
        </div>

        <p className="mt-10 text-sm text-white/40">
          Cancel anytime. Prices in GBP. VAT included.
        </p>
      </section>
    </main>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  annual,
  features,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  cadence: string;
  annual?: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "relative rounded-3xl border-2 border-brand bg-gradient-to-b from-brand/10 to-transparent p-8 text-left shadow-glow"
          : "rounded-3xl border border-white/10 bg-white/5 p-8 text-left"
      }
    >
      {highlight && (
        <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          <Sparkles className="h-3 w-3" /> Most popular
        </div>
      )}
      <div className="text-sm uppercase tracking-wider text-white/50">{name}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-extrabold">{price}</span>
        <span className="text-white/60">{cadence}</span>
      </div>
      {annual && <div className="mt-1 text-sm text-brand">{annual}</div>}
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-white/80">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  );
}
