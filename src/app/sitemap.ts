import type { MetadataRoute } from "next";
import { getToolSlugs } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mytradelink.page";

/**
 * Sitemap for the indexable, public surface of Mytradelink:
 *   - the core marketing pages
 *   - the /tools hub and every individual free-tool page
 *
 * Dashboard, onboarding and per-user profile pages are intentionally left out
 * (private or user-generated) — they're handled separately.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${APP_URL}/pricing`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const toolRoutes: MetadataRoute.Sitemap = getToolSlugs().map((slug) => ({
    url: `${APP_URL}/tools/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${APP_URL}/blog/${post.slug}`,
    lastModified: post.dateUpdated || post.datePublished || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
