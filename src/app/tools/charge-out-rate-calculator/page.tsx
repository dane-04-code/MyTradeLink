import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "../tools-chrome";
import { RateCalculator } from "./rate-calculator";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";
const SLUG = "charge-out-rate-calculator";
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
    name: "Set your income goal",
    text: "Decide what you want to pay yourself for a year on the tools, before tax. Flick on super if you're putting some away. Employees get 12%, so should you.",
  },
  {
    name: "Be honest about billable hours",
    text: "Take off holidays, sick days and rain days, then count only the hours you can actually charge for. Quoting, driving and paperwork don't pay.",
  },
  {
    name: "Add up your business costs",
    text: "Ute, fuel, insurance, licences, tools, phone. The business pays for all of it before you earn a cent, so your rate has to cover it.",
  },
  {
    name: "Add a profit margin",
    text: "Profit isn't your wage. It's what keeps the business alive through slow months and pays for growth. 10-20% is typical.",
  },
  {
    name: "Read your rate",
    text: "The calculator shows your hourly rate, your day rate, and exactly what each hour covers. Add GST on top if you're registered.",
  },
];

const INCLUDES: string[] = [
  "Your wage: what you actually pay yourself",
  "Super, so future-you isn't broke",
  "Holidays, sick days and rain days you don't bill",
  "The hours each week you can't charge for",
  "Vehicle, insurance, tools and running costs",
  "A real profit margin on top",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is this charge-out rate calculator really free?",
    a: "Yes. No sign-up, no limits, and your numbers never leave your device. It runs entirely in your browser.",
  },
  {
    q: "What do tradies charge per hour in Australia?",
    a: "It varies a lot by trade and city, but most established tradies land somewhere between $80 and $150 an hour plus GST. The right number for you depends on your costs and billable hours, which is exactly what this calculator works out.",
  },
  {
    q: "What's a billable hour?",
    a: "An hour you can actually invoice a customer for. Time spent quoting, driving between jobs, picking up materials and doing paperwork is work, but nobody pays you for it. Most tradies only bill 25 to 32 hours of a 45-hour week.",
  },
  {
    q: "Do I add GST on top of my charge-out rate?",
    a: "Yes. The rate from this calculator is GST-exclusive. If you're registered for GST (required once turnover hits $75,000), add 10% on top of your rate when you invoice.",
  },
  {
    q: "Do sole traders have to pay themselves super?",
    a: "No, super isn't compulsory for sole traders. But employees get 12% paid for them, and your rate should fund the same for you, or you're effectively working for less than an employee.",
  },
  {
    q: "Why can't I just charge what other tradies charge?",
    a: "Their costs aren't your costs. A bloke with a paid-off ute and no insurance lapses can charge less than someone financing a new van. Work your rate out from your own numbers, then sanity-check it against the market.",
  },
  {
    q: "Does the rate include markup on materials?",
    a: "No. Materials and their markup are separate. This rate covers your labour. Most tradies add 15-25% on materials to cover sourcing time and warranty risk.",
  },
];

function buildJsonLd(toolDescription: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Free Charge-Out Rate Calculator for Tradies",
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
          "Hourly and day rate from your real numbers",
          "Covers super, holidays and business costs",
          "Profit margin built in",
          "Works in the browser, no sign-up",
        ],
      },
      {
        "@type": "HowTo",
        name: "How to work out your charge-out rate as a tradie",
        description:
          "Work out what to charge per hour from your income goal, billable hours, business costs and profit margin.",
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

export default function ChargeOutRateCalculatorPage() {
  const tool = getToolBySlug(SLUG);
  if (!tool) notFound();

  const jsonLd = buildJsonLd(tool.metaDescription);

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
          Charge-out rate <span className="text-brand">calculator</span> for
          tradies.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Work out what to charge an hour from your real numbers: your wage,
          super, time off, business costs and profit. Stop guessing, stop
          undercharging.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-brand" /> Updates as you type
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
          <RateCalculator />
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            How to work out your charge-out rate
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

        {/* What the rate has to cover */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            What your hourly rate has to cover
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
            Charge-out rate FAQ
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
