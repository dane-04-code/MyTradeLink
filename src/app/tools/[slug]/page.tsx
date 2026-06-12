import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, Hammer } from "lucide-react";
import { getAllTools, getToolBySlug } from "@/lib/tools";
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

  const liveTools = getAllTools().filter((t) => t.built && t.slug !== slug);

  return (
    <main className="min-h-screen bg-ink-900 text-white selection:bg-brand selection:text-ink-900">
      {/* same blueprint grid as the hub so the section feels like one place */}
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

        {/* Coming-soon slip — honest, and routes people to the live tools */}
        <section className="mx-auto max-w-3xl px-5 pb-4">
          <div className="overflow-hidden rounded-2xl border-2 border-ink-900 bg-white text-ink-900 shadow-[0_8px_0_0_#0F172A]">
            <div className="flex items-center gap-3 border-b-2 border-ink-900 bg-muted px-6 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink-900 bg-brand text-ink-900">
                <Hammer className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div>
                <div className="font-display text-lg leading-tight tracking-tight">
                  Still on the bench
                </div>
                <div className="text-sm text-ink-500">
                  We&apos;re building the {tool.name} right now.
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {liveTools.length > 0 && (
                <>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
                    Ready to use today
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {liveTools.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/tools/${t.slug}`}
                        className="group flex items-center gap-3 rounded-xl border-2 border-line bg-white px-4 py-3.5 transition hover:border-ink-900"
                      >
                        <span className="flex-1">
                          <span className="block font-bold">{t.name}</span>
                          <span className="mt-0.5 block text-sm text-ink-500">
                            {t.description}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink-900" />
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <p className="mt-6 text-sm text-ink-500">
                Or get ahead of the competition while you wait: a free
                Mytradelink profile takes 5 minutes and wins you work all year.
              </p>
            </div>
          </div>
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}
