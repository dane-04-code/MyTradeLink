import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  List,
  Wrench,
} from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import {
  getPostBySlug,
  getPostSlugs,
  getAllPosts,
  formatDate,
  type BlogPost,
} from "@/lib/blog";
import { getToolBySlug, type Tool } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "../../tools/tools-chrome";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Guides for Tradies | Mytradelink" };

  const canonical = `${APP_URL}/blog/${post.slug}`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: post.metaTitle,
      description: post.metaDescription,
      publishedTime: post.datePublished,
      modifiedTime: post.dateUpdated,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

/** Heading text → URL fragment, shared by the TOC and the rendered h2 ids. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Flatten MDX children (string | array | element) into plain text. */
function childrenText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return childrenText(
      (children as { props: { children?: React.ReactNode } }).props.children
    );
  }
  return "";
}

/** Pull the ## headings out of the raw MDX for the table of contents. */
function extractH2s(content: string): string[] {
  return [...content.matchAll(/^##\s+(.+)$/gm)]
    .map((m) =>
      m[1]
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .trim()
    )
    .filter(Boolean);
}

/** Which free tool to plug under a post, by tag. Falls back to the hub. */
function toolForTag(tag: string): Tool | undefined {
  switch (tag) {
    case "Invoicing":
    case "Tax & Money":
    case "Getting Paid":
      return getToolBySlug("tax-invoice-generator");
    case "Quoting":
      return getToolBySlug("quote-template");
    case "Pricing":
      return getToolBySlug("charge-out-rate-calculator");
    default:
      return undefined;
  }
}

/** Same-tag posts first, then newest — for the "keep reading" row. */
function relatedPosts(current: BlogPost, count = 3): BlogPost[] {
  const others = getAllPosts().filter((p) => p.slug !== current.slug);
  const sameTag = others.filter((p) => p.tag === current.tag);
  const rest = others.filter((p) => p.tag !== current.tag);
  return [...sameTag, ...rest].slice(0, count);
}

/**
 * Branded MDX element styling. We map raw markdown elements to the design
 * system (display headings, ink body text, brand links) rather than pulling in
 * a typography plugin, so the article inherits the exact Mytradelink look.
 * Internal links use next/link; external links open in a new tab.
 */
const mdxComponents: MDXComponents = {
  h2: ({ children, ...props }) => (
    <h2
      id={slugifyHeading(childrenText(children))}
      className="mt-10 scroll-mt-28 font-display text-2xl leading-tight tracking-tight text-ink-900 md:text-3xl"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: (props) => (
    <h3
      className="mt-8 font-display text-xl leading-tight tracking-tight text-ink-900"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-4 text-[17px] leading-relaxed text-ink-700" {...props} />
  ),
  ul: (props) => (
    <ul className="mt-4 space-y-2 pl-1 text-[17px] leading-relaxed text-ink-700" {...props} />
  ),
  ol: (props) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-6 text-[17px] leading-relaxed text-ink-700 marker:font-bold marker:text-brand"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-bold text-ink-900" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-8 rounded-xl border-2 border-line bg-muted p-5 text-[15px] leading-relaxed text-ink-600 [&>p]:mt-0"
      {...props}
    />
  ),
  a: ({ href = "", ...props }: { href?: string }) => {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link
          href={href}
          className="font-semibold text-brand-600 underline decoration-2 underline-offset-2 transition hover:text-brand"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-brand-600 underline decoration-2 underline-offset-2 transition hover:text-brand"
        {...props}
      />
    );
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const canonical = `${APP_URL}/blog/${post.slug}`;
  const headings = extractH2s(post.content);
  const tool = toolForTag(post.tag);
  const related = relatedPosts(post);

  // Structured data for AI search + rich results. Article gives LLMs author,
  // dates and publisher; FAQPage exposes the Q&As for AI Overviews / featured
  // snippets; BreadcrumbList clarifies the site hierarchy.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateUpdated,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Mytradelink",
      url: APP_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  const faqSchema =
    post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Guides", item: `${APP_URL}/blog` },
      { "@type": "ListItem", position: 2, name: post.title, item: canonical },
    ],
  };

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* same blueprint grid as /tools so the section feels like one place */}
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

        {/* Article header */}
        <section className="mx-auto max-w-3xl px-5 pt-10 pb-8 md:pt-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            All guides
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-sm border-2 border-ink-900 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
              {post.tag}
            </span>
            <span className="text-[11px] font-semibold text-white/45">
              {post.readingTime}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
            <span>By {post.author}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-brand" />
              Last updated {formatDate(post.dateUpdated)}
            </span>
          </div>
        </section>

        {/* Article body — light reading surface for long-form readability */}
        <section className="mx-auto max-w-3xl px-5 pb-4">
          <div className="rounded-2xl border-2 border-ink-900 bg-white p-6 text-ink-900 shadow-[0_8px_0_0_#0F172A] md:p-10">
            {/* On this page — anchors to each section, like the big SEO blogs */}
            {headings.length >= 3 && (
              <nav
                aria-label="On this page"
                className="mb-8 rounded-xl border-2 border-line bg-muted p-5"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
                  <List className="h-3.5 w-3.5 text-brand" />
                  On this page
                </div>
                <ol className="mt-3 space-y-1.5">
                  {headings.map((heading, i) => (
                    <li key={heading} className="flex gap-2.5 text-[15px] leading-snug">
                      <span className="font-bold tabular-nums text-brand">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <a
                        href={`#${slugifyHeading(heading)}`}
                        className="font-semibold text-ink-700 transition hover:text-ink-900"
                      >
                        {heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <article>
              <MDXRemote source={post.content} components={mdxComponents} />
            </article>

            {/* Matching free tool — do the thing the article explains */}
            {tool && (
              <Link
                href={`/tools/${tool.slug}`}
                className="group mt-10 flex flex-col gap-4 rounded-xl border-2 border-ink-900 bg-brand p-5 text-ink-900 shadow-hard-sm transition hover:bg-brand-400 sm:flex-row sm:items-center"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-ink-900 text-white">
                  <Wrench className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg leading-tight tracking-tight">
                    Put it into practice: free {tool.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-900/75">
                    Free, no sign-up, done in a minute.
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            )}

            {post.faqs.length > 0 && (
              <div className="mt-12 border-t-2 border-line pt-8">
                <h2 className="font-display text-2xl leading-tight tracking-tight text-ink-900">
                  Common questions
                </h2>
                <dl className="mt-5 space-y-3">
                  {post.faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="rounded-xl border-2 border-line bg-muted/60 p-5"
                    >
                      <dt className="font-bold text-ink-900">{faq.question}</dt>
                      <dd className="mt-1.5 text-[16px] leading-relaxed text-ink-600">
                        {faq.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>

        {/* Keep reading — related guides keep the session going */}
        {related.length > 0 && (
          <section className="mx-auto max-w-3xl px-5 pt-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-5 w-1.5 rounded-sm bg-brand" />
              <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                Keep reading
              </h2>
            </div>
            <div className="space-y-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-white/15 bg-white/[0.02] px-5 py-4 transition hover:border-brand"
                >
                  <span className="flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                      {p.tag} · {p.readingTime}
                    </span>
                    <span className="mt-1 block font-display text-lg leading-tight tracking-tight">
                      {p.title}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-brand" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <ToolsFooterCTA />
      </div>
    </main>
  );
}
