/**
 * Fire-and-forget client-side event tracker for the public profile.
 * Never blocks the user's action — if the network call fails, we don't
 * care; the click still goes through.
 */

export type TrackEventType =
  | "view"
  | "call_click"
  | "whatsapp_click"
  | "quote_open"
  | "quote_submit"
  | "social_click";

export function trackEvent(slug: string, eventType: TrackEventType): void {
  if (typeof window === "undefined") return;
  try {
    const referrer = document.referrer || null;
    const body = JSON.stringify({ slug, eventType, referrer });

    // sendBeacon survives page navigation (Call buttons navigate to tel:)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/event", blob);
      return;
    }

    // Fallback for browsers without sendBeacon
    fetch("/api/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // swallow — tracking must never throw to user code
  }
}
