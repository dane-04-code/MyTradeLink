/**
 * Free Tools config — the single source of truth for the /tools section.
 *
 * Each tool here gets:
 *   - a card on the /tools listing page
 *   - its own page at /tools/[slug] rendered by the shared template
 *   - unique SEO meta tags (title, description, OG) pulled straight from here
 *   - an entry in the sitemap
 *
 * The tools section is a top-of-funnel SEO play: rank for the things Aussie
 * tradies google ("free tax invoice template", "tradie charge-out rate calculator"),
 * give them the tool for free, then funnel them into creating a Mytradelink
 * profile.
 *
 * To add a new tool: add an object below, then drop the actual tool UI into
 * the template's placeholder slot keyed by slug. Nothing else needs touching.
 */

export type Tool = {
  /** URL segment — lives at /tools/[slug]. Lowercase, hyphenated, never change once live (SEO). */
  slug: string;
  /** Human name shown on the card and as the page heading. */
  name: string;
  /** One-line plain-English description. Shown on the card and under the page heading. */
  description: string;
  /** SEO <title>. Keep keyword-led and under ~60 chars where possible. */
  metaTitle: string;
  /** SEO meta description + OG description. Aim for 140-160 chars. */
  metaDescription: string;
  /** Small pill shown on the card, e.g. "Free". */
  badge: string;
  /** Who it's for, e.g. "All Tradies" or "Electricians". Shown as a tag. */
  targetTrade: string;
};

export const TOOLS: Tool[] = [
  {
    slug: "tax-invoice-generator",
    name: "Tax Invoice Generator",
    description:
      "Make an ATO-compliant tax invoice in under a minute. Add your ABN, the job and GST, then send it.",
    metaTitle: "Free Tax Invoice Generator for Tradies | Mytradelink",
    metaDescription:
      "Create an ATO-compliant tax invoice free. Add your ABN, line items and GST, then download or send. Built for Australian tradies. No sign-up needed.",
    badge: "Free",
    targetTrade: "All Tradies",
  },
  {
    slug: "quote-template",
    name: "Quote Template",
    description:
      "Send quotes that win jobs. Fill in the work, the price, and look the part every time.",
    metaTitle: "Free Quote Template for Tradies | Mytradelink",
    metaDescription:
      "A free, professional quote template for tradies. Add your details, the job and the price, then send it to win more work. No sign-up needed.",
    badge: "Free",
    targetTrade: "All Tradies",
  },
  {
    slug: "charge-out-rate-calculator",
    name: "Charge-Out Rate Calculator",
    description:
      "Work out what to charge an hour. Cover your costs, super and time off, and still make a profit.",
    metaTitle: "Free Charge-Out Rate Calculator for Tradies | Mytradelink",
    metaDescription:
      "Work out your true charge-out rate. Factor in costs, super, holidays and profit so you never undercharge again. Free calculator built for Australian tradies.",
    badge: "Free",
    targetTrade: "All Tradies",
  },
  {
    slug: "job-sheet-generator",
    name: "Job Sheet Generator",
    description:
      "Print or share a tidy job sheet. Site, scope, materials and sign-off, all in one place.",
    metaTitle: "Free Job Sheet Generator for Tradies | Mytradelink",
    metaDescription:
      "Create a clear job sheet free. Capture the site, scope, materials and customer sign-off, then print or share. Built for tradies on the tools.",
    badge: "Free",
    targetTrade: "All Tradies",
  },
  {
    slug: "tradie-tax-calculator",
    name: "Tradie Tax Calculator",
    description:
      "See what to set aside for tax and GST so the ATO bill never catches you out.",
    metaTitle: "Free Tradie Tax Calculator (GST + Income) | Mytradelink",
    metaDescription:
      "Estimate your income tax and GST as a sole trader tradie. Know what to put aside each job so tax time isn't a shock. Free Australian tax calculator.",
    badge: "Free",
    targetTrade: "All Tradies",
  },
];

/** Every tool, in listing order. */
export function getAllTools(): Tool[] {
  return TOOLS;
}

/** Look up a single tool by its slug. Returns undefined if there's no match. */
export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

/** All tool slugs — handy for the sitemap and generateStaticParams. */
export function getToolSlugs(): string[] {
  return TOOLS.map((tool) => tool.slug);
}
