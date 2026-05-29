import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

/**
 * Shared chrome for the /tools section.
 *
 * ToolsHeader  — sticky top bar: Mytradelink logo (home link) + a persistent
 *                "Create your free profile" CTA. Always visible so a visitor
 *                using a free tool is one tap from signing up.
 * ToolsFooterCTA — the bottom funnel block pushing visitors into onboarding.
 *
 * Both are server components (links only) so they cost nothing client-side.
 */

const SIGNUP_HREF = "/sign-up";

export function ToolsHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-white/15 bg-ink-900/95 backdrop-blur supports-[backdrop-filter]:bg-ink-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="group flex items-center" aria-label="Mytradelink home">
          <Wordmark className="text-lg text-white transition group-hover:opacity-80 md:text-xl" />
        </Link>
        <Link
          href={SIGNUP_HREF}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-900 bg-brand px-3.5 py-2 text-sm font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-0.5 md:px-4"
        >
          <span className="hidden sm:inline">Create your free profile</span>
          <span className="sm:hidden">Free profile</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

/**
 * Footer CTA — styled like the landing page's job-ticket slip so the tools
 * section feels part of the same product. Drops onto the bottom of every
 * tool page and the listing page.
 */
export function ToolsFooterCTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
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

        <div className="relative px-7 pt-12 pb-10 md:px-16 md:pt-14 md:pb-12">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-ink-900/70">
            Want more jobs?
          </div>
          <h2 className="mt-3 max-w-2xl font-display text-3xl leading-[0.95] tracking-tight md:text-5xl">
            Create your free Mytradelink profile in 5 minutes.
          </h2>
          <p className="mt-4 max-w-md text-base text-ink-900/85 md:text-lg">
            One link with your photos, reviews, and call &amp; WhatsApp buttons.
            Share it everywhere and let it win you work.
          </p>

          <div className="mt-8">
            <Link
              href={SIGNUP_HREF}
              className="group inline-flex items-center justify-center gap-3 rounded-2xl border-[3px] border-ink-900 bg-ink-900 px-7 py-4 text-lg font-bold text-white shadow-[0_6px_0_0_rgba(15,23,42,0.35)] transition will-change-transform hover:translate-y-[2px] hover:bg-ink-800 active:translate-y-[6px] active:shadow-none"
            >
              Create my free profile
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1.5" />
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-900/75">
              <span>Free forever</span>
              <span className="h-1 w-1 rounded-full bg-ink-900" />
              <span>5 min setup</span>
              <span className="h-1 w-1 rounded-full bg-ink-900" />
              <span>No card needed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
