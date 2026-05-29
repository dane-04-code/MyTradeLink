import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

/**
 * Allow crawlers to index everything public (landing, pricing, all /tools
 * pages, public profiles) while keeping private app routes out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/api/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
