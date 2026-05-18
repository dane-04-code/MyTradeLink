import Link from "next/link";
import { db } from "@/lib/db";
import { users, pageEvents } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import {
  UserPlus,
  Sparkles,
  Eye,
  TrendingUp,
  Users,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PRICE_PER_MONTH = 9;

export default async function AdminPage() {
  await requireAdmin();

  // --- All the operator queries, run in parallel ---------------------------
  const [
    totals,
    activation,
    paidCount,
    signups14d,
    views7d,
    viewsAll,
    recentSignups,
    recentPro,
  ] = await Promise.all([
    // count totals
    db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(users)
      .then((r) => r[0] ?? { total: 0 }),

    // onboarded
    db
      .select({
        onboarded: sql<number>`count(*) FILTER (WHERE onboarding_complete)::int`,
        total: sql<number>`count(*)::int`,
      })
      .from(users)
      .then((r) => r[0] ?? { onboarded: 0, total: 0 }),

    // pro count
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.plan, "paid"))
      .then((r) => r[0]?.n ?? 0),

    // daily signups for the last 14 days
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${users.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(sql`${users.createdAt} >= now() - interval '14 days'`)
      .groupBy(sql`date_trunc('day', ${users.createdAt})`)
      .orderBy(sql`date_trunc('day', ${users.createdAt})`),

    // last-7-day page views across all profiles
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(pageEvents)
      .where(
        sql`${pageEvents.eventType} = 'view' AND ${pageEvents.createdAt} >= now() - interval '7 days'`
      )
      .then((r) => r[0]?.n ?? 0),

    // all-time views
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(pageEvents)
      .where(eq(pageEvents.eventType, "view"))
      .then((r) => r[0]?.n ?? 0),

    // 10 most recent signups
    db
      .select({
        id: users.id,
        name: users.name,
        trade: users.trade,
        location: users.location,
        slug: users.slug,
        plan: users.plan,
        onboardingComplete: users.onboardingComplete,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10),

    // 10 most recent Pro upgrades — uses updated_at as a proxy
    db
      .select({
        id: users.id,
        name: users.name,
        trade: users.trade,
        slug: users.slug,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.plan, "paid"))
      .orderBy(desc(users.updatedAt))
      .limit(10),
  ]);

  const activationRate =
    activation.total === 0
      ? 0
      : Math.round((activation.onboarded / activation.total) * 100);
  const mrrEstimate = paidCount * PRICE_PER_MONTH;

  // 14-day daily-signups sparkline data
  const sparkData: number[] = [];
  const byDay = new Map<string, number>();
  signups14d.forEach((row) => byDay.set(row.day, Number(row.count)));
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    sparkData.push(byDay.get(key) ?? 0);
  }
  const signups14dTotal = sparkData.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-muted">
      {/* Banner */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 text-xs lg:px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-900">
              Admin
            </span>
            <span className="text-white/70">
              Operator dashboard · gated by ADMIN_EMAIL · do not share this URL
            </span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 font-bold text-white hover:text-brand"
          >
            Back to dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b-2 border-ink-900 pb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand">
              Operator
            </div>
            <h1 className="mt-1 font-display text-4xl leading-none tracking-tight text-ink-900 md:text-5xl">
              How TradeLink is doing
            </h1>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Hero — signups */}
        <SignupsHero
          last14d={signups14dTotal}
          spark={sparkData}
          allTime={totals.total}
        />

        {/* Top row */}
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Activation"
            value={`${activationRate}%`}
            sub={`${activation.onboarded}/${activation.total} onboarded`}
            icon={<Users className="h-4 w-4" />}
          />
          <Stat
            label="Pro subscribers"
            value={String(paidCount)}
            sub={`${
              totals.total === 0
                ? 0
                : Math.round((paidCount / totals.total) * 100)
            }% of all users`}
            icon={<Sparkles className="h-4 w-4" />}
          />
          <Stat
            label="MRR estimate"
            value={`£${mrrEstimate.toLocaleString()}`}
            sub={`${paidCount} × £${PRICE_PER_MONTH}/mo`}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
          <Stat
            label="Views (7d)"
            value={views7d.toLocaleString()}
            sub={`${viewsAll.toLocaleString()} all-time`}
            icon={<Eye className="h-4 w-4" />}
          />
        </div>

        {/* Two-up lists */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Recent signups" count={recentSignups.length}>
            {recentSignups.length === 0 ? (
              <Empty label="No signups yet." />
            ) : (
              <ul className="divide-y divide-line">
                {recentSignups.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                    <UserPlus className="h-4 w-4 flex-shrink-0 text-ink-500" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-sm tracking-tight text-ink-900">
                        {u.name || `User #${u.id}`}
                      </div>
                      <div className="truncate text-[11px] text-ink-500">
                        {u.trade}
                        {u.trade && u.location ? " · " : ""}
                        {u.location}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[10px]">
                      <span
                        className={
                          "rounded-full px-2 py-0.5 font-bold uppercase tracking-wider " +
                          (u.plan === "paid"
                            ? "bg-brand text-ink-900"
                            : "bg-muted text-ink-700")
                        }
                      >
                        {u.plan}
                      </span>
                      <span className="font-mono text-ink-500">
                        {timeAgo(u.createdAt)}
                      </span>
                    </div>
                    {!u.onboardingComplete && (
                      <span
                        title="Onboarding incomplete"
                        className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Recent Pro upgrades" count={recentPro.length}>
            {recentPro.length === 0 ? (
              <Empty label="No Pro subscribers yet." />
            ) : (
              <ul className="divide-y divide-line">
                {recentPro.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                    <Sparkles className="h-4 w-4 flex-shrink-0 text-brand" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-sm tracking-tight text-ink-900">
                        {u.name || `User #${u.id}`}
                      </div>
                      <div className="truncate text-[11px] text-ink-500">
                        {u.trade ?? "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <a
                        href={`/t/${u.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-brand hover:underline"
                      >
                        /t/{u.slug}
                      </a>
                      <div className="font-mono text-[10px] text-ink-500">
                        {timeAgo(u.updatedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <p className="mt-10 text-center text-[11px] uppercase tracking-wider text-ink-500">
          Numbers are live from the database · no caching
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */

function SignupsHero({
  last14d,
  spark,
  allTime,
}: {
  last14d: number;
  spark: number[];
  allTime: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink-900 bg-white shadow-[0_4px_0_0_#0F172A]">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
        <div className="border-b-2 border-ink-900 p-6 md:border-b-0 md:border-r-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
            Signups · last 14 days
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-[88px] leading-[0.85] tracking-[-0.04em] text-ink-900 tabular-nums">
              {last14d}
            </span>
            <span className="pb-2 font-display text-xl text-ink-500">
              {last14d === 1 ? "new user" : "new users"}
            </span>
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-ink-700">
            <TrendingUp className="h-3 w-3" />
            {allTime.toLocaleString()} all-time
          </div>
        </div>
        <div className="p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
            Daily signups (S/M/T/W/T/F/S × 2 weeks)
          </div>
          <Bars data={spark} />
        </div>
      </div>
    </div>
  );
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function Bars({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  return (
    <div className="mt-3">
      <div className="flex h-24 items-end gap-1.5">
        {data.map((v, i) => {
          const hPct = (v / max) * 100;
          return (
            <div key={i} className="group relative flex-1" title={`${v}`}>
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-stretch">
                <div
                  className="bg-ink-900"
                  style={{
                    height: `${Math.max(hPct * 0.96, v > 0 ? 4 : 2)}px`,
                  }}
                />
                {v === 0 && <div className="h-0.5 bg-ink-500/30" />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((_, i) => {
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

function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink-900 bg-white p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-ink-700">
        <span>{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-3xl leading-none tracking-tight text-ink-900 tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-ink-500">{sub}</div>
    </div>
  );
}

function Card({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink-900 bg-white">
      <div className="flex items-end justify-between border-b border-ink-900 px-5 py-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500">
          {title}
        </div>
        <div className="font-mono text-xs text-ink-500">{count}</div>
      </div>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="p-8 text-center text-sm text-ink-500">{label}</div>;
}

function timeAgo(d: Date | string) {
  const date = new Date(d).getTime();
  const diff = Date.now() - date;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}
