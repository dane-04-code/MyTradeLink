import Link from "next/link";
import { Check, ChevronRight, X, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { PricingButtons } from "./pricing-buttons";
import { Wordmark } from "@/components/wordmark";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="relative min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      <BlueprintGrid />
      <Header isSignedIn={isSignedIn} />

      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-10 lg:pt-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Pricing
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[0.92] tracking-[-0.02em] md:text-7xl">
            Simple. <span className="text-brand">Honest.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/70">
            Start free. Upgrade when you&apos;ve won the first job — cancel
            whenever.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          <FreeCard isSignedIn={isSignedIn} />
          <ProCard isSignedIn={isSignedIn} />
        </div>

        <ComparisonTable />

        <FAQ />

        <p className="mt-14 text-center text-xs text-white/40">
          Prices in AUD. GST included. Cancel anytime, no questions.
        </p>
      </section>

      <Footer />
    </main>
  );
}

function BlueprintGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 90%)",
      }}
    />
  );
}

function Header({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:py-7">
        <Link href="/" className="group flex items-center">
          <Wordmark className="text-xl transition group-hover:opacity-80" />
        </Link>
        <Link
          href={isSignedIn ? "/dashboard" : "/sign-in"}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-white bg-white px-4 py-2 text-sm font-bold text-ink-900 transition active:translate-y-0.5 hover:bg-white/90"
        >
          {isSignedIn ? "Dashboard" : "Sign in"}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function FreeCard({ isSignedIn }: { isSignedIn: boolean }) {
  const features = [
    "Public /t/your-name profile page",
    "Massive Call & WhatsApp buttons",
    "Photo gallery + before / after",
    "Certifications & Google reviews",
    "Banner image + 3 social links",
    "Areas covered + payment methods",
    "5 theme accent colours",
  ];
  const missing = [
    "Quote request form",
    "Email alerts on every quote",
    "Emergency callout (24/7)",
    "Intro video",
  ];

  return (
    <div className="rounded-2xl border-2 border-white/15 bg-ink-900 p-8">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/50">
          Free
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-7xl tracking-tight">A$0</span>
        <span className="text-white/55">forever</span>
      </div>
      <div className="mt-1 text-sm text-white/40">
        Free plan shows a small Mytradelink badge in the footer.
      </div>

      <Link
        href={isSignedIn ? "/dashboard" : "/sign-up"}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-transparent px-6 py-4 text-base font-bold transition hover:border-white hover:bg-white/[0.06] active:translate-y-0.5"
      >
        {isSignedIn ? "Go to dashboard" : "Start free"}
      </Link>

      <div className="mt-8">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
          What you get
        </div>
        <ul className="mt-3 space-y-2">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-white/80"
            >
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
          Not on free
        </div>
        <ul className="mt-3 space-y-2">
          {missing.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-white/40"
            >
              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/30" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProCard({ isSignedIn }: { isSignedIn: boolean }) {
  const features = [
    "Everything in Free",
    "Quote request form with photo uploads",
    "Emergency callout button — 24/7",
    "Intro video at the top of your page",
    "No Mytradelink badge",
    "Email alerts on every quote",
  ];
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-b from-brand/15 to-transparent p-8">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 h-48 w-48 rotate-[10deg] opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #F97316 0 8px, transparent 8px 18px)",
        }}
      />
      <div className="relative flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
          Pro
        </span>
        <span className="inline-flex items-center gap-1 rounded-sm border-2 border-ink-900 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
          Most popular
        </span>
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        <span className="font-display text-7xl tracking-tight">A$15</span>
        <span className="text-white/55">per month</span>
      </div>
      <div className="relative mt-1 text-sm text-brand">
        Or <strong className="font-bold">A$149/year</strong>, save A$31.
      </div>

      <div className="relative mt-7">
        <PricingButtons isSignedIn={isSignedIn} />
      </div>

      <ul className="relative mt-8 space-y-2">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-sm text-white"
          >
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparisonTable() {
  const rows: { label: string; free: boolean | string; pro: boolean | string }[] = [
    { label: "Public profile page", free: true, pro: true },
    { label: "Call & WhatsApp buttons", free: true, pro: true },
    { label: "Photo gallery + before/after", free: true, pro: true },
    { label: "Banner image", free: true, pro: true },
    { label: "Certifications & reviews link", free: true, pro: true },
    { label: "Theme accent colour", free: "5 presets", pro: "5 presets + custom" },
    { label: "Quote request form (with photos)", free: false, pro: true },
    { label: "Email alerts on every quote", free: false, pro: true },
    { label: "Emergency 24/7 callout button", free: false, pro: true },
    { label: "Intro video", free: false, pro: true },
    { label: "Mytradelink badge in footer", free: "shown", pro: "removed" },
  ];

  return (
    <div className="mt-14 overflow-hidden rounded-2xl border-2 border-white/15 bg-white/[0.02]">
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b-2 border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
        <div>Feature</div>
        <div className="text-center">Free</div>
        <div className="text-center text-brand">Pro</div>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.label}
          className={
            "grid grid-cols-[1.4fr_0.8fr_0.8fr] items-center px-5 py-3 text-sm" +
            (i < rows.length - 1 ? " border-b border-white/5" : "")
          }
        >
          <div className="text-white/85">{r.label}</div>
          <div className="text-center">
            <Cell value={r.free} />
          </div>
          <div className="text-center">
            <Cell value={r.pro} highlight />
          </div>
        </div>
      ))}
    </div>
  );
}

function Cell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <Check
        className={
          "mx-auto h-4 w-4 " + (highlight ? "text-brand" : "text-white/70")
        }
      />
    );
  }
  if (value === false) {
    return <X className="mx-auto h-4 w-4 text-white/25" />;
  }
  return (
    <span
      className={
        "text-xs font-semibold " + (highlight ? "text-brand" : "text-white/65")
      }
    >
      {value}
    </span>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What if I can't get a job in my first month?",
      a: "Free plan stays free forever. No card needed. Upgrade only when you're getting more work than you can handle.",
    },
    {
      q: "Can I switch between monthly and yearly?",
      a: "Yes. Stripe handles it — manage from your dashboard at any time.",
    },
    {
      q: "What happens if I cancel?",
      a: "Your page stays live on the free plan. The Pro-only sections (quote form, emergency button, intro video) get hidden until you upgrade again.",
    },
    {
      q: "Do I need a website too?",
      a: "Most tradies don't. One Mytradelink page covers what 90% of customers want — see your work, see your trust badges, call or WhatsApp you.",
    },
  ];
  return (
    <div className="mt-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          Honest answers
        </span>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {faqs.map((f) => (
          <div
            key={f.q}
            className="rounded-xl border-2 border-white/15 bg-white/[0.02] p-5 transition hover:border-white/30"
          >
            <div className="font-display text-base leading-tight tracking-tight">
              {f.q}
            </div>
            <p className="mt-2 text-sm text-white/65">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-white/15">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-white/50 md:flex-row">
        <div className="flex items-center gap-2">
          <Wordmark className="text-base text-white/70" />
          <span className="ml-2 text-white/30">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-5">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/tools" className="hover:text-white">Free tools</Link>
          <Link href="/sign-in" className="hover:text-white">Sign in</Link>
          <Link href="/sign-up" className="hover:text-white">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
