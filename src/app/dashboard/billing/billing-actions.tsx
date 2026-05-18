"use client";

import { useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function BillingActions() {
  const [loading, setLoading] = useState(false);
  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error || "Couldn't open portal");
    } catch {
      toast.error("Couldn't open portal");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink-900 bg-white px-5 py-3 text-sm font-bold text-ink-900 shadow-[0_4px_0_0_#0F172A] transition active:translate-y-1 active:shadow-[0_0_0_0_#0F172A] disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          Manage subscription
          <ExternalLink className="h-3.5 w-3.5" />
        </>
      )}
    </button>
  );
}
