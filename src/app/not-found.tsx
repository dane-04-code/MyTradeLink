import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

/**
 * Global 404 — any unmatched route (other than /t/[slug] which has its own)
 * lands here. Matches the landing-page aesthetic: dark navy with blueprint
 * grid, Archivo Black headline, brand-orange wordmark.
 */
export default function GlobalNotFound() {
  return (
    <main className="relative min-h-screen bg-ink-900 text-white">
      {/* blueprint grid */}
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

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:py-7">
          <Link href="/" className="group flex items-center">
            <Wordmark className="text-xl transition group-hover:opacity-80" />
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pt-20 pb-24 text-center md:pt-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          404
        </span>
        <h1 className="mt-6 font-display text-[14vw] leading-[0.88] tracking-[-0.03em] sm:text-[88px] md:text-[112px]">
          Wrong <span className="text-brand">turn.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/70">
          That page isn&apos;t here. Could be a typo, could be a link that
          moved, could be us. Pick somewhere to go from here:
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-7 py-4 text-lg font-bold text-ink-900 shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition hover:bg-brand-400 active:scale-[0.98]"
          >
            Home
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-7 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/[0.08]"
          >
            Get my free page
          </Link>
        </div>
      </section>
    </main>
  );
}
