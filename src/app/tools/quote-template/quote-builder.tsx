"use client";

/**
 * QuoteBuilder — the interactive free quote tool.
 *
 * Everything runs in the browser: no account, no network. Business details
 * persist in localStorage (shared key) so they pre-fill here and across the
 * other tools. The logo is read locally and embedded into the PDF, never
 * uploaded. Shared input chrome lives in ../_components/doc-form.
 */

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  type Quote,
  type BusinessDetails,
  calcTotals,
  formatAUD,
  formatDate,
  toISODate,
  defaultQuoteNumber,
  emptyBusiness,
} from "@/lib/quote";
import {
  BUSINESS_STORAGE_KEY,
  BusinessDetailsSection,
  LineItemsEditor,
  GstToggle,
  FormSection,
  Field,
  newRow,
  num,
  type LineItemForm,
} from "../_components/doc-form";

export function QuoteBuilder() {
  const [business, setBusiness] = useState<BusinessDetails>(emptyBusiness());

  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [jobAddress, setJobAddress] = useState("");

  const [quoteNumber, setQuoteNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const [items, setItems] = useState<LineItemForm[]>([newRow("row-1")]);
  const [gstRegistered, setGstRegistered] = useState(false);
  const [notes, setNotes] = useState(
    "Quote valid for 30 days. 50% deposit to secure the booking, balance on completion."
  );

  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Hydrate localStorage + seed dates/number — client only, after mount.
  useEffect(() => {
    const today = new Date();
    const inThirty = new Date(today);
    inThirty.setDate(today.getDate() + 30);
    setIssueDate(toISODate(today));
    setValidUntil(toISODate(inThirty));
    setQuoteNumber(defaultQuoteNumber(today));

    try {
      const saved = window.localStorage.getItem(BUSINESS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BusinessDetails>;
        setBusiness({ ...emptyBusiness(), ...parsed });
      }
    } catch {
      // Corrupt/blocked storage — start fresh.
    }
    setHydrated(true);
  }, []);

  // Persist business details whenever they change (post-hydration only).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(business));
    } catch {
      // Storage full/blocked — non-fatal.
    }
  }, [business, hydrated]);

  function toQuote(): Quote {
    return {
      business,
      clientName,
      clientContact,
      jobAddress,
      quoteNumber,
      issueDate,
      validUntil,
      gstRegistered,
      notes,
      lineItems: items.map((it) => ({
        id: it.id,
        description: it.description,
        qty: num(it.qty),
        unitPrice: num(it.unitPrice),
      })),
    };
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const { generateQuotePdf } = await import("@/lib/quote-pdf");
      generateQuotePdf(toQuote());
    } finally {
      setDownloading(false);
    }
  }

  const quote = toQuote();
  const totals = calcTotals(quote.lineItems, gstRegistered);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(380px,440px)]">
      {/* ============================ FORM ================================= */}
      <form className="space-y-8 pb-28 lg:pb-0" onSubmit={(e) => e.preventDefault()}>
        <BusinessDetailsSection
          value={business}
          onChange={(patch) => setBusiness((b) => ({ ...b, ...patch }))}
        />

        <FormSection step="02" title="Who's it for?">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Customer name" className="sm:col-span-2">
              <input
                className="input"
                placeholder="Sarah Davies"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </Field>
            <Field label="Job address" className="sm:col-span-2">
              <input
                className="input"
                placeholder="14 Beach Rd, Bondi NSW 2026"
                value={jobAddress}
                onChange={(e) => setJobAddress(e.target.value)}
              />
            </Field>
            <Field label="Customer phone or email" className="sm:col-span-2">
              <input
                className="input"
                placeholder="0400 111 222"
                value={clientContact}
                onChange={(e) => setClientContact(e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step="03" title="The job" hint="Add a line for each part of the work.">
          <LineItemsEditor items={items} setItems={setItems} />
          <GstToggle
            checked={gstRegistered}
            onChange={setGstRegistered}
            title="I'm registered for GST"
            description="Adds 10% GST. Most sole traders under $75k turnover aren't registered."
          />
        </FormSection>

        <FormSection step="04" title="Notes & terms">
          <textarea
            className="input min-h-[110px] resize-y"
            placeholder="Deposit terms, what's included, how long the quote is valid…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormSection>
      </form>

      {/* ========================== PREVIEW =============================== */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">Live preview</span>
          <span className="text-xs text-ink-500">Updates as you type</span>
        </div>

        <QuotePreview quote={quote} totals={totals} />

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary mt-4 hidden w-full lg:inline-flex"
        >
          {downloading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {downloading ? "Building PDF…" : "Download PDF"}
        </button>
        <p className="mt-2 hidden text-center text-xs text-ink-500 lg:block">
          Free. No watermark on your details. Nothing leaves your device.
        </p>
      </div>

      {/* Mobile sticky download bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink-900 bg-white p-3 shadow-[0_-4px_0_0_#0F172A] lg:hidden">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="btn-primary w-full"
        >
          {downloading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {downloading ? "Building PDF…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Live document preview — mirrors the generated PDF
 * ------------------------------------------------------------------------- */
function QuotePreview({
  quote,
  totals,
}: {
  quote: Quote;
  totals: ReturnType<typeof calcTotals>;
}) {
  const meta = [
    quote.quoteNumber && { k: "No.", v: quote.quoteNumber },
    quote.issueDate && { k: "Issued", v: formatDate(quote.issueDate) },
    quote.validUntil && { k: "Valid until", v: formatDate(quote.validUntil) },
  ].filter(Boolean) as { k: string; v: string }[];

  const rows = quote.lineItems.filter(
    (it) => it.description || it.qty || it.unitPrice
  );

  return (
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white text-ink-900 shadow-hard">
      {/* Orange header band */}
      <div className="bg-brand px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {quote.business.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={quote.business.logoDataUrl}
                alt=""
                className="h-10 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <div className="truncate font-display text-lg leading-tight tracking-tight text-ink-900">
                {quote.business.businessName || "Your business"}
              </div>
            )}
          </div>
          <div className="text-right font-display text-2xl leading-none tracking-tight text-ink-900">
            QUOTE
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="text-[11px] leading-snug text-ink-900/80">
            {[
              quote.business.phone,
              quote.business.email,
              quote.business.abn && `ABN ${quote.business.abn}`,
            ]
              .filter(Boolean)
              .join("  •  ")}
          </div>
          <div className="space-y-0.5 text-right text-[11px] text-ink-900/80">
            {meta.map((m) => (
              <div key={m.k}>
                <span className="text-ink-900/60">{m.k} </span>
                <span className="font-semibold">{m.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client */}
      <div className="px-5 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
          Quote for
        </div>
        <div className="font-bold">{quote.clientName || "—"}</div>
        {(quote.jobAddress || quote.clientContact) && (
          <div className="text-sm text-ink-500">
            {[quote.jobAddress, quote.clientContact].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="px-5 pt-4">
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-[1fr_auto] bg-ink-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>
          {rows.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-ink-500">
              Add an item to see it here
            </div>
          ) : (
            rows.map((it, i) => (
              <div
                key={it.id}
                className={`grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-sm ${
                  i % 2 ? "bg-muted" : "bg-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate">{it.description || "—"}</div>
                  <div className="text-xs text-ink-500">
                    {it.qty} × {formatAUD(it.unitPrice)}
                  </div>
                </div>
                <div className="text-right font-semibold tabular-nums">
                  {formatAUD(it.qty * it.unitPrice)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="px-5 pt-3">
        <div className="ml-auto w-full max-w-[240px] space-y-1 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>{quote.gstRegistered ? "Subtotal (ex GST)" : "Subtotal"}</span>
            <span className="tabular-nums">{formatAUD(totals.subtotal)}</span>
          </div>
          {quote.gstRegistered && (
            <div className="flex justify-between text-ink-500">
              <span>GST (10%)</span>
              <span className="tabular-nums">{formatAUD(totals.gst)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-ink-900 pt-1.5 font-display text-lg tracking-tight">
            <span>{quote.gstRegistered ? "Total (inc GST)" : "Total"}</span>
            <span className="tabular-nums">{formatAUD(totals.total)}</span>
          </div>
          {!quote.gstRegistered && (
            <div className="text-right text-[11px] italic text-ink-500">
              Not registered for GST
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {quote.notes.trim() && (
        <div className="px-5 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            Notes &amp; terms
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink-700">
            {quote.notes.trim()}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 border-t border-line px-5 py-3 text-center text-[11px] text-ink-500">
        Created free with mytradelink.page
      </div>
    </div>
  );
}
