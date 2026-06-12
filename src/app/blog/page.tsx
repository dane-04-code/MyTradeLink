import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarClock, Wrench } from "lucide-react";
import { getAllPosts, formatDate, type BlogPost } from "@/lib/blog";
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const posts = getAllPosts();

  // Tag pills, busiest first. Filtering happens server-side via ?tag=.
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    tagCounts.set(post.tag, (tagCounts.get(post.tag) ?? 0) + 1);
  }
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]);

  const activeTag = tag && tagCounts.has(tag) ? tag : null;
  const visible = activeTag ? posts.filter((p) => p.tag === activeTag) : posts;

  // Newest post leads the page as the featured card — only on the unfiltered view.
  const [featured, ...rest] = visible;
  const showFeatured = !activeTag && featured;
  const gridPosts = showFeatured ? rest : visible;

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
        <section className="mx-auto max-w-6xl px-5 pt-12 pb-8 md:pt-16 md:pb-10">
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

        {/* Tag filter — server-rendered, crawlable links */}
        <section className="mx-auto max-w-6xl px-5 pb-8">
          <div className="flex flex-wrap gap-2">
            <TagPill href="/blog" label={`All guides (${posts.length})`} active={!activeTag} />
            {tags.map(([name, count]) => (
              <TagPill
                key={name}
                href={`/blog?tag=${encodeURIComponent(name)}`}
                label={`${name} (${count})`}
                active={activeTag === name}
              />
            ))}
          </div>
        </section>

        {/* Featured: the newest guide gets the white hard-shadow treatment */}
        {showFeatured && (
          <section className="mx-auto max-w-6xl px-5 pb-8">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-2xl border-2 border-ink-900 bg-white p-6 text-ink-900 shadow-[0_8px_0_0_#0F172A] transition will-change-transform hover:-translate-y-0.5 md:p-9"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border-2 border-ink-900 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
                  Latest guide
                </span>
                <span className="rounded-sm border border-line bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-600">
                  {featured.tag}
                </span>
              </div>
              <h2 className="mt-4 max-w-3xl font-display text-3xl leading-[1.02] tracking-tight md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700 md:text-lg">
                {featured.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-5 py-3 text-base font-bold text-ink-900 shadow-hard-sm transition group-hover:bg-brand-400">
                  Read the guide
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-500">
                  <CalendarClock className="h-3.5 w-3.5 text-brand" />
                  {formatDate(featured.dateUpdated)} · {featured.readingTime}
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Post grid */}
        <section className="mx-auto max-w-6xl px-5 pb-4">
          {gridPosts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-white/20 py-16 text-center text-white/60">
              No guides here yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Tools cross-link — mirrors the guides bar on /tools */}
        <section className="mx-auto max-w-6xl px-5 pt-12">
          <Link
            href="/tools"
            className="group flex flex-col gap-4 rounded-2xl border-2 border-white/15 bg-white/[0.03] px-6 py-5 transition hover:border-brand sm:flex-row sm:items-center"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-brand text-ink-900">
              <Wrench className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl leading-tight tracking-tight">
                Need it done, not read? Try the free tools.
              </span>
              <span className="mt-1 block text-sm text-white/60">
                Tax invoices and quotes, generated in a minute. No sign-up.
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand">
              Open the tools
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}

function TagPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full border-2 border-brand bg-brand px-3.5 py-1.5 text-xs font-bold text-ink-900"
          : "rounded-full border-2 border-white/20 bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-white/70 transition hover:border-white/45 hover:text-white"
      }
    >
      {label}
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border-2 border-white/15 bg-white/[0.02] p-6 transition hover:border-brand"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-sm border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          {post.tag}
        </span>
        <span className="text-[11px] font-semibold text-white/45">
          {post.readingTime}
        </span>
      </div>

      <h2 className="mt-4 font-display text-xl leading-tight tracking-tight md:text-2xl">
        {post.title}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
        {post.description}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
          {formatDate(post.dateUpdated)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand">
          Read
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
