"use client";

/**
 * TaxCalculator — the interactive "what should I set aside for tax" tool.
 *
 * Everything runs in the browser: no account, no network. Inputs persist in
 * localStorage so a tradie can come back and tweak. The maths live in
 * lib/tax.ts (pure + testable); this file is just the inputs, the live result
 * card, and the funnel cross-link.
 */

import { useEffect, useState } from "react";
import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import {
  estimateTax,
  formatAUD0 as money,
  TAX_YEAR_LABEL,
  GST_THRESHOLD,
} from "@/lib/tax";
import { FormSection, Field, GstToggle, num } from "../_components/doc-form";

const STORAGE_KEY = "mytradelink:tax-calculator";

type Inputs = {
  annualRevenue: string;
  annualExpenses: string;
  gstRegistered: boolean;
  gstCreditablePct: string;
};

const DEFAULTS: Inputs = {
  annualRevenue: "120000",
  annualExpenses: "30000",
  gstRegistered: true,
  gstCreditablePct: "80",
};

export function TaxCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setInputs({ ...DEFAULTS, ...(JSON.parse(saved) as Partial<Inputs>) });
    } catch {
      // Corrupt/blocked storage — start fresh.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      // Storage full/blocked — non-fatal.
    }
  }, [inputs, hydrated]);

  const set = (patch: Partial<Inputs>) => setInputs((s) => ({ ...s, ...patch }));

  // ---- The maths (pure lib) ------------------------------------------------
  const revenue = num(inputs.annualRevenue);
  const expenses = num(inputs.annualExpenses);
  const est = estimateTax({
    annualRevenue: revenue,
    annualExpenses: expenses,
    gstRegistered: inputs.gstRegistered,
    gstCreditableShare: num(inputs.gstCreditablePct) / 100,
  });

  const perThousand = revenue > 0 ? (est.totalToSetAside / revenue) * 1000 : 0;
  const perWeek = est.totalToSetAside / 52;
  const valid = revenue > 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
      {/* LEFT: inputs */}
      <div className="space-y-10 rounded-2xl border-2 border-ink-900 bg-white p-5 shadow-hard md:p-8">
        <FormSection
          step="01"
          title="What you'll earn this year"
          hint="Your best guess for the full financial year. Use GST-exclusive figures (the actual money, not the GST on top)."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Money you'll invoice (before expenses)">
              <MoneyInput
                value={inputs.annualRevenue}
                onChange={(v) => set({ annualRevenue: v })}
                placeholder="120,000"
              />
            </Field>
            <Field label="Business expenses for the year">
              <MoneyInput
                value={inputs.annualExpenses}
                onChange={(v) => set({ annualExpenses: v })}
                placeholder="30,000"
              />
              <span className="mt-1 block text-xs text-ink-500">
                Fuel, tools, insurance, materials, phone, accountant.
              </span>
            </Field>
          </div>
          <p className="mt-4 text-sm font-bold text-ink-700">
            Taxable income:{" "}
            <span className="tabular-nums text-ink-900">
              {money(est.taxableIncome)}
            </span>{" "}
            <span className="font-normal text-ink-500">
              (what you invoice, minus expenses)
            </span>
          </p>
        </FormSection>

        <FormSection
          step="02"
          title="GST"
          hint={`Registration is compulsory once you turn over ${money(
            GST_THRESHOLD
          )} a year. GST you charge isn't your money — you hold it for the ATO.`}
        >
          <GstToggle
            checked={inputs.gstRegistered}
            onChange={(gstRegistered) => set({ gstRegistered })}
            title="I'm registered for GST"
            description="Adds the GST you collect on sales to what you set aside, less the GST credits on your purchases."
          />
          {inputs.gstRegistered && (
            <div className="mt-3 max-w-[260px]">
              <Field label="Expenses that have GST on them (%)">
                <input
                  className="input"
                  inputMode="decimal"
                  value={inputs.gstCreditablePct}
                  onChange={(e) => set({ gstCreditablePct: e.target.value })}
                  placeholder="80"
                />
              </Field>
              <span className="mt-1 block text-xs text-ink-500">
                Most purchases do. Wages, bank fees and some insurances
                don&apos;t. 80% is a fair starting point.
              </span>
            </div>
          )}
        </FormSection>
      </div>

      {/* RIGHT: live result */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border-2 border-ink-900 bg-ink-900 text-white shadow-[0_8px_0_0_#F97316]">
          <div className="border-b-2 border-white/10 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
            Set aside for tax
          </div>

          <div className="px-6 py-6">
            {valid ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-6xl leading-none tracking-tight text-brand">
                    {money(est.totalToSetAside)}
                  </span>
                  <span className="text-lg font-bold text-white/70">/yr</span>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  About <strong className="text-white">{money(perWeek)}</strong>{" "}
                  a week, or{" "}
                  <strong className="text-white">{money(perThousand)}</strong>{" "}
                  of every $1,000 you invoice.
                </p>

                <dl className="mt-6 space-y-2.5 border-t-2 border-white/10 pt-5 text-sm">
                  <ResultRow label="Income tax" value={money(est.incomeTax)} />
                  <ResultRow label="Medicare levy (2%)" value={money(est.medicare)} />
                  {inputs.gstRegistered && (
                    <ResultRow
                      label="GST to hand back"
                      value={money(est.gstToSetAside)}
                    />
                  )}
                </dl>

                <div className="mt-6 rounded-xl border-2 border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/70">
                  After income tax and Medicare you keep{" "}
                  <strong className="text-white">{money(est.takeHome)}</strong>{" "}
                  of your{" "}
                  <strong className="text-white">
                    {money(est.taxableIncome)}
                  </strong>{" "}
                  taxable income — an effective tax rate of{" "}
                  <strong className="text-white">
                    {(est.effectiveRate * 100).toFixed(1)}%
                  </strong>
                  .
                </div>

                <p className="mt-4 text-[11px] leading-relaxed text-white/45">
                  Estimate only, using resident sole-trader rates for the{" "}
                  {TAX_YEAR_LABEL} financial year. Not tax advice — check with
                  your accountant.
                </p>
              </>
            ) : (
              <div className="flex items-start gap-3 py-4 text-sm text-white/70">
                <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                Add what you&apos;ll invoice this year and your tax estimate
                appears here.
              </div>
            )}
          </div>
        </div>

        <Link
          href="/tools/tax-invoice-generator"
          className="group mt-4 flex items-center gap-3 rounded-xl border-2 border-line bg-white px-4 py-3.5 text-sm transition hover:border-ink-900"
        >
          <span className="flex-1">
            <span className="block font-bold text-ink-900">
              Need to invoice a job?
            </span>
            <span className="text-ink-500">
              Make a free ATO-compliant tax invoice
            </span>
          </span>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-500 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500">
        $
      </span>
      <input
        className="input pl-7"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-white/60">{label}</dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}
