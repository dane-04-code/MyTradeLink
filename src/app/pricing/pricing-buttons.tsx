"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function PricingButtons({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);

  async function start(plan: "monthly" | "annual") {
    if (!isSignedIn) {
      router.push("/sign-up?redirect=/pricing");
      return;
    }
    setLoading(plan);
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
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => start("monthly")}
        disabled={!!loading}
        className="btn-primary w-full"
      >
        {loading === "monthly" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start Pro — £9/mo"}
      </button>
      <button
        onClick={() => start("annual")}
        disabled={!!loading}
        className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white hover:bg-white/10"
      >
        {loading === "annual" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pay yearly — £89/yr (save £19)"}
      </button>
    </div>
  );
}
