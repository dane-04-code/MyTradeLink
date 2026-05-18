"use client";

import { useMemo, useState } from "react";
import {
  Phone,
  MapPin,
  Clock,
  Check,
  MessageCircle,
  Copy,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import type { QuoteRequest } from "@/lib/db/schema";
import { markQuoteStatus } from "./actions";
import { cn } from "@/lib/utils";

type Filter = "all" | "new" | "contacted" | "closed";

export function QuotesList({ quotes }: { quotes: QuoteRequest[] }) {
  const [items, setItems] = useState(quotes);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((q) => q.status === filter);
  }, [items, filter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      new: items.filter((q) => q.status === "new").length,
      contacted: items.filter((q) => q.status === "contacted").length,
      closed: items.filter((q) => q.status === "closed").length,
    }),
    [items]
  );

  async function setStatus(id: number, status: "new" | "contacted" | "closed") {
    setItems((arr) => arr.map((q) => (q.id === id ? { ...q, status } : q)));
    try {
      await markQuoteStatus(id, status);
      toast.success(
        status === "contacted"
          ? "Marked as contacted"
          : status === "closed"
            ? "Closed"
            : "Reopened"
      );
    } catch {
      toast.error("Couldn't update");
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white/70 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-ink-700">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="mt-4 font-display text-xl tracking-tight text-ink-900">
          No quotes yet
        </div>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Share your link on WhatsApp, your van, your Facebook. Every quote a
          customer sends from your page lands here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Filters filter={filter} setFilter={setFilter} counts={counts} />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-ink-500">
          Nothing in <strong className="font-bold text-ink-900">{filter}</strong>.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((q) => (
            <QuoteCard key={q.id} q={q} setStatus={setStatus} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Filters({
  filter,
  setFilter,
  counts,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  counts: { all: number; new: number; contacted: number; closed: number };
}) {
  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "new", label: "New", count: counts.new },
    { id: "contacted", label: "Contacted", count: counts.contacted },
    { id: "closed", label: "Closed", count: counts.closed },
  ];
  return (
    <div className="mb-4 flex overflow-x-auto rounded-2xl border border-line bg-white p-1">
      {tabs.map((t) => {
        const active = filter === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition",
              active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-muted"
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                active ? "bg-white/15 text-white" : "bg-muted text-ink-500"
              )}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function QuoteCard({
  q,
  setStatus,
}: {
  q: QuoteRequest;
  setStatus: (id: number, s: "new" | "contacted" | "closed") => void;
}) {
  const photoUrls = (q.photoUrls ?? []) as string[];
  const cleanedPhone = q.customerPhone.replace(/[^0-9+]/g, "").replace(/^\+/, "");

  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition",
        q.status === "new"
          ? "border-brand shadow-[0_4px_0_0_#F97316]"
          : "border-line"
      )}
    >
      {/* Top: name, status, time */}
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl leading-tight tracking-tight text-ink-900">
              {q.customerName}
            </h3>
            <StatusBadge status={q.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-700">
            <a
              href={`tel:${q.customerPhone}`}
              className="inline-flex items-center gap-1.5 font-bold tabular-nums hover:text-brand"
            >
              <Phone className="h-3.5 w-3.5" />
              {q.customerPhone}
            </a>
            {q.postcode && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ink-500" />
                {q.postcode}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-ink-500">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(q.createdAt)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(q.customerPhone);
            toast.success("Phone copied");
          }}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11px] font-bold text-ink-700 hover:border-ink-500"
        >
          <Copy className="h-3 w-3" /> Copy number
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-4">
        <div className="rounded-xl bg-muted p-4 text-sm leading-relaxed text-ink-900 whitespace-pre-line">
          {q.jobDescription}
        </div>

        {photoUrls.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {photoUrls.map((u) => (
              // eslint-disable-next-line @next/next/no-img-element
              <a key={u} href={u} target="_blank" rel="noopener noreferrer">
                <img
                  src={u}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded-lg border border-line object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-muted/40 px-5 py-3">
        <a
          href={`tel:${q.customerPhone}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:brightness-110"
        >
          <Phone className="h-3.5 w-3.5" /> Call back
        </a>
        <a
          href={`https://wa.me/${cleanedPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:brightness-110"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
        <div className="ml-auto flex gap-2">
          {q.status !== "contacted" && (
            <button
              type="button"
              onClick={() => setStatus(q.id, "contacted")}
              className="inline-flex items-center gap-1 rounded-xl border border-ink-900 bg-white px-3 py-2 text-xs font-bold text-ink-900 hover:bg-muted"
            >
              <Check className="h-3 w-3" /> Mark contacted
            </button>
          )}
          {q.status !== "closed" && (
            <button
              type="button"
              onClick={() => setStatus(q.id, "closed")}
              className="rounded-xl bg-ink-900 px-3 py-2 text-xs font-bold text-white hover:bg-ink-800"
            >
              Close
            </button>
          )}
          {q.status === "closed" && (
            <button
              type="button"
              onClick={() => setStatus(q.id, "new")}
              className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink-700 hover:border-ink-500"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: QuoteRequest["status"] }) {
  if (status === "new") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-900">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-900" />
        New
      </span>
    );
  }
  if (status === "contacted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-800">
        <Check className="h-2.5 w-2.5" strokeWidth={3} /> Contacted
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
      Closed
    </span>
  );
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
  return `${day}d ago`;
}
