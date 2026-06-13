import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "../tools-chrome";
import { JobSheetBuilder } from "./job-sheet-builder";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";
const SLUG = "job-sheet-generator";
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
    name: "Add your business once",
    text: "Name, ABN, phone and logo. It's saved on your device so every job sheet after this one is already half done.",
  },
  {
    name: "Fill in the customer and site",
    text: "Who the job was for, where it was, and a job number and date. The status pill shows whether it's done, in progress or needs a follow-up.",
  },
  {
    name: "Write down what you did",
    text: "Spell out the work carried out on site. This is the bit that protects you if a customer later says something wasn't done.",
  },
  {
    name: "List materials and hours",
    text: "Add the parts and bits you used and your time on site. No prices — a job sheet is a record, not a bill.",
  },
  {
    name: "Get it signed and download",
    text: "Download the PDF, print it or send it. There's a sign-off line for you and the customer so the job's agreed in writing.",
  },
];

const INCLUDES: string[] = [
  "Your business details and logo",
  "Customer, site address and job number",
  "A clear record of the work carried out",
  "Materials and parts used on the job",
  "Hours on site and a job status",
  "Sign-off lines for you and the customer",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is a job sheet?",
    a: "A job sheet is the on-site record of a job: who it was for, where, what work was carried out, what materials and hours went in, and a sign-off from the customer. It's not a bill — there are no prices. It's the paperwork that proves what you did, settles disputes, and makes writing the invoice afterwards easy.",
  },
  {
    q: "What should be on a job sheet?",
    a: "At a minimum: your business details, the customer and site address, the date and a job number, a clear description of the work carried out, the materials used, the hours on site, and a space for the customer to sign. This free generator includes all of that, plus a status (completed, in progress or follow-up needed).",
  },
  {
    q: "Is this job sheet generator really free?",
    a: "Yes. No sign-up, no limits, and nothing leaves your device — it all runs in your browser. Fill it in, download the PDF and you're done.",
  },
  {
    q: "What's the difference between a job sheet and an invoice?",
    a: "A job sheet records what was done on site (work, materials, hours, sign-off) and carries no prices. An invoice is the request for payment, with line items, amounts and GST. Many tradies fill in a job sheet on site, get it signed, then use it to write the invoice. We've got a free tax invoice generator for that next step.",
  },
  {
    q: "Why bother with a job sheet?",
    a: "Three reasons: it protects you if a customer disputes the work, it's a clean record for your own books and warranties, and it makes invoicing faster because everything's already written down. A signed job sheet is hard to argue with.",
  },
  {
    q: "Can I print the job sheet or fill it in on site?",
    a: "Both. Download the PDF and print a stack to fill in by hand on site, or fill it in on your phone and get the customer to sign the printout. The sign-off lines are there either way.",
  },
];

function buildJsonLd(toolDescription: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Free Job Sheet Generator for Tradies",
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
          "Work carried out, materials and hours",
          "Customer and site details",
          "Customer sign-off line",
          "Print or download as PDF",
          "Works in the browser, no sign-up",
        ],
      },
      {
        "@type": "HowTo",
        name: "How to make a job sheet",
        description:
          "Create a clear job sheet recording the customer, site, work carried out, materials, hours and sign-off.",
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

export default function JobSheetGeneratorPage() {
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
          Free job sheet <span className="text-brand">generator</span>.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          A tidy record of every job: the site, the work, materials, hours and
          a customer sign-off. Fill it in, get it signed, download the PDF.
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
          <JobSheetBuilder />
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            How to make a job sheet
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

        {/* What's on it */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            What&apos;s on the job sheet
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

        {/* Read next — blog + tool cross-links */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            Read next
          </h2>
          <div className="mt-6 space-y-2.5">
            <ReadNext
              href="/blog/what-is-a-job-sheet-tradie"
              title="What is a job sheet and what should be on it?"
              meta="The plain-English guide"
            />
            <ReadNext
              href="/tools/tax-invoice-generator"
              title="Turn the job into an invoice"
              meta="Free ATO-compliant tax invoice generator"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            Job sheet FAQ
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

function ReadNext({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border-2 border-line bg-white px-4 py-3.5 transition hover:border-ink-900"
    >
      <span className="flex-1">
        <span className="block font-bold text-ink-900">{title}</span>
        <span className="text-sm text-ink-500">{meta}</span>
      </span>
      <ChevronLeft className="h-4 w-4 flex-shrink-0 rotate-180 text-ink-500 transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}
