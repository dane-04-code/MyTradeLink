import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Wrench } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "../tools-chrome";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Free Tools for Tradies | Mytradelink" };

  const canonical = `${APP_URL}/tools/${tool.slug}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      <ToolsHeader />

      {/* Tool title + description */}
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-8 md:pt-14">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          All free tools
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-sm border-2 border-ink-900 bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-900">
            {tool.badge}
          </span>
          <span className="rounded-sm border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
            {tool.targetTrade}
          </span>
        </div>

        <h1 className="mt-4 font-display text-3xl leading-[0.98] tracking-tight sm:text-4xl md:text-5xl">
          {tool.name}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
          {tool.description}
        </p>
      </section>

      {/* Main tool area — each tool drops its UI into this slot. Empty for now. */}
      <section className="mx-auto max-w-3xl px-5 pb-4">
        <div className="rounded-2xl border-2 border-white/15 bg-white p-6 text-ink-900 shadow-hard md:p-10">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-ink-900 bg-brand text-ink-900">
              <Wrench className="h-6 w-6" />
            </div>
            <p className="mt-4 font-display text-xl tracking-tight text-ink-900">
              This tool is on its way
            </p>
            <p className="mt-2 max-w-sm text-sm text-ink-500">
              The {tool.name} drops in right here. Check back soon, or create
              your free profile in the meantime.
            </p>
          </div>
        </div>
      </section>

      <ToolsFooterCTA />
    </main>
  );
}
