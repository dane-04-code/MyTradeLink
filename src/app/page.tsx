import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Check,
  Star,
  Share2,
  Inbox,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <Header isSignedIn={isSignedIn} />
      <Hero isSignedIn={isSignedIn} />
      <Benefits />
      <Pricing isSignedIn={isSignedIn} />
      <FinalCTA isSignedIn={isSignedIn} />
      <Footer />
    </main>
  );
}

function Header({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
      <Link href="/" className="text-2xl font-extrabold">
        <span className="text-brand">▲</span> TradeLink
      </Link>
      <nav className="flex items-center gap-2 md:gap-4">
        <Link href="/pricing" className="hidden text-sm text-white/70 hover:text-white md:inline">
          Pricing
        </Link>
        {isSignedIn ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/sign-in" className="hidden text-sm text-white/70 hover:text-white md:inline">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pt-12 pb-24 md:grid-cols-2 md:pt-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> Built for UK tradesmen
          </div>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] md:text-7xl">
            Your business.{" "}
            <span className="text-brand">One link.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/70 md:text-xl">
            A professional page that wins you jobs. Set up in 5 minutes — share it on your van, WhatsApp, Facebook bio and business cards.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="btn-primary">
              Create your free page <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/t/demo"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-white/10 bg-white/5 px-6 py-4 text-lg font-semibold text-white hover:bg-white/10"
            >
              See a live example
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/50">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand" /> Free forever plan</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand" /> No card needed</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-brand" /> Mobile first</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-10 rounded-[60px] bg-gradient-to-br from-brand/30 via-transparent to-transparent blur-2xl" />
      <div className="relative h-[620px] w-[300px] rounded-[44px] border-[10px] border-ink-700 bg-white shadow-2xl">
        <div className="absolute left-1/2 top-2 -translate-x-1/2 h-5 w-28 rounded-full bg-ink-700" />
        <div className="h-full w-full overflow-hidden rounded-[34px] bg-white text-ink-900">
          <div className="flex flex-col items-center px-5 pt-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white ring-4 ring-brand/30">
              DW
            </div>
            <h2 className="mt-3 text-lg font-extrabold">Dave Wilson</h2>
            <div className="text-sm font-semibold text-brand">Plumber · Manchester</div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Taking on work
            </div>
          </div>
          <div className="space-y-2 px-4 pt-4">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> Call Dave
            </div>
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-bold text-white">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </div>
            <div className="rounded-xl border border-neutral-200 p-3 text-left text-xs leading-relaxed text-ink-700">
              12 years' experience. Reliable, on time, fair prices. Boilers, leaks, bathrooms.
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-orange-200 to-orange-400" />
              <div className="aspect-square rounded-lg bg-gradient-to-br from-sky-200 to-sky-400" />
              <div className="aspect-square rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-400" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
              <Shield className="h-4 w-4 text-brand" />
              <div className="text-xs font-semibold">Gas Safe Registered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefits() {
  const items = [
    {
      icon: <Star className="h-6 w-6" />,
      title: "Professional profile",
      body: "Photo, services, gallery, certifications — everything customers need to trust you in 30 seconds.",
    },
    {
      icon: <Inbox className="h-6 w-6" />,
      title: "Get quote requests",
      body: "Customers fill in a form with photos and postcode. You get an instant email — call them back, win the job.",
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Share everywhere",
      body: "One link for your van, Instagram, WhatsApp, business cards. Update once — it changes everywhere.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-glow">
              {item.icon}
            </div>
            <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
            <p className="mt-2 text-white/70">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20" id="pricing">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold md:text-5xl">Pick a plan and start winning jobs.</h2>
        <p className="mt-3 text-lg text-white/70">No card needed for the free plan.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="text-sm uppercase tracking-wider text-white/50">Free</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold">£0</span>
            <span className="text-white/60">forever</span>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            {["Public profile page", "Call, WhatsApp, services", "Gallery + certifications", "Quote requests"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand" /> {f}
              </li>
            ))}
          </ul>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="btn-secondary mt-8 w-full"
          >
            {isSignedIn ? "Go to dashboard" : "Start free"}
          </Link>
        </div>

        <div className="relative rounded-3xl border-2 border-brand bg-gradient-to-b from-brand/10 to-transparent p-8 shadow-glow">
          <div className="absolute -top-3 right-6 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase">
            Most popular
          </div>
          <div className="text-sm uppercase tracking-wider text-white/50">Pro</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold">£9</span>
            <span className="text-white/60">per month</span>
          </div>
          <div className="mt-1 text-sm text-brand">£89/year — save £19</div>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            {[
              "Everything in Free",
              "Quote form with photo uploads",
              "Emergency callout button",
              "Intro video",
              "No TradeLink badge",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/pricing" className="btn-primary mt-8 w-full">
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-5 pb-24">
      <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-700 p-10 text-center shadow-glow md:p-16">
        <h2 className="text-3xl font-extrabold md:text-5xl">
          Stop losing jobs to tradesmen with a website.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/90">
          5 minutes to set up. Free forever. Share one link, win more work.
        </p>
        <Link
          href={isSignedIn ? "/dashboard" : "/sign-up"}
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-ink-900 px-8 py-5 text-xl font-bold text-white shadow-xl hover:bg-ink-800"
        >
          Create your free page <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-white/50 md:flex-row">
        <div>© {new Date().getFullYear()} TradeLink</div>
        <div className="flex gap-5">
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/sign-in" className="hover:text-white">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
