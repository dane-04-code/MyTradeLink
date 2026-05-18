import { db } from "@/lib/db";
import { pageEvents } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import type { EventType } from "@/lib/db/schema";

export type EventCounts = Record<EventType, number>;

const EMPTY_COUNTS: EventCounts = {
  view: 0,
  call_click: 0,
  whatsapp_click: 0,
  quote_open: 0,
  quote_submit: 0,
  social_click: 0,
};

export type Sparkline = number[];

/** Aggregate event counts for a user over the last N days. */
export async function getEventCounts(
  userId: number,
  days: number
): Promise<EventCounts> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      eventType: pageEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(pageEvents)
    .where(and(eq(pageEvents.userId, userId), gte(pageEvents.createdAt, since)))
    .groupBy(pageEvents.eventType);

  const counts: EventCounts = { ...EMPTY_COUNTS };
  for (const row of rows) {
    counts[row.eventType as EventType] = Number(row.count);
  }
  return counts;
}

/**
 * Per-day sparkline of one event type for the last N days. Returns an
 * array of length `days` with the oldest day at index 0 and today at the end.
 */
export async function getSparkline(
  userId: number,
  eventType: EventType,
  days: number
): Promise<Sparkline> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${pageEvents.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(pageEvents)
    .where(
      and(
        eq(pageEvents.userId, userId),
        eq(pageEvents.eventType, eventType),
        gte(pageEvents.createdAt, since)
      )
    )
    .groupBy(sql`date_trunc('day', ${pageEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${pageEvents.createdAt})`);

  const byDay = new Map<string, number>();
  for (const row of rows) byDay.set(row.day, Number(row.count));

  const result: Sparkline = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(byDay.get(key) ?? 0);
  }
  return result;
}

/**
 * Bucket referrers into rough sources for display. We don't want a long
 * tail of "google.com/search?q=..." — squash to the major sources.
 */
export type ReferrerBucket =
  | "Direct"
  | "WhatsApp"
  | "Facebook"
  | "Instagram"
  | "TikTok"
  | "Google"
  | "Other";

export function bucketReferrer(referrer: string | null): ReferrerBucket {
  if (!referrer) return "Direct";
  const r = referrer.toLowerCase();
  if (r.includes("whatsapp")) return "WhatsApp";
  if (r.includes("facebook") || r.includes("fb.com")) return "Facebook";
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("tiktok")) return "TikTok";
  if (r.includes("google")) return "Google";
  return "Other";
}

export async function getReferrerBreakdown(
  userId: number,
  days: number
): Promise<{ bucket: ReferrerBucket; count: number }[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      referrer: pageEvents.referrer,
      count: sql<number>`count(*)::int`,
    })
    .from(pageEvents)
    .where(
      and(
        eq(pageEvents.userId, userId),
        eq(pageEvents.eventType, "view"),
        gte(pageEvents.createdAt, since)
      )
    )
    .groupBy(pageEvents.referrer);

  const byBucket = new Map<ReferrerBucket, number>();
  for (const row of rows) {
    const bucket = bucketReferrer(row.referrer);
    byBucket.set(bucket, (byBucket.get(bucket) ?? 0) + Number(row.count));
  }
  return Array.from(byBucket.entries())
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => b.count - a.count);
}
