"use client";

/**
 * RateCalculator — the interactive charge-out rate tool.
 *
 * Everything runs in the browser: no account, no network. Inputs persist in
 * localStorage so a tradie can come back and tweak. The maths:
 *
 *   billable hours = (52 - weeks off) x billable hours per week
 *   base revenue   = income goal + super + business costs
 *   rate           = (base revenue / billable hours) x (1 + profit margin)
 *
 * GST is deliberately excluded — it goes on top of the rate if registered.
 */

import { useEffect, useState } from "react";
import { ArrowRight, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { FormSection, Field, GstToggle, num } from "../_components/doc-form";

const STORAGE_KEY = "mytradelink:rate-calculator";

type Inputs = {
  incomeGoal: string;
  superOn: boolean;
  superRate: string;
  weeksOff: string;
  billableHoursPerWeek: string;
  costVehicle: string;
  costInsurance: string;
  costTools: string;
  costOther: string;
  profitMargin: string;
};

const DEFAULTS: Inputs = {
  incomeGoal: "90000",
  superOn: true,
  superRate: "12",
  weeksOff: "6",
  billableHoursPerWeek: "30",
  costVehicle: "12000",
  costInsurance: "3000",
  costTools: "4000",
  costOther: "3000",
  profitMargin: "15",
};

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

function money(n: number): string {
  return AUD.format(Number.isFinite(n) ? Math.round(n) : 0);
}

export function RateCalculator() {
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

  // ---- The maths -----------------------------------------------------------
  const incomeGoal = num(inputs.incomeGoal);
  const weeksOff = Math.min(Math.max(num(inputs.weeksOff), 0), 51);
  const workWeeks = 52 - weeksOff;
  const billablePerWeek = Math.max(num(inputs.billableHoursPerWeek), 0);
  const billableHours = workWeeks * billablePerWeek;

  const superRate = inputs.superOn ? Math.max(num(inputs.superRate), 0) / 100 : 0;
  const superAmount = incomeGoal * superRate;
  const costs =
    num(inputs.costVehicle) +
    num(inputs.costInsurance) +
    num(inputs.costTools) +
    num(inputs.costOther);

  const margin = Math.max(num(inputs.profitMargin), 0) / 100;

  const baseRevenue = incomeGoal + superAmount + costs;
  const ratePreProfit = billableHours > 0 ? baseRevenue / billableHours : 0;
  const rate = ratePreProfit * (1 + margin);

  // What to actually put on the quote — rounded up to the next $5.
  const suggested = billableHours > 0 ? Math.ceil(rate / 5) * 5 : 0;
  const dayRate = suggested * 8;
  const annualRevenue = rate * billableHours;

  const perHour = {
    wage: billableHours > 0 ? incomeGoal / billableHours : 0,
    superAmt: billableHours > 0 ? superAmount / billableHours : 0,
    costs: billableHours > 0 ? costs / billableHours : 0,
    profit: rate - ratePreProfit,
  };

  const valid = billableHours > 0 && incomeGoal > 0;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
      {/* LEFT: inputs */}
      <div className="space-y-10 rounded-2xl border-2 border-ink-900 bg-white p-5 shadow-hard md:p-8">
        <FormSection
          step="01"
          title="What you want to earn"
          hint="Your wage: what you'd pay yourself for a year on the tools."
        >
          <div className="grid grid-cols-1 gap-4">
            <Field label="Income goal per year (before tax)">
              <MoneyInput
                value={inputs.incomeGoal}
                onChange={(v) => set({ incomeGoal: v })}
                placeholder="90,000"
              />
            </Field>
          </div>
          <GstToggle
            checked={inputs.superOn}
            onChange={(superOn) => set({ superOn })}
            title="Put away super"
            description="Not compulsory for sole traders, but future-you will thank you. 12% is what employees get."
          />
          {inputs.superOn && (
            <div className="mt-3 max-w-[200px]">
              <Field label="Super rate (%)">
                <input
                  className="input"
                  inputMode="decimal"
                  value={inputs.superRate}
                  onChange={(e) => set({ superRate: e.target.value })}
                  placeholder="12"
                />
              </Field>
            </div>
          )}
        </FormSection>

        <FormSection
          step="02"
          title="Your working year"
          hint="Be honest: quoting, driving and paperwork aren't billable."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Weeks off a year">
              <input
                className="input"
                inputMode="numeric"
                value={inputs.weeksOff}
                onChange={(e) => set({ weeksOff: e.target.value })}
                placeholder="6"
              />
              <span className="mt-1 block text-xs text-ink-500">
                Holidays, sick days, public holidays, rain days.
              </span>
            </Field>
            <Field label="Billable hours per week">
              <input
                className="input"
                inputMode="numeric"
                value={inputs.billableHoursPerWeek}
                onChange={(e) => set({ billableHoursPerWeek: e.target.value })}
                placeholder="30"
              />
              <span className="mt-1 block text-xs text-ink-500">
                Hours you can actually charge for. Most tradies bill 25-32 of a
                45-hour week.
              </span>
            </Field>
          </div>
        </FormSection>

        <FormSection
          step="03"
          title="Business costs per year"
          hint="What it costs to run the business before you earn a cent."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ute, fuel, rego & servicing">
              <MoneyInput
                value={inputs.costVehicle}
                onChange={(v) => set({ costVehicle: v })}
                placeholder="12,000"
              />
            </Field>
            <Field label="Insurance & licences">
              <MoneyInput
                value={inputs.costInsurance}
                onChange={(v) => set({ costInsurance: v })}
                placeholder="3,000"
              />
            </Field>
            <Field label="Tools & equipment">
              <MoneyInput
                value={inputs.costTools}
                onChange={(v) => set({ costTools: v })}
                placeholder="4,000"
              />
            </Field>
            <Field label="Phone, software & everything else">
              <MoneyInput
                value={inputs.costOther}
                onChange={(v) => set({ costOther: v })}
                placeholder="3,000"
              />
            </Field>
          </div>
          <p className="mt-3 text-sm font-bold text-ink-700">
            Total costs:{" "}
            <span className="tabular-nums text-ink-900">{money(costs)}</span> a
            year
          </p>
        </FormSection>

        <FormSection
          step="04"
          title="Profit margin"
          hint="Profit isn't your wage. It's what the business keeps for slow months, bad debts and growth."
        >
          <div className="max-w-[200px]">
            <Field label="Margin (%)">
              <input
                className="input"
                inputMode="decimal"
                value={inputs.profitMargin}
                onChange={(e) => set({ profitMargin: e.target.value })}
                placeholder="15"
              />
            </Field>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            10–20% is typical for a one-person trade business.
          </p>
        </FormSection>
      </div>

      {/* RIGHT: live result */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border-2 border-ink-900 bg-ink-900 text-white shadow-[0_8px_0_0_#F97316]">
          <div className="border-b-2 border-white/10 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
            Your charge-out rate
          </div>

          <div className="px-6 py-6">
            {valid ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-6xl leading-none tracking-tight text-brand">
                    {money(suggested)}
                  </span>
                  <span className="text-lg font-bold text-white/70">/hr</span>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {money(dayRate)} for an 8-hour day · + GST on top if
                  you&apos;re registered
                </p>

                <dl className="mt-6 space-y-2.5 border-t-2 border-white/10 pt-5 text-sm">
                  <ResultRow label="Covers your wage" value={`${money(perHour.wage)}/hr`} />
                  {inputs.superOn && (
                    <ResultRow label="Covers your super" value={`${money(perHour.superAmt)}/hr`} />
                  )}
                  <ResultRow label="Covers business costs" value={`${money(perHour.costs)}/hr`} />
                  <ResultRow label="Profit for the business" value={`${money(perHour.profit)}/hr`} />
                </dl>

                <div className="mt-6 rounded-xl border-2 border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/70">
                  Based on{" "}
                  <strong className="text-white">
                    {billableHours.toLocaleString("en-AU")} billable hours
                  </strong>{" "}
                  a year ({workWeeks} weeks × {billablePerWeek} hrs). Bill them
                  all at this rate and the business turns over{" "}
                  <strong className="text-white">{money(annualRevenue)}</strong>.
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 py-4 text-sm text-white/70">
                <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                Add your income goal and billable hours and your rate appears
                here.
              </div>
            )}
          </div>
        </div>

        <Link
          href="/blog/work-out-your-true-day-rate-tradie"
          className="group mt-4 flex items-center gap-3 rounded-xl border-2 border-line bg-white px-4 py-3.5 text-sm transition hover:border-ink-900"
        >
          <span className="flex-1">
            <span className="block font-bold text-ink-900">
              Why your day rate is probably too low
            </span>
            <span className="text-ink-500">5 min read on the blog</span>
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
