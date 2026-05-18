"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { QuoteRequest } from "@/lib/db/schema";
import { markQuoteStatus } from "./actions";
import { cn } from "@/lib/utils";

export function QuotesList({ quotes }: { quotes: QuoteRequest[] }) {
  const [items, setItems] = useState(quotes);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-neutral-300 p-10 text-center">
        <p className="text-lg font-semibold text-ink-700">No quotes yet</p>
        <p className="mt-1 text-sm text-neutral-500">
          Share your link — quote requests from your page will appear here.
        </p>
      </div>
    );
  }

  async function setStatus(id: number, status: "new" | "contacted" | "closed") {
    setItems((arr) => arr.map((q) => (q.id === id ? { ...q, status } : q)));
    await markQuoteStatus(id, status);
    toast.success("Updated");
  }

  return (
    <ul className="space-y-3">
      {items.map((q) => {
        const photoUrls = (q.photoUrls ?? []) as string[];
        return (
          <li
            key={q.id}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-sm transition",
              q.status === "new" ? "border-brand/30 ring-1 ring-brand/10" : "border-neutral-200"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{q.customerName}</h3>
                  <StatusBadge status={q.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                  <a href={`tel:${q.customerPhone}`} className="inline-flex items-center gap-1 hover:text-brand">
                    <Phone className="h-3.5 w-3.5" /> {q.customerPhone}
                  </a>
                  {q.postcode && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {q.postcode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <Clock className="h-3.5 w-3.5" /> {timeAgo(q.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                {q.status !== "contacted" && (
                  <button
                    onClick={() => setStatus(q.id, "contacted")}
                    className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Mark contacted
                  </button>
                )}
                {q.status !== "closed" && (
                  <button
                    onClick={() => setStatus(q.id, "closed")}
                    className="rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-semibold text-ink-700"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 whitespace-pre-line rounded-xl bg-neutral-50 p-3 text-base text-ink-800">
              {q.jobDescription}
            </div>

            {photoUrls.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {photoUrls.map((u) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={u} href={u} target="_blank" rel="noopener noreferrer">
                    <img src={u} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`tel:${q.customerPhone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                <Phone className="h-3.5 w-3.5" /> Call back
              </a>
              <a
                href={`sms:${q.customerPhone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Text
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ status }: { status: QuoteRequest["status"] }) {
  if (status === "new")
    return (
      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
        NEW
      </span>
    );
  if (status === "contacted")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
        <Check className="h-3 w-3" /> Contacted
      </span>
    );
  return (
    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
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
