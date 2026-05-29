import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { getAllTools } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "./tools-chrome";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

export const metadata: Metadata = {
  title: "Free Tools for Tradies | Mytradelink",
  description:
    "Free, no-sign-up tools for tradies: tax invoices, quotes, charge-out rate and tax calculators, job sheets. Built by Mytradelink to help you run the business side.",
  alternates: { canonical: `${APP_URL}/tools` },
  openGraph: {
    type: "website",
    url: `${APP_URL}/tools`,
    title: "Free Tools for Tradies | Mytradelink",
    description:
      "Free, no-sign-up tools for tradies: tax invoices, quotes, charge-out rate and tax calculators, job sheets.",
  },
};

export default function ToolsPage() {
  const tools = getAllTools();

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      {/* faint blueprint grid for the build-site feel, matching the landing page */}
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

      <div className="relative z-10">
        <ToolsHeader />

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-12 pb-10 md:pt-16 md:pb-14">
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
            <Wrench className="h-3.5 w-3.5 text-brand" />
            Free tools
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            Free tools for <span className="text-brand">tradies.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            The boring business stuff, sorted. Invoices, quotes, charge-out
            rates and tax, done in a minute, no sign-up. Built by Mytradelink so
            you can get back on the tools.
          </p>
        </section>

        {/* Tool grid */}
        <section className="mx-auto max-w-6xl px-5 pb-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <article
                key={tool.slug}
                className="group flex flex-col rounded-2xl border-2 border-white/15 bg-ink-900 p-6 transition hover:border-brand"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-sm border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                    {tool.targetTrade}
                  </span>
                  <span className="rounded-sm border-2 border-ink-900 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
                    {tool.badge}
                  </span>
                </div>

                <h2 className="mt-5 font-display text-2xl leading-tight tracking-tight">
                  {tool.name}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">
                  {tool.description}
                </p>

                <Link
                  href={`/tools/${tool.slug}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-5 py-3 text-base font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-0.5"
                >
                  Use Free Tool
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}
