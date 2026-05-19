"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function PricingButtons({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter();
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!isSignedIn) {
      router.push("/sign-up?redirect=/pricing");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || "Checkout failed");
    } catch {
      toast.error("Couldn't open checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Plan toggle */}
      <div className="flex rounded-lg border-2 border-white/25 bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => setPlan("monthly")}
          className={
            "flex-1 rounded-md px-3 py-2 text-xs font-bold transition " +
            (plan === "monthly"
              ? "bg-white text-ink-900"
              : "text-white/70 hover:text-white")
          }
        >
          Monthly · £9
        </button>
        <button
          type="button"
          onClick={() => setPlan("annual")}
          className={
            "flex-1 rounded-md px-3 py-2 text-xs font-bold transition " +
            (plan === "annual"
              ? "bg-white text-ink-900"
              : "text-white/70 hover:text-white")
          }
        >
          Yearly · £89
        </button>
      </div>

      <button
        onClick={start}
        disabled={loading}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink-900 bg-brand px-6 py-4 text-base font-bold text-ink-900 transition hover:bg-brand-400 active:translate-y-1 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {plan === "annual" ? "Start Pro · £89/yr" : "Start Pro · £9/mo"}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </>
        )}
      </button>
      <p className="text-center text-[11px] text-white/45">
        {plan === "annual"
          ? "Two months free vs paying monthly · cancel anytime"
          : "Cancel anytime · upgrade to yearly anytime"}
      </p>
    </div>
  );
}
