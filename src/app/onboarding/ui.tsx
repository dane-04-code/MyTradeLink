"use client";

import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/wordmark";

export function Header() {
  return (
    <div className="mb-8 flex items-center">
      <Wordmark className="text-base text-white" />
    </div>
  );
}

export function BlueprintGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 90%)",
      }}
    />
  );
}

export function Progress({
  step,
  total,
  current,
}: {
  step: number;
  total: number;
  current: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
            Step {step} / {total}
          </div>
          <div className="mt-0.5 font-display text-sm text-white">
            {current}
          </div>
        </div>
        <div className="text-xs text-white/40">
          {Math.round((step / total) * 100)}%
        </div>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i < step ? "bg-brand" : "bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-bold text-white">{label}</label>
        {hint && <span className="text-xs text-white/40">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
