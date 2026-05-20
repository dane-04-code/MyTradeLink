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
  Plug,
  HardHat,
  Droplets,
  MapPin,
  Quote,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Wordmark } from "@/components/wordmark";

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;
  const primaryHref = isSignedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = isSignedIn ? "Open my dashboard" : "Create my page now";

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      <BlueprintGrid />
      <Header isSignedIn={isSignedIn} />
      <Hero primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <TradesTicker />
      <BeforeAfter />
      <HowItWorks />
      <FeatureGrid />
      <ForTheJobs />
      <PricingBlock isSignedIn={isSignedIn} />
      <FinalCTA primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <Footer />
      <MobileStickyCTA primaryHref={primaryHref} primaryLabel={primaryLabel} />
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
 * BigCTA — the upgraded primary call-to-action. Bigger than .btn-primary,
 * with a 6px hard ink shadow that compresses to zero on press, a hatched
 * accent strip on the leading edge, and a small caption ribbon underneath.
 * Used in the hero and final CTA so the same shape language repeats.
 * --------------------------------------------------------------------------*/
function BigCTA({
  href,
  label,
  variant = "orange",
  size = "lg",
  full = false,
}: {
  href: string;
  label: string;
  variant?: "orange" | "dark" | "white";
  size?: "lg" | "xl";
  full?: boolean;
}) {
  const palette =
    variant === "orange"
      ? "border-ink-900 bg-brand text-ink-900 hover:bg-brand-400"
      : variant === "dark"
        ? "border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
        : "border-ink-900 bg-white text-ink-900 hover:bg-muted";

  const sizing =
    size === "xl"
      ? "px-8 py-5 text-xl sm:text-2xl"
      : "px-7 py-4 text-lg sm:text-xl";

  return (
    <Link
      href={href}
      className={[
        "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl border-[3px] font-bold",
        "shadow-[0_6px_0_0_#0F172A] transition will-change-transform",
        "hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#0F172A]",
        "active:translate-y-[6px] active:shadow-[0_0_0_0_#0F172A]",
        full ? "w-full" : "",
        sizing,
        palette,
      ].join(" ")}
    >
      {/* hatched leading-edge stripe — construction-tape tag */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-2.5"
        style={{
          backgroundImage:
            variant === "orange"
              ? "repeating-linear-gradient(45deg, #0F172A 0 4px, transparent 4px 10px)"
              : "repeating-linear-gradient(45deg, #F97316 0 4px, transparent 4px 10px)",
        }}
      />
      <span className="ml-2 whitespace-nowrap">{label}</span>
      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1.5" />
    </Link>
  );
}

/* Small caption ribbon shown beneath the BigCTA — gives the three bullets
 * (free, no card, 5 min) without forcing them into the button itself. */
function CTACaption({ light }: { light?: boolean }) {
  const tone = light ? "text-ink-700/80" : "text-white/55";
  const dot = light ? "bg-ink-900" : "bg-brand";
  return (
    <div
      className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] ${tone}`}
    >
      <span>Free forever</span>
      <span className={`h-1 w-1 rounded-full ${dot}`} />
      <span>5 min setup</span>
      <span className={`h-1 w-1 rounded-full ${dot}`} />
      <span>No card needed</span>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Hero — massive headline + URL chip + phone preview + bigger CTA stack
 * --------------------------------------------------------------------------*/
function Hero({
  primaryHref,
  primaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <section className="relative z-10 overflow-hidden">
      {/* orange glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-32 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pt-10 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16 lg:pb-28">
        <div>
          <span className="inline-flex animate-rise-in items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Built for UK tradesmen
          </span>

          <h1
            className="mt-7 animate-rise-in font-display text-[14vw] leading-[0.88] tracking-[-0.03em] sm:text-[88px] md:text-[104px] lg:text-[112px]"
            style={{ animationDelay: "60ms" }}
          >
            <span className="block">Your business.</span>
            <span className="relative block text-brand">
              One link.
              {/* hand-drawn-style ink underline marker */}
              <svg
                aria-hidden
                viewBox="0 0 360 18"
                className="absolute -bottom-2 left-0 h-3 w-[58%] text-ink-900"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 10 C 80 2, 200 16, 358 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* The URL chip — the unforgettable moment */}
          <div
            className="mt-8 inline-flex max-w-full animate-rise-in items-stretch overflow-hidden rounded-xl border-2 border-white/25 bg-white/[0.04]"
            style={{ animationDelay: "140ms" }}
          >
            <div className="hidden items-center gap-1.5 border-r-2 border-white/15 bg-white/[0.06] px-4 sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 font-mono text-sm md:text-base">
              <span className="text-white/45">mytradelink.page/t/</span>
              <span className="font-bold text-white">dave-plumber</span>
              <span className="ml-1 h-4 w-px animate-soft-blink bg-brand" />
            </div>
            <button
              type="button"
              aria-label="Copy link"
              className="hidden items-center justify-center border-l-2 border-white/15 bg-white/[0.04] px-4 text-white/60 transition hover:bg-white/[0.08] hover:text-white sm:flex"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <p
            className="mt-7 max-w-md animate-rise-in text-lg leading-relaxed text-white/70 md:text-xl"
            style={{ animationDelay: "200ms" }}
          >
            One professional page. Photos, reviews, call and WhatsApp buttons,
            quote requests. Share it on your van, in your bio, on a card. Set
            up in five minutes.
          </p>

          <div
            className="mt-9 animate-rise-in"
            style={{ animationDelay: "260ms" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <BigCTA href={primaryHref} label={primaryLabel} size="lg" />
              <Link
                href="/t/demo"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] border-white/80 bg-transparent px-7 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-ink-900 active:translate-y-1"
              >
                See a live page
              </Link>
            </div>
            <CTACaption />
          </div>

          {/* Trade type stack — honest positioning, no fake counts */}
          <div
            className="mt-8 flex animate-rise-in items-center gap-4"
            style={{ animationDelay: "320ms" }}
          >
            <div className="flex -space-x-2">
              <AvatarChip initials="DW" bg="#F97316" fg="#0F172A" />
              <AvatarChip initials="SP" bg="#2563EB" fg="#FFFFFF" />
              <AvatarChip initials="MH" bg="#DC2626" fg="#FFFFFF" />
              <AvatarChip initials="JT" bg="#EAB308" fg="#0F172A" />
              <AvatarChip initials="RB" bg="#16A34A" fg="#FFFFFF" />
            </div>
            <div className="text-sm leading-tight">
              <div className="font-bold text-white">
                Plumbers, sparks, builders, gas engineers.
              </div>
              <div className="text-white/55">
                One page that does the talking before you do.
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function AvatarChip({
  initials,
  bg,
  fg,
}: {
  initials: string;
  bg: string;
  fg: string;
}) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink-900 ring-2 ring-ink-900/60 font-display text-[13px]"
      style={{ background: bg, color: fg }}
    >
      {initials}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Phone mockup — drawn to look like a finished Mytradelink profile.
 * Now slightly tilted and with a peeking job-ticket card behind it for depth.
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

      {/* peeking quote-request job-ticket card behind the phone */}
      <div
        aria-hidden
        className="absolute -right-6 top-24 hidden w-60 rotate-[6deg] rounded-xl border-2 border-ink-900 bg-white p-3 text-ink-900 shadow-hard md:block"
      >
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
          <span>New quote</span>
          <span className="rounded-sm bg-brand px-1.5 py-0.5 text-ink-900">
            JOB-2025
          </span>
        </div>
        <div className="mt-2 font-display text-sm leading-tight">
          Sarah Davies, Manchester M21
        </div>
        <div className="mt-1 text-[11px] leading-snug text-ink-600">
          Bathroom refit. 2 weeks. Three photos attached.
        </div>
        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-call">
          <span className="h-1.5 w-1.5 rounded-full bg-call" /> 2 min ago
        </div>
      </div>

      <div className="relative h-[640px] w-[310px] -rotate-[3deg] rounded-[44px] border-[10px] border-ink-900/80 bg-ink-900 ring-2 ring-white/15">
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
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                About
              </div>
              12 years on the tools. Boilers, leaks, bathrooms. Fair prices,
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
              <span className="ml-auto font-mono text-[10px] text-ink-500">
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
 * Trades ticker — endless marquee of trade types and UK cities. Reads like a
 * job-board headline crawl, replacing the empty-stat proof strip.
 * --------------------------------------------------------------------------*/
function TradesTicker() {
  const entries = [
    "Plumber · Manchester",
    "Electrician · Leeds",
    "Builder · Bristol",
    "Gas Engineer · Birmingham",
    "Roofer · Sheffield",
    "Landscaper · Nottingham",
    "Joiner · Glasgow",
    "Heating Engineer · Liverpool",
    "Decorator · Newcastle",
    "Bricklayer · Cardiff",
    "Plasterer · Edinburgh",
    "Scaffolder · Belfast",
    "Tiler · Southampton",
    "Locksmith · Leicester",
  ];
  // duplicate the list once so the marquee can loop seamlessly with translate-50%
  const loop = [...entries, ...entries];

  return (
    <section
      aria-label="Trades using Mytradelink"
      className="relative z-10 border-y-2 border-white/15 bg-black/40 backdrop-blur-sm"
    >
      <div className="relative overflow-hidden">
        {/* fade-out edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ink-900 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ink-900 to-transparent"
        />

        <div className="animate-marquee-x flex w-max items-center gap-10 py-5 whitespace-nowrap">
          {loop.map((entry, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="font-display text-base uppercase tracking-[0.18em] text-white/85">
                {entry}
              </span>
              <span className="h-2 w-2 rotate-45 bg-brand" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Before / After — the messy WhatsApp thread vs a clean Mytradelink share.
 * Now stamped with "MESSY" / "BOOKED" overlays for instant read.
 * --------------------------------------------------------------------------*/
function BeforeAfter() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-end gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <SectionMarker number="01" tag="The problem" />
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Stop sending screenshots
            <br />
            of screenshots.
          </h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-white/70">
          Most tradesmen win work through a mess of WhatsApp threads, Facebook
          comments and word of mouth. Mytradelink gives you one link that does
          the talking, so customers see you&apos;re legit before you&apos;ve
          even picked up the phone.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* BEFORE */}
        <div className="relative rounded-2xl border-2 border-white/15 bg-white/[0.02] p-6">
          <Stamp label="Messy" tone="emergency" rotate={-6} />
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
            Three days, no booking. The customer rings someone else.
          </div>
        </div>

        {/* AFTER */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-brand bg-gradient-to-br from-brand/10 via-transparent to-transparent p-6">
          <Stamp label="Booked" tone="call" rotate={5} />
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-brand bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
            After
          </div>
          <div className="space-y-2 text-sm">
            <ChatBubble side="left" text="hi do u do bathrooms" />
            <ChatBubble
              side="right"
              text="yes, everything's on my page 👇"
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
            <ChatBubble side="left" text="amazing, when can you come?" />
          </div>
          <div className="mt-5 text-sm text-brand/90">
            One link. Job booked the same morning.
          </div>
        </div>
      </div>
    </section>
  );
}

/* A small "rubber stamp" graphic used on the Before/After cards. */
function Stamp({
  label,
  tone,
  rotate = 0,
}: {
  label: string;
  tone: "emergency" | "call";
  rotate?: number;
}) {
  const color = tone === "emergency" ? "#DC2626" : "#16A34A";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-4 top-4 select-none rounded-sm border-2 px-2 py-0.5 font-display text-[11px] uppercase tracking-[0.3em] opacity-80"
      style={{
        color,
        borderColor: color,
        transform: `rotate(${rotate}deg)`,
        boxShadow: `inset 0 0 0 2px rgba(0,0,0,0)`,
      }}
    >
      {label}
    </div>
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
 * Section marker — a giant ghosted number + small caption. Replaces the
 * stamped eyebrow chip on most sections so the page doesn't feel like the
 * same row repeated.
 * --------------------------------------------------------------------------*/
function SectionMarker({ number, tag }: { number: string; tag: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="font-display text-5xl leading-none text-brand/80 md:text-6xl">
        {number}
      </span>
      <span className="border-l-2 border-white/15 pl-4 text-xs font-bold uppercase tracking-[0.28em] text-white/70">
        {tag}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * How it works — 3 step rail. Section opener drops the eyebrow chip in favour
 * of a centred section marker for variety.
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
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <SectionMarker number="02" tag="How it works" />
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Live in <span className="text-brand">five minutes.</span>
          </h2>
          <p className="mt-4 max-w-lg text-white/60">
            No designer, no domain, no faff. Sign up, fill in, share.
          </p>
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
 * Feature grid — what you actually get. Section opener uses a bracketed
 * highlight instead of the orange-word-in-headline trick.
 * --------------------------------------------------------------------------*/
function FeatureGrid() {
  const features = [
    {
      title: "Call and WhatsApp buttons",
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
      body: "Gas Safe, NICEIC, CSCS. Display them as proper trust badges.",
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
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SectionMarker number="03" tag="What you get" />
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Everything a customer
            <br className="hidden md:block" />{" "}
            needs to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 px-1 text-ink-900">trust you</span>
              <span
                aria-hidden
                className="absolute inset-0 -skew-y-2 bg-brand"
                style={{ borderRadius: 4 }}
              />
            </span>
            .
          </h2>
        </div>
        <p className="max-w-sm text-white/65">
          Toggle sections on or off, drag them in the order you want. Changes
          save the second you make them, no save button anywhere.
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
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * For the jobs — three job-ticket cards showing how Mytradelink wins specific
 * trade scenarios. Honest social-proof substitute — no fake testimonials.
 * --------------------------------------------------------------------------*/
function ForTheJobs() {
  const jobs = [
    {
      trade: "Plumber",
      ref: "JOB-0421",
      icon: <Droplets className="h-5 w-5" />,
      area: "Manchester · M21",
      title: "Boiler call-out",
      quote:
        "Customer hits Call. You answer. Quote sent before the kettle's boiled.",
      colorHex: "#F97316",
    },
    {
      trade: "Electrician",
      ref: "JOB-0422",
      icon: <Plug className="h-5 w-5" />,
      area: "Leeds · LS6",
      title: "Full house rewire",
      quote:
        "Customer sees your Part P and NICEIC before they even ring. Trust earned in a tap.",
      colorHex: "#2563EB",
    },
    {
      trade: "Builder",
      ref: "JOB-0423",
      icon: <HardHat className="h-5 w-5" />,
      area: "Bristol · BS3",
      title: "Single-storey extension",
      quote:
        "They scroll the gallery, read the reviews, send a quote request. You haven't lifted a finger.",
      colorHex: "#EAB308",
    },
  ];

  return (
    <section className="relative z-10 border-t-2 border-white/15 bg-white/[0.02]">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <div className="max-w-2xl">
          <SectionMarker number="04" tag="For the jobs" />
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            For the jobs
            <br />
            that pay the mortgage.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-white/70">
            Doesn&apos;t matter what you turn up in or what tools you carry. If
            you do the work, Mytradelink helps you win it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {jobs.map((j) => (
            <article
              key={j.ref}
              className="group relative overflow-hidden rounded-2xl border-2 border-white/15 bg-ink-900 p-6 transition hover:border-brand"
            >
              {/* job-ticket header strip with reference number */}
              <div className="-mx-6 -mt-6 mb-5 flex items-center justify-between border-b-2 border-white/15 bg-white/[0.02] px-6 py-3">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-white/70">
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-ink-900"
                    style={{ background: j.colorHex, color: "#0F172A" }}
                  >
                    {j.icon}
                  </span>
                  {j.trade}
                </div>
                <span className="font-mono text-[10px] tracking-widest text-white/40">
                  {j.ref}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                <MapPin className="h-3 w-3" /> {j.area}
              </div>
              <h3 className="mt-2 font-display text-2xl leading-tight tracking-tight">
                {j.title}
              </h3>
              <div className="mt-4 flex items-start gap-2 text-white/75">
                <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                <p className="text-sm leading-relaxed">{j.quote}</p>
              </div>

              {/* tear-line at the bottom — gives the card a ticket-stub feel */}
              <div
                aria-hidden
                className="-mx-6 -mb-6 mt-6 h-3"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 6px 50%, #0F172A 3px, transparent 3.5px)",
                  backgroundSize: "12px 12px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              />
            </article>
          ))}
        </div>
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
          <SectionMarker number="05" tag="Pricing" />
          <h2 className="mt-5 font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Simple. Honest. No card to start.
          </h2>
          <p className="mt-4 text-white/65">
            Start free. Upgrade when you&apos;ve won the first job.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <PriceCard
            tier="Free"
            price="£0"
            cadence="forever"
            features={[
              "Public profile page",
              "Call and WhatsApp buttons",
              "Photo gallery and before/after",
              "Certifications and Google reviews",
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
            sub="£89/year, save £19"
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
 * Final CTA — styled like a job-ticket / collection slip. Perforated edge,
 * stamped reference, hatched corner, BigCTA front-and-centre.
 * --------------------------------------------------------------------------*/
function FinalCTA({
  primaryHref,
  primaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 pb-28">
      <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink-900 bg-brand text-ink-900 shadow-[0_8px_0_0_#0F172A]">
        {/* perforated top edge — ticket stub */}
        <div
          aria-hidden
          className="absolute -top-2 left-0 right-0 h-4"
          style={{
            backgroundImage:
              "radial-gradient(circle at 8px 50%, #0F172A 3px, transparent 3.5px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* hatched corner accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-10 h-64 w-64 rotate-[12deg] rounded-2xl opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #0F172A 0 6px, transparent 6px 18px)",
          }}
        />

        <div className="relative px-8 pt-12 pb-10 md:px-16 md:pt-16 md:pb-14">
          {/* ticket header — fake reference + stamp */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b-2 border-ink-900/30 pb-4 text-xs font-bold uppercase tracking-[0.22em]">
            <div className="flex items-center gap-3">
              <span className="rounded-sm border-2 border-ink-900 bg-ink-900 px-2 py-0.5 text-brand">
                Mytradelink
              </span>
              <span className="hidden md:inline">Sign-up slip</span>
            </div>
            <div className="font-mono text-[10px] tracking-widest text-ink-900/70">
              REF / 2026-05-{new Date().getDate().toString().padStart(2, "0")}
            </div>
          </div>

          <h2 className="max-w-2xl font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Stop losing jobs to lads with a website.
          </h2>
          <p className="mt-5 max-w-md text-lg text-ink-900/85">
            Five minutes to set up. Free forever. Share one link, win more
            work.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-start">
            <BigCTA
              href={primaryHref}
              label={primaryLabel}
              variant="dark"
              size="xl"
            />
            <Link
              href="/t/demo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-[3px] border-ink-900 bg-white/40 px-7 py-4 text-lg font-bold text-ink-900 transition hover:bg-white active:translate-y-1"
            >
              See a live page
            </Link>
          </div>
          <CTACaption light />

          {/* stamped "approved" mark */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-8 bottom-8 hidden -rotate-12 select-none rounded-sm border-2 border-ink-900/80 px-3 py-1 font-display text-xs uppercase tracking-[0.3em] text-ink-900/80 md:block"
          >
            Approved · UK Trades
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Mobile sticky CTA — orange bar pinned to the bottom on small screens, so
 * the primary action is always one tap away as the user scrolls. Mobile-only.
 * --------------------------------------------------------------------------*/
function MobileStickyCTA({
  primaryHref,
  primaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink-900 bg-brand px-4 py-3 shadow-[0_-4px_0_0_#0F172A] md:hidden">
      <Link
        href={primaryHref}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-ink-900 px-4 py-3 text-base font-bold text-white active:translate-y-0.5"
      >
        {primaryLabel}
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Footer
 * --------------------------------------------------------------------------*/
function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-white/15 pb-24 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-white/50 md:flex-row">
        <div className="flex items-center gap-2">
          <Wordmark className="text-base text-white/70" />
          <span className="ml-2 text-white/30">
            © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex gap-5">
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/sign-in" className="hover:text-white">
            Sign in
          </Link>
          <Link href="/sign-up" className="hover:text-white">
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}
