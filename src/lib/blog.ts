/**
 * Blog config + loader — the source of truth for the /blog section.
 *
 * Posts are authored as MDX files in `content/blog/*.mdx`. Each file carries
 * its own SEO + display metadata in YAML frontmatter (see the type below), so
 * adding a post is just dropping a new .mdx file in that folder. Nothing here
 * or in the page components needs touching.
 *
 * Like /tools, /blog is a top-of-funnel SEO + AI-SEO play: answer the exact
 * questions Aussie tradies ask ("how much tax should I set aside?"), get cited
 * by Google AI Overviews / ChatGPT / Perplexity, then funnel readers into a
 * Mytradelink profile. Posts cross-link to the matching free tool.
 *
 * Frontmatter shape (all strings unless noted):
 *   title            Headline shown on the card + as the <h1>.
 *   description      One-line summary for the card + intro.
 *   metaTitle        SEO <title>. Keyword-led, ~60 chars.
 *   metaDescription  SEO meta + OG description. 140-160 chars.
 *   datePublished    ISO date (YYYY-MM-DD).
 *   dateUpdated      ISO date (YYYY-MM-DD). Drives the visible "Last updated".
 *   author           Byline.
 *   tag              Small category pill, e.g. "Tax & Money".
 *   faqs (optional)  Array of { question, answer } → FAQPage schema + on-page FAQ.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  datePublished: string;
  dateUpdated: string;
  author: string;
  tag: string;
  /** Estimated read time, computed from word count, e.g. "4 min read". */
  readingTime: string;
  faqs: BlogFaq[];
};

export type BlogPost = BlogPostMeta & {
  /** Raw MDX body (frontmatter stripped) — fed to the MDX renderer. */
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const WORDS_PER_MINUTE = 220;

/** Narrow an unknown frontmatter value to a trimmed string, with a fallback. */
function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

/** Narrow unknown frontmatter into a list of well-formed FAQ entries. */
function toFaqs(value: unknown): BlogFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const question = str(record.question);
      const answer = str(record.answer);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((faq): faq is BlogFaq => faq !== null);
}

/** Rough read time from the raw MDX body. */
function readingTimeFor(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

/** Read + parse a single .mdx file into a full post (meta + body). */
function parseFile(fileName: string): BlogPost {
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: str(data.title, slug),
    description: str(data.description),
    metaTitle: str(data.metaTitle, str(data.title, slug)),
    metaDescription: str(data.metaDescription, str(data.description)),
    datePublished: str(data.datePublished),
    dateUpdated: str(data.dateUpdated, str(data.datePublished)),
    author: str(data.author, "The Mytradelink Team"),
    tag: str(data.tag, "Guide"),
    readingTime: readingTimeFor(content),
    faqs: toFaqs(data.faqs),
    content,
  };
}

function listFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((name) => name.endsWith(".mdx"));
}

/** Every post, newest first (by dateUpdated then datePublished). */
export function getAllPosts(): BlogPost[] {
  return listFiles()
    .map(parseFile)
    .sort((a, b) => {
      const aKey = a.dateUpdated || a.datePublished;
      const bKey = b.dateUpdated || b.datePublished;
      return bKey.localeCompare(aKey);
    });
}

/** Look up a single post by slug. Returns undefined if there's no match. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  const fileName = `${slug}.mdx`;
  if (!fs.existsSync(path.join(BLOG_DIR, fileName))) return undefined;
  return parseFile(fileName);
}

/** All post slugs — for the sitemap and generateStaticParams. */
export function getPostSlugs(): string[] {
  return listFiles().map((name) => name.replace(/\.mdx$/, ""));
}

/** Human date, e.g. "28 May 2026". Falls back to the raw string if unparseable. */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day} ${months[month - 1]} ${year}`;
}
