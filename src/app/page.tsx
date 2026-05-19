import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Check,
  Star,
  ShieldCheck,
  ArrowRight,
  Hammer,
  Wrench,
  Zap,
  Copy,
  Camera,
  ChevronRight,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Wordmark } from "@/components/wordmark";

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      <BlueprintGrid />
      <Header isSignedIn={isSignedIn} />
      <Hero isSignedIn={isSignedIn} />
      <ProofStrip />
      <BeforeAfter />
      <HowItWorks />
      <FeatureGrid />
      <PricingBlock isSignedIn={isSignedIn} />
      <FinalCTA isSignedIn={isSignedIn} />
      <Footer />
    </main>
  );
}

/* ----------------------------------------------------------------------------
 * Background — fixed blueprint grid that gives the page a build-site feel
 * --------------------------------------------------------------------------*/
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

/* ----------------------------------------------------------------------------
 * Header
 * --------------------------------------------------------------------------*/
function Header({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:py-7">
        <Link href="/" className="group flex items-center">
          <Wordmark className="text-xl transition group-hover:opacity-80" />
        </Link>
        <nav className="flex items-center gap-1 md:gap-3">
          <Link
            href="/pricing"
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-white/70 transition hover:text-white md:inline-flex"
          >
            Pricing
          </Link>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-white bg-white px-4 py-2 text-sm font-bold text-ink-900 transition active:translate-y-0.5 hover:bg-white/90"
            >
              Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-white/70 transition hover:text-white md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-brand px-4 py-2 text-sm font-bold text-ink-900 transition active:translate-y-0.5 hover:bg-brand-400"
              >
                Get my page <ChevronRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------------
 * Hero — massive headline + URL chip + phone preview
 * --------------------------------------------------------------------------*/
function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative z-10 overflow-hidden">
      {/* orange glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-32 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pt-10 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Built for UK tradesmen
          </span>

          <h1 className="mt-7 font-display text-[14vw] leading-[0.88] tracking-[-0.03em] sm:text-[88px] md:text-[104px] lg:text-[112px]">
            <span className="block">Your business.</span>
            <span className="block text-brand">One link.</span>
          </h1>

          {/* The URL chip — the unforgettable moment */}
          <div className="mt-7 inline-flex max-w-full items-stretch overflow-hidden rounded-xl border-2 border-white/25 bg-white/[0.04]">
            <div className="hidden items-center gap-1.5 border-r-2 border-white/15 bg-white/[0.06] px-4 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 font-mono text-sm md:text-base">
              <span className="text-white/45">mytradelink.page/t/</span>
              <span className="font-bold text-white">dave-plumber</span>
              <span className="ml-1 h-4 w-px animate-pulse bg-brand" />
            </div>
            <button
              type="button"
              aria-label="Copy link"
              className="hidden items-center justify-center border-l-2 border-white/15 bg-white/[0.04] px-4 text-white/60 transition hover:bg-white/[0.08] hover:text-white sm:flex"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-white/70 md:text-xl">
            One professional page. Photos, reviews, call & WhatsApp buttons,
            quote requests. Share it on your van, in your bio, on a card. Set up
            in five minutes.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-7 py-4 text-lg font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-1"
            >
              Get my free page
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/t/demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-transparent px-7 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-ink-900 active:translate-y-1"
            >
              See a live page
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/55">
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" /> Free forever plan
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" /> No card needed
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-brand" /> 5-minute setup
            </li>
          </ul>
        </div>

        <div className="relative flex items-center justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Phone mockup — drawn to look like a finished Mytradelink profile
 * --------------------------------------------------------------------------*/
function PhoneMockup() {
  return (
    <div className="relative">
      {/* angled "construction tape" accent */}
      <div
        aria-hidden
        className="absolute -left-12 -top-6 hidden h-12 w-44 rotate-[-12deg] rounded-sm bg-brand text-ink-900 lg:flex"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #0F172A 0 6px, transparent 6px 18px)",
        }}
      />
      <div className="absolute -inset-10 rounded-[60px] bg-gradient-to-br from-brand/40 via-transparent to-transparent blur-3xl" />

      <div className="relative h-[640px] w-[310px] rounded-[44px] border-[10px] border-ink-900/80 bg-ink-900 ring-2 ring-white/15">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-ink-900" />
        <div className="h-full w-full overflow-hidden rounded-[34px] bg-white text-ink-900">
          {/* header */}
          <div className="flex flex-col items-center px-5 pt-9 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-ink-900 bg-brand text-2xl font-bold text-ink-900">
                DW
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-call">
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
            </div>
            <h2 className="mt-3 font-display text-lg leading-tight tracking-tight">
              Dave Wilson Plumbing
            </h2>
            <div className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
              Plumber · Manchester
            </div>
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-sm border border-call bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-call">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-call" />
              Taking on work
            </div>
          </div>

          {/* contact buttons */}
          <div className="space-y-2 px-4 pt-4">
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-ink-900 bg-call py-3 text-sm font-bold text-white shadow-hard-sm">
              <Phone className="h-4 w-4" /> Call Dave
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-ink-900 bg-whatsapp py-3 text-sm font-bold text-white shadow-hard-sm">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </div>
          </div>

          {/* about */}
          <div className="px-4 pt-4">
            <div className="rounded-xl bg-slate-50 p-3 text-left text-[11px] leading-relaxed text-ink-700">
              <div className="mb-1 font-bold uppercase tracking-wider text-[10px] text-ink-500">
                About
              </div>
              12 years' experience. Boilers, leaks, bathrooms. Fair prices,
              on-time, fully insured.
            </div>
          </div>

          {/* gallery */}
          <div className="px-4 pt-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Recent work
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-sky-300 to-sky-500">
                <Camera className="absolute bottom-1 right-1 h-3 w-3 text-white/80" />
              </div>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-orange-300 to-orange-500" />
              <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-300 to-slate-500" />
            </div>
          </div>

          {/* certs */}
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 rounded-lg border-2 border-ink-900 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={2.5} />
              <div className="text-[11px] font-bold">Gas Safe Registered</div>
              <span className="ml-auto text-[10px] font-mono text-ink-500">
                #12345
              </span>
            </div>
          </div>

          {/* reviews */}
          <div className="px-4 pt-2">
            <div className="flex items-center gap-1.5 rounded-lg border-2 border-line bg-muted px-3 py-2 text-[11px]">
              <Star className="h-3 w-3 fill-star text-star" />
              <span className="font-bold">4.9</span>
              <span className="text-ink-500">on Google · 84 reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Proof strip — counters + trust signals
 * --------------------------------------------------------------------------*/
function ProofStrip() {
  const items = [
    { value: "5 min", label: "to set up" },
    { value: "100%", label: "mobile first" },
    { value: "£0", label: "to start" },
    { value: "1 link", label: "everywhere" },
  ];
  return (
    <section className="relative z-10 border-y-2 border-white/15 bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/10 px-5 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="px-2 py-7 text-center">
            <div className="font-display text-3xl text-white md:text-4xl">
              {item.value}
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-white/50">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Before / After — the messy WhatsApp thread vs a clean Mytradelink
 * --------------------------------------------------------------------------*/
function BeforeAfter() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-24">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
          The problem
        </span>
        <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
          Stop sending screenshots <br />
          <span className="text-brand">of screenshots.</span>
        </h2>
        <p className="mt-5 max-w-lg text-lg text-white/70">
          Most tradesmen win work through a mess of WhatsApp threads, Facebook
          comments and word of mouth. Mytradelink gives you one link that does
          the talking — so customers see you're legit before you've even picked
          up the phone.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* BEFORE */}
        <div className="relative rounded-2xl border-2 border-white/15 bg-white/[0.02] p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-emergency/60 bg-emergency/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emergency">
            Before
          </div>
          <div className="space-y-2 text-sm">
            <ChatBubble side="left" text="hi do u do bathrooms" />
            <ChatBubble side="right" text="yes" />
            <ChatBubble side="left" text="can u send pics of past work" />
            <ChatBubble side="right" text="i'll look on my phone tonight" />
            <ChatBubble side="left" text="and the gas safe number?" />
            <ChatBubble side="right" text="…" muted />
          </div>
          <div className="mt-5 text-sm text-white/50">
            Three days, no booking, the customer rings someone else.
          </div>
        </div>

        {/* AFTER */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-br from-brand/10 via-transparent to-transparent p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-brand bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
            After
          </div>
          <div className="space-y-2 text-sm">
            <ChatBubble side="left" text="hi do u do bathrooms" />
            <ChatBubble
              side="right"
              text="yes — everything's on my page 👇"
            />
            <div className="ml-auto w-max rounded-lg border-2 border-ink-900 bg-white px-4 py-3 text-ink-900">
              <div className="font-mono text-xs text-ink-500">
                mytradelink.page/t/dave-plumber
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-bold">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-ink-900 bg-brand text-[10px] text-ink-900">
                  DW
                </span>
                Dave Wilson Plumbing · Manchester
              </div>
            </div>
            <ChatBubble side="left" text="amazing — when can you come?" />
          </div>
          <div className="mt-5 text-sm text-brand/90">
            One link. Job booked the same morning.
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  side,
  text,
  muted,
}: {
  side: "left" | "right";
  text: string;
  muted?: boolean;
}) {
  return (
    <div className={side === "right" ? "flex justify-end" : "flex"}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px]",
          side === "right"
            ? "rounded-br-md bg-brand text-ink-900"
            : "rounded-bl-md bg-white/10 text-white/85",
          muted ? "opacity-50" : "",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * How it works — 3 step rail
 * --------------------------------------------------------------------------*/
function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: <Wrench className="h-6 w-6" />,
      title: "Sign up free",
      body: "Drop your name and trade. We make you a page on the spot.",
    },
    {
      n: "02",
      icon: <Hammer className="h-6 w-6" />,
      title: "Fill it in",
      body: "Photos, services, contact details, certs. Toggle what you want, drag the order.",
    },
    {
      n: "03",
      icon: <Zap className="h-6 w-6" />,
      title: "Share the link",
      body: "On your van, your WhatsApp bio, your business cards. One link does everything.",
    },
  ];
  return (
    <section className="relative z-10 border-t-2 border-white/15 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            How it works
          </span>
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Live in <span className="text-brand">five minutes.</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group relative overflow-hidden rounded-2xl border-2 border-white/15 bg-ink-900 p-7 transition hover:border-brand"
            >
              <div className="absolute -right-6 -top-2 font-display text-[140px] leading-none tracking-tighter text-white/[0.04] transition group-hover:text-brand/15">
                {s.n}
              </div>
              <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-md border-2 border-ink-900 bg-brand text-ink-900 ring-2 ring-white/20">
                {s.icon}
              </div>
              <h3 className="relative mt-5 font-display text-2xl leading-tight tracking-tight">
                {s.title}
              </h3>
              <p className="relative mt-2 text-white/65">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Feature grid — what you actually get
 * --------------------------------------------------------------------------*/
function FeatureGrid() {
  const features = [
    {
      title: "Call & WhatsApp buttons",
      body: "Massive, impossible-to-miss. One tap and they're on the phone with you.",
      tag: "Free",
    },
    {
      title: "Photo gallery",
      body: "Show off your work. Swipeable on mobile. Looks professional out the box.",
      tag: "Free",
    },
    {
      title: "Reviews link",
      body: "Send people to your Google reviews with a single button.",
      tag: "Free",
    },
    {
      title: "Certifications",
      body: "Gas Safe, NICEIC, CSCS — display them as proper trust badges.",
      tag: "Free",
    },
    {
      title: "Quote request form",
      body: "Customers send name, postcode, photos. You get an email. Win the job.",
      tag: "Pro",
    },
    {
      title: "Emergency callout",
      body: "Red 24/7 button for the jobs that pay double. Pro plan only.",
      tag: "Pro",
    },
  ];
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-24">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            What you get
          </span>
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Everything a customer <br className="hidden md:block" />
            <span className="text-brand">needs to trust you.</span>
          </h2>
        </div>
        <p className="max-w-sm text-white/65">
          Toggle sections on or off, drag them in the order you want. Changes
          save the second you make them — no save button anywhere.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border-2 border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative bg-ink-900 p-7 transition hover:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl leading-tight tracking-tight">
                {f.title}
              </h3>
              <span
                className={[
                  "rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]",
                  f.tag === "Pro"
                    ? "border-ink-900 bg-brand text-ink-900"
                    : "border-white/15 bg-white/[0.04] text-white/70",
                ].join(" ")}
              >
                {f.tag}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Pricing
 * --------------------------------------------------------------------------*/
function PricingBlock({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section
      id="pricing"
      className="relative z-10 border-t-2 border-white/15 bg-white/[0.02]"
    >
      <div className="mx-auto max-w-6xl px-5 py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            Pricing
          </span>
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Simple. <span className="text-brand">Honest.</span>
          </h2>
          <p className="mt-4 text-white/65">
            Start free. Upgrade when you've won the first job.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <PriceCard
            tier="Free"
            price="£0"
            cadence="forever"
            features={[
              "Public profile page",
              "Call & WhatsApp buttons",
              "Photo gallery + before/after",
              "Certifications + Google reviews",
              "Small Mytradelink badge in footer",
            ]}
            cta={
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white/30 bg-transparent px-6 py-3.5 text-base font-bold transition hover:border-white hover:bg-white/[0.06] active:translate-y-0.5"
              >
                {isSignedIn ? "Go to dashboard" : "Start free"}
              </Link>
            }
          />
          <PriceCard
            highlight
            tier="Pro"
            price="£9"
            cadence="per month"
            sub="£89/year — save £19"
            features={[
              "Everything in Free",
              "Quote request form with photo uploads",
              "Email alerts on every quote",
              "Emergency callout button (24/7)",
              "Intro video on your page",
              "No Mytradelink badge",
            ]}
            cta={
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-ink-900 bg-brand px-6 py-3.5 text-base font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-1"
              >
                Upgrade to Pro
              </Link>
            }
          />
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  tier,
  price,
  cadence,
  sub,
  features,
  cta,
  highlight,
}: {
  tier: string;
  price: string;
  cadence: string;
  sub?: string;
  features: string[];
  cta: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl border-2 p-8",
        highlight
          ? "border-brand bg-gradient-to-b from-brand/10 to-transparent"
          : "border-white/15 bg-ink-900",
      ].join(" ")}
    >
      {highlight && (
        <div className="absolute right-6 top-6 rounded-sm border-2 border-ink-900 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
          Most popular
        </div>
      )}
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
        {tier}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-6xl tracking-tight">{price}</span>
        <span className="text-white/55">{cadence}</span>
      </div>
      {sub && <div className="mt-1 text-sm text-brand">{sub}</div>}
      <ul className="mt-7 space-y-2.5">
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
      <div className="mt-8">{cta}</div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Final CTA
 * --------------------------------------------------------------------------*/
function FinalCTA({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink-900 bg-brand p-10 text-ink-900 md:p-16">
        {/* hatched accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rotate-[12deg] rounded-2xl opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #0F172A 0 6px, transparent 6px 18px)",
          }}
        />
        <h2 className="relative max-w-2xl font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
          Stop losing jobs to lads with a website.
        </h2>
        <p className="relative mt-4 max-w-md text-lg text-ink-900/85">
          Five minutes to set up. Free forever. Share one link, win more work.
        </p>
        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-ink-900 px-7 py-4 text-lg font-bold text-white transition hover:bg-ink-800 active:translate-y-1"
          >
            Create my free page
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/t/demo"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-white/40 px-7 py-4 text-lg font-bold text-ink-900 transition hover:bg-white active:translate-y-1"
          >
            See a live page
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Footer
 * --------------------------------------------------------------------------*/
function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-white/15">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-white/50 md:flex-row">
        <div className="flex items-center gap-2">
          <Wordmark className="text-base text-white/70" />
          <span className="ml-2 text-white/30">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-5">
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/sign-in" className="hover:text-white">Sign in</Link>
          <Link href="/sign-up" className="hover:text-white">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
