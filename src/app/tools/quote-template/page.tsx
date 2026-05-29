import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "../tools-chrome";
import { QuoteBuilder } from "./quote-builder";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";
const SLUG = "quote-template";
const PAGE_URL = `${APP_URL}/tools/${SLUG}`;

export function generateMetadata(): Metadata {
  const tool = getToolBySlug(SLUG);
  if (!tool) return { title: "Free Tools for Tradies | Mytradelink" };
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      type: "website",
      url: PAGE_URL,
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

/* ---- SEO content as data: drives both the rendered HTML and the schema --- */

const HOW_TO_STEPS: { name: string; text: string }[] = [
  {
    name: "Add your business details",
    text: "Put in your business name, ABN, phone and email. Upload your logo if you've got one. We save it on your device so you only type it once.",
  },
  {
    name: "Add the customer and the job",
    text: "Enter who the quote is for and the job address, so there's no confusion about which job it covers.",
  },
  {
    name: "List the work and your prices",
    text: "Add a line for each part of the job with a quantity and price. The total adds up as you go. Flick on GST if you're registered.",
  },
  {
    name: "Set your terms",
    text: "Add a note about deposits, what's included and how long the quote is valid. 30 days is standard.",
  },
  {
    name: "Download the PDF and send it",
    text: "Hit download for a clean, professional PDF. Send it by text, email or WhatsApp and get the job booked.",
  },
];

const INCLUDES: string[] = [
  "Your business name, ABN and contact details",
  "A clear description of the work, line by line",
  "The price for each item and a clear total",
  "Whether GST applies (and the 10% if it does)",
  "How long the quote is valid for",
  "Payment and deposit terms",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is this quote generator really free?",
    a: "Yes. The quote tool is completely free with no sign-up and no limit on how many quotes you make. There's no watermark on your business details.",
  },
  {
    q: "Do I need an ABN to send a quote?",
    a: "You don't legally need an ABN on a quote, but adding it makes you look legit and is expected once you're running a registered business. The ABN field is optional in the tool.",
  },
  {
    q: "Do I have to charge GST on a quote?",
    a: "Only if you're registered for GST, which is required once your turnover hits $75,000 a year. Most sole traders under that aren't registered, so GST is off by default. Flick the toggle on to add 10% GST.",
  },
  {
    q: "What's the difference between a quote and an invoice?",
    a: "A quote is the price you give a customer before the work, so they can say yes. An invoice is the bill you send after the work to get paid. This tool makes quotes. A tax invoice generator is coming soon.",
  },
  {
    q: "How long should a quote be valid?",
    a: "30 days is standard. It protects you if material prices change. You can set any validity date you like in the tool.",
  },
  {
    q: "Is my information safe?",
    a: "Everything stays in your browser on your device. Your details and logo are never uploaded to a server, so there's nothing to leak.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. The tool is built mobile-first, so you can knock out a quote on site from your phone and download the PDF straight away.",
  },
];

function buildJsonLd(toolName: string, toolDescription: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Free Quote Template for Tradies",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: PAGE_URL,
        description: toolDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "AUD",
        },
        featureList: [
          "GST-aware quote totals",
          "Add your logo and ABN",
          "Download as PDF",
          "Works in the browser, no sign-up",
        ],
      },
      {
        "@type": "HowTo",
        name: "How to write a quote as a tradie in Australia",
        description: `Make a professional ${toolName.toLowerCase()} for free in a few minutes.`,
        step: HOW_TO_STEPS.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default function QuoteTemplatePage() {
  const tool = getToolBySlug(SLUG);
  if (!tool) notFound();

  const jsonLd = buildJsonLd(tool.name, tool.metaDescription);

  return (
    <main className="min-h-screen bg-ink-900 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolsHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-8 pb-10 md:pt-12">
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
            For Australian tradies
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          Free quote <span className="text-brand">template</span> for tradies.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Build a clean, professional quote and download it as a PDF in under a
          minute. No sign-up, works on your phone, GST sorted. Send it and win
          the job.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-brand" /> Works instantly
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-brand" /> Built for mobile
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-brand" /> Stays on your device
          </span>
        </div>
      </section>

      {/* Light workspace — the tool + SEO content live on a clean surface */}
      <div className="rounded-t-3xl bg-muted text-ink-900">
        <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <QuoteBuilder />
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            How to write a quote as a tradie
          </h2>
          <ol className="mt-6 space-y-4">
            {HOW_TO_STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border-2 border-ink-900 bg-brand font-display text-ink-900">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-ink-900">{s.name}</h3>
                  <p className="mt-0.5 text-ink-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* What to include */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            What every tradie quote should include
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INCLUDES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-white p-3 text-ink-700"
              >
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            Quote generator FAQ
          </h2>
          <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
            {FAQS.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 font-bold text-ink-900 marker:content-none">
                  {f.q}
                  <span className="text-brand transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}
