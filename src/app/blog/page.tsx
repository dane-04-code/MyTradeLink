import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getAllPosts, formatDate } from "@/lib/blog";
// Funnel chrome is shared with /tools so the whole marketing surface feels
// like one product: same sticky header + signup CTA, same footer CTA.
import { ToolsHeader, ToolsFooterCTA } from "../tools/tools-chrome";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

export const metadata: Metadata = {
  title: "Guides for Tradies | Mytradelink",
  description:
    "Plain-English guides for Australian tradies on tax, quotes, getting paid and winning more work. No jargon, just the answers you actually need.",
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${APP_URL}/blog`,
    title: "Guides for Tradies | Mytradelink",
    description:
      "Plain-English guides for Australian tradies on tax, quotes, getting paid and winning more work.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      {/* faint blueprint grid, matching /tools and the landing page */}
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
            <BookOpen className="h-3.5 w-3.5 text-brand" />
            Guides
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
            Guides for <span className="text-brand">tradies.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            The business side, explained in plain English. Tax, quotes, getting
            paid and winning more work. No jargon, just the answers you need.
          </p>
        </section>

        {/* Post list */}
        <section className="mx-auto max-w-6xl px-5 pb-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-white/20 py-16 text-center text-white/60">
              First guide coming soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="group flex flex-col rounded-2xl border-2 border-white/15 bg-ink-900 p-6 transition hover:border-brand"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-sm border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                      {post.tag}
                    </span>
                    <span className="text-[11px] font-semibold text-white/45">
                      {post.readingTime}
                    </span>
                  </div>

                  <h2 className="mt-5 font-display text-2xl leading-tight tracking-tight">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">
                    {post.description}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-base font-bold text-brand transition hover:text-brand-400"
                  >
                    Read guide
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}
