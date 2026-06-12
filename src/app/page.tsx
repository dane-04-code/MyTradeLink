import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import {
  Phone,
  MessageCircle,
  Check,
  Star,
  ShieldCheck,
  ArrowRight,
  Zap,
  Camera,
  ChevronRight,
  MapPin,
  FileText,
  Receipt,
  Sparkles,
  UserPlus,
  Pencil,
  Share2,
  Mail,
  Siren,
  ToggleRight,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Wordmark } from "@/components/wordmark";
import { Reveal } from "@/components/landing/reveal";
import { ClaimBar } from "@/components/landing/claim-bar";
import { PhoneShowcase } from "@/components/landing/phone-showcase";

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-landing",
  display: "swap",
});

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;
  const primaryHref = isSignedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = isSignedIn ? "Open my dashboard" : "Create my page now";

  return (
    <main
      className={`${displayFont.variable} min-h-screen bg-white text-ink-900 selection:bg-brand selection:text-ink-900`}
    >
      <Header isSignedIn={isSignedIn} />
      <Hero isSignedIn={isSignedIn} primaryHref={primaryHref} />
      <TradesMarquee />
      <BeforeAfter />
      <HowItWorks />
      <BentoFeatures />
      <FreeTools />
      <PricingBlock isSignedIn={isSignedIn} />
      <FinalCTA primaryHref={primaryHref} primaryLabel={primaryLabel} />
      <MobileStickyCTA primaryHref={primaryHref} primaryLabel={primaryLabel} />
    </main>
  );
}

/* ----------------------------------------------------------------------------
 * Header — sticky glass bar. Logo left, quiet nav, one loud CTA.
 * --------------------------------------------------------------------------*/
function Header({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="group flex items-center">
          <Wordmark className="text-lg transition group-hover:opacity-75" />
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            href="/tools"
            className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-600 transition hover:bg-muted hover:text-ink-900 md:inline-flex"
          >
            Free tools
          </Link>
          <Link
            href="/blog"
            className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-600 transition hover:bg-muted hover:text-ink-900 md:inline-flex"
          >
            Blog
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-600 transition hover:bg-muted hover:text-ink-900 md:inline-flex"
          >
            Pricing
          </Link>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(15,23,42,0.5)] transition hover:bg-ink-800 active:scale-[0.98]"
            >
              <span aria-hidden className="cta-sheen" />
              Dashboard
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-ink-600 transition hover:bg-muted hover:text-ink-900 md:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink-900 shadow-[0_8px_20px_-8px_rgba(249,115,22,0.6)] transition hover:bg-brand-400 hover:shadow-[0_10px_24px_-8px_rgba(249,115,22,0.75)] active:scale-[0.98]"
              >
                <span aria-hidden className="cta-sheen" />
                Get my page
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------------------
 * Hero — claim-your-link bar front and centre, phone showcase with live
 * lead cards on the right.
 * --------------------------------------------------------------------------*/
function Hero({
  isSignedIn,
  primaryHref,
}: {
  isSignedIn: boolean;
  primaryHref: string;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* warm wash + faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(249,115,22,0.09),transparent)]"
      />
      <div
        aria-hidden
        className="bg-dot-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-50 [mask-image:linear-gradient(to_bottom,#000,transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div>
          <Link
            href="/tools"
            className="group inline-flex animate-rise-in items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-600 shadow-sm transition hover:border-brand-300 hover:text-ink-900"
            style={{ animationDelay: "40ms" }}
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-bold text-brand-700">
              <Sparkles className="h-3 w-3" />
              New
            </span>
            Free quote and invoice tools
            <ArrowRight className="h-3.5 w-3.5 text-ink-500 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          <h1
            className="mt-6 animate-rise-in font-display-2 text-[13vw] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-7xl lg:text-[80px]"
            style={{ animationDelay: "100ms" }}
          >
            Your business.
            <br />
            <span className="relative inline-block bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
              One link.
              <svg
                aria-hidden
                viewBox="0 0 360 18"
                className="absolute -bottom-1.5 left-0 h-3 w-[60%] text-brand-300"
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

          <p
            className="mt-6 max-w-lg animate-rise-in text-lg leading-relaxed text-ink-600 md:text-xl"
            style={{ animationDelay: "170ms" }}
          >
            One professional page with your photos, reviews, licences, call and
            WhatsApp buttons. Share it on your van, in your bio, on a card.
            Live in five minutes.
          </p>

          <div
            className="mt-8 animate-rise-in"
            style={{ animationDelay: "240ms" }}
          >
            {isSignedIn ? (
              <div>
                <BigCTA href={primaryHref} label="Open my dashboard" />
                <p className="mt-2.5 pl-1 text-sm text-ink-500">
                  Your page is waiting. Jump back in.
                </p>
              </div>
            ) : (
              <ClaimBar />
            )}
            <Link
              href="/t/demo"
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-ink-700 transition hover:text-brand-600"
            >
              See a live page first
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div
            className="mt-9 flex animate-rise-in items-center gap-4"
            style={{ animationDelay: "310ms" }}
          >
            <div className="flex -space-x-2.5">
              <AvatarChip initials="DW" bg="#F97316" fg="#FFFFFF" />
              <AvatarChip initials="SP" bg="#2563EB" fg="#FFFFFF" />
              <AvatarChip initials="MH" bg="#DC2626" fg="#FFFFFF" />
              <AvatarChip initials="JT" bg="#EAB308" fg="#0F172A" />
              <AvatarChip initials="RB" bg="#16A34A" fg="#FFFFFF" />
            </div>
            <div className="text-sm leading-tight">
              <div className="font-bold text-ink-900">
                Plumbers, sparkies, builders, chippies.
              </div>
              <div className="text-ink-500">
                One page that does the talking before you do.
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 sm:px-0">
          <PhoneShowcase />
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
      className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-[12px] font-extrabold shadow-sm"
      style={{ background: bg, color: fg }}
    >
      {initials}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * BigCTA — the loud primary button used in hero (signed-in) and final CTA.
 * --------------------------------------------------------------------------*/
function BigCTA({
  href,
  label,
  variant = "orange",
}: {
  href: string;
  label: string;
  variant?: "orange" | "white";
}) {
  const palette =
    variant === "orange"
      ? "bg-brand text-ink-900 shadow-[0_12px_32px_-10px_rgba(249,115,22,0.6)] hover:bg-brand-400 hover:shadow-[0_16px_36px_-10px_rgba(249,115,22,0.75)]"
      : "bg-white text-ink-900 shadow-[0_12px_32px_-10px_rgba(255,255,255,0.35)] hover:bg-brand-50";
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-8 py-4 text-lg font-bold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${palette}`}
    >
      <span aria-hidden className="cta-sheen" />
      {label}
      <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

/* ----------------------------------------------------------------------------
 * Section eyebrow — quiet pill with a live orange dot.
 * --------------------------------------------------------------------------*/
function Eyebrow({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-600 shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {label}
    </span>
  );
}

/* ----------------------------------------------------------------------------
 * Trades marquee — endless crawl of trades and cities.
 * --------------------------------------------------------------------------*/
function TradesMarquee() {
  const entries = [
    "Plumber · Sydney",
    "Sparkie · Melbourne",
    "Chippy · Brisbane",
    "Builder · Perth",
    "Roofer · Adelaide",
    "Landscaper · Gold Coast",
    "Concreter · Newcastle",
    "Gas Fitter · Wollongong",
    "Painter · Geelong",
    "Bricklayer · Canberra",
    "Plasterer · Hobart",
    "Fencer · Darwin",
    "Tiler · Sunshine Coast",
    "Locksmith · Townsville",
  ];
  const loop = [...entries, ...entries];

  return (
    <section
      aria-label="Trades using Mytradelink"
      className="border-y border-line bg-muted/60"
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent"
        />
        <div className="animate-marquee-x flex w-max items-center gap-10 whitespace-nowrap py-4">
          {loop.map((entry, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-ink-500">
                {entry}
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-brand" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Before / After — messy WhatsApp thread vs one clean link.
 * --------------------------------------------------------------------------*/
function BeforeAfter() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <div className="grid items-end gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow label="The problem" />
            <h2 className="mt-5 font-display-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
              Stop sending screenshots
              <br />
              of screenshots.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-ink-600">
            Most tradies win work through a mess of WhatsApp threads, Facebook
            comments and word of mouth. Mytradelink gives you one link that
            shows you&apos;re legit before you&apos;ve even picked up the
            phone.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Reveal delay={80}>
          <div className="h-full rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.12)]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emergency/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emergency">
              Before
            </div>
            <div className="space-y-2 text-sm">
              <ChatBubble side="left" text="hi do u do bathrooms" />
              <ChatBubble side="right" text="yes" />
              <ChatBubble side="left" text="can u send pics of past work" />
              <ChatBubble side="right" text="i'll look on my phone tonight" />
              <ChatBubble side="left" text="you licensed? got insurance?" />
              <ChatBubble side="right" text="…" muted />
            </div>
            <div className="mt-5 text-sm text-ink-500">
              Three days, no booking. The customer rings someone else.
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="h-full rounded-3xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_36px_-14px_rgba(249,115,22,0.25)]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-call/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-call">
              After
            </div>
            <div className="space-y-2 text-sm">
              <ChatBubble side="left" text="hi do u do bathrooms" />
              <ChatBubble side="right" text="yes, everything's on my page 👇" />
              <div className="ml-auto w-max max-w-[85%] rounded-2xl rounded-br-md border border-line bg-white px-4 py-3 shadow-sm">
                <div className="font-mono text-xs text-ink-500">
                  mytradelink.page/t/dave-plumber
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-ink-900">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[9px] text-white">
                    DW
                  </span>
                  Dave Wilson Plumbing · Sydney
                </div>
              </div>
              <ChatBubble side="left" text="amazing, when can you come?" />
            </div>
            <div className="mt-5 text-sm font-semibold text-brand-700">
              One link. Job booked the same morning.
            </div>
          </div>
        </Reveal>
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
            : "rounded-bl-md bg-muted text-ink-700",
          muted ? "opacity-50" : "",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * How it works — three steps joined by a dashed rail.
 * --------------------------------------------------------------------------*/
function HowItWorks() {
  const steps = [
    {
      n: "1",
      icon: <UserPlus className="h-5 w-5" />,
      title: "Sign up free",
      body: "Drop your name and trade. We make you a page on the spot.",
    },
    {
      n: "2",
      icon: <Pencil className="h-5 w-5" />,
      title: "Fill it in",
      body: "Photos, services, contact details, certs. Toggle what you want, drag the order.",
    },
    {
      n: "3",
      icon: <Share2 className="h-5 w-5" />,
      title: "Share the link",
      body: "On your van, your WhatsApp bio, your business cards. One link does everything.",
    },
  ];
  return (
    <section className="border-t border-line bg-muted/50">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow label="How it works" />
            <h2 className="mt-5 font-display-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
              Live in{" "}
              <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">
                five minutes.
              </span>
            </h2>
            <p className="mt-4 max-w-lg text-ink-600">
              No designer, no domain, no faff. Sign up, fill in, share.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* dashed connector rail, desktop only */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[44px] hidden border-t-2 border-dashed border-brand-200 md:block"
          />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="group relative h-full rounded-3xl border border-line bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_44px_-16px_rgba(249,115,22,0.28)]">
                <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_10px_24px_-8px_rgba(249,115,22,0.55)]">
                  {s.icon}
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-ink-900 text-[11px] font-extrabold text-white">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 font-display-2 text-2xl font-bold leading-tight tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 leading-relaxed text-ink-600">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Bento features — what you actually get, with little working visuals.
 * --------------------------------------------------------------------------*/
function BentoFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow label="What you get" />
            <h2 className="mt-5 font-display-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
              Everything a customer
              <br className="hidden md:block" /> needs to{" "}
              <span className="relative inline-block">
                <span className="relative z-10 px-1">trust you.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 top-[55%] -skew-y-1 rounded bg-brand/30"
                />
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-ink-600">
            Toggle sections on or off, drag them in the order you want. Changes
            save the second you make them, no save button anywhere.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
        {/* Call + WhatsApp, wide card with button mock */}
        <Reveal className="md:col-span-4" delay={0}>
          <BentoCard
            title="Call and WhatsApp buttons"
            body="Massive, impossible to miss. One tap and they're on the phone with you."
            tag="Free"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-call py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(22,163,74,0.6)]">
                <Phone className="h-4 w-4" /> Call now
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(37,211,102,0.6)]">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </div>
            </div>
          </BentoCard>
        </Reveal>

        {/* Photo gallery */}
        <Reveal className="md:col-span-2" delay={90}>
          <BentoCard
            title="Photo gallery"
            body="Show off your work. Swipeable on mobile, sharp on desktop."
            tag="Free"
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-sky-200 to-sky-400">
                <Camera className="absolute bottom-1.5 right-1.5 h-3.5 w-3.5 text-white/90" />
              </div>
              <div className="aspect-square rounded-lg bg-gradient-to-br from-brand-200 to-brand-400" />
              <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-200 to-slate-400" />
            </div>
          </BentoCard>
        </Reveal>

        {/* Reviews */}
        <Reveal className="md:col-span-2" delay={0}>
          <BentoCard
            title="Reviews link"
            body="Send people straight to your Google reviews with one button."
            tag="Free"
          >
            <div className="flex items-center gap-2 rounded-xl border border-line bg-muted px-3.5 py-3">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-star text-star" />
                ))}
              </div>
              <span className="text-sm font-bold">4.9</span>
              <span className="text-xs text-ink-500">84 reviews</span>
            </div>
          </BentoCard>
        </Reveal>

        {/* Licences */}
        <Reveal className="md:col-span-2" delay={90}>
          <BentoCard
            title="Licences and insurance"
            body="Display your tickets as proper trust badges, not a line of text."
            tag="Free"
          >
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-muted px-3.5 py-3">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-brand-600"
                strokeWidth={2.5}
              />
              <span className="text-sm font-bold">Licensed Plumber</span>
              <Check className="ml-auto h-4 w-4 text-call" strokeWidth={3} />
            </div>
          </BentoCard>
        </Reveal>

        {/* Emergency callout */}
        <Reveal className="md:col-span-2" delay={180}>
          <BentoCard
            title="Emergency callout"
            body="A red 24/7 button for the jobs that pay double."
            tag="Pro"
          >
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emergency py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(220,38,38,0.6)]">
              <Siren className="h-4 w-4" /> 24/7 emergency callout
            </div>
          </BentoCard>
        </Reveal>

        {/* Quote requests, the hero card */}
        <Reveal className="md:col-span-6" delay={0}>
          <div className="group relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-16px_rgba(249,115,22,0.25)] transition duration-300 hover:-translate-y-1 md:p-9">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-900">
                  Pro
                </span>
                <h3 className="mt-4 font-display-2 text-3xl font-bold leading-tight tracking-tight">
                  Quote requests, straight to your inbox.
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-ink-600">
                  Customers send their name, postcode, job description and
                  photos. You get an email the second it lands. Reply first,
                  win the job.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
                  <Mail className="h-4 w-4" />
                  Email alerts on every quote
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.15)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
                    New quote request
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-call">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-call" />
                    2 min ago
                  </span>
                </div>
                <div className="mt-3 text-base font-bold">
                  Sarah Davies · Bondi NSW 2026
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  Bathroom refit, 2 weeks, 3 photos attached
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="flex-1 rounded-lg bg-ink-900 py-2.5 text-center text-xs font-bold text-white">
                    Call Sarah
                  </span>
                  <span className="flex-1 rounded-lg border border-line py-2.5 text-center text-xs font-bold text-ink-700">
                    Mark contacted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* autosave note card */}
        <Reveal className="md:col-span-6" delay={80}>
          <div className="flex flex-col items-start gap-3 rounded-3xl border border-line bg-muted/60 px-7 py-5 sm:flex-row sm:items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <ToggleRight className="h-5 w-5 text-brand-600" />
            </span>
            <p className="text-sm leading-relaxed text-ink-600">
              <span className="font-bold text-ink-900">
                Everything autosaves.
              </span>{" "}
              Flip a section on, drag it up the page, change your number. It's
              live before you've put the phone down.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BentoCard({
  title,
  body,
  tag,
  children,
}: {
  title: string;
  body: string;
  tag: "Free" | "Pro";
  children: React.ReactNode;
}) {
  return (
    <div className="group flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_44px_-16px_rgba(249,115,22,0.25)]">
      <div className="mb-5">{children}</div>
      <div className="mt-auto">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display-2 text-xl font-bold leading-tight tracking-tight">
            {title}
          </h3>
          <span
            className={[
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
              tag === "Pro"
                ? "bg-brand text-ink-900"
                : "bg-muted text-ink-600",
            ].join(" ")}
          >
            {tag}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Free tools — top-of-funnel cards for /tools.
 * --------------------------------------------------------------------------*/
function FreeTools() {
  const tools = [
    {
      href: "/tools/quote-template",
      icon: <FileText className="h-5 w-5" />,
      name: "Quote Template",
      body: "Send quotes that win jobs. Fill in the work and the price, look the part every time.",
    },
    {
      href: "/tools/tax-invoice-generator",
      icon: <Receipt className="h-5 w-5" />,
      name: "Tax Invoice Generator",
      body: "Make an ATO-compliant tax invoice in under a minute. Add your ABN, the job and GST, then send it.",
    },
  ];

  return (
    <section className="border-t border-line bg-muted/50">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow label="Free tools" />
              <h2 className="mt-5 font-display-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
                Free tools for tradies.
                <br className="hidden md:block" /> No sign-up needed.
              </h2>
            </div>
            <p className="max-w-sm text-ink-600">
              Quotes, tax invoices and more. Use them free, then grab your
              Mytradelink page when you&apos;re ready.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {tools.map((t, i) => (
            <Reveal key={t.href} delay={i * 100}>
              <Link
                href={t.href}
                className="group flex h-full flex-col rounded-3xl border border-line bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_44px_-16px_rgba(249,115,22,0.25)]"
              >
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-[0_10px_24px_-8px_rgba(249,115,22,0.55)]">
                    {t.icon}
                  </span>
                  <h3 className="font-display-2 text-2xl font-bold leading-tight tracking-tight">
                    {t.name}
                  </h3>
                  <ArrowRight className="ml-auto h-5 w-5 text-ink-400 transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-brand-600" />
                </div>
                <p className="mt-4 leading-relaxed text-ink-600">{t.body}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="mt-8">
            <Link
              href="/tools"
              className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-brand-700 transition hover:text-brand-600"
            >
              See all free tools
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Pricing
 * --------------------------------------------------------------------------*/
function PricingBlock({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <div className="text-center">
          <div className="flex justify-center">
            <Eyebrow label="Pricing" />
          </div>
          <h2 className="mt-5 font-display-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Simple. Honest. No card to start.
          </h2>
          <p className="mt-4 text-ink-600">
            Start free. Upgrade when you&apos;ve won the first job.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Reveal delay={60}>
          <PriceCard
            tier="Free"
            price="A$0"
            cadence="forever"
            features={[
              "Public profile page",
              "Call and WhatsApp buttons",
              "Photo gallery and before/after",
              "Licences and Google reviews",
              "Small Mytradelink badge in footer",
            ]}
            cta={
              <Link
                href={isSignedIn ? "/dashboard" : "/sign-up"}
                className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-line bg-white px-6 py-3.5 text-base font-bold text-ink-900 transition hover:border-ink-900 active:scale-[0.99]"
              >
                {isSignedIn ? "Go to dashboard" : "Start free"}
              </Link>
            }
          />
        </Reveal>
        <Reveal delay={160}>
          <PriceCard
            highlight
            tier="Pro"
            price="A$15"
            cadence="per month"
            sub="A$149/year, save A$31"
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
                className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-6 py-3.5 text-base font-bold text-ink-900 shadow-[0_12px_28px_-10px_rgba(249,115,22,0.6)] transition hover:bg-brand-400 active:scale-[0.99]"
              >
                <span aria-hidden className="cta-sheen" />
                Upgrade to Pro
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </Reveal>
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
        "relative flex h-full flex-col rounded-3xl p-8",
        highlight
          ? "border-2 border-brand bg-gradient-to-b from-brand-50 to-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_56px_-20px_rgba(249,115,22,0.35)]"
          : "border border-line bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.1)]",
      ].join(" ")}
    >
      {highlight && (
        <div className="absolute -top-3.5 left-8 inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-lg">
          <Zap className="h-3 w-3 text-brand" />
          Most popular
        </div>
      )}
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500">
        {tier}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display-2 text-6xl font-extrabold tracking-tight">
          {price}
        </span>
        <span className="text-ink-500">{cadence}</span>
      </div>
      {sub && (
        <div className="mt-1 text-sm font-semibold text-brand-700">{sub}</div>
      )}
      <ul className="mt-7 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-call/15">
              <Check className="h-3 w-3 text-call" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8 pt-2">{cta}</div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Final CTA + footer — one dark closing block with a warm glow.
 * --------------------------------------------------------------------------*/
function FinalCTA({
  primaryHref,
  primaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-24 text-center md:pt-28">
        <Reveal>
          <h2 className="mx-auto max-w-3xl font-display-2 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Stop losing jobs to the bloke{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
              with a website.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/70">
            Five minutes to set up. Free forever. Share one link, win more
            work.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BigCTA href={primaryHref} label={primaryLabel} />
            <Link
              href="/t/demo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/25 px-8 py-[14px] text-lg font-bold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              See a live page
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            <span>Free forever</span>
            <span className="h-1 w-1 rounded-full bg-brand" />
            <span>5 min setup</span>
            <span className="h-1 w-1 rounded-full bg-brand" />
            <span>No card needed</span>
          </div>
        </Reveal>

        <footer className="mt-20 border-t border-white/10 pb-20 pt-8 md:pb-2">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-white/50 md:flex-row">
            <div className="flex items-center gap-2">
              <Wordmark className="text-base text-white/80" />
              <span className="ml-2 text-white/30">
                © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex gap-6">
              <Link href="/tools" className="transition hover:text-white">
                Free tools
              </Link>
              <Link href="/blog" className="transition hover:text-white">
                Blog
              </Link>
              <Link href="/pricing" className="transition hover:text-white">
                Pricing
              </Link>
              <Link href="/sign-in" className="transition hover:text-white">
                Sign in
              </Link>
              <Link href="/sign-up" className="transition hover:text-white">
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Mobile sticky CTA — floating pill, always one thumb-tap away.
 * --------------------------------------------------------------------------*/
function MobileStickyCTA({
  primaryHref,
  primaryLabel,
}: {
  primaryHref: string;
  primaryLabel: string;
}) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link
        href={primaryHref}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-5 py-4 text-base font-bold text-ink-900 shadow-[0_16px_40px_-12px_rgba(249,115,22,0.65),0_4px_16px_rgba(15,23,42,0.18)] active:scale-[0.98]"
      >
        <span aria-hidden className="cta-sheen" />
        {primaryLabel}
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
