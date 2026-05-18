"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
    <button onClick={openPortal} disabled={loading} className="btn-dark">
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Manage subscription"}
    </button>
  );
}
