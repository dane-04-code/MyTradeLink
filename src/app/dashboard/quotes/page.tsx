import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import { requireOnboardedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { quoteRequests } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { QuotesList } from "./quotes-list";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const user = await requireOnboardedUser();
  const rows = await db.query.quoteRequests.findMany({
    where: eq(quoteRequests.userId, user.id),
    orderBy: [desc(quoteRequests.createdAt)],
  });

  const counts = {
    all: rows.length,
    new: rows.filter((r) => r.status === "new").length,
    contacted: rows.filter((r) => r.status === "contacted").length,
    closed: rows.filter((r) => r.status === "closed").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-500">
            Inbox
          </div>
          <h1 className="mt-1 font-display text-3xl leading-none tracking-tight text-ink-900 md:text-4xl">
            Quote requests
          </h1>
        </div>
        {counts.all > 0 && (
          <div className="flex items-center gap-2 rounded-md border-2 border-ink-900 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 tabular-nums">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand" />
            {counts.new} new · {counts.contacted} contacted · {counts.closed} closed
          </div>
        )}
      </div>

      {user.plan !== "paid" && <FreeUpsell />}

      <QuotesList quotes={rows} />
    </div>
  );
}

function FreeUpsell() {
  return (
    <Link
      href="/pricing"
      className="group relative mb-6 flex items-center gap-4 overflow-hidden rounded-xl border-2 border-ink-900 bg-ink-900 p-5 text-white shadow-hard-brand transition active:translate-y-1 active:shadow-press"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-[10deg] bg-hatch opacity-40"
      />
      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-brand text-ink-900 ring-2 ring-ink-900">
        <Lock className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <div className="relative flex-1 min-w-0">
        <div className="font-display text-lg leading-tight tracking-tight md:text-xl">
          Quote requests are <span className="text-brand">Pro only</span>
        </div>
        <div className="mt-1 text-sm text-white/70">
          Customers can already call and WhatsApp you on free. Upgrade to add
          the quote form (with photo uploads) and get every lead emailed to you.
        </div>
      </div>
      <div className="relative inline-flex shrink-0 items-center gap-1.5 rounded-md border-2 border-brand bg-brand px-3.5 py-2 text-sm font-bold text-ink-900 transition group-hover:translate-x-1">
        <Sparkles className="h-3.5 w-3.5" />
        Upgrade
      </div>
    </Link>
  );
}
