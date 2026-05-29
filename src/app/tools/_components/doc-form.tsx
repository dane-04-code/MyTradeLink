"use client";

/**
 * Shared form building blocks for the trade-document tools (quote, tax
 * invoice, job sheet). These are the parts that are genuinely identical across
 * tools: the section scaffold, a labelled field, the "your business" block
 * with logo upload, the repeatable line-items editor, and the GST toggle.
 *
 * Each tool keeps its own live-preview and assembly logic — only the input
 * chrome is shared here.
 */

import { useRef, type Dispatch, type SetStateAction } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import type { BusinessDetails } from "@/lib/quote";

/** localStorage key for business details — shared so all tools pre-fill. */
export const BUSINESS_STORAGE_KEY = "mytradelink:business";

/** Line-item form state keeps qty/price as strings for friendly editing. */
export type LineItemForm = {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
};

export function newRow(id: string): LineItemForm {
  return { id, description: "", qty: "1", unitPrice: "" };
}

/** Parse a friendly numeric string ("", "12.5", "1,200") into a number. */
export function num(value: string): number {
  const n = parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/* ---------------------------------------------------------------------------
 * Layout primitives
 * ------------------------------------------------------------------------- */
export function FormSection({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-display text-2xl leading-none text-brand">
          {step}
        </span>
        <div>
          <h3 className="font-display text-xl tracking-tight text-ink-900">
            {title}
          </h3>
          {hint && <p className="text-sm text-ink-500">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

/* ---------------------------------------------------------------------------
 * Your business (persisted) — name, ABN, phone, email, logo
 * ------------------------------------------------------------------------- */
export function BusinessDetailsSection({
  value,
  onChange,
}: {
  value: BusinessDetails;
  onChange: (patch: Partial<BusinessDetails>) => void;
}) {
  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <FormSection
      step="01"
      title="Your business"
      hint="Saved on this device so you only type it once."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Business name" className="sm:col-span-2">
          <input
            className="input"
            placeholder="Dave Wilson Electrical"
            value={value.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
          />
        </Field>
        <Field label="ABN (optional)">
          <input
            className="input"
            inputMode="numeric"
            placeholder="12 345 678 901"
            value={value.abn}
            onChange={(e) => onChange({ abn: e.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            className="input"
            inputMode="tel"
            placeholder="0400 000 000"
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </Field>
        <Field label="Email" className="sm:col-span-2">
          <input
            className="input"
            inputMode="email"
            placeholder="dave@example.com.au"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </Field>
      </div>

      <div className="mt-4">
        <span className="label">Logo (optional)</span>
        {value.logoDataUrl ? (
          <div className="flex items-center gap-3 rounded-xl border-2 border-line bg-muted p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value.logoDataUrl}
              alt="Your logo"
              className="h-12 w-auto max-w-[140px] object-contain"
            />
            <button
              type="button"
              onClick={() => onChange({ logoDataUrl: null })}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border-2 border-line px-3 py-2 text-sm font-bold text-ink-700 transition hover:border-ink-900 active:translate-y-0.5"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-muted px-4 py-5 text-base font-bold text-ink-700 transition hover:border-ink-900">
            <Upload className="h-5 w-5" />
            Upload a logo
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={onLogoChange}
            />
          </label>
        )}
      </div>
    </FormSection>
  );
}

/* ---------------------------------------------------------------------------
 * Line items editor — repeatable description / qty / unit price rows
 * ------------------------------------------------------------------------- */
export function LineItemsEditor({
  items,
  setItems,
}: {
  items: LineItemForm[];
  setItems: Dispatch<SetStateAction<LineItemForm[]>>;
}) {
  const seq = useRef(items.length + 1);

  const addRow = () =>
    setItems((rows) => [...rows, newRow(`row-${seq.current++}`)]);
  const removeRow = (id: string) =>
    setItems((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  const updateRow = (id: string, patch: Partial<LineItemForm>) =>
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
      <div className="space-y-3">
        {items.map((row, i) => (
          <div key={row.id} className="rounded-xl border-2 border-line bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                Item {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={items.length === 1}
                aria-label={`Remove item ${i + 1}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition hover:bg-muted hover:text-emergency disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              className="input mb-2"
              placeholder="Supply & install 3 double power points"
              value={row.description}
              onChange={(e) => updateRow(row.id, { description: e.target.value })}
            />
            <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
              <input
                className="input text-center"
                inputMode="decimal"
                aria-label="Quantity"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => updateRow(row.id, { qty: e.target.value })}
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
                  $
                </span>
                <input
                  className="input pl-7"
                  inputMode="decimal"
                  aria-label="Unit price"
                  placeholder="Unit price"
                  value={row.unitPrice}
                  onChange={(e) => updateRow(row.id, { unitPrice: e.target.value })}
                />
              </div>
              <div className="min-w-[88px] text-right font-bold tabular-nums text-ink-900">
                {formatCell(num(row.qty) * num(row.unitPrice))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900 bg-white px-4 py-3 text-base font-bold text-ink-900 transition hover:bg-muted active:translate-y-0.5"
      >
        <Plus className="h-5 w-5" /> Add another item
      </button>
    </>
  );
}

// Local AUD formatter for the row total (kept here so the editor is self-
// contained; the previews/PDF use the shared formatAUD from lib).
const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function formatCell(n: number): string {
  return AUD.format(Number.isFinite(n) ? n : 0);
}

/* ---------------------------------------------------------------------------
 * GST toggle
 * ------------------------------------------------------------------------- */
export function GstToggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="mt-5 flex w-full items-center gap-3 rounded-xl border-2 border-line bg-muted p-4 text-left transition hover:border-ink-900"
    >
      <span
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition ${
          checked ? "bg-brand" : "bg-ink-500/40"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
      <span>
        <span className="block font-bold text-ink-900">{title}</span>
        <span className="block text-sm text-ink-500">{description}</span>
      </span>
    </button>
  );
}
