import Link from "next/link";
import {
  Eye,
  Phone,
  MessageCircle,
  Send,
  FileText,
  Sparkles,
  Lock,
  BarChart3,
} from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import {
  getEventCounts,
  getSparkline,
  getReferrerBreakdown,
  type Sparkline as SparklineData,
} from "@/lib/analytics";
import type { EventType } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

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
      getSparkline(user.id, "call_click", 14),
      getSparkline(user.id, "whatsapp_click", 14),
      getSparkline(user.id, "quote_submit", 14),
      getReferrerBreakdown(user.id, 30),
    ]);

  const stats: {
    label: string;
    value: number;
    monthly: number;
    spark: SparklineData;
    icon: React.ReactNode;
    eventType: EventType;
  }[] = [
    {
      label: "Page views",
      value: counts7d.view,
      monthly: counts30d.view,
      spark: viewsSpark,
      icon: <Eye className="h-4 w-4" />,
      eventType: "view",
    },
    {
      label: "Call taps",
      value: counts7d.call_click,
      monthly: counts30d.call_click,
      spark: callsSpark,
      icon: <Phone className="h-4 w-4" />,
      eventType: "call_click",
    },
    {
      label: "WhatsApp taps",
      value: counts7d.whatsapp_click,
      monthly: counts30d.whatsapp_click,
      spark: whatsSpark,
      icon: <MessageCircle className="h-4 w-4" />,
      eventType: "whatsapp_click",
    },
    {
      label: "Quote submissions",
      value: counts7d.quote_submit,
      monthly: counts30d.quote_submit,
      spark: submitSpark,
      icon: <Send className="h-4 w-4" />,
      eventType: "quote_submit",
    },
  ];

  const totalReferrer = referrers.reduce((sum, r) => sum + r.count, 0);
  const hasData = counts30d.view > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
            Insights
          </div>
          <h1 className="mt-1 font-display text-3xl leading-none tracking-tight text-ink-900 md:text-4xl">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Last 7 days · with 14-day trend.
          </p>
        </div>
      </div>

      {!hasData && (
        <div className="mb-6 rounded-2xl border border-line bg-white p-6 text-center">
          <BarChart3 className="mx-auto h-7 w-7 text-ink-500" />
          <div className="mt-2 font-display text-lg tracking-tight text-ink-900">
            No traffic yet — share your link to start collecting data.
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Numbers below will populate as people visit your page.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <StatCard key={s.eventType} {...s} />
        ))}
      </div>

      {/* Referrers */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
            Where they came from
          </div>
          <div className="mt-0.5 text-sm font-bold text-ink-900">
            Last 30 days · {totalReferrer.toLocaleString()} views
          </div>
        </div>
        {totalReferrer === 0 ? (
          <div className="p-6 text-center text-sm text-ink-500">
            No traffic yet.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {referrers.map((r) => {
              const pct = Math.round((r.count / totalReferrer) * 100);
              return (
                <li key={r.bucket} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-24 font-display text-sm tracking-tight text-ink-900">
                    {r.bucket}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs font-bold text-ink-700 tabular-nums">
                    {r.count}
                    <span className="ml-1 font-normal text-ink-500">({pct}%)</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-ink-500">
        Visitors aren&apos;t identified — only IP-hashed for spam control.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  monthly,
  spark,
  icon,
}: {
  label: string;
  value: number;
  monthly: number;
  spark: SparklineData;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
          <span className="text-ink-700">{icon}</span>
          {label}
        </div>
        <div className="text-[10px] text-ink-500">
          30d · <span className="font-bold text-ink-900 tabular-nums">{monthly}</span>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="font-display text-5xl leading-none tracking-tight text-ink-900 tabular-nums">
          {value}
        </div>
        <Sparkline data={spark} />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: SparklineData }) {
  const max = Math.max(1, ...data);
  const w = 96;
  const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="flex-shrink-0"
      aria-hidden
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#F97316"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => {
        const x = (i / Math.max(1, data.length - 1)) * w;
        const y = h - (v / max) * h;
        return <circle key={i} cx={x} cy={y} r="1.2" fill="#F97316" />;
      })}
    </svg>
  );
}

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
          See exactly how your <br />page is performing.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-ink-700">
          Track page views, call taps, WhatsApp clicks, quote submissions, and
          where your traffic comes from. Know if the QR code on your van is
          actually getting scanned.
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
          <PreviewStat icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp taps" />
          <PreviewStat icon={<FileText className="h-4 w-4" />} label="Quote submissions" />
        </ul>
      </div>
    </div>
  );
}

function PreviewStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted text-ink-700">
        <Lock className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-bold text-ink-900">{label}</span>
    </li>
  );
}
