import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { ToolsHeader, ToolsFooterCTA } from "../tools-chrome";
import { InvoiceBuilder } from "./invoice-builder";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";
const SLUG = "tax-invoice-generator";
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

const HOW_TO_STEPS: { name: string; text: string }[] = [
  {
    name: "Add your business details",
    text: "Business name, ABN, phone and email, plus your logo. Saved on your device so you only type it once.",
  },
  {
    name: "Add who you're billing",
    text: "Enter the customer, the job address, an invoice number and the due date. 14 days is standard.",
  },
  {
    name: "List the work and prices",
    text: "Add a line for each part of the job. Flick GST on if you're registered and the document becomes a proper tax invoice with 10% GST.",
  },
  {
    name: "Add how to get paid",
    text: "Put in your BSB and account number (or PayID) so the customer can pay you straight away.",
  },
  {
    name: "Download and send",
    text: "Download a clean ATO-style PDF and send it by email, text or WhatsApp. Get paid faster.",
  },
];

const INCLUDES: string[] = [
  "The words 'Tax Invoice' (when you're registered for GST)",
  "Your business name and ABN",
  "The date the invoice was issued",
  "A description of the work, line by line",
  "The GST amount, if any applies",
  "The buyer's identity or ABN for invoices of $1,000 or more",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is this tax invoice generator free?",
    a: "Yes. It's completely free with no sign-up and no limit on invoices. There's no watermark on your business details.",
  },
  {
    q: "What's the difference between an invoice and a tax invoice?",
    a: "Only businesses registered for GST may issue a 'tax invoice', and it must show the GST. If you're not registered for GST you issue a plain 'invoice' with no GST. This tool switches the heading automatically based on the GST toggle, so you stay compliant.",
  },
  {
    q: "What has to be on a tax invoice in Australia?",
    a: "For invoices under $1,000: the words 'Tax Invoice', your business name, your ABN, the date issued, a description of what was sold, and the GST amount (if any). For $1,000 or more, you also need the buyer's identity or ABN.",
  },
  {
    q: "Do I need to be registered for GST?",
    a: "You must register once your turnover reaches $75,000 a year. Below that it's optional. If you're not registered, leave the GST toggle off and the tool produces a plain invoice with no GST.",
  },
  {
    q: "Do I need an ABN on my invoice?",
    a: "Strongly recommended. Without an ABN, a business customer may be required to withhold 47% of the payment under the 'no ABN withholding' rule, so quoting your ABN gets you paid in full.",
  },
  {
    q: "Is my information safe?",
    a: "Everything stays in your browser on your device. Your details, logo and bank info are never uploaded to a server.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. It's built mobile-first, so you can invoice from site and download the PDF on the spot.",
  },
];

function buildJsonLd(toolDescription: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Free Tax Invoice Generator for Tradies",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: PAGE_URL,
        description: toolDescription,
        offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
        featureList: [
          "ATO-style tax invoice layout",
          "Automatic Tax Invoice / Invoice heading based on GST",
          "Add your logo, ABN and bank details",
          "Download as PDF, no sign-up",
        ],
      },
      {
        "@type": "HowTo",
        name: "How to make a tax invoice as a tradie in Australia",
        description: "Create an ATO-compliant tax invoice free in a few minutes.",
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

export default function TaxInvoicePage() {
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
          Free tax invoice <span className="text-brand">generator</span> for
          tradies.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Make an ATO-compliant tax invoice and download it as a PDF in under a
          minute. Adds GST when you need it, drops it when you don&apos;t. No
          sign-up, works on your phone.
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

      {/* Light workspace */}
      <div className="rounded-t-3xl bg-muted text-ink-900">
        <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <InvoiceBuilder />
        </section>

        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            How to make a tax invoice
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

        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            What a tax invoice must include
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
          <p className="mt-4 text-sm text-ink-500">
            General information only, based on ATO guidance. Check the ATO
            website or your accountant for your situation.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            Tax invoice FAQ
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

          <p className="mt-6 text-ink-600">
            Quoting a job first?{" "}
            <Link
              href="/tools/quote-template"
              className="font-bold text-brand underline-offset-2 hover:underline"
            >
              Use the free quote template
            </Link>
            .
          </p>
        </section>

        <ToolsFooterCTA />
      </div>
    </main>
  );
}
