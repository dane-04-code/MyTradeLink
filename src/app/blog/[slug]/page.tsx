import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarClock } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import { getPostBySlug, getPostSlugs, formatDate } from "@/lib/blog";
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

/**
 * Branded MDX element styling. We map raw markdown elements to the design
 * system (display headings, ink body text, brand links) rather than pulling in
 * a typography plugin, so the article inherits the exact Mytradelink look.
 * Internal links use next/link; external links open in a new tab.
 */
const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-10 font-display text-2xl leading-tight tracking-tight text-ink-900 md:text-3xl"
      {...props}
    />
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
        <div className="rounded-2xl border-2 border-white/15 bg-white p-6 text-ink-900 shadow-hard md:p-10">
          <article>
            <MDXRemote source={post.content} components={mdxComponents} />
          </article>

          {post.faqs.length > 0 && (
            <div className="mt-12 border-t-2 border-line pt-8">
              <h2 className="font-display text-2xl leading-tight tracking-tight text-ink-900">
                Common questions
              </h2>
              <dl className="mt-5 space-y-5">
                {post.faqs.map((faq) => (
                  <div key={faq.question}>
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

      <ToolsFooterCTA />
    </main>
  );
}
