import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { TAX_YEAR_LABEL } from "@/lib/tax";
import { ToolsHeader, ToolsFooterCTA } from "../tools-chrome";
import { TaxCalculator } from "./tax-calculator";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";
const SLUG = "tradie-tax-calculator";
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
    name: "Enter what you'll invoice",
    text: "Put in the total money you expect to earn for the financial year, before expenses and GST-exclusive. A rough but honest guess is fine.",
  },
  {
    name: "Add your business expenses",
    text: "Fuel, tools, insurance, materials, phone, software, your accountant. These come off your income before tax, so the more you track the less you pay.",
  },
  {
    name: "Flick GST on if you're registered",
    text: "Once you turn over $75,000 you have to register. The calculator adds the GST you collect, then takes off the GST credits on your purchases.",
  },
  {
    name: "Read what to set aside",
    text: "You get a yearly figure plus a weekly amount and what to put away per $1,000 invoiced. Move that into a separate account and tax time stops being a shock.",
  },
];

const INCLUDES: string[] = [
  "Income tax at the resident sole-trader rates",
  "The 2% Medicare levy, with the low-income phase-in",
  "GST you collect, less credits on your purchases",
  "Your effective tax rate, not just the top bracket",
  "What you actually keep after tax",
  "A per-week and per-$1,000 amount to set aside",
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How much should a tradie set aside for tax?",
    a: "A common rule of thumb is 25–30% of your profit, but it depends on what you earn. A sole trader on $90,000 taxable income pays about $19,600 in income tax and Medicare (roughly 22%); on $130,000 it's about $32,400 (close to 25%). If you're registered for GST you also hold the GST you charge (1/11 of your GST-inclusive sales) for the ATO on top. This calculator works out the real figure from your own numbers.",
  },
  {
    q: "How much tax does a sole trader pay in Australia?",
    a: "Sole traders pay individual income tax on their profit (income minus expenses) at the resident marginal rates, plus the 2% Medicare levy. The first $18,200 is tax-free, then it steps up: 16% to $45,000, 30% to $135,000, 37% to $190,000 and 45% above that. There's no separate 'business tax' — your trade profit is just added to your personal income.",
  },
  {
    q: "Do I pay tax on the whole amount I invoice?",
    a: "No. You only pay income tax on your profit — the money you invoice minus your deductible business expenses. Keeping good records of fuel, tools, insurance and materials directly lowers your tax bill, which is why it pays to track every receipt.",
  },
  {
    q: "When do I have to register for GST?",
    a: "Once your business turns over $75,000 or more in a year, GST registration is compulsory. After that you add 10% GST to your invoices, hand it to the ATO each BAS, and can claim back the GST on your business purchases. Under $75,000 it's optional.",
  },
  {
    q: "Is the GST I charge my money?",
    a: "No, and it's the number one thing that catches tradies out. GST you charge a customer is collected on behalf of the ATO — you're just holding it. Set it aside the moment it lands so it's there when your BAS is due, otherwise it feels like a pay cut every quarter.",
  },
  {
    q: "Does this calculator include HECS or other debts?",
    a: "No. It covers income tax, the Medicare levy and GST for a resident sole trader. If you have a HECS/HELP debt or other adjustments your set-aside should be a bit higher — your accountant can fine-tune it. Treat this as a solid starting estimate, not tax advice.",
  },
];

function buildJsonLd(toolDescription: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Free Tradie Tax Calculator (Income + GST)",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: PAGE_URL,
        description: toolDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "AUD",
        },
        featureList: [
          "Income tax at resident sole-trader rates",
          "2% Medicare levy with low-income phase-in",
          "GST set-aside, net of credits",
          "Per-week and per-$1,000 set-aside amounts",
          "Works in the browser, no sign-up",
        ],
      },
      {
        "@type": "HowTo",
        name: "How to work out what to set aside for tax as a tradie",
        description:
          "Estimate your income tax, Medicare levy and GST as an Australian sole-trader tradie from your revenue and expenses.",
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

export default function TradieTaxCalculatorPage() {
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
            {TAX_YEAR_LABEL} rates
          </span>
        </div>

        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
          Tradie tax <span className="text-brand">calculator</span>.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          See exactly what to put aside for income tax, the Medicare levy and
          GST so the ATO bill never catches you out. Built for Australian sole
          traders.
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
          <TaxCalculator />
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            How to work out what to set aside
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

        {/* What it covers */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            What the estimate covers
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

        {/* Read next — blog cross-links */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            Read next
          </h2>
          <div className="mt-6 space-y-2.5">
            <ReadNext
              href="/blog/how-much-tax-does-a-sole-trader-tradie-pay"
              title="How much tax does a sole trader tradie pay?"
              meta="The brackets explained, plain English"
            />
            <ReadNext
              href="/blog/tradie-tax-set-aside-australia"
              title="How much should a tradie set aside for tax?"
              meta="The simple rule that keeps you out of trouble"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="font-display text-2xl tracking-tight text-ink-900 md:text-3xl">
            Tradie tax FAQ
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
