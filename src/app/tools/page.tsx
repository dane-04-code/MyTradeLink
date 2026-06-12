import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ClipboardList,
  FileText,
  PiggyBank,
  Receipt,
  Wrench,
  Zap,
} from "lucide-react";
import { getAllTools, type Tool } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";
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

/** Per-tool icon. Lives here, not in the config — purely presentational. */
function toolIcon(slug: string) {
  switch (slug) {
    case "tax-invoice-generator":
      return <Receipt className="h-6 w-6" strokeWidth={2.25} />;
    case "quote-template":
      return <FileText className="h-6 w-6" strokeWidth={2.25} />;
    case "charge-out-rate-calculator":
      return <Calculator className="h-6 w-6" strokeWidth={2.25} />;
    case "job-sheet-generator":
      return <ClipboardList className="h-6 w-6" strokeWidth={2.25} />;
    case "tradie-tax-calculator":
      return <PiggyBank className="h-6 w-6" strokeWidth={2.25} />;
    default:
      return <Wrench className="h-6 w-6" strokeWidth={2.25} />;
  }
}

export default function ToolsPage() {
  const tools = getAllTools();
  const ready = tools.filter((t) => t.built);
  const coming = tools.filter((t) => !t.built);
  const guideCount = getAllPosts().length;

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
        <section className="mx-auto max-w-6xl px-5 pt-12 pb-10 md:pt-16 md:pb-12">
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
            <Wrench className="h-3.5 w-3.5 text-brand" />
            Free tools
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            Free tools for <span className="text-brand">tradies.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            The boring business stuff, sorted. Invoices, quotes, charge-out
            rates and tax, done in a minute. Built by Mytradelink so you can
            get back on the tools.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
            <span>100% free</span>
            <span className="h-1 w-1 rounded-full bg-brand" />
            <span>No sign-up</span>
            <span className="h-1 w-1 rounded-full bg-brand" />
            <span>Nothing leaves your device</span>
          </div>
        </section>

        {/* Ready to use — the live tools, loud and white */}
        <section className="mx-auto max-w-6xl px-5 pb-12">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-sm bg-brand" />
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
              Ready to use
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ready.map((tool) => (
              <ReadyCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* On the bench — honest about what's coming, no dead-end CTAs */}
        <section className="mx-auto max-w-6xl px-5 pb-4">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-sm bg-white/25" />
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
              On the bench — coming soon
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coming.map((tool) => (
              <ComingCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>

        {/* Guides cross-link — the other free resource */}
        <section className="mx-auto max-w-6xl px-5 pt-12">
          <Link
            href="/blog"
            className="group flex flex-col gap-4 rounded-2xl border-2 border-white/15 bg-white/[0.03] px-6 py-5 transition hover:border-brand sm:flex-row sm:items-center"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-brand text-ink-900">
              <BookOpen className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl leading-tight tracking-tight">
                Prefer reading? {guideCount} free guides on the blog.
              </span>
              <span className="mt-1 block text-sm text-white/60">
                Tax, invoicing, pricing and getting more work. Plain English,
                no waffle.
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand">
              Read the guides
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}

/**
 * A live tool — white card with the hard offset shadow from the landing
 * page and dashboard, so "you can use this right now" reads at a glance.
 */
function ReadyCard({ tool }: { tool: Tool }) {
  return (
    <article className="group relative flex flex-col rounded-2xl border-2 border-ink-900 bg-white p-6 text-ink-900 shadow-[0_8px_0_0_#0F172A] transition will-change-transform hover:-translate-y-0.5 md:p-7">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-ink-900 bg-brand text-ink-900">
          {toolIcon(tool.slug)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-sm border-2 border-ink-900 bg-call px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          <Zap className="h-3 w-3" strokeWidth={3} />
          Live
        </span>
      </div>

      <h3 className="mt-5 font-display text-2xl leading-tight tracking-tight md:text-3xl">
        {tool.name}
      </h3>
      <p className="mt-2 flex-1 text-base leading-relaxed text-ink-700">
        {tool.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/tools/${tool.slug}`}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-5 py-3 text-base font-bold text-ink-900 shadow-hard-sm transition hover:bg-brand-400 active:translate-y-0.5 active:shadow-press"
        >
          Use free tool
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
          {tool.badge} · No sign-up
        </span>
      </div>
    </article>
  );
}

/**
 * A coming-soon tool — quiet dashed outline so nobody clicks expecting a
 * working tool. Still links to the page (it carries the SEO + sign-up funnel).
 */
function ComingCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] p-5 transition hover:border-white/45"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-white/20 bg-white/[0.05] text-white/70">
          {toolIcon(tool.slug)}
        </span>
        <span className="rounded-sm border border-white/20 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
          Coming soon
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl leading-tight tracking-tight text-white/90">
        {tool.name}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-white/55">
        {tool.description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/45 transition group-hover:text-brand">
        Have a look
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
