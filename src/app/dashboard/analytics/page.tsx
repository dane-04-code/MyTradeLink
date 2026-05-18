import Link from "next/link";
import {
  Eye,
  Phone,
  MessageCircle,
  Send,
  Sparkles,
  Lock,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import {
  getEventCounts,
  getSparkline,
  getReferrerBreakdown,
  type Sparkline as SparklineData,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default async function AnalyticsPage() {
  const user = await requireOnboardedUser();

  if (user.plan !== "paid") {
    return <FreeUpsell />;
  }

  const [counts7d, counts30d, viewsSpark, callsSpark, whatsSpark, submitSpark, referrers] =
    await Promise.all([
      getEventCounts(user.id, 7),
      getEventCounts(user.id, 30),
      getSparkline(user.id, "view", 14),
      getSparkline(user.id, "call_click", 7),
      getSparkline(user.id, "whatsapp_click", 7),
      getSparkline(user.id, "quote_submit", 7),
      getReferrerBreakdown(user.id, 30),
    ]);

  const totalReferrer = referrers.reduce((sum, r) => sum + r.count, 0);
  const hasData = counts30d.view > 0;
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  // Detect "best day" in last 7 days of views
  const last7 = viewsSpark.slice(-7);
  const bestIdx = last7.reduce((best, v, i) => (v > last7[best] ? i : best), 0);
  const bestCount = last7[bestIdx] ?? 0;
  const today_d = new Date();
  const bestDate = new Date(today_d);
  bestDate.setDate(today_d.getDate() - (6 - bestIdx));
  const bestDay = bestDate.toLocaleDateString("en-GB", { weekday: "long" });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6 lg:py-10">
      {/* Masthead */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink-900 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand">
            Weekly worksheet
          </div>
          <h1 className="mt-1 font-display text-4xl leading-none tracking-tight text-ink-900 md:text-5xl">
            Analytics
          </h1>
        </div>
        <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
          {today}
        </div>
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <>
          {/* Hero — views */}
          <HeroCard
            value={counts7d.view}
            monthValue={counts30d.view}
            spark={viewsSpark}
            bestDay={bestDay}
            bestCount={bestCount}
          />

          {/* Secondary metrics */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SubStat
              label="Calls"
              icon={<Phone className="h-4 w-4" />}
              value={counts7d.call_click}
              monthly={counts30d.call_click}
              spark={callsSpark}
            />
            <SubStat
              label="WhatsApp"
              icon={<MessageCircle className="h-4 w-4" />}
              value={counts7d.whatsapp_click}
              monthly={counts30d.whatsapp_click}
              spark={whatsSpark}
            />
            <SubStat
              label="Quote submits"
              icon={<Send className="h-4 w-4" />}
              value={counts7d.quote_submit}
              monthly={counts30d.quote_submit}
              spark={submitSpark}
            />
          </div>

          {/* Traffic sources */}
          <Referrers referrers={referrers} total={totalReferrer} />
        </>
      )}

      <p className="mt-8 text-center text-[11px] uppercase tracking-wider text-ink-500">
        Visitors are anonymous · IP-hashed only · No cookies
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Hero card                                                              */
/* --------------------------------------------------------------------- */
function HeroCard({
  value,
  monthValue,
  spark,
  bestDay,
  bestCount,
}: {
  value: number;
  monthValue: number;
  spark: SparklineData;
  bestDay: string;
  bestCount: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink-900 bg-white shadow-[0_4px_0_0_#0F172A]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
        {/* Number side */}
        <div className="border-b-2 border-ink-900 p-6 md:border-b-0 md:border-r-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
            Last 7 days
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-[88px] leading-[0.85] tracking-[-0.04em] text-ink-900 tabular-nums">
              {value}
            </span>
            <span className="pb-2 font-display text-xl text-ink-500">
              views
            </span>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-ink-700">
            <TrendingUp className="h-3 w-3" />
            {monthValue.toLocaleString()} this month
          </div>
        </div>

        {/* Bars side */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
              Last 14 days
            </div>
            {bestCount > 0 && (
              <div className="text-[11px] text-ink-500">
                Busiest:{" "}
                <span className="font-bold text-ink-900">{bestDay}</span>
              </div>
            )}
          </div>
          <Bars data={spark} />
        </div>
      </div>
    </div>
  );
}

/**
 * Vertical bar chart, ink-900 with orange caps on the top 3 days.
 * Reads like a tally on a worksheet.
 */
function Bars({ data }: { data: SparklineData }) {
  const max = Math.max(1, ...data);
  // Find top 3 indices to highlight in orange
  const top3 = [...data]
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((x) => x.i);

  return (
    <div className="mt-3">
      <div className="flex h-24 items-end gap-1.5">
        {data.map((v, i) => {
          const hPct = (v / max) * 100;
          const highlighted = top3.includes(i) && v > 0;
          return (
            <div
              key={i}
              className="group relative flex-1"
              title={`${v} view${v === 1 ? "" : "s"}`}
            >
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-stretch">
                {highlighted && v > 0 && (
                  <div className="h-1 bg-brand" />
                )}
                <div
                  className="bg-ink-900"
                  style={{ height: `${Math.max(hPct * 0.96, v > 0 ? 4 : 2)}px` }}
                />
                {v === 0 && (
                  <div className="h-0.5 bg-ink-500/30" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((_, i) => {
          // Day-of-week letter for the date this column represents
          const d = new Date();
          d.setDate(d.getDate() - (data.length - 1 - i));
          return (
            <div
              key={i}
              className="flex-1 text-center text-[10px] font-bold text-ink-500"
            >
              {DAY_LABELS[d.getDay()]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Secondary stat cards                                                   */
/* --------------------------------------------------------------------- */
function SubStat({
  label,
  icon,
  value,
  monthly,
  spark,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  monthly: number;
  spark: SparklineData;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink-900 bg-white p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-700">
        <span>{icon}</span>
        {label}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="font-display text-4xl leading-none tracking-tight text-ink-900 tabular-nums">
          {value}
        </span>
        <span className="pb-0.5 text-[10px] text-ink-500">7d</span>
      </div>
      <div className="mt-3">
        <MiniBars data={spark} />
      </div>
      <div className="mt-2 text-[10px] text-ink-500">
        <span className="font-bold text-ink-900 tabular-nums">{monthly}</span>{" "}
        this month
      </div>
    </div>
  );
}

function MiniBars({ data }: { data: SparklineData }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-8 items-end gap-0.5">
      {data.map((v, i) => {
        const hPct = (v / max) * 100;
        return (
          <div key={i} className="flex-1">
            <div
              className="bg-ink-900"
              style={{ height: `${Math.max(hPct * 0.32, v > 0 ? 3 : 1)}px` }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Referrers                                                              */
/* --------------------------------------------------------------------- */
function Referrers({
  referrers,
  total,
}: {
  referrers: { bucket: string; count: number }[];
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="mt-6 rounded-2xl border-2 border-ink-900 bg-white p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
          Where they came from
        </div>
        <div className="mt-3 text-sm text-ink-500">
          No traffic to break down yet.
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink-900 bg-white">
      <div className="flex items-end justify-between border-b border-ink-900 px-5 py-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
            Where they came from
          </div>
          <div className="mt-0.5 font-display text-base tracking-tight text-ink-900">
            Last 30 days
          </div>
        </div>
        <div className="font-mono text-xs text-ink-500">
          {total} view{total === 1 ? "" : "s"}
        </div>
      </div>
      <ul className="divide-y divide-line">
        {referrers.map((r) => {
          const pct = Math.round((r.count / total) * 100);
          return (
            <li
              key={r.bucket}
              className="flex items-center gap-3 px-5 py-2.5"
            >
              <div className="w-20 font-display text-sm tracking-tight text-ink-900">
                {r.bucket}
              </div>
              <div className="flex-1">
                <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute left-0 top-0 h-full bg-ink-900"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full w-0.5 bg-brand"
                    style={{ right: `${100 - pct}%` }}
                  />
                </div>
              </div>
              <div className="w-20 text-right text-xs font-bold text-ink-700 tabular-nums">
                {r.count}
                <span className="ml-1 font-normal text-ink-500">·{pct}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Empty state                                                            */
/* --------------------------------------------------------------------- */
function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-ink-900/30 bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-brand">
        <BarChart3 className="h-6 w-6" />
      </div>
      <div className="mt-4 font-display text-2xl leading-tight tracking-tight text-ink-900">
        No traffic yet.
      </div>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
        Share your link on WhatsApp, your van, your Facebook bio. As soon as
        someone visits your page, numbers land here.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------- */
/* Free upsell                                                            */
/* --------------------------------------------------------------------- */
function FreeUpsell() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:py-20">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-brand">
          <BarChart3 className="h-7 w-7" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
          Pro
        </div>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink-900">
          Know if your page <br />is actually working.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-700">
          Track page views, call taps, WhatsApp clicks and quote submissions.
          See exactly where your traffic comes from — the QR sticker on your
          van, the Facebook share, the Google search.
        </p>

        <Link
          href="/pricing"
          className="mt-7 inline-flex items-center gap-2 rounded-2xl border-2 border-ink-900 bg-brand px-6 py-3.5 text-base font-bold text-ink-900 shadow-[0_4px_0_0_#0F172A] transition active:translate-y-1 active:shadow-[0_0_0_0_#0F172A]"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade to Pro
        </Link>

        <ul className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-2 text-left text-sm text-ink-700">
          <PreviewStat icon={<Eye className="h-4 w-4" />} label="Page views" />
          <PreviewStat icon={<Phone className="h-4 w-4" />} label="Call taps" />
          <PreviewStat
            icon={<MessageCircle className="h-4 w-4" />}
            label="WhatsApp taps"
          />
          <PreviewStat icon={<Send className="h-4 w-4" />} label="Quote submits" />
        </ul>
      </div>
    </div>
  );
}

function PreviewStat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2 rounded-xl border-2 border-ink-900 bg-white px-3 py-2.5">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted text-ink-700">
        <Lock className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-bold text-ink-900">{label}</span>
    </li>
  );
}
