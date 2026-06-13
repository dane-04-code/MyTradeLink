"use client";

/**
 * JobSheetBuilder — the interactive free job-sheet tool. Shares the business
 * details block and form chrome with the quote/invoice tools, but records a
 * job rather than a bill: customer & site, work done, materials (no prices),
 * hours and a sign-off. Live preview mirrors the generated PDF.
 */

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import {
  type JobSheet,
  type Material,
  type JobStatus,
  type BusinessDetails,
  JOB_STATUS_LABELS,
  defaultJobNumber,
  emptyMaterial,
  emptyBusiness,
  formatDate,
  toISODate,
} from "@/lib/job-sheet";
import {
  BUSINESS_STORAGE_KEY,
  BusinessDetailsSection,
  FormSection,
  Field,
} from "../_components/doc-form";

const STATUS_ORDER: JobStatus[] = ["completed", "in_progress", "follow_up"];

export function JobSheetBuilder() {
  const [business, setBusiness] = useState<BusinessDetails>(emptyBusiness());

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

  const [jobNumber, setJobNumber] = useState("");
  const [jobDate, setJobDate] = useState("");
  const [status, setStatus] = useState<JobStatus>("completed");

  const [workDone, setWorkDone] = useState("");
  const [materials, setMaterials] = useState<Material[]>([emptyMaterial("mat-1")]);
  const [hours, setHours] = useState("");
  const [followUp, setFollowUp] = useState("");

  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const today = new Date();
    setJobDate(toISODate(today));
    setJobNumber(defaultJobNumber(today));

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

  function toSheet(): JobSheet {
    return {
      business,
      jobNumber,
      jobDate,
      status,
      customerName,
      customerContact,
      siteAddress,
      workDone,
      materials,
      hours,
      followUp,
    };
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const { generateJobSheetPdf } = await import("@/lib/job-sheet-pdf");
      generateJobSheetPdf(toSheet());
    } finally {
      setDownloading(false);
    }
  }

  const sheet = toSheet();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_minmax(380px,440px)]">
      {/* ============================ FORM ================================= */}
      <form className="space-y-8 pb-28 lg:pb-0" onSubmit={(e) => e.preventDefault()}>
        <BusinessDetailsSection
          value={business}
          onChange={(patch) => setBusiness((b) => ({ ...b, ...patch }))}
        />

        <FormSection step="02" title="Customer & site">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Customer name" className="sm:col-span-2">
              <input
                className="input"
                placeholder="Sarah Davies"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Field>
            <Field label="Site address" className="sm:col-span-2">
              <input
                className="input"
                placeholder="14 Beach Rd, Bondi NSW 2026"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
              />
            </Field>
            <Field label="Customer phone or email" className="sm:col-span-2">
              <input
                className="input"
                placeholder="0400 111 222"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Job number">
              <input
                className="input"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                className="input"
                value={jobDate}
                onChange={(e) => setJobDate(e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {JOB_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          step="03"
          title="Work carried out"
          hint="What you actually did on site. Be specific — this is your record if anything's queried later."
        >
          <textarea
            className="input min-h-[120px] resize-y"
            placeholder="Replaced leaking mixer tap in main bathroom. Cleared blocked kitchen drain. Tested all outlets, no further leaks."
            value={workDone}
            onChange={(e) => setWorkDone(e.target.value)}
          />
        </FormSection>

        <FormSection
          step="04"
          title="Materials & hours"
          hint="Parts and bits used on the job, plus time on site."
        >
          <MaterialsEditor items={materials} setItems={setMaterials} />
          <div className="mt-4 max-w-[260px]">
            <Field label="Hours on site">
              <input
                className="input"
                placeholder="6.5 hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          step="05"
          title="Follow-up & notes"
          hint="Anything outstanding, warnings, or what's needed on the next visit."
        >
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="Customer to monitor for leaks. Return next week to fit new shower head once part arrives."
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
          />
        </FormSection>
      </form>

      {/* ========================== PREVIEW =============================== */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">Live preview</span>
          <span className="text-xs text-ink-500">Updates as you type</span>
        </div>

        <JobSheetPreview sheet={sheet} />

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
          Free. Print or share. Nothing leaves your device.
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
 * Materials editor — repeatable description / qty rows (no prices)
 * ------------------------------------------------------------------------- */
function MaterialsEditor({
  items,
  setItems,
}: {
  items: Material[];
  setItems: React.Dispatch<React.SetStateAction<Material[]>>;
}) {
  const seq = useRef(items.length + 1);

  const addRow = () =>
    setItems((rows) => [...rows, emptyMaterial(`mat-${seq.current++}`)]);
  const removeRow = (id: string) =>
    setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  const updateRow = (id: string, patch: Partial<Material>) =>
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
      <div className="space-y-2.5">
        {items.map((row, i) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_84px_auto] items-center gap-2"
          >
            <input
              className="input"
              placeholder="Mixer tap, 15mm copper, silicone…"
              aria-label={`Material ${i + 1} description`}
              value={row.description}
              onChange={(e) => updateRow(row.id, { description: e.target.value })}
            />
            <input
              className="input text-center"
              placeholder="Qty"
              aria-label={`Material ${i + 1} quantity`}
              value={row.qty}
              onChange={(e) => updateRow(row.id, { qty: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={items.length === 1}
              aria-label={`Remove material ${i + 1}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition hover:bg-muted hover:text-emergency disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900 bg-white px-4 py-3 text-base font-bold text-ink-900 transition hover:bg-muted active:translate-y-0.5"
      >
        <Plus className="h-5 w-5" /> Add material
      </button>
    </>
  );
}

/* ---------------------------------------------------------------------------
 * Live document preview — mirrors the generated job-sheet PDF
 * ------------------------------------------------------------------------- */
const STATUS_STYLES: Record<JobStatus, string> = {
  completed: "bg-call text-white",
  in_progress: "bg-brand text-ink-900",
  follow_up: "bg-emergency text-white",
};

function JobSheetPreview({ sheet }: { sheet: JobSheet }) {
  const meta = [
    sheet.jobNumber && { k: "No.", v: sheet.jobNumber },
    sheet.jobDate && { k: "Date", v: formatDate(sheet.jobDate) },
  ].filter(Boolean) as { k: string; v: string }[];

  const materials = sheet.materials.filter((m) => m.description || m.qty);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-white text-ink-900 shadow-hard">
      {/* Orange header band */}
      <div className="bg-brand px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {sheet.business.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sheet.business.logoDataUrl}
                alt=""
                className="h-10 w-auto max-w-[150px] object-contain"
              />
            ) : (
              <div className="truncate font-display text-lg leading-tight tracking-tight text-ink-900">
                {sheet.business.businessName || "Your business"}
              </div>
            )}
          </div>
          <div className="text-right font-display text-xl leading-none tracking-tight text-ink-900">
            JOB SHEET
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="text-[11px] leading-snug text-ink-900/80">
            {[
              sheet.business.phone,
              sheet.business.email,
              sheet.business.abn && `ABN ${sheet.business.abn}`,
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

      {/* Status pill */}
      <div className="px-5 pt-4">
        <span
          className={`inline-flex rounded-sm border-2 border-ink-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
            STATUS_STYLES[sheet.status]
          }`}
        >
          {JOB_STATUS_LABELS[sheet.status]}
        </span>
      </div>

      {/* Customer & site */}
      <div className="px-5 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
          Customer &amp; site
        </div>
        <div className="font-bold">{sheet.customerName || "—"}</div>
        {(sheet.siteAddress || sheet.customerContact) && (
          <div className="text-sm text-ink-500">
            {[sheet.siteAddress, sheet.customerContact].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>

      {/* Work done */}
      {sheet.workDone.trim() && (
        <div className="px-5 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            Work carried out
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink-700">
            {sheet.workDone.trim()}
          </p>
        </div>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <div className="px-5 pt-4">
          <div className="overflow-hidden rounded-lg border border-line">
            <div className="grid grid-cols-[1fr_auto] bg-ink-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white">
              <span>Materials &amp; parts used</span>
              <span className="text-right">Qty</span>
            </div>
            {materials.map((m, i) => (
              <div
                key={m.id}
                className={`grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-sm ${
                  i % 2 ? "bg-muted" : "bg-white"
                }`}
              >
                <div className="min-w-0 truncate">{m.description || "—"}</div>
                <div className="text-right font-semibold tabular-nums">
                  {m.qty || ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours */}
      {sheet.hours.trim() && (
        <div className="px-5 pt-4 text-sm">
          <span className="font-bold text-ink-900">Hours on site: </span>
          <span className="text-ink-700">{sheet.hours.trim()}</span>
        </div>
      )}

      {/* Follow-up */}
      {sheet.followUp.trim() && (
        <div className="px-5 pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
            Follow-up / notes
          </div>
          <p className="whitespace-pre-wrap text-sm text-ink-700">
            {sheet.followUp.trim()}
          </p>
        </div>
      )}

      {/* Sign-off */}
      <div className="grid grid-cols-2 gap-4 px-5 pt-6">
        {["Tradesperson", "Customer"].map((who) => (
          <div key={who}>
            <div className="h-8 border-b-2 border-ink-900" />
            <div className="mt-1 text-[10px] text-ink-500">
              {who} signature &amp; date
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 border-t border-line px-5 py-3 text-center text-[11px] text-ink-500">
        Created free with mytradelink.page
      </div>
    </div>
  );
}
