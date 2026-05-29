"use client";

/**
 * InvoiceBuilder — the interactive free tax-invoice tool. Shares the quote
 * engine and form chrome; adds invoice number, due date, bank payment details,
 * and the ATO heading rule ("Tax Invoice" only when registered for GST).
 */

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  type Invoice,
  type BusinessDetails,
  type PaymentDetails,
  invoiceTotals,
  invoiceHeading,
  formatAUD,
  formatDate,
  toISODate,
  defaultInvoiceNumber,
  emptyBusiness,
  emptyPayment,
} from "@/lib/invoice";
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

export function InvoiceBuilder() {
  const [business, setBusiness] = useState<BusinessDetails>(emptyBusiness());

  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [jobAddress, setJobAddress] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [items, setItems] = useState<LineItemForm[]>([newRow("row-1")]);
  const [gstRegistered, setGstRegistered] = useState(false);
  const [payment, setPayment] = useState<PaymentDetails>(emptyPayment());
  const [notes, setNotes] = useState("Payment due within 14 days. Thanks for your business.");

  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const inFourteen = new Date(today);
    inFourteen.setDate(today.getDate() + 14);
    setIssueDate(toISODate(today));
    setDueDate(toISODate(inFourteen));
    setInvoiceNumber(defaultInvoiceNumber(today));

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

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(business));
    } catch {
      // non-fatal
    }
  }, [business, hydrated]);

  function setPay(patch: Partial<PaymentDetails>) {
    setPayment((p) => ({ ...p, ...patch }));
  }

  function toInvoice(): Invoice {
    return {
      business,
      clientName,
      clientContact,
      jobAddress,
      invoiceNumber,
      issueDate,
      dueDate,
      gstRegistered,
      payment,
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
      const { generateInvoicePdf } = await import("@/lib/invoice-pdf");
      generateInvoicePdf(toInvoice());
    } finally {
      setDownloading(false);
    }
  }

  const invoice = toInvoice();
  const totals = invoiceTotals(invoice);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(380px,440px)]">
      {/* ============================ FORM ================================= */}
      <form className="space-y-8 pb-28 lg:pb-0" onSubmit={(e) => e.preventDefault()}>
        <BusinessDetailsSection
          value={business}
          onChange={(patch) => setBusiness((b) => ({ ...b, ...patch }))}
        />

        <FormSection step="02" title="Bill to">
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

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Invoice number">
              <input
                className="input"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </Field>
            <Field label="Issued">
              <input
                type="date"
                className="input"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </Field>
            <Field label="Due">
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step="03" title="The work" hint="Add a line for each part of the job.">
          <LineItemsEditor items={items} setItems={setItems} />
          <GstToggle
            checked={gstRegistered}
            onChange={setGstRegistered}
            title="I'm registered for GST"
            description="Adds 10% GST and labels the document 'Tax Invoice'. If you're not registered it stays a plain 'Invoice' (ATO rule)."
          />
        </FormSection>

        <FormSection step="04" title="How to pay" hint="Shown on the invoice so the customer can pay you.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Account name" className="sm:col-span-2">
              <input
                className="input"
                placeholder="Dave Wilson Electrical"
                value={payment.accountName}
                onChange={(e) => setPay({ accountName: e.target.value })}
              />
            </Field>
            <Field label="BSB">
              <input
                className="input"
                inputMode="numeric"
                placeholder="062-000"
                value={payment.bsb}
                onChange={(e) => setPay({ bsb: e.target.value })}
              />
            </Field>
            <Field label="Account number">
              <input
                className="input"
                inputMode="numeric"
                placeholder="1234 5678"
                value={payment.accountNumber}
                onChange={(e) => setPay({ accountNumber: e.target.value })}
              />
            </Field>
            <Field label="Other (PayID, etc.)" className="sm:col-span-2">
              <input
                className="input"
                placeholder="PayID: dave@example.com.au"
                value={payment.other}
                onChange={(e) => setPay({ other: e.target.value })}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step="05" title="Notes">
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="Payment terms, a thank-you, anything else…"
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

        <InvoicePreview invoice={invoice} totals={totals} />

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
          Free. ATO-compliant layout. Nothing leaves your device.
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
 * Live document preview — mirrors the generated invoice PDF
 * ------------------------------------------------------------------------- */
function InvoicePreview({
  invoice,
  totals,
}: {
  invoice: Invoice;
  totals: ReturnType<typeof invoiceTotals>;
}) {
  const heading = invoiceHeading(invoice.gstRegistered);
  const meta = [
    invoice.invoiceNumber && { k: "No.", v: invoice.invoiceNumber },
    invoice.issueDate && { k: "Issued", v: formatDate(invoice.issueDate) },
    invoice.dueDate && { k: "Due", v: formatDate(invoice.dueDate) },
  ].filter(Boolean) as { k: string; v: string }[];

  const rows = invoice.lineItems.filter(
    (it) => it.description || it.qty || it.unitPrice
  );

  const payBits = [
    invoice.payment.accountName && `Account: ${invoice.payment.accountName}`,
    (invoice.payment.bsb || invoice.payment.accountNumber) &&
      [
        invoice.payment.bsb && `BSB ${invoice.payment.bsb}`,
        invoice.payment.accountNumber && `Acc ${invoice.payment.accountNumber}`,
      ]
        .filter(Boolean)
        .join("  "),
    invoice.payment.other,
  ].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white text-ink-900 shadow-hard">
      {/* Orange header band */}
      <div className="bg-brand px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {invoice.business.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invoice.business.logoDataUrl}
                alt=""
                className="h-10 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <div className="truncate font-display text-lg leading-tight tracking-tight text-ink-900">
                {invoice.business.businessName || "Your business"}
              </div>
            )}
          </div>
          <div className="text-right font-display text-xl leading-none tracking-tight text-ink-900">
            {heading}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="text-[11px] leading-snug text-ink-900/80">
            {[
              invoice.business.phone,
              invoice.business.email,
              invoice.business.abn && `ABN ${invoice.business.abn}`,
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

      {/* Bill to */}
      <div className="px-5 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
          Bill to
        </div>
        <div className="font-bold">{invoice.clientName || "—"}</div>
        {(invoice.jobAddress || invoice.clientContact) && (
          <div className="text-sm text-ink-500">
            {[invoice.jobAddress, invoice.clientContact].filter(Boolean).join(" · ")}
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
            <span>{invoice.gstRegistered ? "Subtotal (ex GST)" : "Subtotal"}</span>
            <span className="tabular-nums">{formatAUD(totals.subtotal)}</span>
          </div>
          {invoice.gstRegistered && (
            <div className="flex justify-between text-ink-500">
              <span>GST (10%)</span>
              <span className="tabular-nums">{formatAUD(totals.gst)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-ink-900 pt-1.5 font-display text-lg tracking-tight">
            <span>Total due</span>
            <span className="tabular-nums">{formatAUD(totals.total)}</span>
          </div>
          {!invoice.gstRegistered && (
            <div className="text-right text-[11px] italic text-ink-500">
              Not registered for GST
            </div>
          )}
        </div>
      </div>

      {/* How to pay */}
      {payBits.length > 0 && (
        <div className="px-5 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            How to pay
          </div>
          <div className="text-sm text-ink-700">
            {payBits.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.notes.trim() && (
        <div className="px-5 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            Notes
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink-700">
            {invoice.notes.trim()}
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
