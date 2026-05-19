import Link from "next/link";
import { Hammer, ArrowRight } from "lucide-react";

export default function TradeNotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink-900 px-6 py-16 text-center text-white">
      {/* blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 90%)",
        }}
      />

      <div className="w-full max-w-md">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-ink-900 bg-brand font-display text-4xl text-ink-900 ring-2 ring-white/15">
          404
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">
          Page not found
        </div>
        <h1 className="mt-2 font-display text-4xl leading-[0.95] tracking-tight md:text-5xl">
          This Mytradelink <br />
          <span className="text-brand">doesn&apos;t exist.</span>
        </h1>
        <p className="mt-4 text-base text-white/70">
          The link might be wrong, or the tradesman hasn&apos;t set up their page
          yet.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border-2 border-white/20 bg-white/[0.04] p-6 text-left">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
            <Hammer className="h-3.5 w-3.5" strokeWidth={2.5} />
            Are you a tradesman?
          </div>
          <div className="mt-2 font-display text-xl leading-tight tracking-tight">
            Get your own page in 5 minutes.
          </div>
          <p className="mt-2 text-sm text-white/65">
            One link with your phone, WhatsApp, photos, reviews and a quote
            form. Free to start.
          </p>
          <Link
            href="/sign-up"
            className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-5 py-3.5 text-base font-bold text-ink-900 transition active:translate-y-1 hover:bg-brand-400"
          >
            Create my page — free
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <Link
          href="/"
          className="mt-7 inline-block text-sm font-bold uppercase tracking-[0.18em] text-white/60 hover:text-white"
        >
          ← Back to Mytradelink
        </Link>
      </div>
    </main>
  );
}
